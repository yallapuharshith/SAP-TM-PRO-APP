const PROGRESS_KEY = 'sap-tm-master-pro-knowledge-progress-v1';

function defaultProgress() {
  return {
    startedAt: Date.now(),
    lastUpdatedAt: Date.now(),
    completedItems: {
      questions: [],
      flashcards: [],
      interview: [],
      revision: [],
      notes: [],
    },
    moduleProgress: {},
  };
}

function readProgress() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return defaultProgress();
  }

  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) {
      return defaultProgress();
    }
    return { ...defaultProgress(), ...JSON.parse(raw) };
  } catch {
    return defaultProgress();
  }
}

function saveProgress(progress) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return progress;
  }

  const next = {
    ...progress,
    lastUpdatedAt: Date.now(),
  };

  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  return next;
}

export class ProgressService {
  load() {
    return readProgress();
  }

  save(progress) {
    return saveProgress(progress);
  }

  markCompleted(type, id, moduleId) {
    const progress = this.load();
    const bucket = Array.isArray(progress.completedItems[type]) ? progress.completedItems[type] : [];

    const completedItems = {
      ...progress.completedItems,
      [type]: bucket.includes(id) ? bucket : [...bucket, id],
    };

    const moduleState = progress.moduleProgress[moduleId] || { completed: 0, total: 0 };
    const moduleProgress = {
      ...progress.moduleProgress,
      [moduleId]: {
        ...moduleState,
        completed: Number(moduleState.completed || 0) + 1,
      },
    };

    return this.save({
      ...progress,
      completedItems,
      moduleProgress,
    });
  }

  getStatistics() {
    const progress = this.load();
    const totals = Object.fromEntries(
      Object.entries(progress.completedItems).map(([type, values]) => [type, values.length])
    );

    return {
      startedAt: progress.startedAt,
      lastUpdatedAt: progress.lastUpdatedAt,
      totals,
      moduleProgress: progress.moduleProgress,
    };
  }
}

export const progressService = new ProgressService();
