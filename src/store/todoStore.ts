import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export type FilterType = 'all' | 'active' | 'completed';
export type SortType = 'date' | 'alphabetical';

interface TodoState {
  todos: Todo[];
  filter: FilterType;
  sort: SortType;
  theme: 'light' | 'dark';
  hasSeenOnboarding: boolean;
  
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, text: string) => void;
  setFilter: (filter: FilterType) => void;
  setSort: (sort: SortType) => void;
  toggleTheme: () => void;
  dismissOnboarding: () => void;
  
  getFilteredTodos: () => Todo[];
  getStats: () => { total: number; completed: number; active: number };
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: [],
      filter: 'all',
      sort: 'date',
      theme: 'light',
      hasSeenOnboarding: false,

      addTodo: (text: string) => {
        const newTodo: Todo = {
          id: Date.now().toString(),
          text: text.trim(),
          completed: false,
          createdAt: Date.now(),
        };
        set((state) => ({ todos: [newTodo, ...state.todos] }));
      },

      toggleTodo: (id: string) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          ),
        }));
      },

      deleteTodo: (id: string) => {
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        }));
      },

      editTodo: (id: string, text: string) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, text: text.trim() } : todo
          ),
        }));
      },

      setFilter: (filter: FilterType) => {
        set({ filter });
      },

      setSort: (sort: SortType) => {
        set({ sort });
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

      getFilteredTodos: () => {
        const { todos, filter, sort } = get();
        
        let filtered = todos;
        
        if (filter === 'active') {
          filtered = todos.filter((todo) => !todo.completed);
        } else if (filter === 'completed') {
          filtered = todos.filter((todo) => todo.completed);
        }
        
        if (sort === 'alphabetical') {
          filtered = [...filtered].sort((a, b) => a.text.localeCompare(b.text));
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
    }
  )
);
