import { Router } from 'express';
import userRoutes from '../src/resource/User/userRoutes';
import leadRoutes from '../src/resource/Lead/leadRoutes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/users', userRoutes);
router.use('/leads', leadRoutes);

export default router;
