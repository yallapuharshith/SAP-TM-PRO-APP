import BulletListRenderer from './BulletListRenderer';
import CalloutRenderer from './CalloutRenderer';
import DiagramRenderer from './DiagramRenderer';
import GlossaryRenderer from './GlossaryRenderer';
import HeadingRenderer from './HeadingRenderer';
import ImageRenderer from './ImageRenderer';
import {
  ArchitectureDiagramRenderer,
  BusinessBackgroundRenderer,
  BusinessScenarioRenderer,
  ComparisonTableRenderer,
  KnowledgeCheckRenderer,
  RelatedLearningRenderer,
  RevisionSummaryRenderer,
  SAPObjectCardRenderer,
  ScenarioCardRenderer,
} from './legacyRenderers';
import NumberedListRenderer from './NumberedListRenderer';
import ParagraphRenderer from './ParagraphRenderer';
import ProcessFlowRenderer from './ProcessFlowRenderer';
import TableRenderer from './TableRenderer';
import TimelineRenderer from './TimelineRenderer';
import { BaseStudyBlock, StudyRendererComponent } from './types';

const rendererRegistry = new Map<string, StudyRendererComponent>();
let defaultRegistered = false;

export function registerStudyBlockRenderer(type: string, renderer: StudyRendererComponent) {
  rendererRegistry.set(type, renderer);
}

export function getStudyBlockRenderer(type: string) {
  return rendererRegistry.get(type);
}

function legacyListRendererFactory(isOrdered: boolean): StudyRendererComponent {
  return function LegacyListRenderer({ block }: { block: BaseStudyBlock }) {
    const items = Array.isArray((block as { items?: string[] }).items) ? ((block as { items: string[] }).items as string[]) : [];
    const normalizedBlock = {
      type: isOrdered ? 'numbered-list' : 'bullet-list',
      items,
    };

    return isOrdered ? <NumberedListRenderer block={normalizedBlock} context={{ sectionId: '', blockIndex: -1 }} /> : <BulletListRenderer block={normalizedBlock} context={{ sectionId: '', blockIndex: -1 }} />;
  };
}

export function ensureDefaultStudyRenderersRegistered() {
  if (defaultRegistered) {
    return;
  }

  registerStudyBlockRenderer('heading', HeadingRenderer);
  registerStudyBlockRenderer('paragraph', ParagraphRenderer);
  registerStudyBlockRenderer('bullet-list', BulletListRenderer);
  registerStudyBlockRenderer('numbered-list', NumberedListRenderer);
  registerStudyBlockRenderer('table', TableRenderer);
  registerStudyBlockRenderer('image', ImageRenderer);
  registerStudyBlockRenderer('diagram', DiagramRenderer);
  registerStudyBlockRenderer('process-flow', ProcessFlowRenderer);
  registerStudyBlockRenderer('callout', CalloutRenderer);
  registerStudyBlockRenderer('glossary', GlossaryRenderer);
  registerStudyBlockRenderer('timeline', TimelineRenderer);

  // Legacy aliases and existing extended content blocks
  registerStudyBlockRenderer('list', ({ block, context }) => {
    const ordered = Boolean((block as { ordered?: boolean }).ordered);
    const items = Array.isArray((block as { items?: string[] }).items) ? ((block as { items: string[] }).items as string[]) : [];
    const normalized = {
      type: ordered ? 'numbered-list' : 'bullet-list',
      items,
    };

    return ordered ? <NumberedListRenderer block={normalized} context={context} /> : <BulletListRenderer block={normalized} context={context} />;
  });

  registerStudyBlockRenderer('sap-object-card', SAPObjectCardRenderer);
  registerStudyBlockRenderer('sap-object', SAPObjectCardRenderer);
  registerStudyBlockRenderer('architecture-diagram', ArchitectureDiagramRenderer);
  registerStudyBlockRenderer('business-background', BusinessBackgroundRenderer);
  registerStudyBlockRenderer('scenario-card', ScenarioCardRenderer);
  registerStudyBlockRenderer('business-scenario', BusinessScenarioRenderer);
  registerStudyBlockRenderer('comparison-table', ComparisonTableRenderer);
  registerStudyBlockRenderer('comparison', ComparisonTableRenderer);
  registerStudyBlockRenderer('revision-summary', RevisionSummaryRenderer);
  registerStudyBlockRenderer('knowledge-check', KnowledgeCheckRenderer);
  registerStudyBlockRenderer('related-learning', RelatedLearningRenderer);

  defaultRegistered = true;
}
