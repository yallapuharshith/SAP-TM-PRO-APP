import ProcessFlow from '../study-notes/ProcessFlow';
import { StudyRendererProps } from './types';

function ProcessFlowRenderer({ block }: StudyRendererProps) {
  const steps = Array.isArray((block as { steps?: unknown[] }).steps) ? ((block as { steps?: unknown[] }).steps as never[]) : [];
  if (steps.length === 0) {
    return null;
  }

  return (
    <ProcessFlow
      title={String((block as { title?: string }).title || 'Process Flow')}
      steps={steps as never}
      orientation={((block as { orientation?: 'horizontal' | 'vertical' }).orientation || 'horizontal') as never}
    />
  );
}

export default ProcessFlowRenderer;
