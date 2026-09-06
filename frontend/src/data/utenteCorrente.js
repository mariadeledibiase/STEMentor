// Gestione semplice dell'utente "loggato" nel browser, tramite localStorage.
// Non è un vero sistema di autenticazione (niente password) -- coerente con
// l'ambito del prototipo (§3.3): un profilo semplice, senza dati sensibili
// oltre a quelli già raccolti nel form di registrazione.

const CHIAVE_STORAGE = 'stementor_utente';

export function getUtente() {
  const dati = localStorage.getItem(CHIAVE_STORAGE);
  return dati ? JSON.parse(dati) : null;
}

export function setUtente(utente) {
  localStorage.setItem(CHIAVE_STORAGE, JSON.stringify(utente));
}

export function rimuoviUtente() {
  localStorage.removeItem(CHIAVE_STORAGE);
}