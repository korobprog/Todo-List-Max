import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Tag } from 'lucide-react';
import { useTodoStore } from '@/store/todoStore';

interface TodoCategorySelectorProps {
  value: string | null;
  onChange: (category: string | null) => void;
  className?: string;
}

export const TodoCategorySelector = ({ value, onChange, className }: TodoCategorySelectorProps) => {
  const addCustomCategory = useTodoStore((state) => state.addCustomCategory);
  const todos = useTodoStore((state) => state.todos);
  const customCategories = useTodoStore((state) => state.customCategories);
  const [newCategory, setNewCategory] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const normalizedValue = value === '' ? null : value;

  const categoriesFromTodos = Array.from(
    new Set(todos.map((t) => t.category).filter((c): c is string => c !== null && c !== ''))
  );
  const allCategories = Array.from(new Set([...categoriesFromTodos, ...customCategories])).sort();

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      const categoryName = newCategory.trim();
      addCustomCategory(categoryName);
      onChange(categoryName);
      setNewCategory('');
      setIsDialogOpen(false);
    }
  };

  const handleValueChange = (val: string) => {
    if (val === '__none__') {
      onChange(null);
      setIsSelectOpen(false);
    } else if (val === '__new__') {
      setIsDialogOpen(true);
      setIsSelectOpen(false);
    } else {
      onChange(val);
      setIsSelectOpen(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
  };

  return (
    <>
      <Select 
        value={normalizedValue || '__none__'} 
        onValueChange={handleValueChange}
        open={isSelectOpen}
        onOpenChange={setIsSelectOpen}
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder="Без категории">
            {normalizedValue ? (
              <div className="flex items-center gap-2">
                <Tag className="h-3 w-3" />
                <span>{normalizedValue}</span>
              </div>
            ) : (
              'Без категории'
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__new__">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Создать категорию</span>
            </div>
          </SelectItem>
          <SelectItem value="__none__">Без категории</SelectItem>
          {allCategories.map((category) => {
            if (!category || category === '') return null;
            return (
              <SelectItem key={category} value={category}>
                <div className="flex items-center gap-2">
                  <Tag className="h-3 w-3" />
                  <span>{category}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новая категория</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2">
            <Input
              placeholder="Название категории"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCategory();
                }
              }}
              autoFocus
            />
            <Button onClick={handleAddCategory}>Добавить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

