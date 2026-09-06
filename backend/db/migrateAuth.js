import db from './database.js';

// MIGRAZIONE UNA TANTUM: aggiunge email e password (cifrata) alla tabella
// users esistente, per passare dal semplice "codice profilo" a un vero
// accesso con email + password.
// Esegui questo file UNA VOLTA con: node db/migrateAuth.js
//
// NOTA: gli utenti creati PRIMA di questa migrazione (es. l'utente di
// test) non avranno email/password e non potranno più accedere con il
// vecchio sistema -- è previsto, in un prototipo di tesi non serve
// preservarli: basta registrarsi di nuovo con il nuovo modulo.

try {
  db.exec('ALTER TABLE users ADD COLUMN email TEXT');
  console.log('Colonna "email" aggiunta.');
} catch (errore) {
  if (errore.message.includes('duplicate column')) {
    console.log('Colonna "email" già presente, nessuna modifica necessaria.');
  } else {
    throw errore;
  }
}

try {
  db.exec('ALTER TABLE users ADD COLUMN password_hash TEXT');
  console.log('Colonna "password_hash" aggiunta.');
} catch (errore) {
  if (errore.message.includes('duplicate column')) {
    console.log('Colonna "password_hash" già presente, nessuna modifica necessaria.');
  } else {
    throw errore;
  }
}

// Indice univoco sull'email (ignora i vecchi utenti con email NULL, così
// la migrazione non fallisce su chi si era già registrato prima).
db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
  ON users(email)
  WHERE email IS NOT NULL
`);
console.log('Indice univoco su "email" creato (o già esistente).');

console.log('Migrazione completata.');