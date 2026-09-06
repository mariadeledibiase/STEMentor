import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, 'stementor.sqlite');

// Crea (o apre, se esiste già) il file del database.
// node:sqlite è un modulo integrato in Node.js (dalla v22.5) -- non richiede
// installazione di pacchetti esterni né compilazione di codice nativo.
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON');

// Alla prima esecuzione, crea tutte le tabelle leggendo schema.sql
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

console.log(`Database SQLite pronto: ${dbPath}`);

export default db;
