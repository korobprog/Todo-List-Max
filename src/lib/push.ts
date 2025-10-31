const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/\_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function getVapidPublicKey(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/push/vapid-public-key`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get VAPID public key');
  }

  const data = await response.json();
  return data.publicKey;
}

export async function subscribeToPush(publicKey: string): Promise<PushSubscription> {
  const registration = await navigator.serviceWorker.ready;
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: new Uint8Array(urlBase64ToUint8Array(publicKey)),
  });

  return subscription;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  const p256dhKey = subscription.getKey('p256dh');
  const authKey = subscription.getKey('auth');

  if (!p256dhKey || !authKey) {
    throw new Error('Subscription keys are missing');
  }

  const p256dh = arrayBufferToBase64(p256dhKey);
  const auth = arrayBufferToBase64(authKey);

  const response = await fetch(`${API_BASE_URL}/push/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        p256dh,
        auth,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send subscription to server');
  }
}

export async function unsubscribeFromPush(): Promise<void> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    const response = await fetch(`${API_BASE_URL}/push/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
      }),
    });

    if (response.ok) {
      await subscription.unsubscribe();
    }
  }
}

export async function checkPushPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('Браузер не поддерживает уведомления');
  }

  return Notification.permission;
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('Браузер не поддерживает уведомления');
  }

  return Notification.requestPermission();
}

export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

