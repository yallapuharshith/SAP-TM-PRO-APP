import { StudyRendererProps, ImageBlock } from './types';

function ImageRenderer({ block }: StudyRendererProps<ImageBlock>) {
  if (!block.src) {
    return null;
  }

  return (
    <figure className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/5">
      <img src={block.src} alt={block.alt || 'Study illustration'} className="h-auto w-full object-cover" loading="lazy" />
      {block.caption ? <figcaption className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{block.caption}</figcaption> : null}
    </figure>
  );
}

export default ImageRenderer;
