import { Router } from 'express';
import negotiationController from '../controllers/NegotiationController';

const router = Router();

router.post('/', negotiationController.storeByBody);

export default router;