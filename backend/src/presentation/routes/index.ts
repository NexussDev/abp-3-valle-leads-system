import { Router } from 'express';
import userRoutes from './userRoutes';
import leadRoutes from './leadRoutes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/users', userRoutes);
router.use('/leads', leadRoutes);

export default router;
