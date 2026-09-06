import db from './database.js';

// MIGRAZIONE UNA TANTUM: crea la tabella per i token di recupero password.
// Esegui questo file UNA VOLTA con: node db/migratePasswordReset.js

db.exec(`
  CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    scade_il DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

console.log('Tabella "password_resets" pronta.');