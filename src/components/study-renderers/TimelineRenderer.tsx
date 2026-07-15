import { CalendarClock } from 'lucide-react';
import { StudyRendererProps, TimelineBlock } from './types';

function TimelineRenderer({ block }: StudyRendererProps<TimelineBlock>) {
  const items = Array.isArray(block.items) ? block.items.filter((item) => String(item?.title || '').trim()) : [];
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4" aria-label="Timeline">
      <div className="mb-3 flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-accent" />
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{block.title || 'Timeline'}</h4>
      </div>

      <ol className="space-y-2">
        {items.map((item, index) => (
          <li key={item.id || `timeline-${index + 1}`} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.title}</p>
              {item.date ? <span className="text-[11px] text-slate-500 dark:text-slate-400">{item.date}</span> : null}
            </div>
            {item.description ? <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">{item.description}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export default TimelineRenderer;
