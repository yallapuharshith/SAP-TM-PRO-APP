const ADMIN_TOPICS_KEY = 'sap-tm-master-pro-admin-topics-v1';
const ADMIN_SESSION_KEY = 'sap-tm-master-pro-admin-session-v1';
const ADMIN_CREDENTIALS_KEY = 'sap-tm-master-pro-admin-credentials-v1';
const DEFAULT_ADMINS = [
  {
    username: 'admin',
    password: 'admin123',
  },
];

function safeJsonParse(raw, fallback) {
  try {
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function readStore() {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = localStorage.getItem(ADMIN_TOPICS_KEY);
  const parsed = safeJsonParse(raw || '[]', []);
  return Array.isArray(parsed) ? parsed : [];
}

function writeStore(items) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(ADMIN_TOPICS_KEY, JSON.stringify(items));
}

function readCredentials() {
  if (typeof window === 'undefined') {
    return DEFAULT_ADMINS;
  }

  const raw = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
  if (!raw) {
    localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(DEFAULT_ADMINS));
    return DEFAULT_ADMINS;
  }

  const parsed = safeJsonParse(raw, DEFAULT_ADMINS);
  if (Array.isArray(parsed)) {
    const admins = parsed
      .map((entry) => ({
        username: String(entry?.username || '').trim(),
        password: String(entry?.password || '').trim(),
      }))
      .filter((entry) => entry.username && entry.password);

    return admins.length > 0 ? admins : DEFAULT_ADMINS;
  }

  const migratedUsername = String(parsed?.username || '').trim();
  const migratedPassword = String(parsed?.password || '').trim();
  if (migratedUsername && migratedPassword) {
    const migrated = [{ username: migratedUsername, password: migratedPassword }];
    localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(migrated));
    return migrated;
  }

  return DEFAULT_ADMINS;
}

function writeCredentials(credentials) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(credentials));
}

function normalizeModuleId(scope, moduleInput) {
  if (scope === 'viva') {
    return 'viva';
  }

  const raw = String(moduleInput || '').trim().toLowerCase();
  if (/^module\d+$/.test(raw)) {
    return raw;
  }

  if (/^\d+$/.test(raw)) {
    return `module${Number(raw)}`;
  }

  return 'module1';
}

function ensureTopicId(scope, topicId) {
  const cleaned = String(topicId || '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '-');

  const base = cleaned || `custom-${Date.now()}`;
  return scope === 'viva'
    ? (base.startsWith('viva.') ? base : `viva.${base}`)
    : base;
}

function normalizeObjectives(rawObjectives) {
  const lines = String(rawObjectives || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((title, index) => ({ id: `obj-${index + 1}`, title }));
}

function normalizeRelatedLinks(files) {
  return (Array.isArray(files) ? files : [])
    .filter((file) => file && file.name && file.dataUrl)
    .map((file, index) => ({
      id: file.id || `link-${index + 1}`,
      label: file.name,
      href: file.dataUrl,
    }));
}

function upsertStoredTopic(topic) {
  const existing = readStore();
  const index = existing.findIndex((item) => String(item.id) === String(topic.id));

  if (index >= 0) {
    existing[index] = topic;
  } else {
    existing.push(topic);
  }

  writeStore(existing);
  return topic;
}

function parseObjectivesToItems(rawObjectives) {
  const lines = String(rawObjectives || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((title, index) => ({ id: `obj-${index + 1}`, title }));
}

export class AdminContentService {
  static sessionKey = ADMIN_SESSION_KEY;

  static getAllTopics() {
    return readStore();
  }

  static upsertTopic(input) {
    const scope = input.scope === 'viva' ? 'viva' : 'study';
    const moduleId = normalizeModuleId(scope, input.moduleId);
    const topicId = ensureTopicId(scope, input.id);

    const topic = {
      id: topicId,
      moduleId,
      moduleTitle: scope === 'viva' ? 'Viva Preparation' : (String(input.moduleTitle || '').trim() || moduleId),
      title: String(input.title || '').trim() || 'Untitled Topic',
      difficulty: String(input.difficulty || '').trim() || 'Intermediate',
      estimatedMinutes: Math.max(1, Number(input.estimatedMinutes || 10)),
      learningObjectives: normalizeObjectives(input.objectives),
      keyTakeaways: [],
      sections: [
        {
          id: 'admin-section-1',
          title: String(input.sectionTitle || '').trim() || 'Overview',
          content: [
            {
              type: 'paragraph',
              text: String(input.sectionContent || '').trim() || 'No content provided yet.',
            },
          ],
        },
      ],
      relatedLinks: normalizeRelatedLinks(input.files),
      relatedLearning: [],
      relatedLearningGroups: {
        viva: [],
        handsOnLabs: [],
        caseStudies: [],
        practiceMcqs: [],
      },
      __admin: true,
      __scope: scope,
      updatedAt: new Date().toISOString(),
    };

    return upsertStoredTopic(topic);
  }

  static upsertStructuredTopic(input) {
    const scope = input.scope === 'viva' || input.moduleId === 'viva' || String(input.id || '').startsWith('viva.')
      ? 'viva'
      : 'study';
    const moduleId = normalizeModuleId(scope, input.moduleId);
    const topicId = ensureTopicId(scope, input.id);

    const topic = {
      id: topicId,
      moduleId,
      moduleTitle: scope === 'viva' ? 'Viva Preparation' : (String(input.moduleTitle || '').trim() || moduleId),
      title: String(input.title || '').trim() || 'Untitled Topic',
      difficulty: String(input.difficulty || '').trim() || 'Intermediate',
      estimatedMinutes: Math.max(1, Number(input.estimatedMinutes || 10)),
      learningObjectives: Array.isArray(input.learningObjectives)
        ? input.learningObjectives
        : (input.objectives ? parseObjectivesToItems(input.objectives) : []),
      keyTakeaways: Array.isArray(input.keyTakeaways) ? input.keyTakeaways : [],
      sections: Array.isArray(input.sections) && input.sections.length > 0
        ? input.sections
        : [
            {
              id: 'admin-section-1',
              title: 'Overview',
              content: [{ type: 'paragraph', text: 'No content provided yet.' }],
            },
          ],
      relatedLinks: Array.isArray(input.relatedLinks) ? input.relatedLinks : normalizeRelatedLinks(input.files),
      relatedLearning: Array.isArray(input.relatedLearning) ? input.relatedLearning : [],
      relatedLearningGroups: input.relatedLearningGroups || {
        viva: [],
        handsOnLabs: [],
        caseStudies: [],
        practiceMcqs: [],
      },
      __admin: true,
      __scope: scope,
      updatedAt: new Date().toISOString(),
    };

    return upsertStoredTopic(topic);
  }

  static deleteTopic(id) {
    const existing = readStore();
    const next = existing.filter((item) => String(item.id) !== String(id));
    writeStore(next);
  }

  static getTopicsForScope(scope) {
    const target = scope === 'viva' ? 'viva' : 'study';
    return readStore().filter((topic) => {
      if (target === 'viva') {
        return topic.moduleId === 'viva' || String(topic.id || '').startsWith('viva.');
      }
      return topic.moduleId !== 'viva' && !String(topic.id || '').startsWith('viva.');
    });
  }

  static isLoggedIn() {
    if (typeof window === 'undefined') {
      return false;
    }
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    const parsed = safeJsonParse(raw || '', {});
    return Boolean(parsed && parsed.username);
  }

  static login(username, password) {
    const user = String(username || '').trim();
    const pass = String(password || '').trim();
    const credentials = readCredentials();
    const matched = credentials.find((entry) => entry.username === user && entry.password === pass);

    if (matched) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ username: matched.username }));
      return true;
    }

    return false;
  }

  static logout() {
    if (typeof window === 'undefined') {
      return;
    }
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }

  static getCurrentAdminUsername() {
    if (typeof window === 'undefined') {
      return '';
    }

    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    const parsed = safeJsonParse(raw || '', {});
    return String(parsed?.username || '').trim();
  }

  static getAdmins() {
    return readCredentials().map((entry) => ({ username: entry.username }));
  }

  static addAdmin(username, password) {
    const user = String(username || '').trim();
    const pass = String(password || '').trim();

    if (!user) {
      return { ok: false, error: 'Username is required.' };
    }

    if (pass.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters.' };
    }

    const credentials = readCredentials();
    if (credentials.some((entry) => entry.username.toLowerCase() === user.toLowerCase())) {
      return { ok: false, error: 'Admin username already exists.' };
    }

    credentials.push({ username: user, password: pass });
    writeCredentials(credentials);
    return { ok: true };
  }

  static removeAdmin(username) {
    const user = String(username || '').trim();
    if (!user) {
      return { ok: false, error: 'Username is required.' };
    }

    const credentials = readCredentials();
    if (credentials.length <= 1) {
      return { ok: false, error: 'At least one admin account must remain.' };
    }

    const current = this.getCurrentAdminUsername();
    if (current && current === user) {
      return { ok: false, error: 'You cannot remove the currently logged in admin.' };
    }

    const next = credentials.filter((entry) => entry.username !== user);
    if (next.length === credentials.length) {
      return { ok: false, error: 'Admin user not found.' };
    }

    writeCredentials(next);
    return { ok: true };
  }

  static changePassword(currentPassword, nextPassword) {
    const current = String(currentPassword || '').trim();
    const next = String(nextPassword || '').trim();
    const credentials = readCredentials();
    const currentUser = this.getCurrentAdminUsername();
    const activeAdmin = credentials.find((entry) => entry.username === currentUser) || null;

    if (!activeAdmin) {
      return { ok: false, error: 'Admin session not found. Please sign in again.' };
    }

    if (!current || current !== activeAdmin.password) {
      return { ok: false, error: 'Current password is incorrect.' };
    }

    if (next.length < 6) {
      return { ok: false, error: 'New password must be at least 6 characters.' };
    }

    const updated = credentials.map((entry) => {
      if (entry.username !== activeAdmin.username) {
        return entry;
      }
      return {
        username: entry.username,
        password: next,
      };
    });
    writeCredentials(updated);

    return { ok: true };
  }
}
