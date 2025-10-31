import { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TodoDeadlinePickerProps {
  value: number | null;
  onChange: (deadline: number | null) => void;
  className?: string;
}

export const TodoDeadlinePicker = ({ value, onChange, className }: TodoDeadlinePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const date = value ? new Date(value) : undefined;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'PPP', { locale: ru }) : 'Без дедлайна'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              if (selectedDate) {
                onChange(selectedDate.getTime());
              }
              setIsOpen(false);
            }}
            initialFocus
          />
          {date && (
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  onChange(null);
                  setIsOpen(false);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Убрать дедлайн
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

