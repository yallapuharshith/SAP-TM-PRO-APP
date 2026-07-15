import { StudyRendererProps, BulletListBlock } from './types';

function BulletListRenderer({ block }: StudyRendererProps<BulletListBlock>) {
  const items = Array.isArray(block.items) ? block.items : [];
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

export default BulletListRenderer;
