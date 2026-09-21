// =======================================================================
// Conversione ID viseme di Azure (0-21, set numerico proprio di Microsoft)
// -> nome del nostro asset bocca (A / E / O / FV / MBP / SIL).
//
// La colonna "fonemi" è quella ufficiale della documentazione Azure:
// https://learn.microsoft.com/azure/ai-services/speech-service/how-to-speech-synthesis-viseme
// (gli ID viseme rappresentano forme della bocca, sono indipendenti dalla
// lingua: anche sintetizzando testo italiano, Azure restituisce sempre
// uno di questi 22 ID).
//
// Per cambiare a quale asset corrisponde un ID, basta editare la riga
// corrispondente qui sotto -- nient'altro nel progetto va toccato.
// =======================================================================

export const AZURE_VISEME_A_GRUPPO = {
  0: 'SIL', // silenzio / bocca a riposo
  1: 'A', //  æ, ə, ʌ            (es. inglese "cat", "sun")
  2: 'A', //  ɑ                  (es. "father")
  3: 'O', //  ɔ                  (es. "off")
  4: 'E', //  ɛ, ʊ               (es. "bed", "book")
  5: 'E', //  ɝ                  (es. "bird")
  6: 'E', //  j, i, ɪ            (es. "yes", "see", "sit")
  7: 'O', //  w, u               (es. "we", "boot" -- rotonda, più vicina a O che ad A)
  8: 'O', //  o                  (es. "go")
  9: 'A', //  aʊ                 (dittongo, apertura iniziale simile ad A)
  10: 'O', //  ɔɪ                (dittongo, apertura iniziale simile ad O)
  11: 'A', //  aɪ                (dittongo, apertura iniziale simile ad A)
  12: 'A', //  h                 (aspirata, bocca aperta)
  13: 'E', //  ɹ                 (es. "red")
  14: 'E', //  l                 (es. "lot" -- lingua alzata, bocca socchiusa)
  15: 'FV', //  s, z              (denti ravvicinati, forma simile a F/V)
  16: 'FV', //  ʃ, tʃ, dʒ, ʒ       (es. "she", "chip" -- nessun asset dedicato, si usa FV)
  17: 'FV', //  ð                 (es. "this" -- nessun asset dedicato, si usa FV)
  18: 'FV', //  f, v              (es. "fee", "vote")
  19: 'MBP', //  d, t, n, θ        (lingua dietro i denti, bocca quasi chiusa)
  20: 'MBP', //  k, g, ŋ           (fondo bocca, esternamente quasi chiusa)
  21: 'MBP', //  p, b, m           (labbra chiuse)
};


// =======================================================================
// MOTORE A LAYER (avatar/avatar-engine.js)
// Usa la stessa tabella qui sopra, con poche correzioni perche' il motore
// ha una bocca vera per ogni forma (rest, A, E, I, O, U, FV, MBP):
//   - s/z, sh/ch, th (15, 16, 17) e d/t/n, k/g (19, 20) sono consonanti con
//     le labbra APERTE: FV (denti sul labbro) o MBP (labbra serrate) sarebbero
//     forme sbagliate e, in italiano, molto frequenti -> bocca "masticata".
//     Le mappo su E (bocca appena aperta, denti visibili), tranne:
//       - s/z (15) e "i" (6) -> I (denti ravvicinati);
//       - "u" e "w" (7) e sc/sh/ci/gi (16) -> U: nel parlato le labbra vanno in
//         avanti. Prima "scienziata" restava sulla E.
// Le forme I e U esistono solo per le scienziate che hanno gli asset mouth_I.png
// e mouth_U.png (es. Margherita; Marie ha la I): per le altre il motore le
// sostituisce con la forma piu' vicina (I -> E, U -> O), quindi per loro non
// cambia nulla.
// Per cambiare una forma basta editare OVERRIDE_MOTORE o la tabella sopra.
// =======================================================================

const OVERRIDE_MOTORE = {
  6: 'I', //  i, j ("ee": denti visibili, angoli tirati)
  7: 'U', //  u, w (labbra in avanti; se manca la U diventa O)
  15: 'I', //  s, z (denti ravvicinati e visibili)
  16: 'U', //  sc/sh, c/g dolci ("scienza", "ciao", "gente"): labbra in avanti
  17: 'E',
  19: 'E',
  20: 'E',
};

// visemeId (0-21) -> 'rest' | 'A' | 'E' | 'I' | 'O' | 'U' | 'FV' | 'MBP'
export function visemeIdANomeAsset(visemeId) {
  const gruppo =
    OVERRIDE_MOTORE[visemeId] ?? AZURE_VISEME_A_GRUPPO[visemeId] ?? 'SIL';
  return gruppo === 'SIL' ? 'rest' : gruppo;
}

// Se per piu' di questi secondi non arriva un nuovo viseme, Azure non ha
// segnalato una pausa esplicita (virgole, respiri): la bocca si richiude.
const SOGLIA_PAUSA_SECONDI = 0.22;

// [{ time, visemeId }] (dal backend, /api/tts) -> [{ time, viseme }]
export function visemiATimeline(visemi = []) {
  const timeline = [];

  visemi.forEach((v, i) => {
    timeline.push({ time: v.time, viseme: visemeIdANomeAsset(v.visemeId) });

    const prossimo = visemi[i + 1];
    const finePrevista = v.time + SOGLIA_PAUSA_SECONDI;

    if (!prossimo || prossimo.time > finePrevista) {
      timeline.push({ time: finePrevista, viseme: 'rest' });
    }
  });

  return timeline;
}
