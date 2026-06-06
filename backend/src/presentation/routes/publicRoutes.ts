import { Router } from 'express';
import publicLeadController from '../controllers/PublicLeadController';

const router = Router();

/**
 * Rotas públicas (sem authMiddleware).
 * Usadas pelo formulário de captação de lead no site do cliente.
 */
router.post('/leads', publicLeadController.register);

export default router;
