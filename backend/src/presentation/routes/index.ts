import { Router } from 'express';
import userRoutes from './userRoutes';
import leadRoutes from './leadRoutes';
import leadSourceRoutes from './leadSourceRoutes';
import negotiationRoutes from './negotiationRoutes';
import dashboardRoutes from './dashboardRoutes';
import logRoutes from './logRoutes';

const router = Router();

router.use('/users', userRoutes);
router.use('/leads', leadRoutes);
router.use('/lead-sources', leadSourceRoutes);
router.use('/leads/:leadId/negotiation', negotiationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/logs', logRoutes);

export default router;
