import { CheckCircle2 } from 'lucide-react';

function TopicCompletion({ completed, onMarkComplete }) {
  return (
    <button
      type="button"
      onClick={onMarkComplete}
      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-success/35 bg-success/15 px-3 py-2 text-xs font-semibold text-success"
      aria-pressed={completed}
      aria-label={completed ? 'Topic completed' : 'Mark topic as complete'}
    >
      <CheckCircle2 className="h-3.5 w-3.5" />
      {completed ? 'Completed' : 'Mark Complete'}
    </button>
  );
}

export default TopicCompletion;
