import { motion } from 'framer-motion';
import { Bell, Menu, Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';

function Navbar({ pageTitle, isDark, onThemeToggle, onMenuClick }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={onMenuClick}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 p-2 text-slate-100 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </motion.button>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">SAP TM Master Pro</p>
            <h2 className="text-lg font-semibold text-white">{pageTitle}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => navigate('/revision')}
            className="hidden items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-slate-100 hover:bg-white/15 md:flex"
          >
            <Sparkles className="h-4 w-4 text-accent" />
            Smart Revision
          </motion.button>
          <button
            type="button"
            onClick={() => navigate('/study?section=notes')}
            className="hidden min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 p-2 text-slate-100 hover:bg-white/15 sm:inline-flex"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/analytics')}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 p-2 text-slate-100 hover:bg-white/15"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
