import { useEffect, useMemo } from 'react';
import type { Todo, Priority } from '@/store/todoStore';
import { AnimatePresence } from 'framer-motion';
import { CheckSquare, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TodoInput } from '@/components/TodoInput';
import { TodoItem } from '@/components/TodoItem';
import { TodoBoard } from '@/components/TodoBoard';
import { TodoFilters } from '@/components/TodoFilters';
import { TodoStats } from '@/components/TodoStats';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Onboarding } from '@/components/Onboarding';
import { useTodoStore } from '@/store/todoStore';
import { useAuthStore } from '@/store/authStore';
import { useStatusStore } from '@/store/statusStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LayoutList, LayoutGrid } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Index = () => {
  const loadTodos = useTodoStore((state) => state.loadTodos);
  const isLoading = useTodoStore((state) => state.isLoading);
  const todosRaw = useTodoStore((state) => state.todos);
  const filter = useTodoStore((state) => state.filter);
  const sort = useTodoStore((state) => state.sort);
  const viewMode = useTodoStore((state) => state.viewMode);
  const setViewMode = useTodoStore((state) => state.setViewMode);
  const filterByPriority = useTodoStore((state) => state.filterByPriority);
  const filterByCategory = useTodoStore((state) => state.filterByCategory);
  const filterByTag = useTodoStore((state) => state.filterByTag);
  const filterByStatusId = useTodoStore((state) => state.filterByStatusId);
  const { user, logout } = useAuthStore();
  const loadStatuses = useStatusStore((state) => state.loadStatuses);
  
  const todos = useMemo(() => {
    let filtered: Todo[] = todosRaw;
    
    if (filter === 'active') {
      filtered = todosRaw.filter((todo) => !todo.completed);
    } else if (filter === 'completed') {
      filtered = todosRaw.filter((todo) => todo.completed);
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

    // Filter by status only in list view (board view already shows by status)
    if (viewMode === 'list' && filterByStatusId) {
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
  }, [todosRaw, filter, sort, filterByPriority, filterByCategory, filterByTag, filterByStatusId, viewMode]);

  useEffect(() => {
    loadTodos().catch((error) => {
      toast.error(error.message || 'Ошибка загрузки задач');
    });
    loadStatuses().catch((error) => {
      toast.error(error.message || 'Ошибка загрузки статусов');
    });
  }, [loadTodos, loadStatuses]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4 transition-colors duration-300">
      <div className={viewMode === 'board' ? 'w-full mx-auto' : 'max-w-3xl mx-auto'}>
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <CheckSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Todo List
              </h1>
              <p className="text-sm text-muted-foreground">
                {user ? `Привет, ${user.name}!` : 'Организуйте свои задачи'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === 'list' ? 'board' : 'list')}
              className="rounded-xl"
              title={viewMode === 'list' ? 'Переключить на доску' : 'Переключить на список'}
            >
              {viewMode === 'list' ? (
                <LayoutGrid className="h-5 w-5" />
              ) : (
                <LayoutList className="h-5 w-5" />
              )}
            </Button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl">
                  <CheckSquare className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Настройки
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Onboarding */}
        <Onboarding />

        {/* Stats */}
        {todos.length > 0 && (
          <div className="mb-6">
            <TodoStats />
          </div>
        )}

        {/* Input */}
        <div className="mb-6">
          <TodoInput />
        </div>

        {/* Filters */}
        {todos.length > 0 && viewMode === 'list' && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Задачи ({todos.length})
            </h2>
            <TodoFilters />
          </div>
        )}

        {/* Todo List or Board */}
        {viewMode === 'board' ? (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Доска задач
              </h2>
              {viewMode === 'board' && (
                <TodoFilters />
              )}
            </div>
            {isLoading ? (
              <div className="text-center py-16">
                <div className="text-muted-foreground">Загрузка задач...</div>
              </div>
            ) : todosRaw.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex h-16 w-16 rounded-2xl bg-muted items-center justify-center mb-4">
                  <CheckSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Здесь пока нет задач. Добавьте первую!
                </p>
              </div>
            ) : (
              <TodoBoard todos={todosRaw} />
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <div className="text-center py-16">
                  <div className="text-muted-foreground">Загрузка задач...</div>
                </div>
              ) : todos.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex h-16 w-16 rounded-2xl bg-muted items-center justify-center mb-4">
                    <CheckSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    Здесь пока нет задач. Добавьте первую!
                  </p>
                </div>
              ) : (
                todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
