import express from 'express';
import cors from 'cors';
import routes from './presentation/routes';
import { errorHandler } from './infrastructure/middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.use(errorHandler);

export default app;
