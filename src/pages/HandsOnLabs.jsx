import LearningModulePlaceholder from '../components/common/LearningModulePlaceholder';

function HandsOnLabs() {
  return (
    <LearningModulePlaceholder
      title="Hands-on Labs"
      description="Follow guided practical exercises to reinforce SAP TM workflows, integration patterns, and execution scenarios with stepwise lab tracks."
      points={[
        'Lab blueprints for planning, tendering, execution, and settlement.',
        'Environment setup guides and expected output checkpoints.',
        'Troubleshooting notes to validate implementation outcomes.',
      ]}
      ctaLabel="Start Practice MCQ"
      ctaRoute="/exam"
    />
  );
}

export default HandsOnLabs;
