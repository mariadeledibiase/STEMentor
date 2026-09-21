import express from 'express';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { applicaFonetica } from '../pronuncia.js';
import { limitaRichieste } from '../middleware/limitaRichieste.js';

const router = express.Router();

// ---------------------------------------------------------------------
// Profilo vocale per ciascuna mentor: voce neurale italiana + piccoli
// aggiustamenti di velocità (rate) e intonazione (pitch) via SSML, per
// dare a ciascuna un carattere leggermente diverso.
// Sostituisce PROFILI_VOCALI che prima viveva in TalkingAvatar.jsx.
// ---------------------------------------------------------------------
const PROFILI_VOCALI = {
  'Ada Lovelace': {
    voce: 'it-IT-IsabellaNeural',
    rate: '0%',
    pitch: '+5%',
  },
  'Marie Curie': {
    voce: 'it-IT-ElsaNeural',
    rate: '-5%',
    pitch: '-3%',
  },
  'Margherita Hack': {
    voce: 'it-IT-IsabellaNeural',
    rate: '+5%',
    pitch: '-8%',
  },
  'Samantha Cristoforetti': {
    voce: 'it-IT-ElsaNeural',
    rate: '+8%',
    pitch: '+8%',
  },
};

const PROFILO_DEFAULT = {
  voce: 'it-IT-IsabellaNeural',
  rate: '0%',
  pitch: '0%',
};

// Limiti di sicurezza sulla rotta: la sintesi vocale consuma la quota di
// Azure, quindi il testo ha una lunghezza massima (le risposte della chat
// sono al massimo ~80 parole, cioè ben sotto questa soglia) e le richieste
// per IP sono limitate (vedi middleware/limitaRichieste.js).
const MAX_CARATTERI_TESTO = 1000;
const limitaTts = limitaRichieste({ finestraMs: 60_000, massimo: 30 });

// Il testo entra dentro un tag SSML: & < > " ' vanno sempre escapati,
// altrimenti un messaggio con questi caratteri romperebbe l'XML e la
// sintesi fallirebbe con un errore poco chiaro.
function escapeSsml(testo) {
  return testo
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Esportata solo per poterla testare senza chiamare Azure.
export function costruisciSsml(testo, profilo = PROFILO_DEFAULT) {
  // ORDINE IMPORTANTE: prima si escapa l'XML, poi si applicano i tag
  // <phoneme> della pronuncia (vedi pronuncia.js), altrimenti i tag
  // appena aggiunti verrebbero escapati a loro volta.
  const testoEscapato = applicaFonetica(escapeSsml(testo));

  // xmlns:mstts + <mstts:viseme type="redlips_front"/> sono quello che
  // dice ad Azure di restituire gli eventi viseme durante la sintesi.
  return `<speak version="1.0" xml:lang="it-IT" xmlns:mstts="https://www.w3.org/2001/mstts">
  <voice name="${profilo.voce}">
    <mstts:viseme type="redlips_front"/>
    <prosody rate="${profilo.rate}" pitch="${profilo.pitch}">${testoEscapato}</prosody>
  </voice>
</speak>`;
}

// Esegue la sintesi vocale con l'SDK di Azure e restituisce una Promise
// con l'audio (Buffer) e la lista dei visemi raccolti durante la sintesi.
function sintetizza(testo, nomeAvatar) {
  return new Promise((resolve, reject) => {
    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;

    if (!key || !region) {
      reject(
        new Error(
          'AZURE_SPEECH_KEY / AZURE_SPEECH_REGION mancanti nel file .env'
        )
      );
      return;
    }

    const profilo = PROFILI_VOCALI[nomeAvatar] || PROFILO_DEFAULT;
    const ssml = costruisciSsml(testo, profilo);

    const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);

    // mp3 leggero: sufficiente per la qualità che serve in chat, file
    // più piccoli da spedire al frontend rispetto a un wav non compresso.
    speechConfig.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

    // audioConfig = null: nessun altoparlante di default (il backend
    // gira senza scheda audio), ci basta il buffer audio nel risultato.
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);

    const visemi = [];

    synthesizer.visemeReceived = (_sender, evento) => {
      visemi.push({
        // audioOffset è in unità da 100 nanosecondi -> secondi
        time: evento.audioOffset / 10_000_000,
        visemeId: evento.visemeId,
      });
    };

    synthesizer.speakSsmlAsync(
      ssml,
      (risultato) => {
        synthesizer.close();

        if (
          risultato.reason ===
          sdk.ResultReason.SynthesizingAudioCompleted
        ) {
          resolve({
            audio: Buffer.from(risultato.audioData),
            visemi,
          });
        } else {
          reject(
            new Error(
              risultato.errorDetails ||
                'La sintesi vocale di Azure non è riuscita.'
            )
          );
        }
      },
      (errore) => {
        synthesizer.close();
        reject(errore instanceof Error ? errore : new Error(String(errore)));
      }
    );
  });
}

// POST /api/tts -> { nome, testo } => { audio (base64), mimeType, visemi }
// Il frontend non deve MAI vedere la chiave Azure: passa solo testo e
// nome dell'avatar, la chiamata vera ad Azure avviene qui.
router.post('/', limitaTts, async (req, res) => {
  const { nome, testo } = req.body;

  if (typeof nome !== 'string' || typeof testo !== 'string' || !nome || !testo.trim()) {
    return res
      .status(400)
      .json({ errore: 'nome e testo sono obbligatori.' });
  }

  if (testo.length > MAX_CARATTERI_TESTO) {
    return res
      .status(400)
      .json({ errore: `Il testo è troppo lungo (massimo ${MAX_CARATTERI_TESTO} caratteri).` });
  }

  try {
    const { audio, visemi } = await sintetizza(testo, nome);

    res.json({
      audio: audio.toString('base64'),
      mimeType: 'audio/mpeg',
      visemi, // [{ time: 0.4, visemeId: 12 }, ...]
    });
  } catch (errore) {
    console.error('Errore sintesi vocale Azure:', errore);
    res.status(502).json({
      errore: 'Sintesi vocale non disponibile al momento.',
    });
  }
});

export default router;