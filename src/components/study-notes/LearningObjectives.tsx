import { motion } from 'framer-motion';
import { CheckCircle2, Goal } from 'lucide-react';

export interface LearningObjectiveItem {
  id?: string | number;
  title?: string;
  text?: string;
  description?: string;
}

interface LearningObjectivesProps {
  objectives?: LearningObjectiveItem[];
  title?: string;
  className?: string;
  emptyStateText?: string;
}

function normalizeObjectives(objectives: LearningObjectiveItem[] = []) {
  return objectives
    .map((objective, index) => {
      const rawTitle = objective.title ?? objective.text ?? '';
      const normalizedTitle = String(rawTitle).trim();
      const normalizedDescription = String(objective.description ?? '').trim();

      if (!normalizedTitle) {
        return null;
      }

      return {
        id: objective.id ?? `objective-${index + 1}`,
        title: normalizedTitle,
        description: normalizedDescription || null,
      };
    })
    .filter(Boolean) as Array<{ id: string | number; title: string; description: string | null }>;
}

function LearningObjectives({
  objectives = [],
  title = 'Learning Objectives',
  className = '',
  emptyStateText = 'Learning objectives will appear here when defined for this topic.',
}: LearningObjectivesProps) {
  const items = normalizeObjectives(objectives);

  return (
    <section
      aria-label="Learning objectives"
      className={`mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 ${className}`.trim()}
    >
      <div className="mb-3 flex items-center gap-2">
        <Goal className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-slate-600 dark:text-slate-300">{emptyStateText}</p>
      ) : (
        <motion.ul
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                when: 'beforeChildren',
                staggerChildren: 0.06,
              },
            },
          }}
          className="grid gap-2 sm:grid-cols-2"
        >
          {items.map((objective) => (
            <motion.li
              key={objective.id}
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: 'easeOut' } },
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
            >
              <div className="inline-flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{objective.title}</p>
                  {objective.description ? (
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{objective.description}</p>
                  ) : null}
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </section>
  );
}

export default LearningObjectives;
