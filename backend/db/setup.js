// SETUP UNICO DEL DATABASE.
// Esegui questo file (o, meglio ancora, lascialo eseguire in automatico
// da "npm run dev" / "npm start", vedi package.json) per portare il
// database in uno stato completo e funzionante con UN SOLO COMANDO:
//
//   node db/setup.js
//
// Cosa fa, in ordine:
// 1. Importa database.js -> crea la connessione ed esegue schema.sql
//    (che ora include già email/password_hash, password_resets e le
//    colonne estese di mappe_contenuti).
// 2. Applica le vecchie migrazioni (migrateAuth, migratePasswordReset,
//    migrateMappe) -- servono SOLO se stai riusando un file .sqlite
//    creato PRIMA dell'unificazione dello schema; su un database nuovo
//    non fanno nulla (le colonne/tabelle esistono già, gli ALTER TABLE
//    falliscono silenziosamente con "duplicate column" e vengono ignorati).
// 3. Semina gli avatar e i contenuti delle mappe, ma SOLO se le tabelle
//    sono vuote (seed.js e seedMappe.js sono idempotenti) -- così può
//    essere lanciato ad ogni avvio senza creare duplicati o cancellare
//    dati già inseriti.
//
// È quindi sicuro lanciarlo tutte le volte che vuoi, anche più volte di
// fila: non rompe né duplica nulla.

import './database.js';

console.log('--- Verifica/applicazione migrazioni (necessarie solo su database pre-esistenti) ---');
await import('./migrateAuth.js');
await import('./migratePasswordReset.js');
await import('./migrateMappe.js');

console.log('--- Verifica/popolamento dati iniziali ---');
await import('./seed.js');
await import('./seedMappe.js');

console.log('--- Setup completato: il database è pronto. ---');