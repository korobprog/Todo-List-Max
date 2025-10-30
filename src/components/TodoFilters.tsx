import { ListFilter, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTodoStore, type FilterType, type SortType } from '@/store/todoStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const TodoFilters = () => {
  const { filter, sort, setFilter, setSort } = useTodoStore();

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'active', label: 'Активные' },
    { value: 'completed', label: 'Выполненные' },
  ];

  const sortOptions: { value: SortType; label: string }[] = [
    { value: 'date', label: 'По дате' },
    { value: 'alphabetical', label: 'По алфавиту' },
  ];

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-2 hover:bg-muted"
          >
            <ListFilter className="h-4 w-4" />
            {filterOptions.find((f) => f.value === filter)?.label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl">
          {filterOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`rounded-lg ${
                filter === option.value ? 'bg-primary/10 text-primary' : ''
              }`}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-2 hover:bg-muted"
          >
            <ArrowUpDown className="h-4 w-4" />
            {sortOptions.find((s) => s.value === sort)?.label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl">
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setSort(option.value)}
              className={`rounded-lg ${
                sort === option.value ? 'bg-primary/10 text-primary' : ''
              }`}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
