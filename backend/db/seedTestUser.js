import db from './database.js';

// UTENTE DI TEST -- da usare finché non costruiamo la vera pagina di
// registrazione/profilazione (§3.2, area "Profilazione utente").
// Esegui questo file UNA VOLTA con: node db/seedTestUser.js

const utenteTest = {
  nome: 'Utente di prova',
  eta: 17,
  livello_scolastico: 'scuola_superiore',
  indirizzo_scolastico: 'Liceo scientifico',
  consenso_genitoriale: 1,
};

const stmt = db.prepare(`
  INSERT INTO users (nome, eta, livello_scolastico, indirizzo_scolastico, consenso_genitoriale)
  VALUES (@nome, @eta, @livello_scolastico, @indirizzo_scolastico, @consenso_genitoriale)
`);

const risultato = stmt.run(utenteTest);

console.log(`Utente di test inserito con id: ${risultato.lastInsertRowid}`);
console.log('Usa questo id come TEMP_USER_ID in frontend/src/pages/Chat.jsx');