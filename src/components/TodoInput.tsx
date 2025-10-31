import { useState } from 'react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTodoStore, type Priority } from '@/store/todoStore';
import { TodoPrioritySelector } from './TodoPrioritySelector';
import { TodoCategorySelector } from './TodoCategorySelector';
import { TodoTagsInput } from './TodoTagsInput';
import { TodoDeadlinePicker } from './TodoDeadlinePicker';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export const TodoInput = () => {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const addTodo = useTodoStore((state) => state.addTodo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      try {
        await addTodo({
          text: text.trim(),
          completed: false,
          priority,
          category,
          tags,
          deadline,
        });
        setText('');
        setPriority('medium');
        setCategory(null);
        setTags([]);
        setDeadline(null);
        setIsExpanded(false);
      } catch (error: any) {
        console.error('Error adding todo:', error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Добавьте новую задачу..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="h-12 text-base rounded-2xl border-2 focus-visible:ring-primary flex-1"
        />
        <Button
          type="submit"
          size="lg"
          className="h-12 px-6 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
        >
          <Plus className="h-5 w-5 mr-2" />
          Добавить
        </Button>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-12 px-4 rounded-2xl"
            >
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </div>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Приоритет</label>
              <TodoPrioritySelector value={priority} onChange={setPriority} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Категория</label>
              <TodoCategorySelector value={category} onChange={setCategory} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Теги</label>
            <TodoTagsInput value={tags} onChange={setTags} />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Дедлайн</label>
            <TodoDeadlinePicker value={deadline} onChange={setDeadline} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </form>
  );
};
