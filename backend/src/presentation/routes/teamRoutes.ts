import { Router } from 'express';
import teamController from '../controllers/TeamController';
import { roleMiddleware } from '../../infrastructure/middleware/roleMiddleware';

const router = Router();

router.get('/', teamController.index);
router.get('/:id', teamController.show);
router.post('/', roleMiddleware('ADMIN', 'GERENTE_GERAL'), teamController.store);
router.put('/:id', roleMiddleware('ADMIN', 'GERENTE_GERAL'), teamController.update);
router.delete('/:id', roleMiddleware('ADMIN'), teamController.destroy);

export default router;
