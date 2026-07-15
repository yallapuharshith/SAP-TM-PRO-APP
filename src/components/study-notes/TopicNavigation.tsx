import { CheckCircle2 } from 'lucide-react';

interface TopicNavigationProps {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onMarkComplete: () => void;
  isCompleted?: boolean;
}

function TopicNavigation({ hasPrevious, hasNext, onPrevious, onNext, onMarkComplete, isCompleted = false }: TopicNavigationProps) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
      <button
        type="button"
        disabled={!hasPrevious}
        onClick={onPrevious}
        className="min-h-11 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      <button
        type="button"
        onClick={onMarkComplete}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-success/35 bg-success/15 px-3 py-2 text-xs font-semibold text-success"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        {isCompleted ? 'Completed' : 'Mark Complete'}
      </button>

      <button
        type="button"
        disabled={!hasNext}
        onClick={onNext}
        className="min-h-11 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

export default TopicNavigation;
