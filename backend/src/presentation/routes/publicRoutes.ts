import { Router } from 'express';
import publicLeadController from '../controllers/PublicLeadController';
import publicCatalogController from '../controllers/PublicCatalogController';

const router = Router();

/**
 * Rotas públicas (sem authMiddleware).
 * Usadas pelo formulário de captação de lead e pela vitrine do site.
 */
router.post('/leads', publicLeadController.register);

router.get('/catalog',     publicCatalogController.index);
router.get('/catalog/:id', publicCatalogController.show);

export default router;
