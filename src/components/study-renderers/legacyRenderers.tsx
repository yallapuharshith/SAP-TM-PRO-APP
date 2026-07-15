import ArchitectureDiagram from '../study-notes/ArchitectureDiagram';
import BusinessBackground from '../study-notes/BusinessBackground';
import BusinessScenario from '../study-notes/BusinessScenario';
import ComparisonTable from '../study-notes/ComparisonTable';
import KnowledgeCheck from '../study-notes/KnowledgeCheck';
import RelatedLearning from '../study-notes/RelatedLearning';
import RevisionSummary from '../study-notes/RevisionSummary';
import SAPObjectCard from '../study-notes/SAPObjectCard';
import ScenarioCard from '../study-notes/ScenarioCard';
import { StudyRendererProps } from './types';

export function SAPObjectCardRenderer({ block }: StudyRendererProps) {
  return (
    <SAPObjectCard
      title={String((block as { title: string }).title)}
      definition={String((block as { definition: string }).definition)}
      purpose={String((block as { purpose: string }).purpose)}
      businessUse={String((block as { businessUse: string }).businessUse)}
      configuration={String((block as { configuration: string }).configuration)}
      relationships={(Array.isArray((block as { relationships?: string[] }).relationships)
        ? (block as { relationships: string[] }).relationships
        : []) as string[]}
    />
  );
}

export function ArchitectureDiagramRenderer({ block }: StudyRendererProps) {
  return (
    <ArchitectureDiagram
      title={(block as { title?: string }).title}
      description={(block as { description?: string }).description}
      groups={Array.isArray((block as { groups?: unknown[] }).groups) ? ((block as { groups: unknown[] }).groups as never[]) : []}
      nodes={Array.isArray((block as { nodes?: unknown[] }).nodes) ? ((block as { nodes: unknown[] }).nodes as never[]) : []}
      connections={
        Array.isArray((block as { connections?: unknown[] }).connections)
          ? ((block as { connections: unknown[] }).connections as never[])
          : []
      }
    />
  );
}

export function BusinessBackgroundRenderer({ block }: StudyRendererProps) {
  return (
    <BusinessBackground
      title={(block as { title?: string }).title}
      businessProblem={String((block as { businessProblem: string }).businessProblem)}
      solution={String((block as { solution: string }).solution)}
      businessBenefit={String((block as { businessBenefit: string }).businessBenefit)}
      image={(block as { image?: never }).image}
      companyExample={(block as { companyExample?: never }).companyExample}
    />
  );
}

export function ScenarioCardRenderer({ block }: StudyRendererProps) {
  return (
    <ScenarioCard
      title={(block as { title?: string }).title}
      company={String((block as { company: string }).company)}
      industry={String((block as { industry: string }).industry)}
      businessProblem={String((block as { businessProblem: string }).businessProblem)}
      currentProcess={String((block as { currentProcess: string }).currentProcess)}
      sapSolution={String((block as { sapSolution: string }).sapSolution)}
      expectedBenefits={String((block as { expectedBenefits: string }).expectedBenefits)}
      diagram={(block as { diagram?: never }).diagram}
      companyExample={(block as { companyExample?: never }).companyExample}
    />
  );
}

export function BusinessScenarioRenderer({ block }: StudyRendererProps) {
  return (
    <BusinessScenario
      title={(block as { title?: string }).title}
      company={String((block as { company: string }).company)}
      industry={String((block as { industry: string }).industry)}
      businessProblem={String((block as { businessProblem: string }).businessProblem)}
      currentProcess={String((block as { currentProcess: string }).currentProcess)}
      sapSolution={String((block as { sapSolution: string }).sapSolution)}
      expectedBenefits={String((block as { expectedBenefits: string }).expectedBenefits)}
      diagram={(block as { diagram?: never }).diagram}
      companyExample={(block as { companyExample?: never }).companyExample}
    />
  );
}

export function ComparisonTableRenderer({ block }: StudyRendererProps) {
  return (
    <ComparisonTable
      title={(block as { title?: string }).title}
      columns={Array.isArray((block as { columns?: string[] }).columns) ? ((block as { columns: string[] }).columns as string[]) : []}
      rows={Array.isArray((block as { rows?: unknown[] }).rows) ? ((block as { rows: unknown[] }).rows as never[]) : []}
      highlightDifferences={(block as { highlightDifferences?: boolean }).highlightDifferences}
      exportFileName={(block as { exportFileName?: string }).exportFileName}
    />
  );
}

export function RevisionSummaryRenderer({ block }: StudyRendererProps) {
  return (
    <RevisionSummary
      title={(block as { title?: string }).title}
      bullets={Array.isArray((block as { bullets?: string[] }).bullets) ? ((block as { bullets: string[] }).bullets as string[]) : []}
      flashcards={Array.isArray((block as { flashcards?: unknown[] }).flashcards) ? ((block as { flashcards: unknown[] }).flashcards as never[]) : []}
      initiallyExpanded={Boolean((block as { initiallyExpanded?: boolean }).initiallyExpanded)}
    />
  );
}

export function KnowledgeCheckRenderer({ block }: StudyRendererProps) {
  return (
    <KnowledgeCheck
      title={(block as { title?: string }).title}
      questions={Array.isArray((block as { questions?: unknown[] }).questions) ? ((block as { questions: unknown[] }).questions as never[]) : []}
    />
  );
}

export function RelatedLearningRenderer({ block }: StudyRendererProps) {
  return (
    <RelatedLearning
      title={(block as { title?: string }).title}
      groups={(block as { groups?: never }).groups || {}}
      onNavigate={(href) => {
        if (!href) {
          return;
        }
        if (href.startsWith('#/')) {
          window.location.hash = href.slice(1);
          return;
        }
        if (href.startsWith('/')) {
          window.location.hash = href;
          return;
        }
        window.open(href, '_blank', 'noopener,noreferrer');
      }}
    />
  );
}
