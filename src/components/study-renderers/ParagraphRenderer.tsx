import { StudyRendererProps, ParagraphBlock } from './types';

function ParagraphRenderer({ block }: StudyRendererProps<ParagraphBlock>) {
  return <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{block.text}</p>;
}

export default ParagraphRenderer;
