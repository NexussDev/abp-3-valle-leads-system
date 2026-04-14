import { Router } from 'express';
import userController from '../controllers/UserController';
import { authMiddleware } from '../../infrastructure/middleware/authMiddleware';
import { roleMiddleware } from '../../infrastructure/middleware/roleMiddleware';

const router = Router();

router.get('/', authMiddleware, roleMiddleware('ADMIN'), userController.index);
router.get('/:id', authMiddleware, roleMiddleware('ADMIN'), userController.show);
router.post('/', authMiddleware, roleMiddleware('ADMIN'), userController.store);
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), userController.update);
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), userController.destroy);

export default router;