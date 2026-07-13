import { AnimatePresence, motion } from 'framer-motion';

function SubmitModal({ open, counts, onCancel, onConfirm }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass-card w-full max-w-md rounded-2xl border border-white/10 p-5 shadow-soft"
          >
            <h3 className="text-lg font-semibold text-white">Submit Exam</h3>
            <p className="mt-1 text-sm text-slate-300">Please confirm before final submission.</p>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-success/35 bg-success/15 p-2">
                <p className="text-xl font-semibold text-success">{counts.answered}</p>
                <p className="text-xs text-slate-200">Answered</p>
              </div>
              <div className="rounded-xl border border-slate-500/35 bg-slate-700/25 p-2">
                <p className="text-xl font-semibold text-slate-100">{counts.notAnswered}</p>
                <p className="text-xs text-slate-300">Not Answered</p>
              </div>
              <div className="rounded-xl border border-warning/35 bg-warning/15 p-2">
                <p className="text-xl font-semibold text-warning">{counts.marked}</p>
                <p className="text-xs text-slate-200">Marked</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="rounded-xl bg-gradient-to-r from-primary to-accent px-3 py-2 text-sm font-semibold text-white"
              >
                Submit Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SubmitModal;
