import { BookText } from 'lucide-react';
import { StudyRendererProps, GlossaryBlock } from './types';

function GlossaryRenderer({ block }: StudyRendererProps<GlossaryBlock>) {
  const entries = Array.isArray(block.entries)
    ? block.entries.filter((entry) => String(entry?.term || '').trim() && String(entry?.definition || '').trim())
    : [];

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4" aria-label="Glossary">
      <div className="mb-3 flex items-center gap-2">
        <BookText className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{block.title || 'Glossary'}</h4>
      </div>

      <dl className="space-y-2">
        {entries.map((entry, index) => (
          <div key={`${entry.term}-${index}`} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">{entry.term}</dt>
            <dd className="mt-1 text-sm text-slate-700 dark:text-slate-300">{entry.definition}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default GlossaryRenderer;
