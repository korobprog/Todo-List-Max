import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as statusService from '../services/statusService';
import { createStatusSchema, updateStatusSchema } from '../utils/validation';

export const getStatuses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const statuses = await statusService.getStatusesByUserId(userId);
    res.json(statuses);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Ошибка получения статусов' });
  }
};

export const createStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const validatedData = createStatusSchema.parse(req.body);
    
    const status = await statusService.createStatus({
      userId,
      ...validatedData,
    });
    
    res.status(201).json(status);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      res.status(500).json({ error: error.message || 'Ошибка создания статуса' });
    }
  }
};

export const updateStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const statusId = parseInt(req.params.id);
    const validatedData = updateStatusSchema.parse(req.body);
    
    const status = await statusService.updateStatus(statusId, userId, validatedData);
    res.json(status);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors[0].message });
    } else if (error.message === 'Статус не найден') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message || 'Ошибка обновления статуса' });
    }
  }
};

export const deleteStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const statusId = parseInt(req.params.id);
    
    await statusService.deleteStatus(statusId, userId);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Статус не найден') {
      res.status(404).json({ error: error.message });
    } else if (error.message === 'Нельзя удалить статус, который используется в задачах') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message || 'Ошибка удаления статуса' });
    }
  }
};

