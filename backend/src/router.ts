import { Router } from 'express';
import authRoutes from './resource/Auth/authRoutes';
import userRoutes from './resource/User/userRoutes';
import leadRoutes from './resource/Lead/leadRoutes';
import leadSourceRoutes from './resource/LeadSource/leadSourceRoutes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/leads', leadRoutes);
router.use('/lead-sources', leadSourceRoutes);

export default router;  