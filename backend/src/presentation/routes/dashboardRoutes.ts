import { Router } from 'express';
import dashboardController from '../controllers/DashboardController';

const router = Router();

router.get('/', dashboardController.operacional);
router.get('/analytics', dashboardController.analytics);

export default router;
