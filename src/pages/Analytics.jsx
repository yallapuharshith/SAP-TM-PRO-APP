import { motion } from 'framer-motion';
import { Activity, BookOpenCheck, CheckCircle2, Clock3, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { knowledgeRepository } from '../services/KnowledgeRepository';
import { studyService } from '../services/StudyService';

const ANALYTICS_HISTORY_KEY = 'sap-tm-master-pro-analytics-history-v1';

function formatMinutes(seconds = 0) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  if (safeSeconds < 3600) {
    return `${Math.round(safeSeconds / 60)} min`;
  }
  return `${(safeSeconds / 3600).toFixed(1)} h`;
}

function formatDateLabel(dayOffset) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - dayOffset);
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

function buildWeeklyAttemptSeries(topicStats = {}) {
  const dayBuckets = Array.from({ length: 7 }, (_, index) => ({
    label: formatDateLabel(6 - index),
    value: 0,
  }));

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  Object.values(topicStats).forEach((stat) => {
    const attempts = Number(stat?.attempts || 0);
    const lastAttemptAt = Number(stat?.lastAttemptAt || 0);

    if (attempts <= 0 || !lastAttemptAt) {
      return;
    }

    const diffDays = Math.floor((now - lastAttemptAt) / dayMs);
    if (diffDays < 0 || diffDays > 6) {
      return;
    }

    const targetIndex = 6 - diffDays;
    dayBuckets[targetIndex].value += attempts;
  });

  return dayBuckets;
}

function toDayKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dayOffsetKey(offset = 0) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - Math.max(0, Number(offset) || 0));
  return toDayKey(date);
}

function readAnalyticsHistory() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(ANALYTICS_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAnalyticsHistory(entries = []) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  window.localStorage.setItem(ANALYTICS_HISTORY_KEY, JSON.stringify(entries));
}

function upsertHistorySnapshot({ moduleAttempts = {}, readiness = 0, solved = 0, studyTimeSeconds = 0 }) {
  const history = readAnalyticsHistory();
  const key = dayOffsetKey(0);

  const nextEntry = {
    dayKey: key,
    capturedAt: Date.now(),
    moduleAttempts,
    readiness: Number(readiness || 0),
    solved: Number(solved || 0),
    studyTimeSeconds: Number(studyTimeSeconds || 0),
  };

  const filtered = history.filter((entry) => entry?.dayKey !== key);
  const nextHistory = [...filtered, nextEntry]
    .filter((entry) => entry && entry.dayKey)
    .sort((a, b) => String(a.dayKey).localeCompare(String(b.dayKey)))
    .slice(-35);

  writeAnalyticsHistory(nextHistory);
  return nextHistory;
}

function getEntryOnOrBefore(history = [], offset = 0) {
  const targetKey = dayOffsetKey(offset);
  let best = null;

  history.forEach((entry) => {
    const key = String(entry?.dayKey || '');
    if (!key || key > targetKey) {
      return;
    }
    if (!best || key > String(best.dayKey)) {
      best = entry;
    }
  });

  return best;
}

function getCumulativeAttempts(history = [], moduleId, offset = 0) {
  const entry = getEntryOnOrBefore(history, offset);
  return Number(entry?.moduleAttempts?.[moduleId] || 0);
}

function getModuleWeeklyDeltaPercent(history = [], moduleId) {
  const current = getCumulativeAttempts(history, moduleId, 0);
  const weekAgo = getCumulativeAttempts(history, moduleId, 7);
  const twoWeeksAgo = getCumulativeAttempts(history, moduleId, 14);

  const thisWeek = Math.max(0, current - weekAgo);
  const previousWeek = Math.max(0, weekAgo - twoWeeksAgo);

  if (thisWeek === 0 && previousWeek === 0) {
    return 0;
  }

  if (previousWeek === 0) {
    return thisWeek > 0 ? 100 : 0;
  }

  return Number((((thisWeek - previousWeek) / previousWeek) * 100).toFixed(1));
}

function buildModuleSparkline(history = [], moduleId) {
  return Array.from({ length: 7 }, (_, index) => {
    const offset = 6 - index;
    return getCumulativeAttempts(history, moduleId, offset);
  });
}

function extractModuleIdFromTopicId(topicId = '') {
  const value = String(topicId);
  if (!value.includes('.')) {
    return value;
  }
  return value.split('.')[0];
}

function Analytics() {
  const [summary, setSummary] = useState(null);
  const [moduleIndex, setModuleIndex] = useState([]);
  const [moduleQuestionMap, setModuleQuestionMap] = useState({});
  const [totalQuestionBank, setTotalQuestionBank] = useState(0);
  const [progressSnapshot, setProgressSnapshot] = useState({ topicStats: {} });
  const [analyticsHistory, setAnalyticsHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadAnalytics() {
      try {
        const [dashboardSummary, modules] = await Promise.all([
          studyService.getDashboardSummary(),
          knowledgeRepository.loadKnowledgeIndex(),
        ]);

        if (!mounted) {
          return;
        }

        setSummary(dashboardSummary);
        setModuleIndex(Array.isArray(modules) ? modules : []);
        setProgressSnapshot(studyService.getProgress());

        const [allQuestions, moduleCounts] = await Promise.all([
          knowledgeRepository.loadAllQuestions(),
          Promise.all(
            (Array.isArray(modules) ? modules : []).map(async (module) => {
              const moduleQuestions = await knowledgeRepository.loadModuleQuestions(module.id);
              return [module.id, Array.isArray(moduleQuestions) ? moduleQuestions.length : 0];
            })
          ),
        ]);

        if (!mounted) {
          return;
        }

        setTotalQuestionBank(Array.isArray(allQuestions) ? allQuestions.length : 0);
        setModuleQuestionMap(Object.fromEntries(moduleCounts));
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      mounted = false;
    };
  }, []);

  const moduleAttemptsById = useMemo(() => {
    const topicStats = progressSnapshot?.topicStats || {};
    const map = {};

    Object.entries(topicStats).forEach(([topicId, stat]) => {
      const moduleId = extractModuleIdFromTopicId(topicId);
      map[moduleId] = Number(map[moduleId] || 0) + Number(stat?.attempts || 0);
    });

    return map;
  }, [progressSnapshot]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const metrics = summary?.metrics || {};
    const nextHistory = upsertHistorySnapshot({
      moduleAttempts: moduleAttemptsById,
      readiness: summary?.certificationReadiness || 0,
      solved: metrics.questionsSolved || 0,
      studyTimeSeconds: metrics.studyTimeSeconds || 0,
    });

    setAnalyticsHistory(nextHistory);
  }, [isLoading, moduleAttemptsById, summary]);

  const weeklySeries = useMemo(
    () => buildWeeklyAttemptSeries(progressSnapshot?.topicStats || {}),
    [progressSnapshot]
  );

  const moduleInsights = useMemo(() => {
    if (!summary) {
      return [];
    }

    const completionMap = Object.fromEntries(
      (summary.certificationReadinessDetail?.moduleCompletion || []).map((item) => [item.id, Number(item.completion || 0)])
    );
    const topicStats = progressSnapshot?.topicStats || {};
    const correctMap = {};

    Object.entries(topicStats).forEach(([topicId, stat]) => {
      const moduleId = extractModuleIdFromTopicId(topicId);
      correctMap[moduleId] = Number(correctMap[moduleId] || 0) + Number(stat?.correct || 0);
    });

    return moduleIndex
      .map((module) => {
        const attempts = Number(moduleAttemptsById[module.id] || 0);
        const correct = Number(correctMap[module.id] || 0);
        const accuracy = attempts > 0 ? Number(((correct / attempts) * 100).toFixed(1)) : 0;
        const completion = Number(completionMap[module.id] || 0);
        const questionCount = Number(moduleQuestionMap[module.id] || module.questionCount || 0);
        const weeklyDelta = getModuleWeeklyDeltaPercent(analyticsHistory, module.id);
        const sparkline = buildModuleSparkline(analyticsHistory, module.id);

        return {
          id: module.id,
          title: module.title || module.id,
          attempts,
          accuracy,
          completion,
          questionCount,
          weeklyDelta,
          sparkline,
        };
      })
      .sort((a, b) => b.attempts - a.attempts || b.completion - a.completion)
      .slice(0, 5);
  }, [analyticsHistory, moduleAttemptsById, moduleIndex, moduleQuestionMap, progressSnapshot, summary]);

  const keyMetrics = useMemo(() => {
    const metrics = summary?.metrics || {};
    return [
      {
        id: 'readiness',
        label: 'Readiness Score',
        value: `${Number(summary?.certificationReadiness || 0).toFixed(1)}%`,
        hint: 'Predicted from topic coverage + accuracy',
        icon: Target,
      },
      {
        id: 'question-bank',
        label: 'Question Bank',
        value: String(totalQuestionBank),
        hint: `${moduleIndex.length} modules loaded`,
        icon: BookOpenCheck,
      },
      {
        id: 'questions',
        label: 'Questions Solved',
        value: String(Number(metrics.questionsSolved || 0)),
        hint: 'Tracked from your real attempts',
        icon: CheckCircle2,
      },
      {
        id: 'study-time',
        label: 'Study Time',
        value: formatMinutes(metrics.studyTimeSeconds || 0),
        hint: `Revision: ${formatMinutes(metrics.revisionTimeSeconds || 0)}`,
        icon: Clock3,
      },
      {
        id: 'avg-score',
        label: 'Average Score',
        value: `${Number(metrics.averageScore || 0).toFixed(1)}%`,
        hint: `${Number(summary?.recentTopics?.length || 0)} recent topics`,
        icon: Activity,
      },
    ];
  }, [moduleIndex.length, summary, totalQuestionBank]);

  const timeline = useMemo(() => {
    const recentTopics = Array.isArray(summary?.recentTopics) ? summary.recentTopics : [];

    if (recentTopics.length === 0) {
      return [{
        id: 'empty-recent',
        title: 'No recent activity yet',
        subtitle: 'Start a module test to build your analytics timeline.',
      }];
    }

    return recentTopics.slice(0, 6).map((topic, index) => ({
      id: `recent-topic-${index}-${topic.id}`,
      title: `Visited ${topic.title}`,
      subtitle: `${topic.module || 'Module'} · ${topic.unit || 'Unit'}`,
    }));
  }, [summary]);

  const maxWeeklyValue = Math.max(1, ...weeklySeries.map((entry) => entry.value));

  if (isLoading) {
    return (
      <div className="analytics-theme space-y-4">
        <div className="glass-card analytics-card rounded-2xl border border-white/10 p-5 shadow-soft">
          <p className="text-sm text-slate-300">Loading analytics from your local study data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-theme space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card analytics-card relative overflow-hidden rounded-2xl border border-white/10 p-6 shadow-soft"
      >
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
        </div>
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white">Performance Trend</h3>
            <p className="mt-1 text-sm text-slate-300">
              Real-time insights generated from your study progress and topic attempt history.
            </p>
          </div>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Live Data · Last 7 Days
          </span>
        </div>

        <div className="mt-6 grid h-52 grid-cols-7 items-end gap-3">
          {weeklySeries.map((entry, index) => {
            const height = Math.max(8, Math.round((entry.value / maxWeeklyValue) * 100));
            return (
              <div key={`weekly-${entry.label}-${index}`} className="flex flex-col items-center gap-2">
                <span className="text-[11px] text-slate-400">{entry.value}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.04, duration: 0.45 }}
                  className="analytics-line-soft w-full rounded-t-xl border border-white/10"
                />
                <span className="text-[11px] font-medium text-slate-300">{entry.label}</span>
              </div>
            );
          })}
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {keyMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.article
              key={metric.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card analytics-card rounded-2xl border border-white/10 p-4 shadow-soft"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-slate-400">{metric.label}</p>
                <div className="analytics-icon inline-flex rounded-xl p-2">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-white">{metric.value}</p>
              <p className="mt-1 text-xs text-slate-400">{metric.hint}</p>
            </motion.article>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <motion.article
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card analytics-card rounded-2xl border border-white/10 p-5 shadow-soft xl:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Top Module Analytics</h3>
            <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs text-accent">Module-wise</span>
          </div>

          <div className="space-y-3">
            {moduleInsights.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                No module attempts yet. Start a module test to unlock module analytics.
              </div>
            )}

            {moduleInsights.map((module) => (
              <div key={module.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{module.title}</p>
                    <p className="text-xs text-slate-400">
                      {module.attempts} attempts · {module.questionCount} total questions
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <p className="text-sm font-semibold text-primary">{module.accuracy.toFixed(1)}% accuracy</p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${module.weeklyDelta >= 0 ? 'delta-badge-positive' : 'delta-badge-negative'}`}
                    >
                      {module.weeklyDelta >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {module.weeklyDelta >= 0 ? '+' : ''}{module.weeklyDelta.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Weekly Attempt Trend</span>
                    <span>{module.completion.toFixed(1)}% completion</span>
                  </div>
                  <div className="h-11 w-full rounded-lg border border-white/10 bg-slate-900/30 p-2">
                    <svg viewBox="0 0 100 28" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
                      <defs>
                        <linearGradient id={`sparkline-${module.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="var(--analytics-line-start)" />
                          <stop offset="100%" stopColor="var(--analytics-line-end)" />
                        </linearGradient>
                      </defs>
                      {(() => {
                        const values = module.sparkline || [0, 0, 0, 0, 0, 0, 0];
                        const max = Math.max(1, ...values);
                        const points = values
                          .map((value, idx) => {
                            const x = (idx / Math.max(1, values.length - 1)) * 100;
                            const y = 26 - (Number(value || 0) / max) * 22;
                            return `${x},${Math.max(2, Math.min(26, y))}`;
                          })
                          .join(' ');

                        return (
                          <>
                            <polyline
                              fill="none"
                              stroke={`url(#sparkline-${module.id})`}
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={points}
                            />
                            {values.map((value, idx) => {
                              const x = (idx / Math.max(1, values.length - 1)) * 100;
                              const y = 26 - (Number(value || 0) / max) * 22;
                              return (
                                <circle
                                  key={`${module.id}-pt-${idx}`}
                                  cx={x}
                                  cy={Math.max(2, Math.min(26, y))}
                                  r="1.6"
                                  fill="var(--analytics-line-end)"
                                />
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Completion</span>
                      <span>{module.completion.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-700/60">
                      <div
                        style={{ width: `${Math.max(0, Math.min(100, module.completion))}%` }}
                        className="analytics-line h-full rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card analytics-card rounded-2xl border border-white/10 p-5 shadow-soft"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Learning Timeline</h3>
            <BookOpenCheck className="h-4 w-4 text-primary" />
          </div>

          <ul className="space-y-3">
            {timeline.map((item) => (
              <li key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="mt-1 text-xs text-slate-400">{item.subtitle}</p>
              </li>
            ))}
          </ul>
        </motion.article>
      </section>
    </div>
  );
}

export default Analytics;
