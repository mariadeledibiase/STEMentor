// Script di valutazione degli avatar (richiesta della prof: "test delle
// risposte dei quattro avatar su un piccolo insieme predefinito di domande",
// "verifica dei vincoli di lunghezza", "misurazione indicativa dei tempi di
// risposta").
//
// COSA FA IN AUTOMATICO (oggettivo, verificabile da codice):
// - manda 5 domande fisse a ciascuno dei 4 avatar, in entrambi i registri
//   (scuola media / scuola superiore)
// - controlla che ogni risposta rispetti il limite di parole dichiarato nel
//   prompt di sistema (40 parole normalmente, 80 quando si chiede un
//   approfondimento o quando l'avatar deve dare il consiglio finale)
// - misura il tempo di risposta di ogni chiamata e calcola media/p95,
//   confrontandolo con il requisito "<=4 secondi nel 95% dei casi" del Cap.3
//
// COSA NON FA (richiede lettura umana del report):
// - giudicare se il tono/la personalità sono coerenti col personaggio
// - giudicare se il linguaggio è davvero adeguato all'età
// - giudicare se il tempo verbale è quello giusto (passato per le storiche,
//   presente solo per Samantha) -- lo script segnala solo dove SPUNTANO
//   verbi al presente sospetti, ma la lettura resta necessaria
//
// USO:
//   1. Assicurati che il server sia acceso (node server.js)
//   2. node db/seedTestUsers.js   (una tantum, se non l'hai già fatto)
//   3. node scripts/valutazioneAvatar.js
//   4. Apri scripts/report-valutazione-avatar.md

import { writeFileSync } from 'fs';

const BASE_URL = 'http://localhost:3001';

// Cambia questi due id se i tuoi utenti di test hanno id diversi da quelli
// stampati da "node db/seedTestUsers.js".
const UTENTE_MEDIE_ID = process.env.UTENTE_MEDIE_ID || 1;
const UTENTE_SUPERIORI_ID = process.env.UTENTE_SUPERIORI_ID || 2;

// Stesse 5 domande per ogni avatar, pensate per attraversare i punti
// critici del prompt di sistema:
//   Q1 -> regola sul primo messaggio (saluto generico)
//   Q2-Q3 -> conversazione normale (limite 40 parole)
//   Q4 -> 4° messaggio utente: soglia "ora è il momento di dare un consiglio"
//   Q5 -> parola-chiave "approfondisci": limite esteso a 80 parole
const DOMANDE_TEST = [
  'Ciao',
  'Raccontami del tuo lavoro',
  'Quali materie ti piacevano a scuola?',
  'Che consiglio mi daresti?',
  'Puoi approfondire di più?',
];

// Verbi al presente che, se compaiono nella risposta di una figura storica
// scomparsa (tutte tranne Samantha), sono quasi certamente un errore di
// tempo verbale da controllare a mano.
const INDIZI_PRESENTE_SOSPETTO = /\b(mi occupo|lavoro come|sono una|sto studiando|insegno)\b/i;

function contaParole(testo) {
  return testo.trim().split(/\s+/).filter(Boolean).length;
}

async function recuperaAvatar() {
  const risposta = await fetch(`${BASE_URL}/api/avatars`);
  if (!risposta.ok) throw new Error('Impossibile recuperare la lista avatar. Il server è acceso?');
  return risposta.json();
}

async function inviaMessaggio({ userId, avatarId, messaggio, conversationId }) {
  const inizio = Date.now();
  const risposta = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, avatar_id: avatarId, messaggio, conversation_id: conversationId }),
  });
  const tempoMs = Date.now() - inizio;
  const dati = await risposta.json();
  if (!risposta.ok) throw new Error(dati.errore || 'Errore sconosciuto dal server.');
  return { testo: dati.risposta, conversationId: dati.conversation_id, tempoMs };
}

function calcolaPercentile(valori, percentile) {
  const ordinati = [...valori].sort((a, b) => a - b);
  const indice = Math.ceil((percentile / 100) * ordinati.length) - 1;
  return ordinati[Math.max(0, indice)];
}

async function attendi(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function eseguiConversazioneDiProva(userId, avatar) {
  let conversationId = null;
  const scambi = [];

  for (let i = 0; i < DOMANDE_TEST.length; i++) {
    const domanda = DOMANDE_TEST[i];
    const numeroMessaggioUtente = i + 1;
    const { testo, conversationId: nuovoId, tempoMs } = await inviaMessaggio({
      userId,
      avatarId: avatar.id,
      messaggio: domanda,
      conversationId,
    });
    conversationId = nuovoId;

    const parole = contaParole(testo);
    const chiedeApprofondimento = /approfond/i.test(domanda);
    const eOraDiConcludere = numeroMessaggioUtente >= 4;
    const limiteAtteso = (chiedeApprofondimento || eOraDiConcludere) ? 80 : 40;
    const superaLimite = parole > limiteAtteso;

    const eFiguraScomparsa = avatar.nome !== 'Samantha Cristoforetti';
    const presenteSospetto = eFiguraScomparsa && INDIZI_PRESENTE_SOSPETTO.test(testo);

    scambi.push({ domanda, risposta: testo, parole, limiteAtteso, superaLimite, tempoMs, presenteSospetto });

    // Pausa tra una chiamata e l'altra: il test ha scoperto che il piano
    // gratuito di Gemini per "gemini-3.5-flash-lite" ammette solo 15
    // richieste al minuto (errore 429 RESOURCE_EXHAUSTED, confermato in
    // fase di collaudo). 15/minuto = 1 ogni 4 secondi; usiamo 4.5s per
    // avere un margine di sicurezza.
    await attendi(4500);
  }

  return scambi;
}

function formattaReportMarkdown(risultatiPerRegistro) {
  const tuttiITempi = [];
  let righe = `# Report di valutazione degli avatar\n\nGenerato il ${new Date().toLocaleString('it-IT')}.\n\n`;
  righe += `**Lettura di questo report**: i controlli di lunghezza e i tempi sono automatici. `
    + `La coerenza del personaggio (tono, tempo verbale) e l'adeguatezza per età vanno invece `
    + `giudicate leggendo le risposte qui sotto -- lo script segnala solo con ⚠️ i casi più sospetti.\n\n`;

  for (const [registro, avatarsRisultati] of Object.entries(risultatiPerRegistro)) {
    righe += `## Registro: ${registro}\n\n`;

    for (const [nomeAvatar, scambi] of Object.entries(avatarsRisultati)) {
      righe += `### ${nomeAvatar}\n\n`;
      righe += `| # | Domanda | Parole (limite) | Tempo | Note |\n|---|---|---|---|---|\n`;

      scambi.forEach((s, i) => {
        tuttiITempi.push(s.tempoMs);
        const note = [
          s.superaLimite ? '⚠️ supera il limite di parole' : '',
          s.presenteSospetto ? '⚠️ possibile tempo verbale sbagliato' : '',
        ].filter(Boolean).join(' ') || '✓';
        righe += `| ${i + 1} | ${s.domanda} | ${s.parole} (${s.limiteAtteso}) | ${s.tempoMs} ms | ${note} |\n`;
      });

      righe += `\n<details><summary>Vedi le risposte complete</summary>\n\n`;
      scambi.forEach((s, i) => {
        righe += `**${i + 1}. "${s.domanda}"**\n\n> ${s.risposta}\n\n`;
      });
      righe += `</details>\n\n`;
    }
  }

  const media = Math.round(tuttiITempi.reduce((a, b) => a + b, 0) / tuttiITempi.length);
  const p95 = calcolaPercentile(tuttiITempi, 95);
  const entroSoglia = p95 <= 4000;

  righe += `## Tempi di risposta (aggregati su ${tuttiITempi.length} chiamate)\n\n`;
  righe += `- Media: **${media} ms**\n`;
  righe += `- 95° percentile: **${p95} ms**\n`;
  righe += `- Requisito dichiarato nel Cap. 3 (<=4000 ms nel 95% dei casi): `
    + `${entroSoglia ? '✅ rispettato' : '❌ NON rispettato in questo test'}\n\n`;

  return righe;
}

async function main() {
  console.log('Recupero la lista degli avatar dal server...');
  const avatars = await recuperaAvatar();
  if (avatars.length === 0) throw new Error('Nessun avatar trovato: hai lanciato node db/setup.js?');

  const registri = [
    { nome: 'Scuola Secondaria di primo grado', ... }
    { nome: 'Scuola Secondaria di secondo grado', ... },
  ];

  const risultatiPerRegistro = {};

  for (const registro of registri) {
    console.log(`\n--- Registro: ${registro.nome} (user_id ${registro.userId}) ---`);
    risultatiPerRegistro[registro.nome] = {};

    for (const avatar of avatars) {
      console.log(`  Testando ${avatar.nome}...`);
      const scambi = await eseguiConversazioneDiProva(registro.userId, avatar);
      risultatiPerRegistro[registro.nome][avatar.nome] = scambi;
    }
  }

  const report = formattaReportMarkdown(risultatiPerRegistro);
  writeFileSync('scripts/report-valutazione-avatar.md', report, 'utf-8');
  console.log('\nFatto. Report salvato in scripts/report-valutazione-avatar.md');
}

main().catch((err) => {
  console.error('\nErrore durante la valutazione:', err.message);
  process.exit(1);
});