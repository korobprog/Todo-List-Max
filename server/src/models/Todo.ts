export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: number;
  userId: number;
  text: string;
  completed: boolean;
  priority: Priority;
  category: string | null;
  tags: string[];
  deadline: number | null;
  statusId: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface CreateTodoData {
  userId: number;
  text: string;
  completed?: boolean;
  priority?: Priority;
  category?: string | null;
  tags?: string[];
  deadline?: number | null;
  statusId?: number | null;
}

export interface UpdateTodoData {
  text?: string;
  completed?: boolean;
  priority?: Priority;
  category?: string | null;
  tags?: string[];
  deadline?: number | null;
  statusId?: number | null;
}

