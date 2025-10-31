import { create } from 'zustand';
import { api } from '@/lib/api';

export interface NotificationSettings {
  id: number;
  userId: number;
  pushEnabled: boolean;
  newTodoEnabled: boolean;
  deadlineEnabled: boolean;
  completedEnabled: boolean;
  updatedEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SettingsState {
  notificationSettings: NotificationSettings | null;
  isLoading: boolean;

  loadNotificationSettings: () => Promise<void>;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  notificationSettings: null,
  isLoading: false,

  loadNotificationSettings: async () => {
    set({ isLoading: true });
    try {
      const settings = await api.settings.getNotificationSettings();
      set({ notificationSettings: settings, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateNotificationSettings: async (settings: Partial<NotificationSettings>) => {
    try {
      const updatedSettings = await api.settings.updateNotificationSettings({
        pushEnabled: settings.pushEnabled,
        newTodoEnabled: settings.newTodoEnabled,
        deadlineEnabled: settings.deadlineEnabled,
        completedEnabled: settings.completedEnabled,
        updatedEnabled: settings.updatedEnabled,
      });
      set({ notificationSettings: updatedSettings });
    } catch (error) {
      throw error;
    }
  },
}));

