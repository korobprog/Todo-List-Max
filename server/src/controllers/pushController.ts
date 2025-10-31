import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  createPushSubscription,
  deletePushSubscription,
  getPushSubscriptionsByUserId,
  getVapidPublicKey,
} from '../services/pushService';
import { PushSubscriptionPayload } from '../models/PushSubscription';

export const getVapidPublicKeyHandler = async (req: AuthRequest, res: Response) => {
  try {
    const publicKey = getVapidPublicKey();
    if (!publicKey) {
      return res.status(503).json({ error: 'Push notifications not configured' });
    }
    res.json({ publicKey });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Ошибка получения VAPID ключа' });
  }
};

export const subscribeHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const subscription: PushSubscriptionPayload = req.body;
    
    if (!subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      return res.status(400).json({ error: 'Неверный формат подписки' });
    }

    await createPushSubscription({
      userId: req.userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    });

    res.status(201).json({ message: 'Подписка создана' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Ошибка создания подписки' });
  }
};

export const unsubscribeHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const { endpoint } = req.body;
    
    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint обязателен' });
    }

    await deletePushSubscription(req.userId, endpoint);
    res.json({ message: 'Подписка удалена' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Ошибка удаления подписки' });
  }
};

export const getSubscriptionsHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const subscriptions = await getPushSubscriptionsByUserId(req.userId);
    res.json({ subscriptions });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Ошибка получения подписок' });
  }
};

