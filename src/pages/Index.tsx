import { AnimatePresence } from 'framer-motion';
import { CheckSquare } from 'lucide-react';
import { TodoInput } from '@/components/TodoInput';
import { TodoItem } from '@/components/TodoItem';
import { TodoFilters } from '@/components/TodoFilters';
import { TodoStats } from '@/components/TodoStats';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Onboarding } from '@/components/Onboarding';
import { useTodoStore } from '@/store/todoStore';

const Index = () => {
  const getFilteredTodos = useTodoStore((state) => state.getFilteredTodos);
  const todos = getFilteredTodos();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
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
              <p className="text-sm text-muted-foreground">Организуйте свои задачи</p>
            </div>
          </div>
          <ThemeToggle />
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
        {todos.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Задачи ({todos.length})
            </h2>
            <TodoFilters />
          </div>
        )}

        {/* Todo List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {todos.length === 0 ? (
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
      </div>
    </div>
  );
};

export default Index;
