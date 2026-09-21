import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Database SEPARATO da quello vero (stementor.sqlite), così i test non
// toccano mai i dati reali dell'app in sviluppo. Viene ricreato da zero
// (schema.sql) ad ogni esecuzione dei test grazie a database.js.
const DB_TEST_PATH = path.join(__dirname, 'test.sqlite');

if (fs.existsSync(DB_TEST_PATH)) {
  fs.unlinkSync(DB_TEST_PATH);
}

// database.js legge questa variabile PRIMA di aprire la connessione --
// deve essere impostata qui, in un setupFile, che Vitest esegue prima di
// importare i file di test (e quindi prima che qualsiasi rotta importi
// database.js).
process.env.DB_PATH = DB_TEST_PATH;

// Chiave finta: nei test che chiamano /api/chat, il fetch verso Gemini
// viene comunque sostituito con un finto (vedi tests/api.test.js), quindi
// questa chiave non viene mai usata per una vera richiesta di rete.
process.env.AI_API_KEY = 'chiave-finta-per-i-test';
