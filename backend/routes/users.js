import express from 'express';
import crypto from 'crypto';
import db from '../db/database.js';

const router = express.Router();

// --- Utilità per l'hashing sicuro della password (§3.3 -- privacy) ---
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verificaPassword(password, passwordHashSalvato) {
  const [salt, hashSalvato] = passwordHashSalvato.split(':');
  const hashDaVerificare = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hashSalvato, 'hex'), Buffer.from(hashDaVerificare, 'hex'));
}

function validaEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Stessi valori del CHECK in schema.sql. Validarli qui evita che un valore
// sbagliato arrivi fino al database e produca un 500 generico invece di un
// 400 con un messaggio chiaro.
const LIVELLI_SCOLASTICI_VALIDI = [
  'scuola_secondaria_primo_grado',
  'scuola_secondaria_secondo_grado'
];
// POST /api/users -> registrazione nuovo utente (§3.2), con email + password
router.post('/', (req, res) => {
  const { nome, email, password, eta, livello_scolastico, indirizzo_scolastico, consenso_genitoriale } = req.body;

  if (!nome || !email || !password || !eta || !livello_scolastico) {
    return res.status(400).json({ errore: 'Nome, email, password, età e livello scolastico sono obbligatori.' });
  }

  if (!validaEmail(email)) {
    return res.status(400).json({ errore: 'Email non valida.' });
  }

  if (!LIVELLI_SCOLASTICI_VALIDI.includes(livello_scolastico)) {
    return res.status(400).json({ errore: 'Livello scolastico non valido.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ errore: 'La password deve avere almeno 8 caratteri.' });
  }

  if (eta < 14 && !consenso_genitoriale) {
    return res.status(403).json({ errore: 'Per utenti sotto i 14 anni è necessario il consenso genitoriale.' });
  }

  const emailEsistente = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (emailEsistente) {
    return res.status(409).json({ errore: 'Esiste già un profilo con questa email. Prova ad accedere.' });
  }

  const passwordHash = hashPassword(password);

  const stmt = db.prepare(`
    INSERT INTO users (nome, email, password_hash, eta, livello_scolastico, indirizzo_scolastico, consenso_genitoriale)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    nome,
    email.toLowerCase(),
    passwordHash,
    eta,
    livello_scolastico,
    indirizzo_scolastico || null,
    consenso_genitoriale ? 1 : 0
  );

  res.status(201).json({
    id: result.lastInsertRowid,
    nome,
    eta,
    livello_scolastico,
  });
});

// POST /api/users/login -> accesso con email + password
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ errore: 'Email e password sono obbligatorie.' });
  }

  const utente = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());

  if (!utente || !utente.password_hash) {
    return res.status(401).json({ errore: 'Email o password non corretti.' });
  }

  const passwordCorretta = verificaPassword(password, utente.password_hash);
  if (!passwordCorretta) {
    return res.status(401).json({ errore: 'Email o password non corretti.' });
  }

  res.json({
    id: utente.id,
    nome: utente.nome,
    eta: utente.eta,
    livello_scolastico: utente.livello_scolastico,
  });
});

// POST /api/users/recupera-password -> genera un token di reset
// NOTA IMPORTANTE (§5.3, limite noto del prototipo): in un'app reale questo
// token verrebbe inviato via EMAIL. Qui, per restare a costo zero e senza
// configurare un servizio di posta, il link viene restituito direttamente
// nella risposta e mostrato a schermo -- va sostituito con un vero invio
// email in uno sviluppo futuro.
router.post('/recupera-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ errore: 'Email obbligatoria.' });
  }

  const utente = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());

  // Per sicurezza, non riveliamo se l'email esiste o no nella risposta
  // "di successo" -- ma il link vero e proprio lo generiamo solo se
  // l'utente esiste davvero.
  if (!utente) {
    return res.json({ messaggio: 'Se l\'indirizzo esiste, riceverai le istruzioni per il reset.', link_reset: null });
  }

  const token = crypto.randomBytes(24).toString('hex');
  const scadeIl = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minuti

  db.prepare('INSERT INTO password_resets (user_id, token, scade_il) VALUES (?, ?, ?)')
    .run(utente.id, token, scadeIl);

  res.json({
    messaggio: 'Se l\'indirizzo esiste, riceverai le istruzioni per il reset.',
    link_reset: `/reimposta-password?token=${token}`,
  });
});

// POST /api/users/reimposta-password -> imposta una nuova password usando il token
router.post('/reimposta-password', (req, res) => {
  const { token, nuova_password } = req.body;

  if (!token || !nuova_password) {
    return res.status(400).json({ errore: 'Token e nuova password sono obbligatori.' });
  }

  if (nuova_password.length < 8) {
    return res.status(400).json({ errore: 'La password deve avere almeno 8 caratteri.' });
  }

  const richiesta = db.prepare('SELECT * FROM password_resets WHERE token = ?').get(token);

  if (!richiesta) {
    return res.status(400).json({ errore: 'Link non valido o già usato.' });
  }

  if (new Date(richiesta.scade_il) < new Date()) {
    return res.status(400).json({ errore: 'Questo link è scaduto. Richiedine uno nuovo.' });
  }

  const passwordHash = hashPassword(nuova_password);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, richiesta.user_id);

  // Il token è utilizzabile una sola volta
  db.prepare('DELETE FROM password_resets WHERE id = ?').run(richiesta.id);

  res.json({ messaggio: 'Password aggiornata con successo.' });
});

// PUT /api/users/:id/password -> cambia password da profilo (utente già loggato,
// conosce la password attuale)
router.put('/:id/password', (req, res) => {
  const { password_attuale, password_nuova } = req.body;

  if (!password_attuale || !password_nuova) {
    return res.status(400).json({ errore: 'Password attuale e nuova password sono obbligatorie.' });
  }

  if (password_nuova.length < 8) {
    return res.status(400).json({ errore: 'La nuova password deve avere almeno 8 caratteri.' });
  }

  const utente = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!utente) return res.status(404).json({ errore: 'Utente non trovato.' });

  if (!verificaPassword(password_attuale, utente.password_hash)) {
    return res.status(401).json({ errore: 'Password attuale non corretta.' });
  }

  const nuovoHash = hashPassword(password_nuova);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(nuovoHash, req.params.id);

  res.json({ messaggio: 'Password aggiornata.' });
});

// GET /api/users/:id -> recupera profilo utente
router.get('/:id', (req, res) => {
  const user = db.prepare('SELECT id, nome, email, eta, livello_scolastico, indirizzo_scolastico FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ errore: 'Utente non trovato.' });
  res.json(user);
});

// PUT /api/users/:id -> aggiorna profilo (requisito: aggiornabile in qualsiasi momento)
router.put('/:id', (req, res) => {
  const { nome, eta, livello_scolastico, indirizzo_scolastico } = req.body;

  if (!nome || !eta || !livello_scolastico) {
    return res.status(400).json({ errore: 'Nome, età e livello scolastico sono obbligatori.' });
  }

  if (!LIVELLI_SCOLASTICI_VALIDI.includes(livello_scolastico)) {
    return res.status(400).json({ errore: 'Livello scolastico non valido.' });
  }

  db.prepare(`
    UPDATE users SET nome = ?, eta = ?, livello_scolastico = ?, indirizzo_scolastico = ?
    WHERE id = ?
  `).run(nome, eta, livello_scolastico, indirizzo_scolastico || null, req.params.id);

  const utenteAggiornato = db.prepare(
    'SELECT id, nome, eta, livello_scolastico, indirizzo_scolastico FROM users WHERE id = ?'
  ).get(req.params.id);

  res.json(utenteAggiornato);
});
// DELETE /api/users/:id -> elimina definitivamente l'account
// Per sicurezza richiede la password attuale.
// Vengono eliminati anche tutti i dati collegati all'utente.
router.delete('/:id', (req, res) => {
  const { password } = req.body;
  const userId = req.params.id;

  if (!password) {
    return res.status(400).json({
      errore: 'Inserisci la password per confermare l’eliminazione.'
    });
  }

  const utente = db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(userId);

  if (!utente) {
    return res.status(404).json({
      errore: 'Utente non trovato.'
    });
  }

  if (!verificaPassword(password, utente.password_hash)) {
    return res.status(401).json({
      errore: 'Password non corretta.'
    });
  }

  try {
    // node:sqlite (il modulo nativo usato in questo progetto) NON ha un
    // metodo .transaction() di comodo come better-sqlite3 -- va aperta e
    // chiusa la transazione a mano con BEGIN/COMMIT, con ROLLBACK in caso
    // di errore. Stesso identico effetto: o va tutto a buon fine, o niente
    // viene eliminato.
    db.exec('BEGIN');

    // 1. Elimina eventuali token per il recupero password
    db.prepare(`
      DELETE FROM password_resets
      WHERE user_id = ?
    `).run(userId);

    // 2. Elimina tutti i messaggi delle conversazioni dell'utente
    db.prepare(`
      DELETE FROM messages
      WHERE conversation_id IN (
        SELECT id
        FROM conversations
        WHERE user_id = ?
      )
    `).run(userId);

    // 3. Elimina tutte le conversazioni
    db.prepare(`
      DELETE FROM conversations
      WHERE user_id = ?
    `).run(userId);

    // 4. Elimina i risultati del quiz di orientamento. Senza questo passaggio
    //    la chiave esterna quiz_results.user_id -> users.id bloccava
    //    l'eliminazione (errore 500) per chiunque avesse fatto il quiz.
    db.prepare(`
      DELETE FROM quiz_results
      WHERE user_id = ?
    `).run(userId);

    // 5. Elimina definitivamente l'utente
    db.prepare(`
      DELETE FROM users
      WHERE id = ?
    `).run(userId);

    db.exec('COMMIT');

    res.json({
      successo: true,
      messaggio: 'Account eliminato definitivamente.'
    });

  } catch (errore) {

    db.exec('ROLLBACK');

    console.error(
      'Errore durante eliminazione account:',
      errore
    );

    res.status(500).json({
      errore: 'Non è stato possibile eliminare l’account.'
    });
  }
});

export default router;