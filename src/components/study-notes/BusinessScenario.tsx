import ScenarioCard, { ScenarioCardProps } from './ScenarioCard';

function BusinessScenario(props: ScenarioCardProps) {
  return <ScenarioCard {...props} title={props.title || 'Business Scenario'} />;
}

export default BusinessScenario;
