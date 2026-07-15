import Callout from '../study-notes/Callout';
import { StudyRendererProps } from './types';

function CalloutRenderer({ block }: StudyRendererProps) {
  const content = String((block as { content?: string; text?: string }).content || (block as { text?: string }).text || '').trim();
  if (!content) {
    return null;
  }

  return (
    <Callout
      type={((block as { calloutType?: string }).calloutType || 'info') as never}
      title={String((block as { title?: string }).title || 'Callout')}
      content={content}
      icon={(block as { icon?: never }).icon}
      color={(block as { color?: never }).color}
      collapsible={Boolean((block as { collapsible?: boolean }).collapsible)}
      defaultCollapsed={Boolean((block as { defaultCollapsed?: boolean }).defaultCollapsed)}
    />
  );
}

export default CalloutRenderer;
