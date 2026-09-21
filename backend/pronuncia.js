// Pronuncia fissa dei nomi delle scienziate per Azure Neural TTS.
//
// Il problema: con una voce italiana Azure decide caso per caso, in base alla
// frase, se leggere "Ada Lovelace" all'inglese o all'italiana. Qui ogni nome
// viene avvolto in un tag SSML <phoneme> con la trascrizione IPA, cosi' si legge
// SEMPRE allo stesso modo, in qualsiasi punto della frase.
//
// Perche' non un file lexicon (.pls) come suggerito da Marcello: il lexicon deve
// stare a un URL pubblico raggiungibile da Azure, quindi non funziona in
// sviluppo locale. Il tag <phoneme> ha lo stesso effetto e viaggia dentro
// l'SSML, senza hosting. Se preferisci il lexicon in produzione, basta mettere
// il file online e aggiungere <lexicon uri="..."/> dentro <voice> in tts.js.
//
// La trascrizione e' volutamente fatta con soli fonemi ITALIANI (la voce e'
// italiana: fonemi inglesi come /ʌ/ o /eɪ/ non sono nel suo set).
//
// PER AGGIUNGERE UN NOME: una riga nella tabella. Vale solo la parola intera,
// senza distinguere maiuscole/minuscole. Usa una parola per riga (non "Nome
// Cognome" insieme): Azure gestisce meglio i tag sulle singole parole.

export const FONETICA = {
  // Ada Lovelace: "Àda Lòvleis" (Lovelace all'italiana, con dittongo "ei")
  ada: 'ˈada',
  lovelace: 'ˈlɔvlejs',

  // Marie Curie: "Marì Curì" (all'italiana; il suono francese /y/ non esiste in italiano)
  marie: 'maˈri',
  curie: 'kuˈri',
};

const escapeRegex = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Una sola espressione con tutte le parole, cosi' non si annidano mai due tag.
// I lookaround Unicode fanno combaciare solo parole intere ("Ada" si', "Adamo" o
// "Cascada" no).
function costruisciRegex() {
  const parole = Object.keys(FONETICA)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex)
    .join('|');
  return new RegExp(`(?<![\\p{L}\\p{N}])(${parole})(?![\\p{L}\\p{N}])`, 'giu');
}

const REGEX = costruisciRegex();

/**
 * Avvolge nei tag <phoneme> le parole della tabella.
 * ATTENZIONE: va chiamata sul testo GIA' escapato per l'XML (escapeSsml),
 * altrimenti i tag che aggiunge verrebbero escapati a loro volta.
 */
export function applicaFonetica(testoEscapato) {
  return testoEscapato.replace(REGEX, (parola) => {
    const ipa = FONETICA[parola.toLowerCase()];
    return `<phoneme alphabet="ipa" ph="${ipa}">${parola}</phoneme>`;
  });
}