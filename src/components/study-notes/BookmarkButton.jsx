import { BookMarked } from 'lucide-react';

function BookmarkButton({ active, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
        active ? 'bg-warning/20 text-warning' : 'bg-white/10 text-slate-700 dark:text-slate-300'
      }`}
      aria-pressed={active}
      aria-label={active ? 'Remove topic bookmark' : 'Bookmark topic'}
    >
      <span className="inline-flex items-center gap-1">
        <BookMarked className="h-3.5 w-3.5" />
        {active ? 'Bookmarked' : 'Bookmark'}
      </span>
    </button>
  );
}

export default BookmarkButton;
