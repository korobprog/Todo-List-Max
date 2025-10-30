import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTodoStore } from '@/store/todoStore';

export const TodoInput = () => {
  const [input, setInput] = useState('');
  const addTodo = useTodoStore((state) => state.addTodo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      addTodo(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="Добавьте новую задачу..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="h-12 text-base rounded-2xl border-2 focus-visible:ring-primary"
      />
      <Button
        type="submit"
        size="lg"
        className="h-12 px-6 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
      >
        <Plus className="h-5 w-5 mr-2" />
        Добавить
      </Button>
    </form>
  );
};
