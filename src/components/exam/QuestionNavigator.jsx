import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function QuestionNavigator({ currentIndex, total, onPrevious, onNext }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2">
      <motion.button
        whileTap={{ scale: 0.96 }}
        type="button"
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200 disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" /> Prev
      </motion.button>

      <span className="text-xs text-slate-300">Question {currentIndex + 1} / {total}</span>

      <motion.button
        whileTap={{ scale: 0.96 }}
        type="button"
        onClick={onNext}
        disabled={currentIndex >= total - 1}
        className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200 disabled:opacity-40"
      >
        Next <ChevronRight className="h-4 w-4" />
      </motion.button>
    </div>
  );
}

export default QuestionNavigator;
