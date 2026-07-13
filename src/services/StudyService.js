import { knowledgeRepository } from './KnowledgeRepository';
import { topicService } from './TopicService';

const PROGRESS_KEY = 'sap-tm-master-pro-study-progress-v1';

function defaultProgress() {
  return {
    startedAt: Date.now(),
    lastTopicId: null,
    studyTimeSeconds: 0,
    revisionTimeSeconds: 0,
    topicsCompleted: [],
    solvedQuestions: 0,
    averageScore: 0,
    weakConceptIds: [],
    strongConceptIds: [],
    topicStats: {},
    wrongQuestionIds: [],
    bookmarks: {
      questions: [],
      topics: [],
      modules: [],
      interviewQuestions: [],
      consultantNotes: [],
    },
    recentTopics: [],
  };
}

function uniquePush(list, value) {
  if (list.includes(value)) {
    return list;
  }
  return [value, ...list];
}

export class StudyService {
  getProgress() {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (!raw) {
        return defaultProgress();
      }
      return { ...defaultProgress(), ...JSON.parse(raw) };
    } catch {
      return defaultProgress();
    }
  }

  saveProgress(progress) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    return progress;
  }

  startTopic(topicId) {
    const progress = this.getProgress();
    const next = {
      ...progress,
      lastTopicId: topicId,
      recentTopics: uniquePush(progress.recentTopics, topicId).slice(0, 8),
      topicStats: {
        ...progress.topicStats,
        [topicId]: {
          ...(progress.topicStats[topicId] || {}),
          lastAccessedAt: Date.now(),
        },
      },
    };
    return this.saveProgress(next);
  }

  completeTopic(topicId) {
    const progress = this.getProgress();
    const next = {
      ...progress,
      topicsCompleted: uniquePush(progress.topicsCompleted, topicId),
      topicStats: {
        ...progress.topicStats,
        [topicId]: {
          ...(progress.topicStats[topicId] || {}),
          completion: 100,
          completedAt: Date.now(),
        },
      },
    };
    return this.saveProgress(next);
  }

  trackStudyTime(seconds = 0) {
    const progress = this.getProgress();
    return this.saveProgress({
      ...progress,
      studyTimeSeconds: progress.studyTimeSeconds + Math.max(0, seconds),
    });
  }

  trackRevisionTime(seconds = 0) {
    const progress = this.getProgress();
    return this.saveProgress({
      ...progress,
      revisionTimeSeconds: progress.revisionTimeSeconds + Math.max(0, seconds),
    });
  }

  trackQuestionResult({ questionId, topicId, isCorrect, score = 0 }) {
    const progress = this.getProgress();
    const topicStat = progress.topicStats[topicId] || { attempts: 0, correct: 0, completion: 0 };

    const attempts = Number(topicStat.attempts || 0) + 1;
    const correct = Number(topicStat.correct || 0) + (isCorrect ? 1 : 0);
    const accuracy = attempts > 0 ? (correct / attempts) * 100 : 0;

    const wrongQuestionIds = isCorrect
      ? progress.wrongQuestionIds.filter((id) => id !== questionId)
      : uniquePush(progress.wrongQuestionIds, questionId);

    const next = {
      ...progress,
      solvedQuestions: progress.solvedQuestions + 1,
      averageScore: Number(((progress.averageScore + score) / 2).toFixed(2)),
      wrongQuestionIds,
      topicStats: {
        ...progress.topicStats,
        [topicId]: {
          ...topicStat,
          attempts,
          correct,
          accuracy: Number(accuracy.toFixed(2)),
          lastAttemptAt: Date.now(),
        },
      },
    };

    return this.saveProgress(next);
  }

  toggleBookmark(kind, id) {
    const progress = this.getProgress();
    const existing = progress.bookmarks[kind] || [];
    const nextSet = existing.includes(id)
      ? existing.filter((item) => item !== id)
      : [...existing, id];

    return this.saveProgress({
      ...progress,
      bookmarks: {
        ...progress.bookmarks,
        [kind]: nextSet,
      },
    });
  }

  async getCertificationReadiness() {
    const progress = this.getProgress();
    const modules = await knowledgeRepository.loadKnowledgeIndex();
    const topics = await topicService.getAllTopics();

    const completion = topics.length > 0 ? (progress.topicsCompleted.length / topics.length) * 100 : 0;
    const avgAccuracy = Object.values(progress.topicStats).reduce((sum, stat) => sum + Number(stat.accuracy || 0), 0) /
      Math.max(1, Object.values(progress.topicStats).length);

    const weakTopics = await topicService.getWeakTopics(progress);

    const predictedScore = Number((completion * 0.45 + avgAccuracy * 0.55).toFixed(2));

    return {
      moduleCompletion: modules.map((module) => ({
        id: module.id,
        title: module.title,
        completion: Number(((progress.topicsCompleted.filter((topicId) => topicId.startsWith(module.id)).length || 0) / Math.max(1, module.topicCount || 1) * 100).toFixed(2)),
      })),
      averageAccuracy: Number(avgAccuracy.toFixed(2)),
      weakTopics,
      predictedScore,
    };
  }

  async getDashboardSummary() {
    const progress = this.getProgress();
    const readiness = await this.getCertificationReadiness();
    const allTopics = await topicService.getAllTopics();

    const resumeTopic = progress.lastTopicId
      ? allTopics.find((topic) => topic.id === progress.lastTopicId)
      : null;

    const recentTopics = allTopics.filter((topic) => progress.recentTopics.includes(topic.id));

    return {
      continueLearning: resumeTopic,
      resumeLastTopic: resumeTopic,
      dailyChallenge: allTopics[0] || null,
      todaysWeakArea: readiness.weakTopics[0] || null,
      certificationReadiness: readiness.predictedScore,
      certificationReadinessDetail: readiness,
      studyCalendarStreak: Math.min(30, Math.max(1, Math.floor(progress.studyTimeSeconds / 1800))),
      recentTopics,
      bookmarks: progress.bookmarks,
      metrics: {
        questionsSolved: progress.solvedQuestions,
        topicsCompleted: progress.topicsCompleted.length,
        studyTimeSeconds: progress.studyTimeSeconds,
        revisionTimeSeconds: progress.revisionTimeSeconds,
        averageScore: progress.averageScore,
        weakConcepts: readiness.weakTopics.map((topic) => topic.title),
        strongConcepts: Object.entries(progress.topicStats)
          .filter(([, stat]) => Number(stat.accuracy || 0) >= 80)
          .map(([topicId]) => allTopics.find((topic) => topic.id === topicId)?.title)
          .filter(Boolean),
      },
    };
  }
}

export const studyService = new StudyService();
