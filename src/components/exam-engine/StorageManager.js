const EXAM_STORAGE_KEY = 'sap-tm-master-pro-exam-session-v1';

export const StorageManager = {
  load() {
    try {
      const raw = localStorage.getItem(EXAM_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  save(state) {
    try {
      localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota and serialization errors for non-blocking UX.
    }
  },

  clear() {
    localStorage.removeItem(EXAM_STORAGE_KEY);
  },
};
