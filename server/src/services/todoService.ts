import { pool } from '../config/database';
import { Todo, CreateTodoData, UpdateTodoData } from '../models/Todo';

export const createTodo = async (todoData: CreateTodoData): Promise<Todo> => {
  const now = Date.now();
  const tagsJson = todoData.tags ? JSON.stringify(todoData.tags) : null;

  // If no statusId provided, get default status
  let statusId = todoData.statusId ?? null;
  if (statusId === null) {
    const [rows] = await pool.execute<any[]>(
      'SELECT id FROM statuses WHERE userId = ? ORDER BY `order` ASC LIMIT 1',
      [todoData.userId]
    );
    if (rows.length > 0) {
      statusId = rows[0].id;
    }
  }

  const [result] = await pool.execute(
    `INSERT INTO todos (userId, text, completed, priority, category, tags, deadline, statusId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      todoData.userId,
      todoData.text,
      todoData.completed ?? false,
      todoData.priority ?? 'medium',
      todoData.category ?? null,
      tagsJson,
      todoData.deadline ?? null,
      statusId,
      now,
      now,
    ]
  );

  const insertId = (result as any).insertId;
  return getTodoById(insertId, todoData.userId);
};

export const getTodosByUserId = async (userId: number): Promise<Todo[]> => {
  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM todos WHERE userId = ? ORDER BY createdAt DESC',
    [userId]
  );

  return rows.map(row => {
    let tags: string[] = [];
    try {
      if (row.tags) {
        if (typeof row.tags === 'string') {
          tags = JSON.parse(row.tags);
        } else {
          tags = row.tags;
        }
      }
    } catch (error) {
      console.error('Error parsing tags:', error);
      tags = [];
    }

    return {
      ...row,
      tags,
      createdAt: Number(row.createdAt),
      updatedAt: Number(row.updatedAt),
    };
  });
};

export const getTodoById = async (id: number, userId: number): Promise<Todo> => {
  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM todos WHERE id = ? AND userId = ?',
    [id, userId]
  );

  if (rows.length === 0) {
    throw new Error('Задача не найдена');
  }

  const row = rows[0];
  let tags: string[] = [];
  try {
    if (row.tags) {
      if (typeof row.tags === 'string') {
        tags = JSON.parse(row.tags);
      } else {
        tags = row.tags;
      }
    }
  } catch (error) {
    console.error('Error parsing tags:', error);
    tags = [];
  }

  return {
    ...row,
    tags,
    createdAt: Number(row.createdAt),
    updatedAt: Number(row.updatedAt),
  };
};

export const updateTodo = async (id: number, userId: number, updates: UpdateTodoData): Promise<Todo> => {
  const now = Date.now();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.text !== undefined) {
    fields.push('text = ?');
    values.push(updates.text);
  }
  if (updates.completed !== undefined) {
    fields.push('completed = ?');
    values.push(updates.completed);
  }
  if (updates.priority !== undefined) {
    fields.push('priority = ?');
    values.push(updates.priority);
  }
  if (updates.category !== undefined) {
    fields.push('category = ?');
    values.push(updates.category);
  }
  if (updates.tags !== undefined) {
    fields.push('tags = ?');
    values.push(updates.tags ? JSON.stringify(updates.tags) : null);
  }
  if (updates.deadline !== undefined) {
    fields.push('deadline = ?');
    values.push(updates.deadline);
  }
  if (updates.statusId !== undefined) {
    fields.push('statusId = ?');
    values.push(updates.statusId);
    
    // If changing to "Done" status, auto-complete the todo
    if (updates.statusId !== null) {
      const [statusRows] = await pool.execute<any[]>(
        'SELECT isDefault FROM statuses WHERE id = ? AND userId = ?',
        [updates.statusId, userId]
      );
      if (statusRows.length > 0 && statusRows[0].isDefault) {
        fields.push('completed = ?');
        values.push(true);
      }
    }
  }

  fields.push('updatedAt = ?');
  values.push(now);
  values.push(id, userId);

  await pool.execute(
    `UPDATE todos SET ${fields.join(', ')} WHERE id = ? AND userId = ?`,
    values
  );

  return getTodoById(id, userId);
};

export const deleteTodo = async (id: number, userId: number): Promise<void> => {
  const [result] = await pool.execute(
    'DELETE FROM todos WHERE id = ? AND userId = ?',
    [id, userId]
  );

  if ((result as any).affectedRows === 0) {
    throw new Error('Задача не найдена');
  }
};

