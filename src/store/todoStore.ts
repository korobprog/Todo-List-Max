import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: string | null;
  tags: string[];
  deadline: number | null;
  statusId: string | null;
  createdAt: number;
  updatedAt: number;
}

export type FilterType = 'all' | 'active' | 'completed';
export type SortType = 'date' | 'alphabetical' | 'priority' | 'deadline';
export type ViewMode = 'list' | 'board';

interface TodoState {
  todos: Todo[];
  isLoading: boolean;
  filter: FilterType;
  sort: SortType;
  viewMode: ViewMode;
  theme: 'light' | 'dark';
  hasSeenOnboarding: boolean;
  customCategories: string[];
  
  loadTodos: () => Promise<void>;
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  editTodo: (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  updateTodoStatus: (id: string, statusId: string | null) => Promise<void>;
  setFilter: (filter: FilterType) => void;
  setSort: (sort: SortType) => void;
  filterByPriority: Priority | null;
  filterByCategory: string | null;
  filterByTag: string | null;
  filterByStatusId: string | null;
  setFilterByPriority: (priority: Priority | null) => void;
  setFilterByCategory: (category: string | null) => void;
  setFilterByTag: (tag: string | null) => void;
  setFilterByStatusId: (statusId: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleTheme: () => void;
  dismissOnboarding: () => void;
  addCustomCategory: (category: string) => void;
  getAllCategories: () => string[];
  
  getFilteredTodos: () => Todo[];
  getStats: () => { total: number; completed: number; active: number };
}

const convertTodoFromApi = (todo: any): Todo => ({
  id: todo.id.toString(),
  text: todo.text,
  completed: Boolean(todo.completed),
  priority: todo.priority,
  category: todo.category,
  tags: todo.tags || [],
  deadline: todo.deadline,
  statusId: todo.statusId ? todo.statusId.toString() : null,
  createdAt: Number(todo.createdAt),
  updatedAt: Number(todo.updatedAt),
});

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: [],
      isLoading: false,
      filter: 'all',
      sort: 'date',
      viewMode: 'list',
      theme: 'light',
      hasSeenOnboarding: false,
      filterByPriority: null,
      filterByCategory: null,
      filterByTag: null,
      filterByStatusId: null,
      customCategories: [],

      loadTodos: async () => {
        set({ isLoading: true });
        try {
          const todos = await api.todos.getAll();
          set({ todos: todos.map(convertTodoFromApi), isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      addTodo: async (todo) => {
        try {
          const newTodo = await api.todos.create({
            text: todo.text.trim(),
            completed: todo.completed ?? false,
            priority: todo.priority ?? 'medium',
            category: todo.category ?? null,
            tags: todo.tags ?? [],
            deadline: todo.deadline ?? null,
            statusId: todo.statusId ?? null,
          });
          set((state) => ({ todos: [convertTodoFromApi(newTodo), ...state.todos] }));
        } catch (error) {
          throw error;
        }
      },

      toggleTodo: async (id: string) => {
        const todo = get().todos.find((t) => t.id === id);
        if (!todo) return;

        try {
          const updatedTodo = await api.todos.update(id, {
            completed: !todo.completed,
          });
          set((state) => ({
            todos: state.todos.map((t) =>
              t.id === id ? convertTodoFromApi(updatedTodo) : t
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      deleteTodo: async (id: string) => {
        try {
          await api.todos.delete(id);
          set((state) => ({
            todos: state.todos.filter((todo) => todo.id !== id),
          }));
        } catch (error) {
          throw error;
        }
      },

      editTodo: async (id: string, updates) => {
        try {
          const updatedTodo = await api.todos.update(id, {
            ...updates,
            text: updates.text?.trim(),
          });
          set((state) => ({
            todos: state.todos.map((t) =>
              t.id === id ? convertTodoFromApi(updatedTodo) : t
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      setFilter: (filter: FilterType) => {
        set({ filter });
      },

      setSort: (sort: SortType) => {
        set({ sort });
      },

      setFilterByPriority: (priority: Priority | null) => {
        set({ filterByPriority: priority });
      },

      setFilterByCategory: (category: string | null) => {
        set({ filterByCategory: category });
      },

      setFilterByTag: (tag: string | null) => {
        set({ filterByTag: tag });
      },

      setFilterByStatusId: (statusId: string | null) => {
        set({ filterByStatusId: statusId });
      },

      setViewMode: (mode: ViewMode) => {
        set({ viewMode: mode });
      },

      updateTodoStatus: async (id: string, statusId: string | null) => {
        try {
          // Convert statusId to number for API
          const statusIdForApi = statusId ? parseInt(statusId, 10) : null;
          const updatedTodo = await api.todos.update(id, { statusId: statusIdForApi });
          set((state) => ({
            todos: state.todos.map((t) =>
              t.id === id ? convertTodoFromApi(updatedTodo) : t
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { theme: newTheme };
        });
      },

      dismissOnboarding: () => {
        set({ hasSeenOnboarding: true });
      },

      addCustomCategory: (category: string) => {
        set((state) => {
          if (!state.customCategories.includes(category)) {
            return { customCategories: [...state.customCategories, category] };
          }
          return state;
        });
      },

      getAllCategories: () => {
        const { todos, customCategories } = get();
        const categoriesFromTodos = Array.from(
          new Set(todos.map((t) => t.category).filter((c): c is string => c !== null && c !== ''))
        );
        return Array.from(new Set([...categoriesFromTodos, ...customCategories])).sort();
      },

      getFilteredTodos: () => {
        const { todos, filter, sort, filterByPriority, filterByCategory, filterByTag, filterByStatusId } = get();
        
        let filtered = todos;
        
        if (filter === 'active') {
          filtered = todos.filter((todo) => !todo.completed);
        } else if (filter === 'completed') {
          filtered = todos.filter((todo) => todo.completed);
        }

        if (filterByPriority) {
          filtered = filtered.filter((todo) => todo.priority === filterByPriority);
        }

        if (filterByCategory) {
          filtered = filtered.filter((todo) => todo.category === filterByCategory);
        }

        if (filterByTag) {
          filtered = filtered.filter((todo) => todo.tags.includes(filterByTag));
        }

        if (filterByStatusId) {
          filtered = filtered.filter((todo) => todo.statusId === filterByStatusId);
        }
        
        if (sort === 'alphabetical') {
          filtered = [...filtered].sort((a, b) => a.text.localeCompare(b.text));
        } else if (sort === 'priority') {
          const priorityOrder: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
          filtered = [...filtered].sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
        } else if (sort === 'deadline') {
          filtered = [...filtered].sort((a, b) => {
            if (!a.deadline && !b.deadline) return 0;
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return a.deadline - b.deadline;
          });
        } else {
          filtered = [...filtered].sort((a, b) => b.createdAt - a.createdAt);
        }
        
        return filtered;
      },

      getStats: () => {
        const { todos } = get();
        return {
          total: todos.length,
          completed: todos.filter((todo) => todo.completed).length,
          active: todos.filter((todo) => !todo.completed).length,
        };
      },
    }),
    {
      name: 'todo-storage',
      partialize: (state) => ({
        filter: state.filter,
        sort: state.sort,
        viewMode: state.viewMode,
        theme: state.theme,
        hasSeenOnboarding: state.hasSeenOnboarding,
        filterByPriority: state.filterByPriority,
        filterByCategory: state.filterByCategory,
        filterByTag: state.filterByTag,
        filterByStatusId: state.filterByStatusId,
        customCategories: state.customCategories,
      }),
    }
  )
);
