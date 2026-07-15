import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Printer, RectangleEllipsis } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface RevisionFlashcard {
  id?: string;
  front: string;
  back: string;
}

export interface RevisionSummaryProps {
  title?: string;
  bullets: string[];
  flashcards?: RevisionFlashcard[];
  initiallyExpanded?: boolean;
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

function RevisionSummary({
  title = 'Revision Summary',
  bullets,
  flashcards = [],
  initiallyExpanded = false,
  className = '',
}: RevisionSummaryProps) {
  const [expanded, setExpanded] = useState(Boolean(initiallyExpanded));
  const safeBullets = Array.isArray(bullets) ? bullets.filter((item) => String(item || '').trim()) : [];
  const safeFlashcards = Array.isArray(flashcards)
    ? flashcards.filter((item) => String(item?.front || '').trim() && String(item?.back || '').trim())
    : [];

  const visibleBullets = expanded ? safeBullets : safeBullets.slice(0, 6);
  const visibleFlashcards = expanded ? safeFlashcards : safeFlashcards.slice(0, 4);

  const notesText = useMemo(() => {
    const lines = [title, '', 'Key Points:'];
    safeBullets.forEach((bullet, index) => lines.push(`${index + 1}. ${bullet}`));

    if (safeFlashcards.length > 0) {
      lines.push('', 'Flashcards:');
      safeFlashcards.forEach((card, index) => {
        lines.push(`Q${index + 1}: ${card.front}`);
        lines.push(`A${index + 1}: ${card.back}`);
      });
    }

    return lines.join('\n');
  }, [safeBullets, safeFlashcards, title]);

  if (safeBullets.length === 0 && safeFlashcards.length === 0) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(notesText);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = notesText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Segoe UI, Arial, sans-serif; padding: 20px; color: #111827; }
            h1 { font-size: 22px; margin-bottom: 12px; }
            h2 { font-size: 16px; margin-top: 18px; margin-bottom: 8px; }
            li { margin-bottom: 8px; }
            .card { border: 1px solid #d1d5db; border-radius: 8px; padding: 10px; margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <h2>Key Points</h2>
          <ul>${safeBullets.map((bullet) => `<li>${bullet}</li>`).join('')}</ul>
          ${
            safeFlashcards.length
              ? `<h2>Flashcards</h2>${safeFlashcards
                  .map((card) => `<div class="card"><strong>Q:</strong> ${card.front}<br/><strong>A:</strong> ${card.back}</div>`)
                  .join('')}`
              : ''
          }
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <section className={`mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 ${className}`.trim()} aria-label="Revision summary">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            {expanded ? 'Collapse' : 'Expand'}
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Notes
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-1.5 text-xs font-semibold text-accent"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
        </div>
      </div>

      {visibleBullets.length > 0 ? (
        <article className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">Bullet Summary</h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
            {visibleBullets.map((bullet, index) => (
              <li key={`${bullet}-${index}`}>
                <MarkdownText value={bullet} />
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      {visibleFlashcards.length > 0 ? (
        <article className="mt-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 inline-flex items-center gap-2">
            <RectangleEllipsis className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">Flashcards</h4>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            {visibleFlashcards.map((card, index) => (
              <details key={card.id || `flashcard-${index + 1}`} className="group rounded-lg border border-white/10 bg-white/5 p-3">
                <summary className="cursor-pointer list-none text-xs font-semibold text-slate-800 dark:text-slate-100">
                  Q{index + 1}. {card.front}
                </summary>
                <p className="mt-2 text-xs text-slate-700 dark:text-slate-300">{card.back}</p>
              </details>
            ))}
          </div>
        </article>
      ) : null}
    </section>
  );
}

export default RevisionSummary;
