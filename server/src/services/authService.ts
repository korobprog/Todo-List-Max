import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { CreateUserData, User } from '../models/User';
import { generateToken } from '../utils/jwt';
import { initializeDefaultStatuses } from './statusService';

export const createUser = async (userData: CreateUserData): Promise<User> => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const [result] = await pool.execute(
    'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
    [userData.email, hashedPassword, userData.name]
  );

  const insertId = (result as any).insertId;

  // Initialize default statuses for new user
  await initializeDefaultStatuses(insertId);

  const [users] = await pool.execute<User[]>(
    'SELECT * FROM users WHERE id = ?',
    [insertId]
  );

  return users[0];
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const [users] = await pool.execute<User[]>(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  return users[0] || null;
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const loginUser = async (email: string, password: string) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error('Пользователь не найден');
  }

  const isValidPassword = await verifyPassword(password, user.password);

  if (!isValidPassword) {
    throw new Error('Неверный пароль');
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
};

export const getUserById = async (id: number): Promise<User | null> => {
  const [users] = await pool.execute<User[]>(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );

  return users[0] || null;
};

