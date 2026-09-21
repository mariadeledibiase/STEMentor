import { describe, it, before, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Questa suite copre i casi d'uso principali richiesti dalla prof: non
// testa OGNI possibile input, ma il percorso realistico che una persona
// farebbe usando l'app (registrarsi, fare login, parlare con un avatar,
// fare il quiz, esplorare le mappe) più i casi di errore più probabili
// (dati mancanti, permessi sbagliati, id inesistenti).
//
// NOTE TECNICHE:
// 1. Si usa il test runner integrato di Node (node --test), non Vitest --
//    Vitest passa da Vite per trasformare i file, e il resolver di Vite
//    "spezza" il prefisso node: nelle import, facendo fallire
//    l'importazione di node:sqlite.
// 2. Il database di test viene impostato qui sotto con process.env.DB_PATH
//    PRIMA di importare app.js -- ma con un import() DINAMICO (non un
//    normale "import" in cima al file), perché i normali import ESM
//    vengono sempre eseguiti per primi (vengono "anticipati"), quindi
//    scrivere process.env.DB_PATH prima di un import normale non avrebbe
//    alcun effetto: database.js leggerebbe comunque la variabile TROPPO
//    TARDI. L'import() dinamico invece è una vera espressione, eseguita
//    esattamente al punto in cui si trova nel codice.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_TEST_PATH = path.join(__dirname, 'test.sqlite');

if (fs.existsSync(DB_TEST_PATH)) {
  fs.unlinkSync(DB_TEST_PATH);
}

process.env.DB_PATH = DB_TEST_PATH;
process.env.AI_API_KEY = 'chiave-finta-per-i-test'; // non viene mai usata davvero: /api/chat è testato con fetch finto

const { default: app } = await import('../app.js');
const { default: db } = await import('../db/database.js');
const { costruisciSsml } = await import('../routes/tts.js');
const { PERCORSI_DI_RIFERIMENTO } = await import('../routes/chat.js');
const { limitaRichieste } = await import('../middleware/limitaRichieste.js');

let avatarId;

// Un avatar finto per i test -- le tabelle del database di test partono
// vuote (schema.sql crea solo la struttura, non i dati), quindi lo
// inseriamo qui a mano invece di dipendere dal seed.js reale.
before(() => {
  const risultato = db.prepare(`
    INSERT INTO avatars (nome, disciplina, bio_breve, system_prompt, immagine_url)
    VALUES ('Avatar di Test', 'Materia di Test', 'Bio di test.', 'Sei un avatar di test. Rispondi sempre in una frase breve.', '/immagini/test.png')
  `).run();
  avatarId = Number(risultato.lastInsertRowid);
});

describe('POST /api/users -- registrazione', () => {
  it('registra una nuova utente con dati validi', async () => {
    const risposta = await request(app).post('/api/users').send({
      nome: 'Prova Utente',
      email: 'prova@esempio.it',
      password: 'passwordsicura123',
      eta: 17,
      livello_scolastico: 'scuola_secondaria_secondo_grado',
    });

    assert.strictEqual(risposta.status, 201);
    assert.ok(risposta.body.id);
    assert.strictEqual(risposta.body.nome, 'Prova Utente');
  });

  it('rifiuta la registrazione se manca un campo obbligatorio', async () => {
    const risposta = await request(app).post('/api/users').send({
      nome: 'Utente Incompleto',
      email: 'incompleto@esempio.it',
    });

    assert.strictEqual(risposta.status, 400);
  });

  it('rifiuta un\'email non valida', async () => {
    const risposta = await request(app).post('/api/users').send({
      nome: 'Utente Email Sbagliata',
      email: 'non-e-una-email',
      password: 'passwordsicura123',
      eta: 17,
      livello_scolastico: 'scuola_secondaria_secondo_grado',
    });

    assert.strictEqual(risposta.status, 400);
  });

  it('richiede il consenso genitoriale sotto i 14 anni', async () => {
    const risposta = await request(app).post('/api/users').send({
      nome: 'Utente Minore',
      email: 'minore@esempio.it',
      password: 'passwordsicura123',
      eta: 12,
      livello_scolastico: 'scuola_secondaria_primo_grado',
      consenso_genitoriale: false,
    });

    assert.strictEqual(risposta.status, 403);
  });

  it('accetta un\'utente sotto i 14 anni SE il consenso è presente', async () => {
    const risposta = await request(app).post('/api/users').send({
      nome: 'Utente Minore Con Consenso',
      email: 'minore-consenso@esempio.it',
      password: 'passwordsicura123',
      eta: 12,
      livello_scolastico: 'scuola_secondaria_primo_grado',
      consenso_genitoriale: true,
    });

    assert.strictEqual(risposta.status, 201);
  });

  it('rifiuta un livello scolastico non valido con 400 (non 500)', async () => {
    // Regressione: il form di registrazione arrivò a inviare le etichette
    // ("Scuola Secondaria di primo grado") al posto dei valori tecnici, e il
    // CHECK del database faceva fallire la richiesta con un 500 generico.
    for (const livello of [
      'Scuola Secondaria di primo grado',
      'Scuola Secondaria di secondo grado Grado',
      'qualsiasi-cosa',
    ]) {
      const risposta = await request(app).post('/api/users').send({
        nome: 'Utente Livello Sbagliato',
        email: `livello-${Math.random()}@esempio.it`,
        password: 'passwordsicura123',
        eta: 16,
        livello_scolastico: livello,
      });

      assert.strictEqual(risposta.status, 400, `livello "${livello}"`);
    }
  });

  it('non permette due profili con la stessa email', async () => {
    await request(app).post('/api/users').send({
      nome: 'Prima Registrazione',
      email: 'duplicata@esempio.it',
      password: 'passwordsicura123',
      eta: 17,
      livello_scolastico: 'scuola_secondaria_secondo_grado',
    });

    const seconda = await request(app).post('/api/users').send({
      nome: 'Seconda Registrazione',
      email: 'duplicata@esempio.it',
      password: 'un\'altra_password',
      eta: 18,
      livello_scolastico: 'scuola_secondaria_secondo_grado',
    });

    assert.strictEqual(seconda.status, 409);
  });
});

describe('POST /api/users/login -- accesso', () => {
  before(async () => {
    await request(app).post('/api/users').send({
      nome: 'Utente Login',
      email: 'login@esempio.it',
      password: 'passwordcorretta',
      eta: 16,
      livello_scolastico: 'scuola_secondaria_secondo_grado',
    });
  });

  it('accede con email e password corrette', async () => {
    const risposta = await request(app).post('/api/users/login').send({
      email: 'login@esempio.it',
      password: 'passwordcorretta',
    });

    assert.strictEqual(risposta.status, 200);
    assert.ok(risposta.body.id);
  });

  it('rifiuta una password sbagliata', async () => {
    const risposta = await request(app).post('/api/users/login').send({
      email: 'login@esempio.it',
      password: 'password-sbagliata',
    });

    assert.strictEqual(risposta.status, 401);
  });

  it('rifiuta un\'email che non esiste', async () => {
    const risposta = await request(app).post('/api/users/login').send({
      email: 'non-esiste@esempio.it',
      password: 'qualsiasi',
    });

    assert.strictEqual(risposta.status, 401);
  });
});

describe('Profilo utente: lettura, modifica, cambio password, cancellazione', () => {
  let userId;

  before(async () => {
    const registrazione = await request(app).post('/api/users').send({
      nome: 'Utente Profilo',
      email: 'profilo@esempio.it',
      password: 'passwordoriginale',
      eta: 15,
      livello_scolastico: 'scuola_secondaria_primo_grado',
      consenso_genitoriale: true,
    });
    userId = registrazione.body.id;
  });

  it('recupera il profilo per id', async () => {
    const risposta = await request(app).get(`/api/users/${userId}`);
    assert.strictEqual(risposta.status, 200);
    assert.strictEqual(risposta.body.nome, 'Utente Profilo');
    // La password (anche hashata) non deve mai uscire dall'API
    assert.strictEqual(risposta.body.password_hash, undefined);
  });

  it('restituisce 404 per un id inesistente', async () => {
    const risposta = await request(app).get('/api/users/999999');
    assert.strictEqual(risposta.status, 404);
  });

  it('aggiorna nome e indirizzo scolastico', async () => {
    const risposta = await request(app).put(`/api/users/${userId}`).send({
      nome: 'Utente Profilo Aggiornato',
      eta: 15,
      livello_scolastico: 'scuola_secondaria_primo_grado',
      indirizzo_scolastico: 'Liceo scientifico',
    });

    assert.strictEqual(risposta.status, 200);
    assert.strictEqual(risposta.body.nome, 'Utente Profilo Aggiornato');
  });

  it('rifiuta un livello scolastico non valido nella modifica del profilo', async () => {
    const risposta = await request(app).put(`/api/users/${userId}`).send({
      nome: 'Utente Profilo',
      eta: 15,
      livello_scolastico: 'Scuola Secondaria di primo grado',
    });

    assert.strictEqual(risposta.status, 400);
  });

  it('cambia la password con quella attuale corretta', async () => {
    const risposta = await request(app).put(`/api/users/${userId}/password`).send({
      password_attuale: 'passwordoriginale',
      password_nuova: 'passwordnuova123',
    });

    assert.strictEqual(risposta.status, 200);

    // Verifica che il login funzioni ORA con la password nuova
    const login = await request(app).post('/api/users/login').send({
      email: 'profilo@esempio.it',
      password: 'passwordnuova123',
    });
    assert.strictEqual(login.status, 200);
  });

  it('rifiuta il cambio password se quella attuale è sbagliata', async () => {
    const risposta = await request(app).put(`/api/users/${userId}/password`).send({
      password_attuale: 'password-sbagliata',
      password_nuova: 'qualcosaltro123',
    });

    assert.strictEqual(risposta.status, 401);
  });

  it('elimina definitivamente l\'account con la password corretta', async () => {
    // NOTA: questo test esercita la rotta DELETE che usava db.transaction()
    // -- un metodo che node:sqlite non possiede (vedi correzione in
    // users.js). Se la correzione non fosse a posto, questo test
    // fallirebbe con "db.transaction is not a function".
    const risposta = await request(app).delete(`/api/users/${userId}`).send({
      password: 'passwordnuova123',
    });

    assert.strictEqual(risposta.status, 200);
    assert.strictEqual(risposta.body.successo, true);

    const dopoEliminazione = await request(app).get(`/api/users/${userId}`);
    assert.strictEqual(dopoEliminazione.status, 404);
  });
});

describe('GET /api/avatars', () => {
  it('elenca gli avatar disponibili', async () => {
    const risposta = await request(app).get('/api/avatars');
    assert.strictEqual(risposta.status, 200);
    assert.ok(Array.isArray(risposta.body));
    assert.ok(risposta.body.length > 0);
    // Il system_prompt non deve mai essere esposto al frontend
    assert.strictEqual(risposta.body[0].system_prompt, undefined);
  });

  it('recupera un singolo avatar per id', async () => {
    const risposta = await request(app).get(`/api/avatars/${avatarId}`);
    assert.strictEqual(risposta.status, 200);
    assert.strictEqual(risposta.body.nome, 'Avatar di Test');
  });

  it('restituisce 404 per un avatar inesistente', async () => {
    const risposta = await request(app).get('/api/avatars/999999');
    assert.strictEqual(risposta.status, 404);
  });
});

describe('POST /api/quiz -- risultati del quiz di orientamento', () => {
  let userId;

  before(async () => {
    const registrazione = await request(app).post('/api/users').send({
      nome: 'Utente Quiz',
      email: 'quiz@esempio.it',
      password: 'passwordsicura123',
      eta: 17,
      livello_scolastico: 'scuola_secondaria_secondo_grado',
    });
    userId = registrazione.body.id;
  });

  it('salva un risultato del quiz', async () => {
    const risposta = await request(app).post('/api/quiz').send({
      user_id: userId,
      profilo_interessi: { informatica: 4, fisica_chimica: 1 },
    });

    assert.strictEqual(risposta.status, 201);
  });

  it('recupera l\'ultimo risultato salvato', async () => {
    const risposta = await request(app).get(`/api/quiz/${userId}`);
    assert.strictEqual(risposta.status, 200);
    assert.deepStrictEqual(risposta.body.profilo_interessi, { informatica: 4, fisica_chimica: 1 });
  });

  it('restituisce 404 se l\'utente non ha ancora fatto il quiz', async () => {
    const risposta = await request(app).get('/api/quiz/999999');
    assert.strictEqual(risposta.status, 404);
  });
});

describe('GET /api/maps -- scuole, università, carriere', () => {
  before(() => {
    db.prepare(`
      INSERT INTO mappe_contenuti (tipo, tipo_istituto, indirizzo, nome, descrizione, regione, provincia)
      VALUES ('scuola', 'Liceo', 'Liceo Scientifico', 'Liceo di Test', 'Descrizione di test.', 'Marche', 'Macerata')
    `).run();
  });

  it('restituisce i contenuti di tipo scuola', async () => {
    const risposta = await request(app).get('/api/maps/scuola');
    assert.strictEqual(risposta.status, 200);
    assert.ok(risposta.body.some((r) => r.nome === 'Liceo di Test'));
  });

  it('filtra per regione', async () => {
    const risposta = await request(app).get('/api/maps/scuola?regione=Marche');
    assert.strictEqual(risposta.status, 200);
    assert.ok(risposta.body.every((r) => r.regione === 'Marche'));
  });

  it('rifiuta un tipo non valido', async () => {
    const risposta = await request(app).get('/api/maps/non-esiste');
    assert.strictEqual(risposta.status, 400);
  });

  it('restituisce le opzioni di filtro effettivamente presenti nei dati', async () => {
    const risposta = await request(app).get('/api/maps/scuola/opzioni-filtro');
    assert.strictEqual(risposta.status, 200);
    assert.ok(risposta.body.regioni.includes('Marche'));
  });
});

describe('POST /api/chat -- conversazione con un avatar (Gemini è FINTO in questi test)', () => {
  let userId;
  let fetchOriginale;

  before(async () => {
    fetchOriginale = globalThis.fetch;

    const registrazione = await request(app).post('/api/users').send({
      nome: 'Utente Chat',
      email: 'chat@esempio.it',
      password: 'passwordsicura123',
      eta: 13,
      livello_scolastico: 'scuola_secondaria_primo_grado',
      consenso_genitoriale: true,
    });
    userId = registrazione.body.id;
  });

  beforeEach(() => {
    // Sostituisce il fetch globale SOLO per la durata di ogni test, così
    // non chiamiamo mai davvero l'API di Gemini (niente costi, niente
    // dipendenza dalla rete, niente rischio di rate limit nei test).
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Questa è una risposta finta per il test.' }] } }],
      }),
    });
  });

  afterEach(() => {
    globalThis.fetch = fetchOriginale;
  });

  it('invia un messaggio e riceve una risposta', async () => {
    const risposta = await request(app).post('/api/chat').send({
      user_id: userId,
      avatar_id: avatarId,
      messaggio: 'Ciao',
    });

    assert.strictEqual(risposta.status, 200);
    assert.ok(risposta.body.conversation_id);
    assert.ok(risposta.body.risposta.includes('risposta finta'));
  });

  it('rifiuta la richiesta se manca il messaggio', async () => {
    const risposta = await request(app).post('/api/chat').send({
      user_id: userId,
      avatar_id: avatarId,
    });

    assert.strictEqual(risposta.status, 400);
  });

  it('restituisce 404 se l\'avatar non esiste', async () => {
    const risposta = await request(app).post('/api/chat').send({
      user_id: userId,
      avatar_id: 999999,
      messaggio: 'Ciao',
    });

    assert.strictEqual(risposta.status, 404);
  });

  it('restituisce 404 se l\'utente non esiste', async () => {
    const risposta = await request(app).post('/api/chat').send({
      user_id: 999999,
      avatar_id: avatarId,
      messaggio: 'Ciao',
    });

    assert.strictEqual(risposta.status, 404);
  });

  it('fa emergere l\'errore reale quando Gemini rifiuta la richiesta (es. rate limit)', async () => {
    // Verifica il fix applicato dopo il rate limit scoperto in fase di
    // collaudo: un errore di Gemini deve tornare come errore vero (500),
    // non come una risposta "normale" con un messaggio generico e status 200.
    globalThis.fetch = async () => ({
      ok: false,
      status: 429,
      json: async () => ({ error: { message: 'quota esaurita' } }),
    });

    const risposta = await request(app).post('/api/chat').send({
      user_id: userId,
      avatar_id: avatarId,
      messaggio: 'Ciao',
    });

    assert.strictEqual(risposta.status, 500);
  });

  describe('eliminazione di una conversazione', () => {
    let conversationId;

    before(async () => {
      globalThis.fetch = async () => ({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'Risposta finta.' }] } }],
        }),
      });

      const risposta = await request(app).post('/api/chat').send({
        user_id: userId,
        avatar_id: avatarId,
        messaggio: 'Messaggio da eliminare poi',
      });
      conversationId = risposta.body.conversation_id;
    });

    it('rifiuta la cancellazione senza user_id', async () => {
      const risposta = await request(app).delete(`/api/chat/${conversationId}`);
      assert.strictEqual(risposta.status, 400);
    });

    it('rifiuta la cancellazione da parte di un\'altra utente', async () => {
      const risposta = await request(app).delete(`/api/chat/${conversationId}?user_id=999999`);
      assert.strictEqual(risposta.status, 403);
    });

    it('elimina la conversazione se l\'utente è quella giusta', async () => {
      const risposta = await request(app).delete(`/api/chat/${conversationId}?user_id=${userId}`);
      assert.strictEqual(risposta.status, 200);

      const dopo = await request(app).get(`/api/chat/storico/${conversationId}`);
      assert.deepStrictEqual(dopo.body, []);
    });
  });
});

describe('DELETE /api/users/:id -- eliminazione account con dati collegati', () => {
  it('elimina anche quiz, conversazioni e messaggi dell\'utente', async () => {
    // Regressione: senza cancellare quiz_results la chiave esterna bloccava
    // l'eliminazione (500) per chiunque avesse fatto il quiz -- cioè quasi
    // tutti. Il test precedente non se ne accorgeva perché l'utente non
    // aveva alcun dato collegato.
    const registrazione = await request(app).post('/api/users').send({
      nome: 'Utente Da Eliminare',
      email: 'da-eliminare@esempio.it',
      password: 'passwordsicura123',
      eta: 17,
      livello_scolastico: 'scuola_secondaria_secondo_grado',
    });
    const id = registrazione.body.id;

    await request(app).post('/api/quiz').send({
      user_id: id,
      profilo_interessi: { informatica: 5 },
    });

    const conversazione = db.prepare(
      'INSERT INTO conversations (user_id, avatar_id) VALUES (?, ?)'
    ).run(id, avatarId);
    db.prepare(
      'INSERT INTO messages (conversation_id, mittente, contenuto) VALUES (?, ?, ?)'
    ).run(conversazione.lastInsertRowid, 'utente', 'Ciao');

    const risposta = await request(app).delete(`/api/users/${id}`).send({
      password: 'passwordsicura123',
    });

    assert.strictEqual(risposta.status, 200);
    assert.strictEqual(db.prepare('SELECT COUNT(*) AS n FROM users WHERE id = ?').get(id).n, 0);
    assert.strictEqual(db.prepare('SELECT COUNT(*) AS n FROM quiz_results WHERE user_id = ?').get(id).n, 0);
    assert.strictEqual(db.prepare('SELECT COUNT(*) AS n FROM conversations WHERE user_id = ?').get(id).n, 0);
    assert.strictEqual(
      db.prepare('SELECT COUNT(*) AS n FROM messages WHERE conversation_id = ?').get(conversazione.lastInsertRowid).n,
      0
    );
  });

  it('non elimina nulla se la password è sbagliata', async () => {
    const registrazione = await request(app).post('/api/users').send({
      nome: 'Utente Che Resta',
      email: 'che-resta@esempio.it',
      password: 'passwordsicura123',
      eta: 17,
      livello_scolastico: 'scuola_secondaria_secondo_grado',
    });

    const risposta = await request(app).delete(`/api/users/${registrazione.body.id}`).send({
      password: 'password-sbagliata',
    });

    assert.strictEqual(risposta.status, 401);
    const ancoraLi = await request(app).get(`/api/users/${registrazione.body.id}`);
    assert.strictEqual(ancoraLi.status, 200);
  });
});

describe('POST /api/tts -- validazione (Azure NON viene mai chiamato in questi test)', () => {
  it('rifiuta la richiesta se mancano nome o testo', async () => {
    const risposta = await request(app).post('/api/tts').send({ nome: 'Ada Lovelace' });
    assert.strictEqual(risposta.status, 400);
  });

  it('rifiuta valori che non sono testo', async () => {
    const risposta = await request(app).post('/api/tts').send({ nome: 'Ada Lovelace', testo: { a: 1 } });
    assert.strictEqual(risposta.status, 400);
  });

  it('rifiuta un testo troppo lungo (protegge la quota di Azure)', async () => {
    const risposta = await request(app).post('/api/tts').send({
      nome: 'Ada Lovelace',
      testo: 'a'.repeat(1001),
    });
    assert.strictEqual(risposta.status, 400);
  });
});

describe('Pronuncia dei nomi nella sintesi vocale (SSML)', () => {
  it('avvolge i nomi delle scienziate in tag <phoneme> con trascrizione IPA', () => {
    const ssml = costruisciSsml('Ciao, sono Ada Lovelace e lei è Marie Curie.');

    assert.ok(ssml.includes('<phoneme alphabet="ipa" ph="ˈada">Ada</phoneme>'));
    assert.ok(ssml.includes('<phoneme alphabet="ipa" ph="ˈlɔvlejs">Lovelace</phoneme>'));
    assert.ok(ssml.includes('<phoneme alphabet="ipa" ph="maˈri">Marie</phoneme>'));
    assert.ok(ssml.includes('<phoneme alphabet="ipa" ph="kuˈri">Curie</phoneme>'));
  });

  it('non tocca parole che contengono un nome (solo parole intere)', () => {
    const ssml = costruisciSsml('Adamo e Cascada');
    assert.ok(!ssml.includes('<phoneme'));
  });

  it('escapa i caratteri speciali XML senza rompere i tag della pronuncia', () => {
    const ssml = costruisciSsml('Ada & <Marie> "Curie"');

    assert.ok(ssml.includes('&amp;'));
    assert.ok(ssml.includes('&lt;'));
    assert.ok(ssml.includes('&gt;'));
    assert.ok(ssml.includes('&quot;'));
    // i tag <phoneme> veri restano tag (non vengono escapati a loro volta)
    assert.ok(ssml.includes('<phoneme alphabet="ipa" ph="ˈada">Ada</phoneme>'));
    assert.ok(!ssml.includes('&lt;phoneme'));
  });
});

describe('Limitatore di richieste', () => {
  function chiama(middleware, ip) {
    let status = null;
    let passata = false;
    const res = {
      set() {},
      status(codice) { status = codice; return this; },
      json() { return this; },
    };
    middleware({ ip }, res, () => { passata = true; });
    return { status, passata };
  }

  it('lascia passare fino al massimo e poi risponde 429', () => {
    const mw = limitaRichieste({ finestraMs: 60_000, massimo: 2 });

    assert.strictEqual(chiama(mw, '10.0.0.1').passata, true);
    assert.strictEqual(chiama(mw, '10.0.0.1').passata, true);

    const terza = chiama(mw, '10.0.0.1');
    assert.strictEqual(terza.passata, false);
    assert.strictEqual(terza.status, 429);
  });

  it('conta separatamente ogni indirizzo IP', () => {
    const mw = limitaRichieste({ finestraMs: 60_000, massimo: 1 });

    assert.strictEqual(chiama(mw, '10.0.0.1').passata, true);
    assert.strictEqual(chiama(mw, '10.0.0.2').passata, true);
    assert.strictEqual(chiama(mw, '10.0.0.1').status, 429);
  });
});

describe('Coerenza tra Quiz e prompt della chat', () => {
  it('ogni scuola/corso consigliato dal Quiz è nell\'elenco di riferimento della chat', () => {
    // Regressione: la lista della chat era una versione ridotta e vecchia di
    // quella del Quiz, quindi le due parti dell'app consigliavano percorsi
    // diversi. Qui si legge il sorgente del Quiz e si controlla che ogni
    // nome compaia (identico) nel prompt.
    const sorgenteQuiz = fs.readFileSync(
      path.join(__dirname, '../../frontend/src/pages/Quiz.jsx'),
      'utf8'
    );

    const inizio = sorgenteQuiz.indexOf('const SCUOLE_SUPERIORI_PER_AREA');
    const fine = sorgenteQuiz.indexOf('const DOMANDE_MEDIA');
    assert.ok(inizio !== -1 && fine > inizio, 'Struttura di Quiz.jsx cambiata: aggiorna questo test.');

    const nomi = [...sorgenteQuiz.slice(inizio, fine).matchAll(/nome:\s*'((?:[^'\\]|\\.)*)'/g)]
      .map((m) => m[1].replace(/\\'/g, "'"));

    assert.ok(nomi.length >= 20, `Trovati solo ${nomi.length} nomi nel Quiz: il parsing non funziona più?`);

    for (const nome of nomi) {
      assert.ok(
        PERCORSI_DI_RIFERIMENTO.includes(`- ${nome}\n`),
        `"${nome}" è nel Quiz ma non nell'elenco di riferimento della chat (routes/chat.js).`
      );
    }
  });
});
