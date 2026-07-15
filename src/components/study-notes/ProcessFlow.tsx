import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowDown,
  ClipboardList,
  Database,
  Factory,
  FileSearch,
  Flag,
  GitBranch,
  ListChecks,
  Map,
  Package,
  Route,
  Settings,
  ShieldCheck,
  Truck,
  Workflow,
  Wrench,
} from 'lucide-react';

export interface ProcessFlowStep {
  id?: string;
  title: string;
  description?: string;
  iconKey?:
    | 'clipboard-list'
    | 'database'
    | 'factory'
    | 'file-search'
    | 'flag'
    | 'git-branch'
    | 'list-checks'
    | 'map'
    | 'package'
    | 'route'
    | 'settings'
    | 'shield-check'
    | 'truck'
    | 'workflow'
    | 'wrench';
}

export interface ProcessFlowProps {
  title?: string;
  steps: ProcessFlowStep[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  maxVerticalHeightClassName?: string;
}

const iconMap = {
  'clipboard-list': ClipboardList,
  database: Database,
  factory: Factory,
  'file-search': FileSearch,
  flag: Flag,
  'git-branch': GitBranch,
  'list-checks': ListChecks,
  map: Map,
  package: Package,
  route: Route,
  settings: Settings,
  'shield-check': ShieldCheck,
  truck: Truck,
  workflow: Workflow,
  wrench: Wrench,
} as const;

function StepCard({
  step,
  index,
  total,
  orientation,
}: {
  step: ProcessFlowStep;
  index: number;
  total: number;
  orientation: 'horizontal' | 'vertical';
}) {
  const Icon = step.iconKey ? iconMap[step.iconKey] : Workflow;
  const showConnector = index < total - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.45), duration: 0.2 }}
      className={`${orientation === 'horizontal' ? 'inline-flex' : 'flex'} items-center`}
    >
      <article className="group w-64 shrink-0 rounded-xl border border-white/10 bg-white/5 p-3 transition-transform duration-200 hover:-translate-y-1 hover:bg-white/10">
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <span className="rounded-md border border-white/15 bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
            {index + 1}
          </span>
        </div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{step.title}</h4>
        {step.description ? <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{step.description}</p> : null}
      </article>

      {showConnector ? (
        orientation === 'horizontal' ? (
          <div className="mx-2 inline-flex items-center text-slate-400">
            <ArrowRight className="h-4 w-4" />
          </div>
        ) : (
          <div className="my-2 flex justify-center text-slate-400">
            <ArrowDown className="h-4 w-4" />
          </div>
        )
      ) : null}
    </motion.div>
  );
}

function ProcessFlow({
  title = 'Process Flow',
  steps,
  orientation = 'horizontal',
  className = '',
  maxVerticalHeightClassName = 'max-h-[36rem]',
}: ProcessFlowProps) {
  const safeSteps = Array.isArray(steps) ? steps.filter((step) => step?.title) : [];

  if (!safeSteps.length) {
    return null;
  }

  const effectiveOrientation = orientation;

  return (
    <section className={`mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 ${className}`.trim()} aria-label="Process flow">
      <div className="mb-3 border-b border-white/10 pb-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>

      {effectiveOrientation === 'horizontal' ? (
        <div className="overflow-x-auto pb-2">
          <div className="inline-flex min-w-max items-center">
            {safeSteps.map((step, index) => (
              <StepCard
                key={step.id || `flow-step-${index + 1}`}
                step={step}
                index={index}
                total={safeSteps.length}
                orientation="horizontal"
              />
            ))}
          </div>
        </div>
      ) : (
        <div className={`overflow-y-auto pr-1 ${maxVerticalHeightClassName}`}>
          <div className="flex flex-col items-start">
            {safeSteps.map((step, index) => (
              <StepCard
                key={step.id || `flow-step-${index + 1}`}
                step={step}
                index={index}
                total={safeSteps.length}
                orientation="vertical"
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default ProcessFlow;
