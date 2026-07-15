import React from 'react';

export interface BaseStudyBlock {
  type: string;
  [key: string]: unknown;
}

export interface StudyRendererContext {
  sectionId: string;
  blockIndex: number;
}

export interface StudyRendererProps<TBlock extends BaseStudyBlock = BaseStudyBlock> {
  block: TBlock;
  context: StudyRendererContext;
}

export type StudyRendererComponent<TBlock extends BaseStudyBlock = BaseStudyBlock> = React.ComponentType<
  StudyRendererProps<TBlock>
>;

export interface HeadingBlock extends BaseStudyBlock {
  type: 'heading';
  level?: 2 | 3 | 4;
  text: string;
}

export interface ParagraphBlock extends BaseStudyBlock {
  type: 'paragraph';
  text: string;
}

export interface BulletListBlock extends BaseStudyBlock {
  type: 'bullet-list';
  items: string[];
}

export interface NumberedListBlock extends BaseStudyBlock {
  type: 'numbered-list';
  items: string[];
}

export interface LegacyListBlock extends BaseStudyBlock {
  type: 'list';
  ordered?: boolean;
  items: string[];
}

export interface TableBlock extends BaseStudyBlock {
  type: 'table';
  columns: string[];
  rows: Array<Array<string | number>>;
}

export interface ImageBlock extends BaseStudyBlock {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
}

export interface DiagramNode {
  id: string;
  label: string;
}

export interface DiagramConnection {
  from: string;
  to: string;
  label?: string;
}

export interface DiagramBlock extends BaseStudyBlock {
  type: 'diagram';
  title?: string;
  description?: string;
  nodes: DiagramNode[];
  edges?: DiagramConnection[];
  connections?: DiagramConnection[];
}

export interface GlossaryEntry {
  term: string;
  definition: string;
}

export interface GlossaryBlock extends BaseStudyBlock {
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

export interface TimelineBlock extends BaseStudyBlock {
  type: 'timeline';
  title?: string;
  items: TimelineItem[];
}
