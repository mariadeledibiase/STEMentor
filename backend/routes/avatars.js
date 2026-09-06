import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// GET /api/avatars -> lista tutti gli avatar (galleria, §3.2)
router.get('/', (req, res) => {
  const avatars = db.prepare('SELECT id, nome, disciplina, bio_breve, immagine_url FROM avatars').all();
  res.json(avatars);
});

// GET /api/avatars/:id -> dettaglio di un singolo avatar (senza esporre il system_prompt al frontend)
router.get('/:id', (req, res) => {
  const avatar = db.prepare('SELECT id, nome, disciplina, bio_breve, immagine_url FROM avatars WHERE id = ?').get(req.params.id);
  if (!avatar) return res.status(404).json({ errore: 'Avatar non trovato.' });
  res.json(avatar);
});

export default router;
