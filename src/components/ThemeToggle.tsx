import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTodoStore } from '@/store/todoStore';
import { useEffect } from 'react';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTodoStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="rounded-xl hover:bg-muted"
    >
      {theme === 'light' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
};
