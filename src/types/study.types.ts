export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Module {
  id: string | number;
  title: string;
  sequence?: number;
}

export interface Topic {
  id: string | number;
  title: string;
  sequence?: number;
}

export interface Metadata {
  difficulty: DifficultyLevel;
  estimatedReadingTime: number;
  estimatedRevisionTime?: number;
  version?: string;
  lastUpdated?: string;
  author?: string;
  tags?: string[];
  prerequisites?: string[];
  learningPath?: string[];
}

export interface StudySection {
  id: string;
  title: string;
  content: SectionBlock[];
}

export interface ProcessFlow {
  title?: string;
  orientation?: 'horizontal' | 'vertical';
  steps: Array<{ id?: string; title: string; description?: string; iconKey?: string }>;
}

export interface Architecture {
  title?: string;
  description?: string;
  groups?: Array<{ id: string; title: string; description?: string }>;
  nodes: Array<{ id: string; title: string; description?: string; groupId?: string; iconKey?: string }>;
  connections: Array<{ from: string; to: string; label?: string }>;
}

export interface ComparisonTable {
  title?: string;
  columns: string[];
  rows: Array<{ id?: string; values: Array<string | number | null | undefined>; highlight?: boolean }>;
  highlightDifferences?: boolean;
  exportFileName?: string;
}

export interface Glossary {
  title?: string;
  entries: Array<{ term: string; definition: string }>;
}

export interface KnowledgeCheckQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex?: number;
  explanation?: string;
}

export interface KnowledgeCheck {
  title?: string;
  questions: KnowledgeCheckQuestion[];
}

export interface RelatedLearningItem {
  id?: string;
  label: string;
  href: string;
  description?: string;
  progress?: number;
}

export interface RelatedLearning {
  viva?: RelatedLearningItem[];
  handsOnLabs?: RelatedLearningItem[];
  caseStudies?: RelatedLearningItem[];
  practiceMcqs?: RelatedLearningItem[];
}

export type SectionBlock =
  | { type: 'heading'; level?: 2 | 3 | 4; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullet-list'; items: string[] }
  | { type: 'numbered-list'; items: string[] }
  | { type: 'table'; columns: string[]; rows: Array<Array<string | number>> }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | {
      type: 'diagram';
      title?: string;
      description?: string;
      nodes: Array<{ id: string; label: string }>;
      connections?: Array<{ from: string; to: string; label?: string }>;
      edges?: Array<{ from: string; to: string; label?: string }>;
    }
  | { type: 'process-flow'; title?: string; orientation?: 'horizontal' | 'vertical'; steps: ProcessFlow['steps'] }
  | {
      type: 'callout';
      calloutType?: string;
      title?: string;
      content?: string;
      text?: string;
      icon?: string;
      color?: string;
      collapsible?: boolean;
      defaultCollapsed?: boolean;
    }
  | { type: 'glossary'; title?: string; entries: Glossary['entries'] }
  | { type: 'timeline'; title?: string; items: Array<{ id?: string; title: string; date?: string; description?: string }> }
  | { type: 'comparison' | 'comparison-table'; title?: string; columns: string[]; rows: ComparisonTable['rows']; highlightDifferences?: boolean; exportFileName?: string }
  | {
      type: 'sap-object' | 'sap-object-card';
      title: string;
      definition: string;
      purpose: string;
      businessUse: string;
      configuration: string;
      relationships: string[];
    }
  | {
      type: 'business-background';
      title?: string;
      businessProblem: string;
      solution: string;
      businessBenefit: string;
      image?: { src: string; alt?: string; caption?: string };
      companyExample?: { title?: string; content: string };
    }
  | {
      type: 'business-scenario' | 'scenario-card';
      title?: string;
      company: string;
      industry: string;
      businessProblem: string;
      currentProcess: string;
      sapSolution: string;
      expectedBenefits: string;
      diagram?: { src: string; alt?: string; caption?: string };
      companyExample?: { title?: string; content: string };
    }
  | { type: 'revision-summary'; title?: string; bullets: string[]; flashcards?: Array<{ id?: string; front: string; back: string }>; initiallyExpanded?: boolean }
  | { type: 'knowledge-check'; title?: string; questions: KnowledgeCheckQuestion[] }
  | { type: 'related-learning'; title?: string; groups: RelatedLearning };

export interface StudyTopic {
  id: string;
  module: Module;
  topic: Topic;
  metadata: Metadata;
  sections: StudySection[];
  relatedLearning?: RelatedLearning;
}
