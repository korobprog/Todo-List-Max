import { Router } from 'express';
import {
  getVapidPublicKeyHandler,
  subscribeHandler,
  unsubscribeHandler,
  getSubscriptionsHandler,
} from '../controllers/pushController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/vapid-public-key', getVapidPublicKeyHandler);
router.post('/subscribe', subscribeHandler);
router.post('/unsubscribe', unsubscribeHandler);
router.get('/subscriptions', getSubscriptionsHandler);

export default router;

