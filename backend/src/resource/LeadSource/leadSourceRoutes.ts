import { Router } from 'express';
import leadSourceController from './LeadSourceController';

const router = Router();

router.get('/', leadSourceController.index);
router.get('/:id', leadSourceController.show);
router.post('/', leadSourceController.store);
router.put('/:id', leadSourceController.update);
router.delete('/:id', leadSourceController.destroy);

export default router;