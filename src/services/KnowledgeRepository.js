const STORAGE_KEY = 'sap-tm-master-pro-knowledge-overrides-v1';
const BOOKMARKS_KEY = 'sap-tm-master-pro-knowledge-bookmarks-v1';

const metadataImporters = import.meta.glob('../storage/knowledge/modules/*/metadata.json');
const topicsImporters = import.meta.glob('../storage/knowledge/modules/*/topics.json');
const notesImporters = import.meta.glob('../storage/knowledge/modules/*/notes.json');
const questionsImporters = import.meta.glob('../storage/knowledge/modules/*/questions.json');
const flashcardsImporters = import.meta.glob('../storage/knowledge/modules/*/flashcards.json');
const interviewImporters = import.meta.glob('../storage/knowledge/modules/*/interview.json');
const revisionImporters = import.meta.glob('../storage/knowledge/modules/*/revision.json');

const IMPORTERS_BY_TYPE = {
  metadata: metadataImporters,
  topics: topicsImporters,
  notes: notesImporters,
  questions: questionsImporters,
  flashcards: flashcardsImporters,
  interview: interviewImporters,
  revision: revisionImporters,
};

function isClient() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readJsonStorage(key, fallback) {
  if (!isClient()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function writeJsonStorage(key, payload) {
  if (!isClient()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(payload));
}

function extractModuleId(path) {
  const match = path.match(/modules\/([^/]+)\//);
  return match ? match[1] : null;
}

function toSortedArray(items) {
  return [...items].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

function pickRandom(items, count = 1) {
  const target = Math.max(1, Number(count) || 1);
  const list = [...items];

  for (let index = list.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
  }

  return list.slice(0, target);
}

function normalizeToArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (value == null) {
    return [];
  }
  return [value];
}

function scoreMatch(text, query) {
  const normalizedText = String(text || '').toLowerCase();
  const normalizedQuery = String(query || '').trim().toLowerCase();

  if (!normalizedQuery) {
    return 0;
  }
  if (normalizedText === normalizedQuery) {
    return 5;
  }
  if (normalizedText.startsWith(normalizedQuery)) {
    return 4;
  }
  if (normalizedText.includes(normalizedQuery)) {
    return 3;
  }
  return 0;
}

function defaultTopicFromQuestion(moduleId, question, index) {
  const topicId = question.topic || `${moduleId}.T${index + 1}`;
  const title = question.subTopic || question.topic || `Topic ${index + 1}`;

  return {
    id: topicId,
    module: moduleId,
    unit: question.unit || 'Unit 1',
    title,
    description: `Auto-generated topic for ${title}`,
    difficulty: question.difficulty || 'Medium',
    estimatedStudyTime: 30,
    prerequisites: [],
    relatedTopics: [],
    revisionWeight: 0.7,
    tags: Array.isArray(question.tags) ? question.tags : [],
  };
}

export class KnowledgeRepository {
  constructor() {
    this.cache = new Map();
  }

  getModuleIds() {
    const ids = Object.values(IMPORTERS_BY_TYPE)
      .flatMap((importerMap) => Object.keys(importerMap).map((path) => extractModuleId(path)))
      .filter(Boolean);

    return toSortedArray(Array.from(new Set(ids)));
  }

  async load(options = {}) {
    const {
      type = 'metadata',
      moduleId,
    } = options;

    if (moduleId) {
      return this.#loadByType(type, moduleId);
    }

    if (type === 'metadata') {
      return this.loadKnowledgeIndex();
    }

    return this.#loadAllByType(type);
  }

  async save(payload = {}) {
    const { type, moduleId, data } = payload;
    if (!type || !moduleId) {
      throw new Error('save() requires type and moduleId');
    }

    const overrides = readJsonStorage(STORAGE_KEY, {});
    const next = {
      ...overrides,
      [moduleId]: {
        ...(overrides[moduleId] || {}),
        [type]: data,
      },
    };

    writeJsonStorage(STORAGE_KEY, next);
    this.cache.set(`${type}:${moduleId}`, data);

    return data;
  }

  async search(options = {}) {
    const {
      type,
      moduleId,
      query,
      fields = [],
      limit = 50,
    } = options;

    const sources = normalizeToArray(type || ['questions', 'notes', 'flashcards', 'interview', 'revision', 'topics']);
    const term = String(query || '').trim().toLowerCase();
    if (!term) {
      return [];
    }

    const batches = await Promise.all(
      sources.map(async (sourceType) => {
        const data = moduleId
          ? normalizeToArray(await this.#loadByType(sourceType, moduleId))
          : await this.#loadAllByType(sourceType);

        return data
          .map((item) => {
            const candidateFields = fields.length > 0
              ? fields
              : Object.keys(item || {}).filter((fieldName) => typeof item[fieldName] !== 'object');

            const score = candidateFields.reduce((maxScore, fieldName) => {
              return Math.max(maxScore, scoreMatch(item[fieldName], term));
            }, 0);

            if (score === 0) {
              return null;
            }

            return {
              type: sourceType,
              moduleId: item.module || moduleId || null,
              score,
              item,
            };
          })
          .filter(Boolean);
      })
    );

    return batches
      .flat()
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async filter(options = {}) {
    const { type = 'questions', moduleId, criteria = {} } = options;
    const items = moduleId
      ? normalizeToArray(await this.#loadByType(type, moduleId))
      : await this.#loadAllByType(type);

    return items.filter((item) => {
      return Object.entries(criteria).every(([key, expected]) => {
        if (expected == null) {
          return true;
        }

        const actual = item[key];
        if (Array.isArray(expected)) {
          if (Array.isArray(actual)) {
            return expected.some((value) => actual.includes(value));
          }
          return expected.includes(actual);
        }

        if (Array.isArray(actual)) {
          return actual.includes(expected);
        }

        return actual === expected;
      });
    });
  }

  async random(options = {}) {
    const { type = 'questions', moduleId, count = 1, criteria } = options;
    const source = criteria
      ? await this.filter({ type, moduleId, criteria })
      : (moduleId ? normalizeToArray(await this.#loadByType(type, moduleId)) : await this.#loadAllByType(type));

    return pickRandom(source, count);
  }

  bookmarks(options = {}) {
    const { action = 'get', type = 'questions', id } = options;
    const state = readJsonStorage(BOOKMARKS_KEY, {});
    const current = Array.isArray(state[type]) ? state[type] : [];

    if (action === 'add' && id) {
      if (!current.includes(id)) {
        const next = { ...state, [type]: [...current, id] };
        writeJsonStorage(BOOKMARKS_KEY, next);
        return next[type];
      }
      return current;
    }

    if (action === 'remove' && id) {
      const next = { ...state, [type]: current.filter((value) => value !== id) };
      writeJsonStorage(BOOKMARKS_KEY, next);
      return next[type];
    }

    if (action === 'toggle' && id) {
      const nextValues = current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id];
      const next = { ...state, [type]: nextValues };
      writeJsonStorage(BOOKMARKS_KEY, next);
      return nextValues;
    }

    return current;
  }

  async statistics(options = {}) {
    const { type } = options;
    const moduleIds = this.getModuleIds();

    const moduleStats = await Promise.all(
      moduleIds.map(async (moduleId) => {
        const statsByType = await Promise.all(
          Object.keys(IMPORTERS_BY_TYPE).map(async (entryType) => {
            const records = normalizeToArray(await this.#loadByType(entryType, moduleId));
            return [entryType, records.length];
          })
        );

        return {
          moduleId,
          counts: Object.fromEntries(statsByType),
        };
      })
    );

    if (type) {
      return {
        type,
        totalModules: moduleIds.length,
        totalRecords: moduleStats.reduce((sum, entry) => sum + Number(entry.counts[type] || 0), 0),
        byModule: moduleStats.map((entry) => ({ moduleId: entry.moduleId, count: entry.counts[type] || 0 })),
      };
    }

    return {
      totalModules: moduleIds.length,
      byModule: moduleStats,
    };
  }

  async loadModuleMetadata(moduleId) {
    const metadata = await this.#loadByType('metadata', moduleId);
    if (metadata) {
      return metadata;
    }

    const [topics, notes, questions] = await Promise.all([
      this.loadModuleTopics(moduleId),
      this.loadModuleNotes(moduleId),
      this.loadModuleQuestions(moduleId),
    ]);

    return {
      id: moduleId,
      title: moduleId,
      description: `Auto-generated metadata for ${moduleId}`,
      unitCount: Array.from(new Set(topics.map((topic) => topic.unit || 'Unit 1'))).length,
      topicCount: topics.length,
      noteCount: notes.length,
      questionCount: questions.length,
      recommendedHours: Math.max(1, Math.ceil((questions.length + notes.length) / 10)),
      difficulty: 'Mixed',
    };
  }

  async loadModuleTopics(moduleId) {
    const topics = await this.#loadByType('topics', moduleId);
    if (Array.isArray(topics) && topics.length > 0) {
      return topics;
    }

    const questions = await this.loadModuleQuestions(moduleId);
    const derived = questions
      .map((question, index) => defaultTopicFromQuestion(moduleId, question, index))
      .filter((topic, index, list) => list.findIndex((other) => other.id === topic.id) === index);

    return derived;
  }

  async loadModuleNotes(moduleId) {
    const notes = await this.#loadByType('notes', moduleId);
    return Array.isArray(notes) ? notes : [];
  }

  async loadModuleQuestions(moduleId) {
    const questions = await this.#loadByType('questions', moduleId);
    return Array.isArray(questions) ? questions : [];
  }

  async loadModuleFlashcards(moduleId) {
    const flashcards = await this.#loadByType('flashcards', moduleId);
    return Array.isArray(flashcards) ? flashcards : [];
  }

  async loadModuleInterview(moduleId) {
    const interview = await this.#loadByType('interview', moduleId);
    return Array.isArray(interview) ? interview : [];
  }

  async loadModuleRevision(moduleId) {
    const revision = await this.#loadByType('revision', moduleId);
    return Array.isArray(revision) ? revision : [];
  }

  async loadKnowledgeIndex() {
    const moduleIds = this.getModuleIds();
    const metadata = await Promise.all(moduleIds.map((moduleId) => this.loadModuleMetadata(moduleId)));
    return metadata.filter(Boolean);
  }

  async loadAllTopics() {
    return this.#loadAllByType('topics', (moduleId) => this.loadModuleTopics(moduleId));
  }

  async loadAllNotes() {
    return this.#loadAllByType('notes');
  }

  async loadAllQuestions() {
    return this.#loadAllByType('questions');
  }

  async loadAllFlashcards() {
    return this.#loadAllByType('flashcards');
  }

  async loadAllInterview() {
    return this.#loadAllByType('interview');
  }

  async loadAllRevision() {
    return this.#loadAllByType('revision');
  }

  async #loadAllByType(type, loader) {
    const moduleIds = this.getModuleIds();
    const groups = await Promise.all(
      moduleIds.map((moduleId) => {
        if (loader) {
          return loader(moduleId);
        }
        return this.#loadByType(type, moduleId);
      })
    );

    return groups.flatMap((group) => normalizeToArray(group));
  }

  async #loadByType(type, moduleId) {
    const cacheKey = `${type}:${moduleId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const overrides = readJsonStorage(STORAGE_KEY, {});
    const overrideData = overrides[moduleId]?.[type];
    // Keep question banks source-of-truth in repository JSON files.
    // Local overrides are useful for editable content types, but can make
    // imported question updates appear stale across sessions.
    if (type !== 'questions' && overrideData !== undefined) {
      this.cache.set(cacheKey, overrideData);
      return overrideData;
    }

    const importerMap = IMPORTERS_BY_TYPE[type];
    if (!importerMap) {
      return null;
    }

    const candidatePaths = Object.keys(importerMap)
      .filter((filePath) => extractModuleId(filePath) === moduleId);

    if (candidatePaths.length === 0) {
      return null;
    }

    const data = await importerMap[candidatePaths[0]]();
    const resolved = data?.default ?? data;
    this.cache.set(cacheKey, resolved);
    return resolved;
  }
}

export const knowledgeRepository = new KnowledgeRepository();
