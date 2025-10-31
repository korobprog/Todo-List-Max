import webpush from 'web-push';
import { pool } from '../config/database';
import { PushSubscription, CreatePushSubscriptionData, PushSubscriptionPayload } from '../models/PushSubscription';

// Инициализация VAPID ключей (должны быть в .env)
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@todoapp.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export const createPushSubscription = async (
  subscriptionData: CreatePushSubscriptionData
): Promise<PushSubscription> => {
  const [result] = await pool.execute(
    `INSERT INTO push_subscriptions (userId, endpoint, p256dh, auth)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       p256dh = VALUES(p256dh),
       auth = VALUES(auth),
       updatedAt = CURRENT_TIMESTAMP`,
    [
      subscriptionData.userId,
      subscriptionData.endpoint,
      subscriptionData.p256dh,
      subscriptionData.auth,
    ]
  );

  const insertId = (result as any).insertId;
  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM push_subscriptions WHERE id = ?',
    [insertId]
  );

  return rows[0];
};

export const getPushSubscriptionsByUserId = async (userId: number): Promise<PushSubscription[]> => {
  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM push_subscriptions WHERE userId = ?',
    [userId]
  );
  return rows;
};

export const deletePushSubscription = async (userId: number, endpoint: string): Promise<void> => {
  await pool.execute(
    'DELETE FROM push_subscriptions WHERE userId = ? AND endpoint = ?',
    [userId, endpoint]
  );
};

export const sendPushNotification = async (
  userId: number,
  payload: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
  }
): Promise<void> => {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('VAPID keys not configured, skipping push notification');
    return;
  }

  const subscriptions = await getPushSubscriptionsByUserId(userId);
  
  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/web-app-manifest-192x192.png',
    badge: payload.badge || '/web-app-manifest-192x192.png',
    tag: payload.tag,
    data: payload.data,
  });

  const promises = subscriptions.map(async (subscription) => {
    try {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      };

      await webpush.sendNotification(pushSubscription, notificationPayload);
    } catch (error: any) {
      console.error(`Failed to send push notification to ${subscription.endpoint}:`, error);
      
      // Удаляем недействительные подписки
      if (error.statusCode === 410 || error.statusCode === 404) {
        await deletePushSubscription(userId, subscription.endpoint);
      }
    }
  });

  await Promise.allSettled(promises);
};

export const getVapidPublicKey = (): string | null => {
  return vapidPublicKey || null;
};

