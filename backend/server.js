import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import usersRouter from './routes/users.js';
import avatarsRouter from './routes/avatars.js';
import chatRouter from './routes/chat.js';
import quizRouter from './routes/quiz.js';
import mapsRouter from './routes/maps.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());              // permette al frontend (porta diversa) di chiamare questa API
app.use(express.json());      // interpreta il body delle richieste come JSON

// Collega ogni gruppo di rotte al proprio percorso base
app.use('/api/users', usersRouter);
app.use('/api/avatars', avatarsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/maps', mapsRouter);

app.get('/', (req, res) => {
  res.json({ messaggio: 'STEMentor API - il server funziona correttamente.' });
});

app.listen(PORT, () => {
  console.log(`Server STEMentor avviato su http://localhost:${PORT}`);
});
