import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  userId?: number;
  userEmail?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Неверный или истекший токен' });
  }
};

