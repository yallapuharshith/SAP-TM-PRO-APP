import { StudyRendererProps, HeadingBlock } from './types';

function HeadingRenderer({ block }: StudyRendererProps<HeadingBlock>) {
  const level = Math.min(4, Math.max(2, Number(block.level || 3)));
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return <Tag className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{block.text}</Tag>;
}

export default HeadingRenderer;
