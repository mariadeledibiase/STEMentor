import db from './database.js';

// Due UTENTI DI TEST -- uno per fascia scolastica -- usati dallo script di
// valutazione degli avatar (scripts/valutazioneAvatar.js) per testare le
// risposte dell'IA sia nel registro "scuola media" sia in quello
// "scuola superiore", senza dover passare dalla registrazione vera.
//
// Esegui questo file UNA VOLTA con: node db/seedTestUsers.js
// (Idempotente: se esistono già utenti con questi nomi esatti, non li
// duplica -- così può essere rilanciato senza sporcare il database.)

const utentiTest = [
  {
    nome: 'Test Medie',
    eta: 12,
    livello_scolastico: 'scuola_secondaria_primo_grado',
    indirizzo_scolastico: null,
    consenso_genitoriale: 1,
  },
  {
    nome: 'Test Superiori',
    eta: 17,
    livello_scolastico: 'scuola_secondaria_secondo_grado',
    indirizzo_scolastico: 'Liceo scientifico',
    consenso_genitoriale: 1,
  },
];

const trovaEsistente = db.prepare('SELECT id FROM users WHERE nome = ?');
const inserisci = db.prepare(`
  INSERT INTO users (nome, eta, livello_scolastico, indirizzo_scolastico, consenso_genitoriale)
  VALUES (@nome, @eta, @livello_scolastico, @indirizzo_scolastico, @consenso_genitoriale)
`);

for (const utente of utentiTest) {
  const esistente = trovaEsistente.get(utente.nome);
  if (esistente) {
    console.log(`"${utente.nome}" esiste già (id: ${esistente.id}) -- nessuna azione.`);
    continue;
  }
  const risultato = inserisci.run(utente);
  console.log(`"${utente.nome}" creato con id: ${risultato.lastInsertRowid}`);
}

console.log('\nUsa questi id come user_id nello script di valutazione degli avatar.');