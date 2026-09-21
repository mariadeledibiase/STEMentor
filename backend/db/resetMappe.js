import db from './database.js';

// Svuota SOLO la tabella mappe_contenuti (scuole, università, carriere),
// lasciando intatti utenti, avatar, conversazioni e risultati quiz.
// Usalo quando hai aggiornato seedMappe.js e vuoi far ripartire il
// popolamento da zero, senza perdere il resto del database.
//
// Uso: node db/resetMappe.js
// Poi: node db/setup.js   (rifà il seed con i dati aggiornati)

const { conteggio } = db.prepare('SELECT COUNT(*) AS conteggio FROM mappe_contenuti').get();

db.prepare('DELETE FROM mappe_contenuti').run();

try {
  db.prepare("DELETE FROM sqlite_sequence WHERE name = 'mappe_contenuti'").run();
} catch (err) {
  // tabella sqlite_sequence assente o senza quella riga: nessun problema
}

console.log(`Tabella "mappe_contenuti" svuotata (${conteggio} righe rimosse). Ora lancia: node db/setup.js`);