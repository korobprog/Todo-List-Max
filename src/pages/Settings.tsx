import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BellOff, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSettingsStore } from '@/store/settingsStore';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  const {
    notificationSettings,
    isLoading,
    loadNotificationSettings,
    updateNotificationSettings,
  } = useSettingsStore();
  const {
    isSupported: pushSupported,
    isSubscribed,
    permission: pushPermission,
    toggle: togglePush,
    isLoading: pushLoading,
  } = usePushNotifications();

  const [localSettings, setLocalSettings] = useState({
    pushEnabled: true,
    newTodoEnabled: true,
    deadlineEnabled: true,
    completedEnabled: false,
    updatedEnabled: true,
  });

  useEffect(() => {
    loadNotificationSettings().catch((error) => {
      toast.error(error.message || 'Ошибка загрузки настроек');
    });
  }, [loadNotificationSettings]);

  useEffect(() => {
    if (notificationSettings) {
      setLocalSettings({
        pushEnabled: notificationSettings.pushEnabled,
        newTodoEnabled: notificationSettings.newTodoEnabled,
        deadlineEnabled: notificationSettings.deadlineEnabled,
        completedEnabled: notificationSettings.completedEnabled,
        updatedEnabled: notificationSettings.updatedEnabled,
      });
    }
  }, [notificationSettings]);

  const handleToggle = async (key: keyof typeof localSettings) => {
    const newValue = !localSettings[key];
    const updatedSettings = { ...localSettings, [key]: newValue };

    setLocalSettings(updatedSettings);

    try {
      await updateNotificationSettings(updatedSettings);
      toast.success('Настройки обновлены');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка обновления настроек');
      setLocalSettings(localSettings);
    }
  };

  const handlePushToggle = async () => {
    await togglePush();
    await loadNotificationSettings();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <CheckSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Настройки
              </h1>
              <p className="text-sm text-muted-foreground">
                Управление уведомлениями и настройками приложения
              </p>
            </div>
          </div>
        </header>

        <Card className="mb-6 rounded-2xl border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isSubscribed && pushPermission === 'granted' ? (
                <Bell className="h-5 w-5 text-primary" />
              ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
              )}
              Push уведомления
            </CardTitle>
            <CardDescription>
              Разрешите браузеру отправлять уведомления на ваше устройство
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!pushSupported ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Ваш браузер не поддерживает push уведомления или Service Worker не зарегистрирован.
                </div>
                <div className="text-xs text-muted-foreground">
                  Убедитесь, что:
                  <ul className="list-disc list-inside mt-1 ml-2">
                    <li>Приложение запущено через HTTPS или localhost</li>
                    <li>Приложение собрано в production режиме (npm run build)</li>
                    <li>Service Worker успешно зарегистрирован</li>
                  </ul>
                </div>
              </div>
            ) : pushPermission === 'denied' ? (
              <div className="text-sm text-destructive">
                Разрешение на уведомления отклонено. Пожалуйста, разрешите уведомления в настройках браузера.
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-toggle" className="text-base">
                    Включить push уведомления
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {isSubscribed
                      ? 'Уведомления активны'
                      : 'Уведомления отключены'}
                  </p>
                </div>
                <Switch
                  id="push-toggle"
                  checked={isSubscribed}
                  onCheckedChange={handlePushToggle}
                  disabled={pushLoading || pushPermission !== 'granted'}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        {pushSupported && pushPermission === 'granted' && isSubscribed && (
          <Card className="rounded-2xl border">
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
              <CardDescription>
                Выберите, какие события должны отправлять уведомления
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="new-todo" className="text-base">
                    Новые задачи
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Уведомления при создании новых задач
                  </p>
                </div>
                <Switch
                  id="new-todo"
                  checked={localSettings.newTodoEnabled}
                  onCheckedChange={() => handleToggle('newTodoEnabled')}
                  disabled={isLoading || !localSettings.pushEnabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="deadline" className="text-base">
                    Дедлайны
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Уведомления о приближающихся дедлайнах
                  </p>
                </div>
                <Switch
                  id="deadline"
                  checked={localSettings.deadlineEnabled}
                  onCheckedChange={() => handleToggle('deadlineEnabled')}
                  disabled={isLoading || !localSettings.pushEnabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="completed" className="text-base">
                    Завершенные задачи
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Уведомления при завершении задач
                  </p>
                </div>
                <Switch
                  id="completed"
                  checked={localSettings.completedEnabled}
                  onCheckedChange={() => handleToggle('completedEnabled')}
                  disabled={isLoading || !localSettings.pushEnabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="updated" className="text-base">
                    Изменения задач
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Уведомления при изменении задач
                  </p>
                </div>
                <Switch
                  id="updated"
                  checked={localSettings.updatedEnabled}
                  onCheckedChange={() => handleToggle('updatedEnabled')}
                  disabled={isLoading || !localSettings.pushEnabled}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Settings;

