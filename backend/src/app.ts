import express from 'express';
import cors from 'cors';
import routes from './presentation/routes';
import { errorHandler } from './infrastructure/middleware/errorHandler';
import { authMiddleware } from './infrastructure/middleware/authMiddleware';
import authRoutes from './presentation/routes/auth.routes';
import publicRoutes from './presentation/routes/publicRoutes';


const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', authMiddleware, routes);
app.use('/auth', authRoutes);
app.use('/public', publicRoutes);

app.use(errorHandler);

export default app;
