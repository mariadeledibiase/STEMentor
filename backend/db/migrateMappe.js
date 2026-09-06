import db from './database.js';

// MIGRAZIONE UNA TANTUM: ristruttura mappe_contenuti per riflettere meglio
// il sistema scolastico italiano (Liceo / Istituto Tecnico / Istituto
// Professionale, ciascuno con i propri indirizzi) e le università per
// classe di laurea, con sbocchi professionali collegati.
// Esegui questo file UNA VOLTA con: node db/migrateMappe.js

const colonne = [
  { nome: 'tipo_istituto', tipo: 'TEXT' },  // 'Liceo' | 'Istituto Tecnico' | 'Istituto Professionale' (solo per tipo='scuola')
  { nome: 'indirizzo', tipo: 'TEXT' },      // indirizzo/specializzazione (scuola) O classe di laurea, es. "L-31" (università)
  { nome: 'provincia', tipo: 'TEXT' },      // per filtrare le scuole più vicine
  { nome: 'sbocchi_professionali', tipo: 'TEXT' }, // lavori possibili, principalmente per le università
];

for (const colonna of colonne) {
  try {
    db.exec(`ALTER TABLE mappe_contenuti ADD COLUMN ${colonna.nome} ${colonna.tipo}`);
    console.log(`Colonna "${colonna.nome}" aggiunta.`);
  } catch (errore) {
    if (errore.message.includes('duplicate column')) {
      console.log(`Colonna "${colonna.nome}" già presente, nessuna modifica necessaria.`);
    } else {
      throw errore;
    }
  }
}

console.log('Migrazione completata.');