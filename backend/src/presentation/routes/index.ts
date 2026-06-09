import { Router } from 'express';
import userRoutes from './userRoutes';
import leadRoutes from './leadRoutes';
import leadSourceRoutes from './leadSourceRoutes';
import negotiationRoutes from './negotiationRoutes';
import negotiationsRootRoutes from './negotiationsRootRoutes';
import dashboardRoutes from './dashboardRoutes';
import logRoutes from './logRoutes';
import clientRoutes from './clientRoutes';
import teamRoutes from './teamRoutes';
import vehicleListingRoutes from './vehicleListingRoutes';

const router = Router();

router.use('/users', userRoutes);
router.use('/leads', leadRoutes);
router.use('/lead-sources', leadSourceRoutes);
router.use('/leads/:leadId/negotiation', negotiationRoutes);
router.use('/negotiations', negotiationsRootRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/logs', logRoutes);
router.use('/clients', clientRoutes);
router.use('/teams', teamRoutes);
router.use('/vehicle-listings', vehicleListingRoutes);

export default router;