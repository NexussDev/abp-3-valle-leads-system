import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../../infrastructure/middleware/authMiddleware';

const router = Router();
const controller = new AuthController();

router.post('/login', (req, res) => controller.login(req, res));
router.post('/logout', authMiddleware, (req, res, next) => controller.logout(req, res, next));

export default router;
