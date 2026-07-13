import { motion } from 'framer-motion';

function Segment({ label, count, total, color }) {
  const width = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span>{count}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-700/60">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function ProgressBar({ counts }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Segment label="Answered" count={counts.answered} total={counts.total} color="bg-success" />
      <Segment label="Visited" count={counts.visited} total={counts.total} color="bg-primary" />
      <Segment label="Remaining" count={counts.notAnswered} total={counts.total} color="bg-slate-400" />
    </div>
  );
}

export default ProgressBar;
