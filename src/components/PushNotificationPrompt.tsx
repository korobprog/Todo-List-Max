import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';

const STORAGE_KEY = 'push-notification-prompt-dismissed';
const MIN_TIME_ON_PAGE = 30000; // 30 секунд минимум на странице
const PROMPT_DELAY = 5000; // 5 секунд задержки после загрузки

export const PushNotificationPrompt = () => {
  const { isSupported, permission, subscribe, isLoading } = usePushNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [pageLoadTime] = useState(Date.now());
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Отслеживание взаимодействия пользователя (лучшая практика для Firefox)
  useEffect(() => {
    const handleInteraction = () => {
      setHasUserInteracted(true);
    };

    // Слушаем различные типы взаимодействий
    const events = ['click', 'scroll', 'keydown', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, []);

  useEffect(() => {
    // Проверяем, было ли окно уже закрыто
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Проверяем условия для показа промпта (лучшие практики):
    // 1. Push поддерживается
    // 2. Разрешение еще не запрошено (default)
    // 3. Пользователь не отклонил запрос ранее
    // 4. Пользователь провел достаточно времени на странице (30+ секунд)
    // 5. Пользователь взаимодействовал со страницей (для Firefox)
    if (!isSupported || permission !== 'default' || isDismissed) {
      return;
    }

    const checkShouldShow = () => {
      const timeOnPage = Date.now() - pageLoadTime;
      const isTabVisible = !document.hidden;
      
      // Проверяем условия согласно лучшим практикам:
      // - Пользователь провел минимум 30 секунд на странице
      // - Вкладка активна (не скрыта)
      // - Пользователь взаимодействовал (особенно важно для Firefox)
      if (timeOnPage >= MIN_TIME_ON_PAGE && isTabVisible && hasUserInteracted) {
        setIsVisible(true);
      }
    };

    // Слушаем изменения видимости вкладки (лучшая практика)
    const handleVisibilityChange = () => {
      if (!document.hidden && hasUserInteracted) {
        checkShouldShow();
      } else {
        // Если вкладка скрыта, скрываем промпт если он показан
        setIsVisible(prev => prev ? false : prev);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Первая проверка после задержки
    const initialTimer = setTimeout(checkShouldShow, PROMPT_DELAY);
    
    // Периодическая проверка каждые 5 секунд
    const intervalTimer = setInterval(checkShouldShow, 5000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSupported, permission, isDismissed, pageLoadTime, hasUserInteracted]);

  const handleAllow = useCallback(async () => {
    try {
      // Лучшая практика: промпт должен быть вызван в контексте пользовательского действия
      // Это особенно важно для Firefox, который требует явного взаимодействия
      setIsVisible(false);
      
      const success = await subscribe();
      if (success) {
        localStorage.setItem(STORAGE_KEY, 'true');
        // Отслеживание события (лучшая практика из OneSignal)
        console.log('Push notification permission granted');
      } else {
        // Если пользователь отклонил, показываем снова через некоторое время
        // Но не сразу, чтобы не быть навязчивым
      }
    } catch (error) {
      console.error('Error subscribing to push:', error);
      // В случае ошибки можно показать промпт снова позже
    }
  }, [subscribe]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
    // Отслеживание события отказа (лучшая практика из OneSignal)
    console.log('Push notification prompt dismissed');
  }, []);

  if (!isVisible || permission !== 'default' || !isSupported) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="fixed top-4 right-4 z-50 max-w-md"
      >
        <div className="relative bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border-2 border-primary/20 shadow-lg backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="absolute top-2 right-2 h-8 w-8 rounded-xl hover:bg-background/50"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
              <Bell className="h-6 w-6 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Включить уведомления?
              </h3>
              <p className="text-muted-foreground mb-4">
                Получайте уведомления о новых задачах, дедлайнах и важных событиях. 
                Нажмите "Разрешить" чтобы включить уведомления в браузере.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleAllow}
                  disabled={isLoading}
                  className="rounded-xl"
                >
                  {isLoading ? 'Загрузка...' : 'Разрешить'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  disabled={isLoading}
                  className="rounded-xl"
                >
                  Позже
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

