import { Router } from 'express';
import logController from '../controllers/LogController';
import { roleMiddleware } from '../../infrastructure/middleware/roleMiddleware';

const router = Router();

router.get('/', roleMiddleware('ADMIN', 'GERENTE', 'GERENTE_GERAL'), logController.index);

export default router;
