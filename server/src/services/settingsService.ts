import { pool } from '../config/database';
import {
  UserNotificationSettings,
  CreateNotificationSettingsData,
  UpdateNotificationSettingsData,
} from '../models/UserNotificationSettings';

export const getNotificationSettingsByUserId = async (
  userId: number
): Promise<UserNotificationSettings | null> => {
  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM user_notification_settings WHERE userId = ?',
    [userId]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
};

export const getOrCreateNotificationSettings = async (
  userId: number
): Promise<UserNotificationSettings> => {
  let settings = await getNotificationSettingsByUserId(userId);

  if (!settings) {
    // Создаем настройки по умолчанию
    const [result] = await pool.execute(
      `INSERT INTO user_notification_settings 
       (userId, pushEnabled, newTodoEnabled, deadlineEnabled, completedEnabled, updatedEnabled)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, true, true, true, false, true]
    );

    const insertId = (result as any).insertId;
    const [rows] = await pool.execute<any[]>(
      'SELECT * FROM user_notification_settings WHERE id = ?',
      [insertId]
    );
    settings = rows[0];
  }

  return settings!;
};

export const updateNotificationSettings = async (
  userId: number,
  settingsData: UpdateNotificationSettingsData
): Promise<UserNotificationSettings> => {
  const updateFields: string[] = [];
  const values: any[] = [];

  if (settingsData.pushEnabled !== undefined) {
    updateFields.push('pushEnabled = ?');
    values.push(settingsData.pushEnabled);
  }
  if (settingsData.newTodoEnabled !== undefined) {
    updateFields.push('newTodoEnabled = ?');
    values.push(settingsData.newTodoEnabled);
  }
  if (settingsData.deadlineEnabled !== undefined) {
    updateFields.push('deadlineEnabled = ?');
    values.push(settingsData.deadlineEnabled);
  }
  if (settingsData.completedEnabled !== undefined) {
    updateFields.push('completedEnabled = ?');
    values.push(settingsData.completedEnabled);
  }
  if (settingsData.updatedEnabled !== undefined) {
    updateFields.push('updatedEnabled = ?');
    values.push(settingsData.updatedEnabled);
  }

  if (updateFields.length === 0) {
    return getOrCreateNotificationSettings(userId);
  }

  values.push(userId);

  await pool.execute(
    `UPDATE user_notification_settings 
     SET ${updateFields.join(', ')}, updatedAt = CURRENT_TIMESTAMP 
     WHERE userId = ?`,
    values
  );

  return getOrCreateNotificationSettings(userId);
};

