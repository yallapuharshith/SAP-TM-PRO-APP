import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

function ThemeToggle({ isDark, onToggle }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      onClick={onToggle}
      className="inline-flex min-h-11 min-w-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-slate-100 backdrop-blur-lg transition-all hover:bg-white/15"
      type="button"
      aria-label="Toggle theme"
    >
      <motion.span
        initial={false}
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.35 }}
      >
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </motion.span>
      <span className="hidden sm:inline">{isDark ? 'Dark' : 'Light'}</span>
    </motion.button>
  );
}

export default ThemeToggle;
