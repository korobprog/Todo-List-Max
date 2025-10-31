import { Response } from 'express';
import { createTodoSchema, updateTodoSchema } from '../utils/validation';
import { createTodo, getTodosByUserId, updateTodo, deleteTodo, getTodoById } from '../services/todoService';
import { AuthRequest } from '../middleware/auth';
import { sendPushNotification } from '../services/pushService';
import { getOrCreateNotificationSettings } from '../services/settingsService';

export const getTodos = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const todos = await getTodosByUserId(req.userId);
    res.json({ todos });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Ошибка получения задач' });
  }
};

export const createTodoHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const validatedData = createTodoSchema.parse(req.body);
    const todo = await createTodo({
      ...validatedData,
      userId: req.userId,
    });

    // Отправляем уведомление о новой задаче
    try {
      const settings = await getOrCreateNotificationSettings(req.userId);
      if (settings.pushEnabled && settings.newTodoEnabled) {
        await sendPushNotification(req.userId, {
          title: 'Новая задача',
          body: todo.text.length > 50 ? `${todo.text.substring(0, 50)}...` : todo.text,
          tag: `todo-${todo.id}`,
          data: { todoId: todo.id.toString(), type: 'new' },
        });
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Не прерываем выполнение, если уведомление не отправилось
    }

    res.status(201).json({ todo });
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({ error: 'Ошибка валидации', details: error.errors });
    }
    res.status(500).json({ error: error.message || 'Ошибка создания задачи' });
  }
};

export const updateTodoHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Неверный ID задачи' });
    }

    // Получаем старую задачу для проверки изменений
    const oldTodo = await getTodoById(id, req.userId);
    const validatedData = updateTodoSchema.parse(req.body);
    const todo = await updateTodo(id, req.userId, validatedData);

    // Отправляем уведомления в зависимости от типа изменения
    try {
      const settings = await getOrCreateNotificationSettings(req.userId);
      if (settings.pushEnabled) {
        // Уведомление о завершении задачи
        if (validatedData.completed !== undefined && validatedData.completed && !oldTodo.completed && settings.completedEnabled) {
          await sendPushNotification(req.userId, {
            title: 'Задача завершена',
            body: todo.text.length > 50 ? `${todo.text.substring(0, 50)}...` : todo.text,
            tag: `todo-${todo.id}-completed`,
            data: { todoId: todo.id.toString(), type: 'completed' },
          });
        }
        // Уведомление об изменении задачи (если не завершение)
        else if (
          settings.updatedEnabled &&
          validatedData.completed !== undefined &&
          !validatedData.completed &&
          (validatedData.text !== undefined || validatedData.deadline !== undefined || validatedData.priority !== undefined)
        ) {
          await sendPushNotification(req.userId, {
            title: 'Задача обновлена',
            body: todo.text.length > 50 ? `${todo.text.substring(0, 50)}...` : todo.text,
            tag: `todo-${todo.id}-updated`,
            data: { todoId: todo.id.toString(), type: 'updated' },
          });
        }
        // Уведомление о дедлайне (если дедлайн был установлен и близок)
        if (todo.deadline && settings.deadlineEnabled) {
          const now = Date.now();
          const deadlineTime = todo.deadline;
          const oneDayInMs = 24 * 60 * 60 * 1000;
          // Уведомляем за день до дедлайна
          if (deadlineTime - now <= oneDayInMs && deadlineTime - now > 0) {
            await sendPushNotification(req.userId, {
              title: 'Приближается дедлайн',
              body: `Задача "${todo.text.length > 30 ? todo.text.substring(0, 30) + '...' : todo.text}" скоро истечет`,
              tag: `todo-${todo.id}-deadline`,
              data: { todoId: todo.id.toString(), type: 'deadline' },
            });
          }
        }
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Не прерываем выполнение, если уведомление не отправилось
    }

    res.json({ todo });
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({ error: 'Ошибка валидации', details: error.errors });
    }
    if (error.message === 'Задача не найдена') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Ошибка обновления задачи' });
  }
};

export const deleteTodoHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Неверный ID задачи' });
    }

    await deleteTodo(id, req.userId);
    res.json({ message: 'Задача удалена' });
  } catch (error: any) {
    if (error.message === 'Задача не найдена') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Ошибка удаления задачи' });
  }
};

export const getTodo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Неверный ID задачи' });
    }

    const todo = await getTodoById(id, req.userId);
    res.json({ todo });
  } catch (error: any) {
    if (error.message === 'Задача не найдена') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Ошибка получения задачи' });
  }
};

