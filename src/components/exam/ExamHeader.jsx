import { motion } from 'framer-motion';
import { Bookmark, Flag, MinusCircle, PlusCircle } from 'lucide-react';
import Timer from './Timer';
import ProgressBar from './ProgressBar';

function difficultyTone(difficulty) {
  if (difficulty === 'Hard') {
    return 'bg-danger/15 text-danger border-danger/40';
  }
  if (difficulty === 'Medium') {
    return 'bg-warning/15 text-warning border-warning/40';
  }
  return 'bg-success/15 text-success border-success/40';
}

function ExamHeader({
  question,
  questionNumber,
  total,
  timeRemaining,
  timerEnabled,
  counts,
  isBookmarked,
  isMarkedForReview,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card space-y-4 rounded-2xl border border-white/10 p-4 shadow-soft"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Question {questionNumber} of {total}</p>
          <h3 className="text-base font-semibold text-white">{question?.topic}</h3>
        </div>
        {timerEnabled ? (
          <Timer timeRemaining={timeRemaining} />
        ) : (
          <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-300">
            Untimed
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-primary/40 bg-primary/15 px-2.5 py-1 text-primary">
          {question?.module}
        </span>
        <span className={`rounded-full border px-2.5 py-1 ${difficultyTone(question?.difficulty)}`}>
          {question?.difficulty}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-success/35 bg-success/15 px-2.5 py-1 text-success">
          <PlusCircle className="h-3.5 w-3.5" /> {question?.marks} marks
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-danger/35 bg-danger/15 px-2.5 py-1 text-danger">
          <MinusCircle className="h-3.5 w-3.5" /> -{question?.negativeMarks}
        </span>
        {isBookmarked && (
          <span className="inline-flex items-center gap-1 rounded-full border border-accent/35 bg-accent/15 px-2.5 py-1 text-accent">
            <Bookmark className="h-3.5 w-3.5" /> Bookmarked
          </span>
        )}
        {isMarkedForReview && (
          <span className="inline-flex items-center gap-1 rounded-full border border-warning/35 bg-warning/15 px-2.5 py-1 text-warning">
            <Flag className="h-3.5 w-3.5" /> Marked
          </span>
        )}
      </div>

      <ProgressBar counts={counts} />
    </motion.section>
  );
}

export default ExamHeader;
