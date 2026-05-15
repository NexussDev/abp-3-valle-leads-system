import express from 'express';
import cors from 'cors';

import routes from './router';

import { errorHandler } from './infrastructure/middleware/errorHandler';
import { authMiddleware } from './infrastructure/middleware/authMiddleware';

import authRoutes from './resource/Auth/authRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API rodando');
});

/*
ROTA PÚBLICA
NÃO USA TOKEN
*/
app.use('/auth', authRoutes);

/*
ROTAS PROTEGIDAS
USA TOKEN
*/
app.use('/api', authMiddleware, routes);

app.use(errorHandler);

export default app;