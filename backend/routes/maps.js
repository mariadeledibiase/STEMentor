import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// GET /api/maps/:tipo -> restituisce i contenuti di una mappa (carriera | universita | scuola)
// Filtrabile per tipo_istituto, indirizzo, regione, provincia (requisito §3.2)
router.get('/:tipo', (req, res) => {
  const { tipo } = req.params;
  const { tipo_istituto, indirizzo, regione, provincia } = req.query;

  if (!['carriera', 'universita', 'scuola'].includes(tipo)) {
    return res.status(400).json({ errore: 'Tipo di mappa non valido.' });
  }

  let query = 'SELECT * FROM mappe_contenuti WHERE tipo = ?';
  const parametri = [tipo];

  if (tipo_istituto) {
    query += ' AND tipo_istituto = ?';
    parametri.push(tipo_istituto);
  }
  if (indirizzo) {
    query += ' AND indirizzo = ?';
    parametri.push(indirizzo);
  }
  if (regione) {
    query += ' AND regione = ?';
    parametri.push(regione);
  }
  if (provincia) {
    query += ' AND provincia = ?';
    parametri.push(provincia);
  }

  query += ' ORDER BY nome ASC';

  const risultati = db.prepare(query).all(...parametri);
  res.json(risultati);
});

// GET /api/maps/:tipo/opzioni-filtro -> restituisce i valori disponibili
// per i filtri (indirizzi, regioni, ecc. effettivamente presenti nei dati),
// così il frontend mostra solo opzioni che danno risultati.
router.get('/:tipo/opzioni-filtro', (req, res) => {
  const { tipo } = req.params;

  if (!['carriera', 'universita', 'scuola'].includes(tipo)) {
    return res.status(400).json({ errore: 'Tipo di mappa non valido.' });
  }

  const tipiIstituto = db.prepare(
    'SELECT DISTINCT tipo_istituto FROM mappe_contenuti WHERE tipo = ? AND tipo_istituto IS NOT NULL ORDER BY tipo_istituto'
  ).all(tipo).map((r) => r.tipo_istituto);

  const indirizzi = db.prepare(
    'SELECT DISTINCT indirizzo FROM mappe_contenuti WHERE tipo = ? AND indirizzo IS NOT NULL ORDER BY indirizzo'
  ).all(tipo).map((r) => r.indirizzo);

  const regioni = db.prepare(
    'SELECT DISTINCT regione FROM mappe_contenuti WHERE tipo = ? AND regione IS NOT NULL ORDER BY regione'
  ).all(tipo).map((r) => r.regione);

  res.json({ tipiIstituto, indirizzi, regioni });
});

export default router;
