import { Router } from 'express';
import userController from '../controllers/UserController';

const router = Router();

router.get('/', userController.index);
router.get('/:id', userController.show);
router.post('/', userController.store);
router.put('/:id', userController.update);
router.delete('/:id', userController.destroy);

export default router;