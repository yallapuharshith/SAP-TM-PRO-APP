export type StudyCalloutType =
  | 'info'
  | 'tip'
  | 'warning'
  | 'success'
  | 'critical'
  | 'note'
  | 'interview-tip'
  | 'best-practice'
  | 'scenario'
  | 'example';

export type StudyCalloutIcon =
  | 'alert-triangle'
  | 'badge-info'
  | 'check-circle'
  | 'lightbulb'
  | 'shield-alert'
  | 'sparkles';

export type StudyCalloutColor = 'primary' | 'accent' | 'warning' | 'success' | 'danger' | 'neutral';

export interface LearningObjective {
  id: string;
  title: string;
  description?: string;
  text?: string;
}

export interface RevisionPoint {
  id: string;
  text: string;
}

export interface StudyCallout {
  type: 'callout';
  calloutType: StudyCalloutType;
  title?: string;
  text?: string;
  content?: string;
  icon?: StudyCalloutIcon;
  color?: StudyCalloutColor;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface StudyDiagramNode {
  id: string;
  label: string;
}

export interface StudyDiagramEdge {
  from: string;
  to: string;
  label?: string;
}

export interface Diagram {
  type: 'diagram';
  title?: string;
  description?: string;
  nodes: StudyDiagramNode[];
  edges: StudyDiagramEdge[];
}

export interface BusinessBackgroundImage {
  src: string;
  alt?: string;
  caption?: string;
}

export interface BusinessExample {
  title?: string;
  content: string;
}

export interface BusinessBackgroundBlock {
  type: 'business-background';
  title?: string;
  businessProblem: string;
  solution: string;
  businessBenefit: string;
  image?: BusinessBackgroundImage;
  companyExample?: BusinessExample;
}

export interface ScenarioDiagram {
  src: string;
  alt?: string;
  caption?: string;
}

export interface ScenarioCardBlock {
  type: 'scenario-card' | 'business-scenario';
  title?: string;
  company: string;
  industry: string;
  businessProblem: string;
  currentProcess: string;
  sapSolution: string;
  expectedBenefits: string;
  diagram?: ScenarioDiagram;
  companyExample?: BusinessExample;
}

export interface ProcessFlowStep {
  id?: string;
  title: string;
  description?: string;
  iconKey?:
    | 'clipboard-list'
    | 'database'
    | 'factory'
    | 'file-search'
    | 'flag'
    | 'git-branch'
    | 'list-checks'
    | 'map'
    | 'package'
    | 'route'
    | 'settings'
    | 'shield-check'
    | 'truck'
    | 'workflow'
    | 'wrench';
}

export interface ProcessFlowBlock {
  type: 'process-flow';
  title?: string;
  orientation?: 'horizontal' | 'vertical';
  steps: ProcessFlowStep[];
}

export interface ComparisonTableRow {
  id?: string;
  values: Array<string | number | null | undefined>;
  highlight?: boolean;
}

export interface ComparisonTableBlock {
  type: 'comparison-table' | 'comparison';
  title?: string;
  columns: string[];
  rows: ComparisonTableRow[];
  highlightDifferences?: boolean;
  exportFileName?: string;
}

export interface RevisionFlashcard {
  id?: string;
  front: string;
  back: string;
}

export interface RevisionSummaryBlock {
  type: 'revision-summary';
  title?: string;
  bullets: string[];
  flashcards?: RevisionFlashcard[];
  initiallyExpanded?: boolean;
}

export interface GlossaryEntry {
  term: string;
  definition: string;
}

export interface GlossaryBlock {
  type: 'glossary';
  title?: string;
  entries: GlossaryEntry[];
}

export interface TimelineItem {
  id?: string;
  title: string;
  date?: string;
  description?: string;
}

export interface TimelineBlock {
  type: 'timeline';
  title?: string;
  items: TimelineItem[];
}

export interface KnowledgeCheckQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex?: number;
  explanation?: string;
}

export interface KnowledgeCheckBlock {
  type: 'knowledge-check';
  title?: string;
  questions: KnowledgeCheckQuestion[];
}

export interface RelatedLearningBlock {
  type: 'related-learning';
  title?: string;
  groups: RelatedLearningGroups;
}

export interface SAPObjectCardBlock {
  type: 'sap-object-card' | 'sap-object';
  title: string;
  definition: string;
  purpose: string;
  businessUse: string;
  configuration: string;
  relationships: string[];
}

export type ArchitectureIconKey =
  | 'app-window'
  | 'boxes'
  | 'building-2'
  | 'cloud'
  | 'cog'
  | 'database'
  | 'gauge'
  | 'network'
  | 'server'
  | 'shield-check'
  | 'workflow';

export interface ArchitectureGroup {
  id: string;
  title: string;
  description?: string;
}

export interface ArchitectureNode {
  id: string;
  title: string;
  description?: string;
  groupId?: string;
  iconKey?: ArchitectureIconKey;
}

export interface ArchitectureConnection {
  from: string;
  to: string;
  label?: string;
}

export interface ArchitectureDiagramBlock {
  type: 'architecture-diagram';
  title?: string;
  description?: string;
  groups?: ArchitectureGroup[];
  nodes: ArchitectureNode[];
  connections: ArchitectureConnection[];
}

export type StudyContentBlock =
  | { type: 'heading'; level?: 2 | 3 | 4; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullet-list'; items: string[] }
  | { type: 'numbered-list'; items: string[] }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | {
      type: 'table';
      columns: string[];
      rows: Array<Array<string | number>>;
    }
  | {
      type: 'image';
      src: string;
      alt: string;
      caption?: string;
    }
  | {
      type: 'code';
      language?: string;
      code: string;
      caption?: string;
    }
  | SAPObjectCardBlock
  | ArchitectureDiagramBlock
  | RevisionSummaryBlock
  | GlossaryBlock
  | TimelineBlock
  | KnowledgeCheckBlock
  | RelatedLearningBlock
  | ComparisonTableBlock
  | ScenarioCardBlock
  | ProcessFlowBlock
  | BusinessBackgroundBlock
  | StudyCallout
  | Diagram;

export interface StudySection {
  id: string;
  title: string;
  content: StudyContentBlock[];
}

export interface StudyLink {
  label: string;
  href: string;
}

export interface RelatedLearning extends StudyLink {
  kind: 'viva' | 'hands-on' | 'case-study' | 'mcq' | 'other';
  progress?: number;
}

export interface RelatedLearningGroups {
  viva?: RelatedLearning[];
  handsOnLabs?: RelatedLearning[];
  caseStudies?: RelatedLearning[];
  practiceMcqs?: RelatedLearning[];
}

export interface StudyTopic {
  id: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  learningObjectives: LearningObjective[];
  keyTakeaways: RevisionPoint[];
  sections: StudySection[];
  relatedLinks?: StudyLink[];
  relatedLearning?: RelatedLearning[];
  relatedLearningGroups?: RelatedLearningGroups;
}

export interface StudyModuleNode {
  id: string;
  title: string;
  topics: StudyTopic[];
}
