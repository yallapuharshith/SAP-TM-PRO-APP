import { ChevronDown, ChevronUp } from 'lucide-react';
import { ReactNode } from 'react';

interface SectionAccordionProps {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
}

function SectionAccordion({ id, title, isOpen, onToggle, children }: SectionAccordionProps) {
  return (
    <section id={`section-${id}`} className="mt-6 scroll-mt-28 rounded-xl border border-white/10 bg-white/5" aria-label={title}>
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex min-h-11 w-full items-center justify-between gap-2 px-4 py-3 text-left"
        aria-expanded={isOpen}
        aria-controls={`section-panel-${id}`}
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
      </button>

      {isOpen ? (
        <div id={`section-panel-${id}`} className="border-t border-white/10 px-4 pb-4" role="region" aria-live="polite">
          {children}
        </div>
      ) : null}
    </section>
  );
}

export default SectionAccordion;
