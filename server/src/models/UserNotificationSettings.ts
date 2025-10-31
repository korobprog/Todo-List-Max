export interface UserNotificationSettings {
  id: number;
  userId: number;
  pushEnabled: boolean;
  newTodoEnabled: boolean;
  deadlineEnabled: boolean;
  completedEnabled: boolean;
  updatedEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationSettingsData {
  userId: number;
  pushEnabled?: boolean;
  newTodoEnabled?: boolean;
  deadlineEnabled?: boolean;
  completedEnabled?: boolean;
  updatedEnabled?: boolean;
}

export interface UpdateNotificationSettingsData {
  pushEnabled?: boolean;
  newTodoEnabled?: boolean;
  deadlineEnabled?: boolean;
  completedEnabled?: boolean;
  updatedEnabled?: boolean;
}

