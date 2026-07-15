export const STUDY_NOTES_KEYS = {
  progress: 'sap-tm-master-pro-study-notes-progress-v2',
  bookmarks: 'sap-tm-master-pro-study-notes-bookmarks-v2',
  notes: 'sap-tm-master-pro-study-notes-personal-notes-v2',
  completed: 'sap-tm-master-pro-study-notes-completed-v2',
  sections: 'sap-tm-master-pro-study-notes-sections-v2',
  preferences: 'sap-tm-master-pro-study-notes-preferences-v2',
  timeSpent: 'sap-tm-master-pro-study-notes-time-spent-v2',
};

export function safeReadMap(key, fallback = {}) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : fallback;
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function safeWriteMap(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function safeReadArray(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function mergeMap(base = {}, patch = {}) {
  return { ...base, ...patch };
}
