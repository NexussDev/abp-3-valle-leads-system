import { Router } from 'express';
import logController from '../controllers/LogController';
import { roleMiddleware } from '../../infrastructure/middleware/roleMiddleware';

const router = Router();

router.get('/', roleMiddleware('ADMIN'), logController.index);

export default router;
