import { Building2, CircleHelp, Lightbulb, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface BusinessBackgroundImage {
  src: string;
  alt?: string;
  caption?: string;
}

export interface BusinessExample {
  title?: string;
  content: string;
}

export interface BusinessBackgroundProps {
  title?: string;
  businessProblem: string;
  solution: string;
  businessBenefit: string;
  image?: BusinessBackgroundImage;
  companyExample?: BusinessExample;
  className?: string;
}

const markdownClassName =
  'prose prose-sm max-w-none text-slate-700 dark:prose-invert dark:text-slate-200 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-headings:my-2';

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className={markdownClassName}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

function InfoPanel({
  icon,
  heading,
  content,
}: {
  icon: React.ReactNode;
  heading: string;
  content: string;
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 inline-flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
          {icon}
        </span>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">{heading}</h4>
      </div>
      <MarkdownContent content={content} />
    </article>
  );
}

function BusinessBackground({
  title = 'Business Background',
  businessProblem,
  solution,
  businessBenefit,
  image,
  companyExample,
  className = '',
}: BusinessBackgroundProps) {
  return (
    <section className={`mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 ${className}`.trim()} aria-label="Business background">
      <div className="mb-4 border-b border-white/10 pb-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>

      <div className={`grid gap-4 ${image ? 'xl:grid-cols-[minmax(0,1fr)_280px]' : ''}`}>
        <div className="grid gap-3 md:grid-cols-3">
          <InfoPanel icon={<CircleHelp className="h-4 w-4" />} heading="Business Problem" content={businessProblem} />
          <InfoPanel icon={<Lightbulb className="h-4 w-4" />} heading="Solution" content={solution} />
          <InfoPanel icon={<TrendingUp className="h-4 w-4" />} heading="Business Benefit" content={businessBenefit} />
        </div>

        {image ? (
          <figure className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <img src={image.src} alt={image.alt || 'Business background'} loading="lazy" className="h-full w-full object-cover" />
            {image.caption ? (
              <figcaption className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{image.caption}</figcaption>
            ) : null}
          </figure>
        ) : null}
      </div>

      {companyExample ? (
        <article className="mt-4 rounded-xl border border-primary/25 bg-primary/10 p-4">
          <div className="mb-2 inline-flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
              {companyExample.title || 'Company Example'}
            </h4>
          </div>
          <MarkdownContent content={companyExample.content} />
        </article>
      ) : null}
    </section>
  );
}

export default BusinessBackground;
