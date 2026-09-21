import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import usersRouter from './routes/users.js';
import avatarsRouter from './routes/avatars.js';
import chatRouter from './routes/chat.js';
import quizRouter from './routes/quiz.js';
import mapsRouter from './routes/maps.js';
import ttsRouter from './routes/tts.js';

dotenv.config();

// Estratto da server.js (che prima costruiva l'app e la metteva subito in
// ascolto nello stesso file) in modo che i test possano importare `app`
// direttamente -- con supertest non serve un server realmente in ascolto
// su una porta, basta l'oggetto Express.

const app = express();

app.use(cors());              // permette al frontend (porta diversa) di chiamare questa API
app.use(express.json());      // interpreta il body delle richieste come JSON

// Collega ogni gruppo di rotte al proprio percorso base
app.use('/api/users', usersRouter);
app.use('/api/avatars', avatarsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/maps', mapsRouter);
app.use('/api/tts', ttsRouter);

app.get('/', (req, res) => {
  res.json({ messaggio: 'STEMentor API - il server funziona correttamente.' });
});

export default app;
