import UnknownBlockRenderer from './UnknownBlockRenderer';
import { ensureDefaultStudyRenderersRegistered, getStudyBlockRenderer } from './registry';
import { BaseStudyBlock, StudyRendererContext } from './types';

interface StudyBlockRendererProps {
  block: BaseStudyBlock;
  context: StudyRendererContext;
}

function StudyBlockRenderer({ block, context }: StudyBlockRendererProps) {
  ensureDefaultStudyRenderersRegistered();

  const type = String(block?.type || '').trim();
  const Renderer = type ? getStudyBlockRenderer(type) : null;

  if (!Renderer) {
    return <UnknownBlockRenderer block={block} context={context} />;
  }

  return <Renderer block={block} context={context} />;
}

export default StudyBlockRenderer;
