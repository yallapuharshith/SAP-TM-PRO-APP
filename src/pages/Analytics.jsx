import { motion } from 'framer-motion';
import ActivityCard from '../components/cards/ActivityCard';
import PerformanceChartPlaceholder from '../components/charts/PerformanceChartPlaceholder';
import { recentActivity } from '../data/dashboardData';

function Analytics() {
  return (
    <div className="space-y-6">
      <PerformanceChartPlaceholder />
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl border border-white/10 p-6 shadow-soft"
      >
        <h3 className="text-lg font-semibold text-white">Insights Pipeline</h3>
        <p className="mt-2 text-sm text-slate-300">
          Advanced analytics by chapter, weakness clustering, and personalized question recommendations will use persisted attempts from local storage in upcoming milestones.
        </p>
      </motion.section>
      <ActivityCard title="Learning Timeline" items={recentActivity} />
    </div>
  );
}

export default Analytics;
