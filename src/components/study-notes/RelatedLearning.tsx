import {
  Activity,
  BriefcaseBusiness,
  ExternalLink,
  FlaskConical,
  Gauge,
  MessageSquareText,
} from 'lucide-react';

export type RelatedLearningKind = 'viva' | 'hands-on' | 'case-study' | 'mcq';

export interface RelatedLearningItem {
  id?: string;
  label: string;
  href: string;
  description?: string;
  progress?: number;
}

export interface RelatedLearningGroups {
  viva?: RelatedLearningItem[];
  handsOnLabs?: RelatedLearningItem[];
  caseStudies?: RelatedLearningItem[];
  practiceMcqs?: RelatedLearningItem[];
}

export interface RelatedLearningProps {
  title?: string;
  groups: RelatedLearningGroups;
  onNavigate: (href: string) => void;
  className?: string;
}

const CARD_META = [
  { key: 'viva', label: 'Viva', icon: MessageSquareText, color: 'text-primary' },
  { key: 'handsOnLabs', label: 'Hands-on', icon: FlaskConical, color: 'text-accent' },
  { key: 'caseStudies', label: 'Case Study', icon: BriefcaseBusiness, color: 'text-success' },
  { key: 'practiceMcqs', label: 'Practice MCQs', icon: Gauge, color: 'text-warning' },
] as const;

function clampPercent(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

function computeProgress(items: RelatedLearningItem[]) {
  if (!items.length) {
    return 0;
  }
  const total = items.reduce((sum, item) => sum + clampPercent(Number(item.progress || 0)), 0);
  return clampPercent(total / items.length);
}

function RelatedLearning({ title = 'Related Learning', groups, onNavigate, className = '' }: RelatedLearningProps) {
  const safeGroups = groups || {};

  return (
    <section className={`rounded-2xl border border-white/10 bg-white/5 p-4 ${className}`.trim()} aria-label="Related learning">
      <div className="mb-3 flex items-center gap-2">
        <ExternalLink className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {CARD_META.map((meta) => {
          const Icon = meta.icon;
          const items = safeGroups[meta.key] || [];
          const progress = computeProgress(items);

          return (
            <article key={meta.key} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${meta.color}`} />
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">{meta.label}</h4>
                </div>
                <span className="rounded-md border border-white/10 bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                  {items.length}
                </span>
              </div>

              <div className="mb-2">
                <div className="mb-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Progress
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-700/50">
                  <div style={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-primary to-accent" />
                </div>
              </div>

              <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <button
                      key={item.id || `${meta.key}-${index + 1}`}
                      type="button"
                      onClick={() => onNavigate(item.href)}
                      className="block w-full rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-left text-xs text-slate-700 transition hover:bg-white/10 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    >
                      <p className="font-medium">{item.label}</p>
                      {item.description ? <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{item.description}</p> : null}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">No items yet.</p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default RelatedLearning;
