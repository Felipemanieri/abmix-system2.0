import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
      title={isDark ? 'Light' : 'Dark'}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      )}
    </button>
  );
}