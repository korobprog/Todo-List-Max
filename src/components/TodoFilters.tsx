import { ListFilter, ArrowUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTodoStore, type FilterType, type SortType, type Priority } from '@/store/todoStore';
import { useStatusStore } from '@/store/statusStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export const TodoFilters = () => {
  const {
    filter,
    sort,
    filterByPriority,
    filterByCategory,
    filterByTag,
    filterByStatusId,
    setFilter,
    setSort,
    setFilterByPriority,
    setFilterByCategory,
    setFilterByTag,
    setFilterByStatusId,
    todos,
    getAllCategories,
  } = useTodoStore();
  const statuses = useStatusStore((state) => state.statuses);

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'active', label: 'Активные' },
    { value: 'completed', label: 'Выполненные' },
  ];

  const sortOptions: { value: SortType; label: string }[] = [
    { value: 'date', label: 'По дате' },
    { value: 'alphabetical', label: 'По алфавиту' },
    { value: 'priority', label: 'По приоритету' },
    { value: 'deadline', label: 'По дедлайну' },
  ];

  const priorityOptions: { value: Priority; label: string }[] = [
    { value: 'high', label: 'Высокий' },
    { value: 'medium', label: 'Средний' },
    { value: 'low', label: 'Низкий' },
  ];

  const categories = getAllCategories();
  const allTags = Array.from(new Set(todos.flatMap((t) => t.tags))).sort();

  const hasActiveFilters = filterByPriority || filterByCategory || filterByTag || filterByStatusId;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-2"
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
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Приоритет</div>
          <DropdownMenuItem onClick={() => setFilterByPriority(null)} className="rounded-lg">
            Все приоритеты
          </DropdownMenuItem>
          {priorityOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setFilterByPriority(option.value)}
              className={`rounded-lg ${
                filterByPriority === option.value ? 'bg-primary/10 text-primary' : ''
              }`}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
          {categories.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Категория</div>
              <DropdownMenuItem onClick={() => setFilterByCategory(null)} className="rounded-lg">
                Все категории
              </DropdownMenuItem>
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setFilterByCategory(category)}
                  className={`rounded-lg ${
                    filterByCategory === category ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </>
          )}
          {allTags.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Тег</div>
              <DropdownMenuItem onClick={() => setFilterByTag(null)} className="rounded-lg">
                Все теги
              </DropdownMenuItem>
              {allTags.map((tag) => (
                <DropdownMenuItem
                  key={tag}
                  onClick={() => setFilterByTag(tag)}
                  className={`rounded-lg ${
                    filterByTag === tag ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  {tag}
                </DropdownMenuItem>
              ))}
            </>
          )}
          {statuses.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Статус</div>
              <DropdownMenuItem onClick={() => setFilterByStatusId(null)} className="rounded-lg">
                Все статусы
              </DropdownMenuItem>
              {statuses.map((status) => (
                <DropdownMenuItem
                  key={status.id}
                  onClick={() => setFilterByStatusId(status.id)}
                  className={`rounded-lg gap-2 ${
                    filterByStatusId === status.id ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  {status.name}
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-2"
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

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFilterByPriority(null);
            setFilterByCategory(null);
            setFilterByTag(null);
            setFilterByStatusId(null);
          }}
          className="rounded-xl gap-2 text-muted-foreground"
        >
          <X className="h-4 w-4" />
          Сбросить
        </Button>
      )}

      {hasActiveFilters && (
        <div className="flex gap-1 flex-wrap">
          {filterByPriority && (
            <Badge variant="secondary" className="text-xs">
              Приоритет: {priorityOptions.find((p) => p.value === filterByPriority)?.label}
            </Badge>
          )}
          {filterByCategory && (
            <Badge variant="secondary" className="text-xs">
              Категория: {filterByCategory}
            </Badge>
          )}
          {filterByTag && (
            <Badge variant="secondary" className="text-xs">
              Тег: {filterByTag}
            </Badge>
          )}
          {filterByStatusId && (
            <Badge variant="secondary" className="text-xs">
              Статус: {statuses.find((s) => s.id === filterByStatusId)?.name}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
