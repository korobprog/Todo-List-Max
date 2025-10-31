import { Circle, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStatusStore } from '@/store/statusStore';
import { useTodoStore } from '@/store/todoStore';
import { toast } from 'sonner';

interface TodoStatusSelectorProps {
  todoId: string;
  currentStatusId: string | null;
  className?: string;
}

const getStatusIcon = (statusName: string) => {
  const lowerName = statusName.toLowerCase();
  if (lowerName.includes('готово') || lowerName.includes('done') || lowerName.includes('выполнено')) {
    return <CheckCircle2 className="h-3 w-3" />;
  }
  if (lowerName.includes('работе') || lowerName.includes('progress') || lowerName.includes('процесс')) {
    return <Clock className="h-3 w-3" />;
  }
  return <Circle className="h-3 w-3" />;
};

export const TodoStatusSelector = ({ todoId, currentStatusId, className }: TodoStatusSelectorProps) => {
  const statuses = useStatusStore((state) => state.statuses);
  const updateTodoStatus = useTodoStore((state) => state.updateTodoStatus);
  const currentStatus = statuses.find((s) => s.id === currentStatusId);

  const handleStatusChange = async (statusId: string) => {
    try {
      await updateTodoStatus(todoId, statusId);
      toast.success('Статус изменен');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка изменения статуса');
    }
  };

  if (statuses.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-6 rounded-lg text-xs gap-1 ${className}`}
          style={{
            backgroundColor: currentStatus ? `${currentStatus.color}15` : undefined,
            borderColor: currentStatus ? `${currentStatus.color}40` : undefined,
            color: currentStatus ? currentStatus.color : undefined,
          }}
        >
          {currentStatus && getStatusIcon(currentStatus.name)}
          {currentStatus ? currentStatus.name : 'Без статуса'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="rounded-xl">
        {statuses.map((status) => (
          <DropdownMenuItem
            key={status.id}
            onClick={() => handleStatusChange(status.id)}
            className={`rounded-lg gap-2 ${
              currentStatusId === status.id ? 'bg-primary/10 text-primary' : ''
            }`}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: status.color }}
            />
            {status.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

