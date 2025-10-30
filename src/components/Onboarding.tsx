import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTodoStore } from '@/store/todoStore';

export const Onboarding = () => {
  const { hasSeenOnboarding, dismissOnboarding, todos } = useTodoStore();

  if (hasSeenOnboarding || todos.length > 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="relative bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border-2 border-primary/20 mb-6"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={dismissOnboarding}
          className="absolute top-2 right-2 h-8 w-8 rounded-xl hover:bg-background/50"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Добро пожаловать!
            </h3>
            <p className="text-muted-foreground mb-3">
              Начните с добавления вашей первой задачи 💪
            </p>
            <p className="text-sm text-muted-foreground">
              Используйте фильтры для сортировки задач, отмечайте выполненные и следите за прогрессом!
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
