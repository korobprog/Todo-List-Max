import { pool } from '../config/database';
import { Status, CreateStatusData, UpdateStatusData } from '../models/Status';

export const initializeDefaultStatuses = async (userId: number): Promise<void> => {
  const now = Date.now();
  
  const defaultStatuses = [
    { name: 'К выполнению', color: '#3b82f6', order: 1, isDefault: false },
    { name: 'В работе', color: '#eab308', order: 2, isDefault: false },
    { name: 'Готово', color: '#22c55e', order: 3, isDefault: true },
  ];

  for (const status of defaultStatuses) {
    await pool.execute(
      `INSERT INTO statuses (userId, name, color, isDefault, \`order\`, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, status.name, status.color, status.isDefault, status.order, now, now]
    );
  }
};

export const createStatus = async (statusData: CreateStatusData): Promise<Status> => {
  const now = Date.now();

  const [result] = await pool.execute(
    `INSERT INTO statuses (userId, name, color, isDefault, \`order\`, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      statusData.userId,
      statusData.name,
      statusData.color,
      statusData.isDefault ?? false,
      statusData.order,
      now,
      now,
    ]
  );

  const insertId = (result as any).insertId;
  return getStatusById(insertId, statusData.userId);
};

export const getStatusesByUserId = async (userId: number): Promise<Status[]> => {
  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM statuses WHERE userId = ? ORDER BY `order` ASC',
    [userId]
  );

  return rows.map(row => ({
    ...row,
    isDefault: Boolean(row.isDefault),
    createdAt: Number(row.createdAt),
    updatedAt: Number(row.updatedAt),
  }));
};

export const getStatusById = async (id: number, userId: number): Promise<Status> => {
  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM statuses WHERE id = ? AND userId = ?',
    [id, userId]
  );

  if (rows.length === 0) {
    throw new Error('Статус не найден');
  }

  const row = rows[0];
  return {
    ...row,
    isDefault: Boolean(row.isDefault),
    createdAt: Number(row.createdAt),
    updatedAt: Number(row.updatedAt),
  };
};

export const updateStatus = async (id: number, userId: number, updates: UpdateStatusData): Promise<Status> => {
  const now = Date.now();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.color !== undefined) {
    fields.push('color = ?');
    values.push(updates.color);
  }
  if (updates.isDefault !== undefined) {
    fields.push('isDefault = ?');
    values.push(updates.isDefault);
  }
  if (updates.order !== undefined) {
    fields.push('`order` = ?');
    values.push(updates.order);
  }

  fields.push('updatedAt = ?');
  values.push(now);
  values.push(id, userId);

  await pool.execute(
    `UPDATE statuses SET ${fields.join(', ')} WHERE id = ? AND userId = ?`,
    values
  );

  return getStatusById(id, userId);
};

export const deleteStatus = async (id: number, userId: number): Promise<void> => {
  // Check if status is used in todos
  const [todos] = await pool.execute<any[]>(
    'SELECT COUNT(*) as count FROM todos WHERE statusId = ? AND userId = ?',
    [id, userId]
  );

  if (todos[0].count > 0) {
    throw new Error('Нельзя удалить статус, который используется в задачах');
  }

  const [result] = await pool.execute(
    'DELETE FROM statuses WHERE id = ? AND userId = ?',
    [id, userId]
  );

  if ((result as any).affectedRows === 0) {
    throw new Error('Статус не найден');
  }
};

export const getDefaultStatusId = async (userId: number): Promise<number | null> => {
  const [rows] = await pool.execute<any[]>(
    'SELECT id FROM statuses WHERE userId = ? ORDER BY `order` ASC LIMIT 1',
    [userId]
  );

  return rows.length > 0 ? rows[0].id : null;
};

export const getDoneStatusId = async (userId: number): Promise<number | null> => {
  const [rows] = await pool.execute<any[]>(
    'SELECT id FROM statuses WHERE userId = ? AND isDefault = TRUE LIMIT 1',
    [userId]
  );

  return rows.length > 0 ? rows[0].id : null;
};

