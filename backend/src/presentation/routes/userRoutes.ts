import { Router } from 'express';
import userController from '../controllers/UserController';
import { roleMiddleware } from '../../infrastructure/middleware/roleMiddleware';

const router = Router();

// authMiddleware já é aplicado em app.ts para todas as rotas /api/*
router.put('/me', userController.me);
router.get('/', roleMiddleware('ADMIN'), userController.index);
router.get('/:id', roleMiddleware('ADMIN'), userController.show);
router.post('/', roleMiddleware('ADMIN'), userController.store);
router.put('/:id', roleMiddleware('ADMIN'), userController.update);
router.delete('/:id', roleMiddleware('ADMIN'), userController.destroy);

export default router;