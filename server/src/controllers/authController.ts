import { Request, Response } from 'express';
import { registerSchema, loginSchema } from '../utils/validation';
import { createUser, findUserByEmail, loginUser } from '../services/authService';
import { AuthRequest } from '../middleware/auth';
import { getUserById } from '../services/authService';

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await findUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    const user = await createUser(validatedData);
    const { password, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: userWithoutPassword,
    });
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({ error: 'Ошибка валидации', details: error.errors });
    }
    res.status(500).json({ error: error.message || 'Ошибка регистрации' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await loginUser(validatedData.email, validatedData.password);

    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Ошибка входа' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const user = await getUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Ошибка получения данных пользователя' });
  }
};

