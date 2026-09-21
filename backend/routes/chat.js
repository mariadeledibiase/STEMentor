import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// Elenco di riferimento per dare a Gemini nomi concreti e reali da
// suggerire, invece di lasciarlo generico o a rischio di inventare nomi di
// corsi/scuole che non esistono.
// ATTENZIONE: i nomi devono coincidere ESATTAMENTE con quelli usati nel
// Quiz (frontend/src/pages/Quiz.jsx: SCUOLE_SUPERIORI_PER_AREA e
// UNIVERSITA_PER_AREA), così quiz e chat consigliano gli stessi percorsi.
// Il test "coerenza con il Quiz" in tests/api.test.js segnala se le due
// liste si disallineano.
export const PERCORSI_DI_RIFERIMENTO = `
Scuole superiori scientifiche reali in Italia (da consigliare a chi è alle medie):
- Liceo Scientifico (tradizionale)
- Liceo Scientifico - opzione Scienze Applicate
- Istituto Tecnico Tecnologico - indirizzo Informatica e Telecomunicazioni
- Istituto Tecnico Tecnologico - indirizzo Elettronica ed Elettrotecnica
- Istituto Tecnico Tecnologico - indirizzo Chimica, Materiali e Biotecnologie
- Istituto Tecnico Tecnologico - indirizzo Meccanica, Meccatronica ed Energia
- Istituto Tecnico Tecnologico - indirizzo Costruzioni, Ambiente e Territorio

Corsi di laurea scientifici reali in Italia (da consigliare a chi è alle superiori):
- Laurea in Informatica
- Laurea in Ingegneria Informatica
- Laurea in Ingegneria e Scienze Informatiche
- Laurea in Fisica
- Laurea in Chimica
- Laurea in Scienza dei Materiali
- Laurea in Astronomia/Astrofisica
- Laurea in Fisica - curriculum Astrofisico
- Laurea in Fisica - curriculum Astroparticellare e Cosmologia
- Laurea in Ingegneria Aerospaziale
- Laurea in Ingegneria Meccanica
- Laurea in Ingegneria Energetica
`;

// POST /api/chat -> invia un messaggio a un avatar e riceve la risposta dell'IA
// Usa l'API GRATUITA di Google Gemini (nessuna carta di credito richiesta).
// Questo è il cuore del "motore avatar" descritto nel §4.1 e nel §4.2 (prompt engineering)
router.post('/', async (req, res) => {
  const { user_id, avatar_id, messaggio, conversation_id } = req.body;

  if (!user_id || !avatar_id || !messaggio) {
    return res.status(400).json({ errore: 'user_id, avatar_id e messaggio sono obbligatori.' });
  }

  // 1. Recupera il system_prompt dell'avatar scelto (definisce personalità, tono, biografia)
  const avatar = db.prepare('SELECT * FROM avatars WHERE id = ?').get(avatar_id);
  if (!avatar) return res.status(404).json({ errore: 'Avatar non trovato.' });

  // 2. Recupera l'età/livello dell'utente per adattare il registro linguistico (requisito §3.2)
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(user_id);
  if (!user) return res.status(404).json({ errore: 'Utente non trovato.' });

  // 3. Crea o riusa una conversazione esistente (per mantenere lo storico)
  let convId = conversation_id;
  if (!convId) {
    const result = db.prepare('INSERT INTO conversations (user_id, avatar_id) VALUES (?, ?)').run(user_id, avatar_id);
    convId = result.lastInsertRowid;
  }

  // 4. Salva il messaggio dell'utente
  db.prepare('INSERT INTO messages (conversation_id, mittente, contenuto) VALUES (?, ?, ?)').run(convId, 'utente', messaggio);

  // 4b. Conta quanti messaggi dell'utente ci sono stati finora in questa
  //     conversazione -- serve per capire quando è il momento di "tirare
  //     le somme" e dare un consiglio concreto invece di continuare solo
  //     a fare domande all'infinito.
  const numeroMessaggiUtente = db.prepare(
    `SELECT COUNT(*) AS conteggio FROM messages WHERE conversation_id = ? AND mittente = 'utente'`
  ).get(convId).conteggio;

  const SOGLIA_CONSIGLIO_FINALE = 4;
  const eOraDiConcludere = numeroMessaggiUtente >= SOGLIA_CONSIGLIO_FINALE;

  try {
    // 5. Costruisce il prompt completo: system_prompt dell'avatar + adattamento per età
   const isSecondariaPrimoGrado =
     user.livello_scolastico === 'scuola_secondaria_primo_grado';

    const promptSistema = `${avatar.system_prompt}

L'utente con cui stai parlando ha ${user.eta} anni e frequenta ${isSecondariaPrimoGrado
                                                                   ? 'la Scuola Secondaria di primo grado'
                                                                   : 'la Scuola Secondaria di secondo grado'}}.

SCOPO DELLA CONVERSAZIONE (fondamentale):
Questa NON è una chiacchierata generica. Il tuo scopo è aiutare concretamente questa persona
nell'orientamento scolastico e lavorativo. Sei una figura di riferimento nel tuo campo (${avatar.disciplina}),
e la tua storia personale è uno STRUMENTO per dare consigli credibili -- non il contenuto principale
della conversazione. L'obiettivo finale della conversazione è arrivare a un CONSIGLIO CONCRETO:
${isSecondariaPrimoGrado
  ? 'quale percorso della Scuola Secondaria di secondo grado scegliere'
  : 'quale corso di laurea scientifico scegliere'}
COME GESTIRE IL PRIMO MESSAGGIO / UN SALUTO GENERICO ("ciao" ecc.):
Rispondi SOLO con: chi sei in una riga (nome + campo), perché sei lì (aiutarla a orientarsi), e
una domanda sui suoi interessi. NIENTE aneddoti storici, NIENTE dettagli biografici, NIENTE
riferimenti al tuo secolo/epoca in questo primo messaggio.

ATTENZIONE AL TEMPO VERBALE: se sei una figura storica ormai scomparsa, usa SEMPRE il PASSATO
per parlare dei tuoi studi/della tua carriera (es. "ho studiato matematica", "mi sono occupata
di..."), MAI il presente (NON dire "mi occupo di" se non sei più in vita -- suona assurdo).
Solo se sei una persona vivente e tuttora attiva nel tuo campo puoi usare il presente.

QUALITÀ DELLA LINGUA (fondamentale): scrivi in italiano NATURALE, semplice e grammaticalmente
corretto, come parlerebbe davvero una persona. Evita costruzioni artificiose, ambigue o che
"suonano tradotte". Prima di rispondere, chiediti: "un madrelingua italiano parlerebbe così?"
Se la risposta è no, riformula in modo più semplice e diretto.

QUANDO PUOI PARLARE DELLA TUA ESPERIENZA/STORIA PERSONALE:
Solo quando ti serve per dare un consiglio CONCRETO su una scelta specifica. Anche lì, un
accenno breve e pertinente (una frase), MAI un racconto storico esteso.

STILE DI RISPOSTA (regola più importante, vale SEMPRE):
- Rispondi come in una VERA conversazione a botta e risposta, tipo messaggi WhatsApp con unǝ
  mentore: MASSIMO 40 PAROLE per messaggio, MAI un paragrafo lungo, MAI più concetti insieme.
- Scrivi frasi BREVI e SEMPLICI. NON costruire frasi lunghe piene di virgole e congiunzioni.
- Dai UNA sola informazione concreta alla volta.
- NON aprire mai con espressioni come "che gioia/emozione/domanda fantastica" o elogi generici:
  vai dritta al punto.
- NON usare linguaggio poetico, ricercato o metaforico.

TONO PER FASCIA D'ETÀ:
${isSecondariaPrimoGrado
    ? '- Ha 11-13 anni: linguaggio semplice e diretto, esempi concreti e vicini alla sua esperienza quotidiana (scuola, videogiochi, oggetti che usa).'
    : '- È alle superiori: puoi essere più specifica su materie, esami, sbocchi lavorativi e percorsi universitari, mantenendo un tono naturale e diretto.'}

${PERCORSI_DI_RIFERIMENTO}

${eOraDiConcludere ? `
IMPORTANTE -- QUESTO È IL MOMENTO DI CONCLUDERE:
Avete già scambiato ${numeroMessaggiUtente} messaggi: hai raccolto abbastanza informazioni sui
suoi interessi. In QUESTA risposta (o al massimo nella prossima, se ti serve un ultimo dettaglio),
tira le somme e CONSIGLIA ESPLICITAMENTE un'opzione concreta dall'elenco qui sopra (una scuola
superiore se è alle medie, un corso di laurea se è alle superiori), spiegando in una frase perché
si adatta a lei in base a quello che vi siete detti. Sii diretta: nomina l'opzione per nome.
Resta comunque entro il limite di parole indicato sopra.
` : `
Non sei ancora arrivata al punto di dare un consiglio finale: continua a fare domande mirate
per capire meglio i suoi interessi, un aspetto alla volta.
`}`;

    // 5b. Recupera lo storico della conversazione, per dare a Gemini la
    //     MEMORIA di quello che vi siete già detti -- senza questo, ogni
    //     messaggio verrebbe trattato come isolato e l'IA non potrebbe
    //     "tirare le somme" in modo coerente.
    const storico = db.prepare(
      `SELECT mittente, contenuto FROM messages WHERE conversation_id = ? ORDER BY created_at ASC`
    ).all(convId);

    const contents = storico.map((m) => ({
      role: m.mittente === 'utente' ? 'user' : 'model',
      parts: [{ text: m.contenuto }],
    }));

    // 6. Chiamata all'API GRATUITA di Google Gemini
    //    NOTA: "gemini-2.5-flash-lite" è stato dismesso da Google; usiamo
    //    ora "gemini-3.5-flash-lite" come indicato dal messaggio di errore
    //    dell'API stessa (verificato in fase di sviluppo).
    const modello = 'gemini-3.5-flash-lite';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modello}:generateContent?key=${process.env.AI_API_KEY}`;

    const rispostaIA = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: promptSistema }] },
        contents
      })
    });

    const dati = await rispostaIA.json();

    // NUOVO: se Gemini ha rifiutato la richiesta (rate limit, quota, chiave
    // non valida, ecc.), la risposta HTTP non è "ok" e dati.candidates sarà
    // assente. Prima questo veniva mascherato con un messaggio generico e
    // un finto status 200 -- ora lo logghiamo come errore vero, così emerge
    // nei log del server invece di sembrare una risposta "normale".
    if (!rispostaIA.ok) {
      console.error('Gemini ha risposto con un errore:', rispostaIA.status, JSON.stringify(dati));
      throw new Error(`Gemini ha risposto con status ${rispostaIA.status} (probabile rate limit o quota esaurita).`);
    }

    let testoRisposta = dati.candidates?.[0]?.content?.parts?.[0]?.text
      || 'Mi dispiace, non sono riuscita a rispondere in questo momento.';

    // RETE DI SICUREZZA: tagliamo per NUMERO DI PAROLE (non di frasi --
    // altrimenti una singola frase lunghissima piena di "e"/virgole
    // aggirerebbe il limite). Diamo più margine quando l'avatar deve dare
    // il consiglio finale, altrimenti rischiamo di tagliarlo a metà.
    const messaggioLower = messaggio.trim().toLowerCase();
    const chiedeApprofondimento = /spiegami tutto|raccontami tutto|dimmi tutto|in dettaglio|approfondi/.test(messaggioLower);
    const limiteParole = (chiedeApprofondimento || eOraDiConcludere) ? 80 : 40;

    const paroleRisposta = testoRisposta.trim().split(/\s+/);
    if (paroleRisposta.length > limiteParole) {
      const troncato = paroleRisposta.slice(0, limiteParole).join(' ');
      const ultimoPunto = Math.max(
        troncato.lastIndexOf('.'),
        troncato.lastIndexOf('!'),
        troncato.lastIndexOf('?')
      );
      testoRisposta = ultimoPunto > troncato.length * 0.5
        ? troncato.slice(0, ultimoPunto + 1)
        : troncato + '...';
    }

    // 7. Salva la risposta dell'avatar nello storico
    db.prepare('INSERT INTO messages (conversation_id, mittente, contenuto) VALUES (?, ?, ?)').run(convId, 'avatar', testoRisposta);

    res.json({ conversation_id: convId, risposta: testoRisposta });

  } catch (errore) {
    console.error('Errore nella chiamata all\'API IA:', errore);
    res.status(500).json({ errore: 'Errore nella generazione della risposta.' });
  }
});

// GET /api/chat/storico/:conversation_id -> recupera lo storico di una conversazione (requisito §3.2)
router.get('/storico/:conversation_id', (req, res) => {
  const messaggi = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(req.params.conversation_id);
  res.json(messaggi);
});

// GET /api/chat/esistente/:user_id/:avatar_id -> recupera l'ULTIMA conversazione già
// esistente tra questo utente e questo avatar (con tutti i messaggi), se esiste.
// Serve per riprendere una chat interrotta invece di ripartire sempre da zero
// (requisito: "la chat rimane sempre accessibile").
router.get('/esistente/:user_id/:avatar_id', (req, res) => {
  const { user_id, avatar_id } = req.params;

  const conversazione = db.prepare(`
    SELECT * FROM conversations
    WHERE user_id = ? AND avatar_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `).get(user_id, avatar_id);

  if (!conversazione) {
    return res.json({ conversation_id: null, messaggi: [] });
  }

  const messaggi = db.prepare(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC'
  ).all(conversazione.id);

  res.json({ conversation_id: conversazione.id, messaggi });
});

// DELETE /api/chat/:conversation_id -> elimina definitivamente una conversazione
// e tutti i suoi messaggi. Richiede user_id in query string per verificare che
// la conversazione appartenga davvero a chi la sta cancellando (altrimenti
// chiunque potrebbe eliminare le chat di un'altra persona indovinando un id).
router.delete('/:conversation_id', (req, res) => {
  const { conversation_id } = req.params;
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ errore: 'user_id è obbligatorio.' });
  }

  const conversazione = db.prepare('SELECT * FROM conversations WHERE id = ?').get(conversation_id);

  if (!conversazione) {
    return res.status(404).json({ errore: 'Conversazione non trovata.' });
  }

  if (String(conversazione.user_id) !== String(user_id)) {
    return res.status(403).json({ errore: 'Questa conversazione non appartiene a questo utente.' });
  }

  db.prepare('DELETE FROM messages WHERE conversation_id = ?').run(conversation_id);
  db.prepare('DELETE FROM conversations WHERE id = ?').run(conversation_id);

  res.json({ successo: true });
});

export default router;