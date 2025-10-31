import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getOrCreateNotificationSettings,
  updateNotificationSettings,
} from '../services/settingsService';
import { UpdateNotificationSettingsData } from '../models/UserNotificationSettings';

export const getNotificationSettings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const settings = await getOrCreateNotificationSettings(req.userId);
    res.json({ settings });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Ошибка получения настроек' });
  }
};

export const updateNotificationSettingsHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const settingsData: UpdateNotificationSettingsData = req.body;
    const settings = await updateNotificationSettings(req.userId, settingsData);
    res.json({ settings });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Ошибка обновления настроек' });
  }
};

