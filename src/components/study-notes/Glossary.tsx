import { BookText } from 'lucide-react';

export interface GlossaryEntry {
  term: string;
  definition: string;
}

interface GlossaryProps {
  title?: string;
  entries: GlossaryEntry[];
  className?: string;
}

function Glossary({ title = 'Glossary', entries, className = '' }: GlossaryProps) {
  const safeEntries = Array.isArray(entries)
    ? entries.filter((entry) => String(entry?.term || '').trim() && String(entry?.definition || '').trim())
    : [];

  if (safeEntries.length === 0) {
    return null;
  }

  return (
    <section className={`mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 ${className}`.trim()} aria-label="Glossary">
      <div className="mb-3 flex items-center gap-2 border-b border-white/10 pb-3">
        <BookText className="h-4 w-4 text-primary" />
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>

      <dl className="space-y-2">
        {safeEntries.map((entry, index) => (
          <div key={`${entry.term}-${index}`} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">{entry.term}</dt>
            <dd className="mt-1 text-sm text-slate-700 dark:text-slate-300">{entry.definition}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default Glossary;
