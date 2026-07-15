import { AnimatePresence, motion } from 'framer-motion';
import { GraduationCap, X } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { navItems } from '../../data/navigation';
import { cn } from '../../utils/cn';

const sidebarVariants = {
  hidden: { x: -320, opacity: 0 },
  visible: { x: 0, opacity: 1 },
};

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const isItemActive = (item) => {
    const [targetPath, targetQuery = ''] = String(item.path || '').split('?');
    if (location.pathname !== targetPath) {
      return false;
    }

    if (!targetQuery) {
      return true;
    }

    const expected = new URLSearchParams(targetQuery);
    const current = new URLSearchParams(location.search);

    for (const [key, value] of expected.entries()) {
      if (current.get(key) !== value) {
        return false;
      }
    }

    return true;
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={isOpen ? 'visible' : 'hidden'}
        variants={sidebarVariants}
        transition={{ type: 'spring', damping: 24, stiffness: 240 }}
        className={cn(
          'fixed left-0 top-0 z-40 h-full w-72 border-r border-white/10 bg-slate-900/80 p-4 backdrop-blur-xl lg:static lg:z-10 lg:translate-x-0 lg:bg-slate-900/45',
          !isOpen && 'pointer-events-none lg:pointer-events-auto'
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-primary to-accent p-2.5 shadow-glow">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">SAP TM</p>
              <h1 className="text-sm font-semibold text-white">Master Pro</h1>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-1 text-slate-300 hover:bg-white/10 lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={Boolean(item.end)}
                onClick={onClose}
                className={() =>
                  cn(
                    'group flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all',
                    active
                      ? 'bg-gradient-to-r from-primary/40 to-accent/30 text-white shadow-soft'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  )
                }
              >
                <span className="inline-flex h-5 w-5 items-center justify-center">
                  <Icon className="h-4 w-4 shrink-0" />
                </span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
}

export default Sidebar;
