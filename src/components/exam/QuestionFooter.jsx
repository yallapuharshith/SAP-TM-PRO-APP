import { motion } from 'framer-motion';
import { Bookmark, Flag, Save } from 'lucide-react';

function ActionButton({ children, onClick, tone = 'default' }) {
  const toneClass = {
    default: 'border-white/15 bg-white/10 text-slate-100 hover:bg-white/15',
    primary: 'border-primary/50 bg-primary/20 text-primary hover:bg-primary/25',
    warning: 'border-warning/50 bg-warning/20 text-warning hover:bg-warning/25',
    success: 'border-success/50 bg-success/20 text-success hover:bg-success/25',
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all ${toneClass[tone]}`}
    >
      {children}
    </motion.button>
  );
}

function QuestionFooter({ onPrevious, onNext, onMarkReview, onBookmark, onSave, onSubmit }) {
  return (
    <div className="glass-card flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 p-3 shadow-soft">
      <div className="flex flex-wrap items-center gap-2">
        <ActionButton onClick={onPrevious}>Previous</ActionButton>
        <ActionButton onClick={onNext}>Next</ActionButton>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ActionButton onClick={onMarkReview} tone="warning">
          <span className="inline-flex items-center gap-1"><Flag className="h-3.5 w-3.5" /> Mark for Review</span>
        </ActionButton>
        <ActionButton onClick={onBookmark} tone="primary">
          <span className="inline-flex items-center gap-1"><Bookmark className="h-3.5 w-3.5" /> Bookmark</span>
        </ActionButton>
        <ActionButton onClick={onSave} tone="success">
          <span className="inline-flex items-center gap-1"><Save className="h-3.5 w-3.5" /> Save</span>
        </ActionButton>
        <ActionButton onClick={onSubmit} tone="default">Submit Exam</ActionButton>
      </div>
    </div>
  );
}

export default QuestionFooter;
