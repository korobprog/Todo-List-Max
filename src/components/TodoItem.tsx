import { useState, forwardRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Check, X, Tag, Calendar, AlertCircle, Minus, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useTodoStore, type Todo, type Priority } from '@/store/todoStore';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { TodoStatusSelector } from './TodoStatusSelector';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TodoItemProps {
  todo: Todo;
  hideStatusSelector?: boolean;
}

const priorityConfig: Record<Priority, { label: string; color: string; icon: ReactNode }> = {
  low: {
    label: 'Низкий',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    icon: <Minus className="h-3 w-3" />,
  },
  medium: {
    label: 'Средний',
    color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    icon: <AlertCircle className="h-3 w-3" />,
  },
  high: {
    label: 'Высокий',
    color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    icon: <ArrowUp className="h-3 w-3" />,
  },
};

export const TodoItem = forwardRef<HTMLDivElement, TodoItemProps>(({ todo, hideStatusSelector = false }, ref) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const { toggleTodo, deleteTodo, editTodo } = useTodoStore();

  const handleSave = async () => {
    if (editText.trim()) {
      try {
        await editTodo(todo.id, { text: editText });
        setIsEditing(false);
      } catch (error: any) {
        console.error('Error updating todo:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const priorityConf = priorityConfig[todo.priority];
  const isOverdue = todo.deadline && !todo.completed && todo.deadline < Date.now();

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group bg-card rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border border-border"
    >
      <div className="flex items-center gap-3">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={async () => {
            try {
              await toggleTodo(todo.id);
            } catch (error: any) {
              console.error('Error toggling todo:', error);
            }
          }}
          className="h-5 w-5 rounded-lg data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />

        {isEditing ? (
          <div className="flex-1 flex gap-2">
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
              className="h-9 rounded-xl"
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSave}
              className="h-9 w-9 rounded-xl text-primary hover:bg-primary/10"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancel}
              className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <p
                  className={`text-base transition-all ${
                    todo.completed
                      ? 'line-through text-muted-foreground'
                      : 'text-foreground'
                  }`}
                >
                  {todo.text}
                </p>
                <Badge variant="outline" className={priorityConf.color}>
                  {priorityConf.icon}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {!hideStatusSelector && (
                  <TodoStatusSelector todoId={todo.id} currentStatusId={todo.statusId} />
                )}
                {todo.category && (
                  <Badge variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {todo.category}
                  </Badge>
                )}
                {todo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {todo.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                {todo.deadline && (
                  <div className={`flex items-center gap-1 ${isOverdue ? 'text-destructive font-semibold' : ''}`}>
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(todo.deadline), 'd MMM yyyy', { locale: ru })}</span>
                    {isOverdue && <span className="text-xs">(Просрочено)</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Удалить задачу?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Это действие нельзя отменить. Задача будет удалена навсегда.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Отмена</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        try {
                          await deleteTodo(todo.id);
                        } catch (error: any) {
                          console.error('Error deleting todo:', error);
                        }
                      }}
                      className="rounded-xl bg-destructive hover:bg-destructive/90"
                    >
                      Удалить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
});

TodoItem.displayName = 'TodoItem';
