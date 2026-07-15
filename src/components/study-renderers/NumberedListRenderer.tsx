import { StudyRendererProps, NumberedListBlock } from './types';

function NumberedListRenderer({ block }: StudyRendererProps<NumberedListBlock>) {
  const items = Array.isArray(block.items) ? block.items : [];
  if (items.length === 0) {
    return null;
  }

  return (
    <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ol>
  );
}

export default NumberedListRenderer;
