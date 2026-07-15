import LearningModulePlaceholder from '../components/common/LearningModulePlaceholder';

function CapstoneProjects() {
  return (
    <LearningModulePlaceholder
      title="Capstone Projects"
      description="Build end-to-end SAP TM case implementations by combining planning, execution, pricing, and analytics outcomes into project deliverables."
      points={[
        'Project briefs with real-world logistics and transport constraints.',
        'Milestone checklists for architecture, configuration, and validation.',
        'Presentation-ready review templates for stakeholder walkthroughs.',
      ]}
      ctaLabel="Revise with MCQ"
      ctaRoute="/exam"
    />
  );
}

export default CapstoneProjects;
