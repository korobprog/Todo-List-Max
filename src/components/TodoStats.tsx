import { CheckCircle2 } from 'lucide-react';
import { useTodoStore } from '@/store/todoStore';
import { useStatusStore } from '@/store/statusStore';
import { Progress } from '@/components/ui/progress';

export const TodoStats = () => {
  const getStats = useTodoStore((state) => state.getStats);
  const todos = useTodoStore((state) => state.todos);
  const statuses = useStatusStore((state) => state.statuses);
  const stats = getStats();
  
  const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  
  const statusCounts = statuses.map((status) => ({
    ...status,
    count: todos.filter((todo) => todo.statusId === status.id).length,
  }));

  return (
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {stats.completed} <span className="text-muted-foreground">из {stats.total}</span>
            </p>
            <p className="text-sm text-muted-foreground">задач выполнено</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {Math.round(progress)}%
          </p>
        </div>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="flex flex-wrap gap-3 mt-4 text-sm">
        {statusCounts.map((status) => (
          <div key={status.id} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: status.color }}
            />
            <span className="text-muted-foreground">
              {status.name}: <span className="font-semibold text-foreground">{status.count}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
