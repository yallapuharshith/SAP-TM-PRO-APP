import { motion } from 'framer-motion';
import { ArrowUpRight, Award, BookOpen, Bookmark, CheckCircle2, Layers, Target, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityCard from '../components/cards/ActivityCard';
import ProgressCard from '../components/cards/ProgressCard';
import StatCard from '../components/cards/StatCard';
import PerformanceChartPlaceholder from '../components/charts/PerformanceChartPlaceholder';
import { knowledgeRepository } from '../services/KnowledgeRepository';
import { studyService } from '../services/StudyService';

function Dashboard() {
  const navigate = useNavigate();
  const [dynamicSummary, setDynamicSummary] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [moduleCount, setModuleCount] = useState(0);

  const spotlightRouteById = {
    'stream-track': '/study',
    'cert-readiness': '/exam',
    'bookmark-focus': '/study?section=notes',
  };

  useEffect(() => {
    async function loadDashboard() {
      const [summary, allQuestions, modules] = await Promise.all([
        studyService.getDashboardSummary(),
        knowledgeRepository.loadAllQuestions(),
        knowledgeRepository.loadKnowledgeIndex(),
      ]);
      setDynamicSummary(summary);
      setQuestionCount(Array.isArray(allQuestions) ? allQuestions.length : 0);
      setModuleCount(Array.isArray(modules) ? modules.length : 0);
    }

    loadDashboard();
  }, []);

  const statCards = [
    {
      id: 'total-questions',
      title: 'Total Questions',
      value: String(questionCount),
      delta: `${moduleCount} modules`,
      icon: Layers,
      tone: 'primary',
    },
    {
      id: 'completed',
      title: 'Completed Topics',
      value: String(dynamicSummary?.metrics?.topicsCompleted ?? 0),
      delta: `${dynamicSummary?.recentTopics?.length || 0} recent topics`,
      icon: CheckCircle2,
      tone: 'success',
    },
    {
      id: 'accuracy',
      title: 'Average Score',
      value: `${Number(dynamicSummary?.metrics?.averageScore || 0).toFixed(1)}%`,
      delta: `${dynamicSummary?.metrics?.questionsSolved || 0} questions solved`,
      icon: Target,
      tone: 'accent',
    },
    {
      id: 'readiness',
      title: 'Readiness',
      value: `${Number(dynamicSummary?.certificationReadiness || 0).toFixed(1)}%`,
      delta: 'Based on coverage + performance',
      icon: Trophy,
      tone: 'warning',
    },
  ];

  const progressCards = [
    {
      id: 'study-progress',
      title: 'Study Progress',
      progress: Math.min(100, Number(dynamicSummary?.certificationReadiness || 0)),
      subtitle: `${dynamicSummary?.metrics?.topicsCompleted || 0} topics completed`,
    },
    {
      id: 'mock-tests',
      title: 'Question Coverage',
      progress: questionCount > 0
        ? Math.min(100, Math.round(((dynamicSummary?.metrics?.questionsSolved || 0) / questionCount) * 100))
        : 0,
      subtitle: `${dynamicSummary?.metrics?.questionsSolved || 0}/${questionCount} solved`,
    },
    {
      id: 'bookmarks',
      title: 'Bookmarks Review',
      progress: Math.min(100, (dynamicSummary?.bookmarks?.questions?.length || 0) * 5),
      subtitle: `${dynamicSummary?.bookmarks?.questions?.length || 0} bookmarked questions`,
    },
  ];

  const recentActivity = (dynamicSummary?.recentTopics || []).slice(0, 4).map((topic, index) => ({
    id: `recent-${index}-${topic.id}`,
    label: `Visited ${topic.title}`,
    meta: `${topic.module || 'Module'} · ${topic.unit || 'Unit'}`,
    time: 'Recent',
  }));

  const timelineItems = recentActivity.length > 0
    ? recentActivity
    : [{
      id: 'recent-empty',
      label: 'No recent study activity yet',
      meta: 'Start a module test to build your timeline',
      time: 'Now',
    }];

  const spotlightCards = [
    {
      id: 'stream-track',
      title: 'Study Modules',
      value: `${moduleCount} Active`,
      icon: BookOpen,
    },
    {
      id: 'cert-readiness',
      title: 'Certification Readiness',
      value: `${Number(dynamicSummary?.certificationReadiness || 0).toFixed(1)}%`,
      icon: Award,
    },
    {
      id: 'bookmark-focus',
      title: 'Bookmark Focus',
      value: `${dynamicSummary?.bookmarks?.questions?.length || 0} Priority Questions`,
      icon: Bookmark,
    },
  ];

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
                  onClick={() => navigate(spotlightRouteById[card.id] || '/study')}
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
          <ActivityCard title="Recent Activity" items={timelineItems} />
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
