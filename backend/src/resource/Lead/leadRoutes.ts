import { Router } from 'express';
import leadController from '../../resource/Lead/LeadController';

const router = Router();

router.get('/', leadController.index);
router.get('/:id', leadController.show);
router.post('/', leadController.store);
router.put('/:id', leadController.update);
router.delete('/:id', leadController.destroy);

export default router;
