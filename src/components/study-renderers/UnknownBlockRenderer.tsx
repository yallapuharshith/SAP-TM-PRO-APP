import { AlertCircle } from 'lucide-react';
import { StudyRendererProps } from './types';

function UnknownBlockRenderer({ block }: StudyRendererProps) {
  return (
    <section className="mt-4 rounded-xl border border-warning/40 bg-warning/10 p-3" role="status" aria-label="Unsupported section type">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 text-warning" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-warning">Unsupported Section Type</p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
            This section type is not registered yet: <strong>{String(block?.type || 'unknown')}</strong>
          </p>
        </div>
      </div>
    </section>
  );
}

export default UnknownBlockRenderer;
