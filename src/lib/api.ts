const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(public status: number, message: string, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const setAuthToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.error || 'Произошла ошибка',
      data.details
    );
  }

  return data as T;
};

export const api = {
  auth: {
    register: async (email: string, password: string, name: string) => {
      const response = await fetchApi<{ message: string; user: any }>(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({ email, password, name }),
        }
      );
      return response;
    },

    login: async (email: string, password: string) => {
      const response = await fetchApi<{ token: string; user: any }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }
      );
      setAuthToken(response.token);
      return response;
    },

    getMe: async () => {
      const response = await fetchApi<{ user: any }>('/auth/me');
      return response;
    },

    logout: () => {
      setAuthToken(null);
    },
  },

  todos: {
    getAll: async () => {
      const response = await fetchApi<{ todos: any[] }>('/todos');
      return response.todos;
    },

    create: async (todoData: {
      text: string;
      completed?: boolean;
      priority?: 'low' | 'medium' | 'high';
      category?: string | null;
      tags?: string[];
      deadline?: number | null;
      statusId?: string | null;
    }) => {
      const response = await fetchApi<{ todo: any }>('/todos', {
        method: 'POST',
        body: JSON.stringify(todoData),
      });
      return response.todo;
    },

    update: async (
      id: string,
      updates: {
        text?: string;
        completed?: boolean;
        priority?: 'low' | 'medium' | 'high';
        category?: string | null;
        tags?: string[];
        deadline?: number | null;
        statusId?: number | null;
      }
    ) => {
      const response = await fetchApi<{ todo: any }>(`/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return response.todo;
    },

    delete: async (id: string) => {
      await fetchApi(`/todos/${id}`, {
        method: 'DELETE',
      });
    },

    getById: async (id: string) => {
      const response = await fetchApi<{ todo: any }>(`/todos/${id}`);
      return response.todo;
    },
  },

  statuses: {
    getAll: async () => {
      const response = await fetchApi<any[]>('/statuses');
      return response;
    },

    create: async (statusData: {
      name: string;
      color: string;
      isDefault?: boolean;
      order: number;
    }) => {
      const response = await fetchApi<any>('/statuses', {
        method: 'POST',
        body: JSON.stringify(statusData),
      });
      return response;
    },

    update: async (
      id: string,
      updates: {
        name?: string;
        color?: string;
        isDefault?: boolean;
        order?: number;
      }
    ) => {
      const response = await fetchApi<any>(`/statuses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return response;
    },

    delete: async (id: string) => {
      await fetchApi(`/statuses/${id}`, {
        method: 'DELETE',
      });
    },
  },

  settings: {
    getNotificationSettings: async () => {
      const response = await fetchApi<{ settings: any }>('/settings/notifications');
      return response.settings;
    },

    updateNotificationSettings: async (settings: {
      pushEnabled?: boolean;
      newTodoEnabled?: boolean;
      deadlineEnabled?: boolean;
      completedEnabled?: boolean;
      updatedEnabled?: boolean;
    }) => {
      const response = await fetchApi<{ settings: any }>('/settings/notifications', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      return response.settings;
    },
  },
};

export { ApiError, getAuthToken, setAuthToken };

