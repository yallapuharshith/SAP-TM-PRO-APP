import { motion } from 'framer-motion';

function PerformanceChartPlaceholder() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl border border-white/10 p-5 shadow-soft"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Performance Trend</h3>
        <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs text-accent">Last 30 Days</span>
      </div>
      <div className="grid h-56 grid-cols-10 items-end gap-2">
        {[32, 46, 39, 57, 63, 54, 68, 70, 76, 82].map((height, index) => (
          <motion.div
            key={`${height}-${index}`}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className="rounded-t-md bg-gradient-to-t from-primary/80 to-accent/70"
          />
        ))}
      </div>
    </motion.section>
  );
}

export default PerformanceChartPlaceholder;
