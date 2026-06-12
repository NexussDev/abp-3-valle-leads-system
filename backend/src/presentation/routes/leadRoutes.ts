import { Router } from 'express';
import leadController from '../controllers/LeadController';

const router = Router();

router.get('/recapture',         leadController.recapture);
router.patch('/:id/contact',     leadController.contact);
router.get('/:id/history',       leadController.history);

router.get('/', leadController.index);
router.get('/:id', leadController.show);
router.post('/', leadController.store);
router.put('/:id', leadController.update);
router.patch('/:id', leadController.update);
router.delete('/:id', leadController.destroy);

export default router;
