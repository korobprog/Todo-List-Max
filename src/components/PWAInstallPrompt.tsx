import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const STORAGE_KEY = 'pwa-install-prompt-dismissed';
const MIN_TIME_ON_PAGE = 60000; // 60 секунд минимум на странице
const PROMPT_DELAY = 10000; // 10 секунд задержки после загрузки

export const PWAInstallPrompt = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [pageLoadTime] = useState(Date.now());
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  // Проверка, установлено ли приложение уже
  useEffect(() => {
    // Проверка через display-mode media query
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    // Проверка через window.navigator.standalone (для iOS)
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true);
    }
  }, []);

  // Отслеживание взаимодействия пользователя
  useEffect(() => {
    const handleInteraction = () => {
      setHasUserInteracted(true);
    };

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

  // Перехват события beforeinstallprompt (лучшая практика)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Предотвращаем автоматический показ браузерного промпта
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      // Сохраняем событие для последующего использования
      deferredPromptRef.current = e;
      
      // Отслеживание события (лучшая практика)
      console.log('PWA install prompt event captured');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Обработка успешной установки
  useEffect(() => {
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      localStorage.setItem(STORAGE_KEY, 'installed');
      toast.success('Приложение успешно установлено!');
      console.log('PWA installed successfully');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Логика показа промпта
  useEffect(() => {
    // Проверяем, было ли окно уже закрыто или приложение установлено
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed || isInstalled) {
      setIsDismissed(true);
      return;
    }

    // Условия для показа промпта (лучшие практики):
    // 1. Событие beforeinstallprompt было перехвачено
    // 2. Пользователь провел достаточно времени на странице (60+ секунд)
    // 3. Пользователь взаимодействовал со страницей
    // 4. Вкладка активна
    if (!deferredPromptRef.current) {
      return;
    }

    const checkShouldShow = () => {
      const timeOnPage = Date.now() - pageLoadTime;
      const isTabVisible = !document.hidden;
      
      // Проверяем условия согласно лучшим практикам:
      // - Пользователь провел минимум 60 секунд на странице
      // - Вкладка активна
      // - Пользователь взаимодействовал
      // - Есть доступное событие установки
      if (
        timeOnPage >= MIN_TIME_ON_PAGE &&
        isTabVisible &&
        hasUserInteracted &&
        deferredPromptRef.current &&
        !isInstalled
      ) {
        setIsVisible(true);
      }
    };

    // Слушаем изменения видимости вкладки
    const handleVisibilityChange = () => {
      if (!document.hidden && hasUserInteracted && deferredPromptRef.current) {
        checkShouldShow();
      } else {
        setIsVisible(prev => prev ? false : prev);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Первая проверка после задержки
    const initialTimer = setTimeout(checkShouldShow, PROMPT_DELAY);
    
    // Периодическая проверка каждые 10 секунд
    const intervalTimer = setInterval(checkShouldShow, 10000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pageLoadTime, hasUserInteracted, isInstalled]);

  const handleInstall = useCallback(async () => {
    if (!deferredPromptRef.current) {
      toast.error('Установка недоступна');
      return;
    }

    try {
      // Показываем нативный промпт установки (лучшая практика)
      await deferredPromptRef.current.prompt();
      
      // Ждем выбора пользователя
      const choiceResult = await deferredPromptRef.current.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted PWA install prompt');
        setIsVisible(false);
        localStorage.setItem(STORAGE_KEY, 'installed');
      } else {
        console.log('User dismissed PWA install prompt');
        setIsVisible(false);
        localStorage.setItem(STORAGE_KEY, 'dismissed');
      }

      // Очищаем ссылку на событие
      deferredPromptRef.current = null;
    } catch (error) {
      console.error('Error showing install prompt:', error);
      toast.error('Ошибка при установке приложения');
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem(STORAGE_KEY, 'dismissed');
    console.log('PWA install prompt dismissed');
  }, []);

  if (!isVisible || isInstalled || isDismissed || !deferredPromptRef.current) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto md:left-auto md:right-4"
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
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Установите приложение
              </h3>
              <p className="text-muted-foreground mb-4">
                Добавьте приложение на главный экран для быстрого доступа и работы офлайн
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  className="rounded-xl"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Установить
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDismiss}
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

