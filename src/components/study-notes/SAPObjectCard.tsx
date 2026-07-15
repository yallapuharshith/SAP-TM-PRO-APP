import { Boxes, Cog, Link2, Target, Type } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface SAPObjectCardProps {
  title: string;
  definition: string;
  purpose: string;
  businessUse: string;
  configuration: string;
  relationships: string[];
  className?: string;
}

const markdownClassName =
  'prose prose-sm max-w-none text-slate-700 dark:prose-invert dark:text-slate-200 prose-p:my-2 prose-ul:my-2 prose-ol:my-2';

function MarkdownText({ value }: { value: string }) {
  return (
    <div className={markdownClassName}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
    </div>
  );
}

function Section({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 inline-flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
          {icon}
        </span>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">{label}</h4>
      </div>
      <MarkdownText value={value} />
    </article>
  );
}

function SAPObjectCard({
  title,
  definition,
  purpose,
  businessUse,
  configuration,
  relationships,
  className = '',
}: SAPObjectCardProps) {
  const safeRelationships = Array.isArray(relationships)
    ? relationships.filter((item) => String(item || '').trim())
    : [];

  if (!title || !definition || !purpose || !businessUse || !configuration) {
    return null;
  }

  return (
    <section className={`mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 ${className}`.trim()} aria-label="SAP object card">
      <div className="mb-4 border-b border-white/10 pb-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Section icon={<Type className="h-4 w-4" />} label="Definition" value={definition} />
        <Section icon={<Target className="h-4 w-4" />} label="Purpose" value={purpose} />
        <Section icon={<Boxes className="h-4 w-4" />} label="Business Use" value={businessUse} />
        <Section icon={<Cog className="h-4 w-4" />} label="Configuration" value={configuration} />
      </div>

      <article className="mt-3 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-2 inline-flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
            <Link2 className="h-4 w-4" />
          </span>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">Relationships</h4>
        </div>

        {safeRelationships.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
            {safeRelationships.map((relationship, index) => (
              <li key={`${relationship}-${index}`}>{relationship}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-300">No relationships provided.</p>
        )}
      </article>
    </section>
  );
}

export default SAPObjectCard;
