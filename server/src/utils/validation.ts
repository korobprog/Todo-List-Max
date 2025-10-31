import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
  name: z.string().min(1, 'Имя обязательно'),
});

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Пароль обязателен'),
});

export const createTodoSchema = z.object({
  text: z.string().min(1, 'Текст задачи обязателен'),
  completed: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  deadline: z.number().nullable().optional(),
  statusId: z.number().nullable().optional(),
});

export const updateTodoSchema = z.object({
  text: z.string().min(1, 'Текст задачи обязателен').optional(),
  completed: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  deadline: z.number().nullable().optional(),
  statusId: z.number().nullable().optional(),
});

export const createStatusSchema = z.object({
  name: z.string().min(1, 'Название статуса обязательно'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Цвет должен быть в формате HEX (#RRGGBB)'),
  isDefault: z.boolean().optional(),
  order: z.number().int().min(0, 'Порядок должен быть неотрицательным числом'),
});

export const updateStatusSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Цвет должен быть в формате HEX (#RRGGBB)').optional(),
  isDefault: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

