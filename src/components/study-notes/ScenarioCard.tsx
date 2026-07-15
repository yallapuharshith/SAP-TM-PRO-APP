import { Building2, Factory, GitMerge, Lightbulb, Sparkles, Target } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface ScenarioDiagram {
  src: string;
  alt?: string;
  caption?: string;
}

export interface ScenarioCompanyExample {
  title?: string;
  content: string;
}

export interface ScenarioCardProps {
  title?: string;
  company: string;
  industry: string;
  businessProblem: string;
  currentProcess: string;
  sapSolution: string;
  expectedBenefits: string;
  diagram?: ScenarioDiagram;
  companyExample?: ScenarioCompanyExample;
  className?: string;
}

const markdownClassName =
  'prose prose-sm max-w-none text-slate-700 dark:prose-invert dark:text-slate-200 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-headings:my-2';

function MarkdownText({ value }: { value: string }) {
  return (
    <div className={markdownClassName}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
    </div>
  );
}

function DetailPanel({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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

function ScenarioCard({
  title = 'Scenario',
  company,
  industry,
  businessProblem,
  currentProcess,
  sapSolution,
  expectedBenefits,
  diagram,
  companyExample,
  className = '',
}: ScenarioCardProps) {
  return (
    <section className={`mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 ${className}`.trim()} aria-label="Scenario card">
      <div className="mb-4 border-b border-white/10 pb-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 inline-flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">Company</h4>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-200">{company}</p>
        </article>

        <article className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 inline-flex items-center gap-2">
            <Factory className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">Industry</h4>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-200">{industry}</p>
        </article>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <DetailPanel icon={<Target className="h-4 w-4" />} label="Business Problem" value={businessProblem} />
        <DetailPanel icon={<GitMerge className="h-4 w-4" />} label="Current Process" value={currentProcess} />
        <DetailPanel icon={<Lightbulb className="h-4 w-4" />} label="SAP Solution" value={sapSolution} />
        <DetailPanel icon={<Sparkles className="h-4 w-4" />} label="Expected Benefits" value={expectedBenefits} />
      </div>

      {diagram ? (
        <figure className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/5">
          <img src={diagram.src} alt={diagram.alt || 'Scenario diagram'} className="h-auto w-full object-cover" loading="lazy" />
          {diagram.caption ? (
            <figcaption className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{diagram.caption}</figcaption>
          ) : null}
        </figure>
      ) : null}

      {companyExample ? (
        <article className="mt-4 rounded-xl border border-accent/25 bg-accent/10 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
            {companyExample.title || 'Company Example'}
          </h4>
          <div className="mt-2">
            <MarkdownText value={companyExample.content} />
          </div>
        </article>
      ) : null}
    </section>
  );
}

export default ScenarioCard;
