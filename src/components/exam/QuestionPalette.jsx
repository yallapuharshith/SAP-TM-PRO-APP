import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const statusTone = {
  not_visited: 'bg-slate-600/40 text-slate-200 border-slate-500/40',
  visited: 'bg-primary/25 text-primary border-primary/45',
  answered: 'bg-success/25 text-success border-success/45',
  marked: 'bg-warning/25 text-warning border-warning/45',
  skipped: 'bg-danger/25 text-danger border-danger/45',
};

function LegendItem({ title, status }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-300">
      <span className={cn('h-3.5 w-3.5 rounded-full border', statusTone[status])} />
      {title}
    </div>
  );
}

function QuestionPalette({ questions, currentIndex, getStatus, onJump }) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card sticky top-24 space-y-4 rounded-2xl border border-white/10 p-4 shadow-soft"
    >
      <div>
        <h3 className="text-sm font-semibold text-white">Question Palette</h3>
        <p className="mt-1 text-xs text-slate-400">Jump to any question</p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {questions.map((question, index) => {
          const status = getStatus(question.id);
          const active = currentIndex === index;

          return (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={question.id}
              type="button"
              onClick={() => onJump(index)}
              className={cn(
                'min-h-11 rounded-lg border py-2 text-sm font-semibold transition-all',
                statusTone[status],
                active && 'ring-2 ring-white/70'
              )}
            >
              {index + 1}
            </motion.button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-2">
        <LegendItem title="Not Visited" status="not_visited" />
        <LegendItem title="Visited" status="visited" />
        <LegendItem title="Answered" status="answered" />
        <LegendItem title="Marked" status="marked" />
        <LegendItem title="Skipped" status="skipped" />
      </div>
    </motion.aside>
  );
}

export default QuestionPalette;
