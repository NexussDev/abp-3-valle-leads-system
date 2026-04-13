import express from 'express';
import cors from 'cors';
import routes from './presentation/routes';
import { errorHandler } from './infrastructure/middleware/errorHandler';
import authRoutes from './presentation/routes/auth.routes';


const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);
app.use('/auth', authRoutes);

app.use(errorHandler);

export default app;
