import { Router } from 'express';
import {
  getNotificationSettings,
  updateNotificationSettingsHandler,
} from '../controllers/settingsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/notifications', getNotificationSettings);
router.put('/notifications', updateNotificationSettingsHandler);

export default router;

