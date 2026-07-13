import { motion } from 'framer-motion';
import { Clock3 } from 'lucide-react';

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
}

function Timer({ timeRemaining }) {
  const isWarning = timeRemaining <= 300;
  const isCritical = timeRemaining <= 60;

  return (
    <motion.div
      animate={isCritical ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={isCritical ? { repeat: Infinity, duration: 0.8 } : { duration: 0.3 }}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold ${
        isCritical
          ? 'animate-pulse border-danger/60 bg-danger/20 text-danger'
          : isWarning
            ? 'border-warning/60 bg-warning/15 text-warning'
            : 'border-primary/35 bg-primary/10 text-primary'
      }`}
    >
      <Clock3 className="h-4 w-4" />
      {formatDuration(timeRemaining)}
    </motion.div>
  );
}

export default Timer;
