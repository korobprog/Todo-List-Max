import { Priority } from '@/store/todoStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Minus, ArrowUp } from 'lucide-react';

interface TodoPrioritySelectorProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  className?: string;
}

const priorityConfig: Record<Priority, { label: string; color: string; icon: React.ReactNode }> = {
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

export const TodoPrioritySelector = ({ value, onChange, className }: TodoPrioritySelectorProps) => {
  const config = priorityConfig[value];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue>
          <Badge variant="outline" className={config.color}>
            {config.icon}
            <span className="ml-1">{config.label}</span>
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(priorityConfig) as Priority[]).map((priority) => {
          const priorityConf = priorityConfig[priority];
          return (
            <SelectItem key={priority} value={priority}>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={priorityConf.color}>
                  {priorityConf.icon}
                  <span className="ml-1">{priorityConf.label}</span>
                </Badge>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

