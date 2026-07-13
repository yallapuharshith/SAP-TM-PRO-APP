import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import ActivityCard from '../components/cards/ActivityCard';
import ProgressCard from '../components/cards/ProgressCard';
import StatCard from '../components/cards/StatCard';
import PerformanceChartPlaceholder from '../components/charts/PerformanceChartPlaceholder';
import { studyService } from '../services/StudyService';
import {
  progressCards,
  recentActivity,
  spotlightCards,
  statCards,
} from '../data/dashboardData';

function Dashboard() {
  const [dynamicSummary, setDynamicSummary] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      const summary = await studyService.getDashboardSummary();
      setDynamicSummary(summary);
    }

    loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <motion.article
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl border border-white/10 p-4 shadow-soft"
        >
          <p className="text-xs uppercase tracking-wide text-slate-400">Continue Learning</p>
          <p className="mt-1 text-sm font-semibold text-white">
            {dynamicSummary?.continueLearning?.title || 'Start module journey'}
          </p>
        </motion.article>
        <motion.article
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card rounded-2xl border border-white/10 p-4 shadow-soft"
        >
          <p className="text-xs uppercase tracking-wide text-slate-400">Today's Weak Area</p>
          <p className="mt-1 text-sm font-semibold text-white">
            {dynamicSummary?.todaysWeakArea?.title || 'No weak area yet'}
          </p>
        </motion.article>
        <motion.article
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl border border-white/10 p-4 shadow-soft"
        >
          <p className="text-xs uppercase tracking-wide text-slate-400">Certification Readiness</p>
          <p className="mt-1 text-sm font-semibold text-white">
            {dynamicSummary ? `${dynamicSummary.certificationReadiness.toFixed(1)}%` : '0%'}
          </p>
        </motion.article>
        <motion.article
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl border border-white/10 p-4 shadow-soft"
        >
          <p className="text-xs uppercase tracking-wide text-slate-400">Study Calendar</p>
          <p className="mt-1 text-sm font-semibold text-white">
            {dynamicSummary?.studyCalendarStreak || 0} day streak
          </p>
        </motion.article>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {spotlightCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.article
              key={card.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="glass-card rounded-2xl border border-white/10 p-4 shadow-soft"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="rounded-xl bg-primary/15 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-white/10 p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs uppercase tracking-wide text-slate-400">{card.title}</p>
              <p className="mt-1 text-base font-semibold text-white">{card.value}</p>
            </motion.article>
          );
        })}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <StatCard
            key={card.id}
            title={card.title}
            value={card.value}
            delta={card.delta}
            icon={card.icon}
            tone={card.tone}
          />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <PerformanceChartPlaceholder />
          <div className="grid gap-4 md:grid-cols-2">
            {progressCards.slice(0, 2).map((card) => (
              <ProgressCard
                key={card.id}
                title={card.title}
                progress={card.progress}
                subtitle={card.subtitle}
              />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <ProgressCard
            title="Recent Topics"
            progress={Math.min(100, (dynamicSummary?.recentTopics?.length || 0) * 12)}
            subtitle={`${dynamicSummary?.recentTopics?.length || 0} topics in recent activity`}
          />
          <ActivityCard title="Recent Activity" items={recentActivity} />
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
