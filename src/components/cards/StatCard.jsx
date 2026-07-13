import { motion } from 'framer-motion';

function StatCard({ title, value, delta, icon: Icon, tone = 'primary' }) {
  const toneClasses = {
    primary: 'from-primary/25 to-primary/5 text-primary',
    accent: 'from-accent/25 to-accent/5 text-accent',
    success: 'from-success/25 to-success/5 text-success',
    warning: 'from-warning/25 to-warning/5 text-warning',
    danger: 'from-danger/25 to-danger/5 text-danger',
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25 }}
      className="glass-card group rounded-2xl border border-white/10 p-4 shadow-soft"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
        <div className={`rounded-xl bg-gradient-to-br p-2 ${toneClasses[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <motion.p
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="text-2xl font-semibold text-white"
      >
        {value}
      </motion.p>
      <p className="mt-1 text-xs text-slate-400">{delta}</p>
    </motion.article>
  );
}

export default StatCard;
