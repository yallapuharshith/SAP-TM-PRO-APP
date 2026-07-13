import { AnimatePresence, motion } from 'framer-motion';

function formatAnswer(answer) {
  if (Array.isArray(answer)) {
    return answer.length > 0 ? answer.join(', ') : 'Not answered';
  }

  if (answer && typeof answer === 'object') {
    const pairs = Object.entries(answer).map(([left, right]) => `${left} -> ${right}`);
    return pairs.length > 0 ? pairs.join(' | ') : 'Not answered';
  }

  return answer || 'Not answered';
}

function ReviewModal({ open, question, yourAnswer, onClose }) {
  return (
    <AnimatePresence>
      {open && question && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass-card max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 p-5 shadow-soft"
          >
            <h3 className="text-lg font-semibold text-white">Question Review</h3>
            <p className="mt-3 text-sm text-slate-100">{question.question}</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-primary/35 bg-primary/10 p-3">
                <p className="text-xs uppercase tracking-wide text-primary">Your Answer</p>
                <p className="mt-1 text-sm text-slate-100">{formatAnswer(yourAnswer)}</p>
              </div>
              <div className="rounded-xl border border-success/35 bg-success/10 p-3">
                <p className="text-xs uppercase tracking-wide text-success">Correct Answer</p>
                <p className="mt-1 text-sm text-slate-100">{formatAnswer(question.correctAnswer)}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/40 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">Explanation</p>
              <p className="mt-1 text-sm text-slate-200">{question.explanation}</p>
            </div>
            <div className="mt-3 rounded-xl border border-accent/30 bg-accent/10 p-3">
              <p className="text-xs uppercase tracking-wide text-accent">Consultant Tip</p>
              <p className="mt-1 text-sm text-slate-100">{question.consultantTip}</p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-gradient-to-r from-primary to-accent px-3 py-2 text-sm font-medium text-white"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ReviewModal;
