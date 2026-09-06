import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// POST /api/quiz -> salva il risultato del quiz di orientamento (§3.2)
router.post('/', (req, res) => {
  const { user_id, profilo_interessi } = req.body;

  if (!user_id || !profilo_interessi) {
    return res.status(400).json({ errore: 'user_id e profilo_interessi sono obbligatori.' });
  }

  const stmt = db.prepare('INSERT INTO quiz_results (user_id, profilo_interessi) VALUES (?, ?)');
  const result = stmt.run(user_id, JSON.stringify(profilo_interessi));

  res.status(201).json({ id: result.lastInsertRowid, messaggio: 'Risultato quiz salvato.' });
});

// GET /api/quiz/:user_id -> recupera l'ultimo risultato quiz di un utente (per collegarlo alle mappe)
router.get('/:user_id', (req, res) => {
  const risultato = db.prepare(`
    SELECT * FROM quiz_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
  `).get(req.params.user_id);

  if (!risultato) return res.status(404).json({ errore: 'Nessun quiz trovato per questo utente.' });

  res.json({ ...risultato, profilo_interessi: JSON.parse(risultato.profilo_interessi) });
});

export default router;
