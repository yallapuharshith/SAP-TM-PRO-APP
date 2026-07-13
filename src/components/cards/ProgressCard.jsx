import { motion } from 'framer-motion';

function ProgressCard({ title, progress, subtitle }) {
  const safeProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="glass-card rounded-2xl border border-white/10 p-5 shadow-soft"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
          {safeProgress}%
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-700/70">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
        />
      </div>
      <p className="mt-3 text-xs text-slate-400">{subtitle}</p>
    </motion.article>
  );
}

export default ProgressCard;
