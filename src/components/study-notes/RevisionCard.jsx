import { CheckSquare2 } from 'lucide-react';

function RevisionCard({ points = [] }) {
  if (!points.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4" aria-label="Key takeaways">
      <div className="mb-3 flex items-center gap-2">
        <CheckSquare2 className="h-4 w-4 text-success" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Key Takeaways</h3>
      </div>
      <ul className="space-y-2">
        {points.map((point) => (
          <li key={point.id} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300">
            {point.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RevisionCard;
