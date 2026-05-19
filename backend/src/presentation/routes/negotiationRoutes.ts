import { Router } from 'express';
import negotiationController from '../controllers/NegotiationController';

const router = Router({ mergeParams: true });

router.get('/', negotiationController.show);
router.post('/', negotiationController.store);
router.put('/', negotiationController.update);

export default router;
