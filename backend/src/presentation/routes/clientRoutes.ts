import { Router } from 'express';
import clientController from '../controllers/ClientController';
import { roleMiddleware } from '../../infrastructure/middleware/roleMiddleware';

const router = Router();

router.get('/', clientController.index);
router.get('/:id', clientController.show);
router.post('/', clientController.store);
router.put('/:id', clientController.update);
router.delete('/:id', roleMiddleware('ADMIN', 'GERENTE_GERAL'), clientController.destroy);

export default router;
