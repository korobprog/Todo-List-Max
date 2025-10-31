import { useState, useEffect, useCallback } from 'react';
import {
  getVapidPublicKey,
  subscribeToPush,
  sendSubscriptionToServer,
  unsubscribeFromPush,
  checkPushPermission,
  requestPushPermission,
  isPushSupported,
} from '@/lib/push';
import { toast } from 'sonner';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  isLoading: boolean;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    permission: 'default',
    isLoading: true,
  });

  useEffect(() => {
    const init = async () => {
      try {
        const supported = isPushSupported();
        if (!supported) {
          setState({
            isSupported: false,
            isSubscribed: false,
            permission: 'denied',
            isLoading: false,
          });
          return;
        }

        if (!('serviceWorker' in navigator)) {
          setState({
            isSupported: false,
            isSubscribed: false,
            permission: 'denied',
            isLoading: false,
          });
          return;
        }

        const permission = await checkPushPermission();
        
        let registration;
        try {
          registration = await navigator.serviceWorker.ready;
        } catch (swError) {
          console.error('Service Worker not ready:', swError);
          setState({
            isSupported: false,
            isSubscribed: false,
            permission,
            isLoading: false,
          });
          return;
        }

        const subscription = await registration.pushManager.getSubscription();

        setState({
          isSupported: true,
          isSubscribed: !!subscription,
          permission,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error initializing push notifications:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    init();
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const supported = isPushSupported();
      if (!supported) {
        toast.error('Ваш браузер не поддерживает push уведомления');
        return false;
      }

      let permission = await checkPushPermission();
      if (permission === 'default') {
        permission = await requestPushPermission();
      }

      if (permission !== 'granted') {
        toast.error('Разрешение на уведомления не предоставлено');
        setState((prev) => ({ ...prev, permission, isLoading: false }));
        return false;
      }

      const publicKey = await getVapidPublicKey();

      const subscription = await subscribeToPush(publicKey);

      await sendSubscriptionToServer(subscription);

      setState({
        isSupported: true,
        isSubscribed: true,
        permission,
        isLoading: false,
      });

      toast.success('Push уведомления включены');
      return true;
    } catch (error: any) {
      console.error('Error subscribing to push:', error);
      toast.error(error.message || 'Ошибка подписки на уведомления');
      setState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      await unsubscribeFromPush();

      setState((prev) => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
      }));

      toast.success('Push уведомления отключены');
      return true;
    } catch (error: any) {
      console.error('Error unsubscribing from push:', error);
      toast.error(error.message || 'Ошибка отписки от уведомлений');
      setState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  const toggle = useCallback(async (): Promise<void> => {
    if (state.isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  }, [state.isSubscribed, subscribe, unsubscribe]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    toggle,
  };
}

