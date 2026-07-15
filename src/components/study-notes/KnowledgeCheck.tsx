import { CheckCircle2, CircleHelp } from 'lucide-react';
import { useMemo, useState } from 'react';

export interface KnowledgeCheckQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex?: number;
  explanation?: string;
}

export interface KnowledgeCheckProps {
  title?: string;
  questions: KnowledgeCheckQuestion[];
  className?: string;
}

function KnowledgeCheck({ title = 'Knowledge Check', questions, className = '' }: KnowledgeCheckProps) {
  const safeQuestions = Array.isArray(questions)
    ? questions.filter((question) => String(question?.question || '').trim() && Array.isArray(question?.options))
    : [];

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const score = useMemo(() => {
    let earned = 0;
    let gradable = 0;

    safeQuestions.forEach((question) => {
      if (typeof question.correctIndex !== 'number') {
        return;
      }
      gradable += 1;
      if (answers[question.id] === question.correctIndex) {
        earned += 1;
      }
    });

    return gradable > 0 ? Math.round((earned / gradable) * 100) : null;
  }, [answers, safeQuestions]);

  if (safeQuestions.length === 0) {
    return null;
  }

  return (
    <section className={`mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 ${className}`.trim()} aria-label="Knowledge check">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
        {score !== null ? <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Score: {score}%</span> : null}
      </div>

      <ol className="space-y-3">
        {safeQuestions.map((question, index) => (
          <li key={question.id || `kc-${index + 1}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {index + 1}. {question.question}
            </p>

            <div className="mt-2 space-y-1">
              {question.options.map((option, optionIndex) => {
                const selected = answers[question.id] === optionIndex;
                const isCorrect = typeof question.correctIndex === 'number' && question.correctIndex === optionIndex;
                return (
                  <button
                    key={`${question.id}-opt-${optionIndex}`}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))}
                    className={`flex min-h-10 w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition ${
                      selected
                        ? 'border-primary/40 bg-primary/15 text-slate-900 dark:text-white'
                        : 'border-white/10 bg-white/5 text-slate-700 hover:bg-white/10 dark:text-slate-300'
                    }`}
                    aria-pressed={selected}
                  >
                    {isCorrect && selected ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <CircleHelp className="h-3.5 w-3.5 text-slate-400" />}
                    {option}
                  </button>
                );
              })}
            </div>

            {typeof question.correctIndex === 'number' && answers[question.id] !== undefined ? (
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                {answers[question.id] === question.correctIndex ? 'Correct.' : `Correct answer: ${question.options[question.correctIndex]}`}
                {question.explanation ? ` ${question.explanation}` : ''}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export default KnowledgeCheck;
