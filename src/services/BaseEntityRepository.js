import { knowledgeRepository } from './KnowledgeRepository';

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function includesAny(haystack, needles) {
  if (!Array.isArray(needles) || needles.length === 0) {
    return true;
  }

  if (!Array.isArray(haystack)) {
    return false;
  }

  return needles.some((needle) => haystack.includes(needle));
}

function applyFilter(items, filters = {}) {
  return items.filter((item) => {
    return Object.entries(filters).every(([key, expected]) => {
      if (expected == null) {
        return true;
      }

      const actual = item[key];
      if (Array.isArray(expected)) {
        if (Array.isArray(actual)) {
          return includesAny(actual, expected);
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

export class BaseEntityRepository {
  constructor({
    type,
    normalizer = (item) => item,
    bookmarkType,
  }) {
    this.type = type;
    this.normalizer = normalizer;
    this.bookmarkType = bookmarkType || type;
  }

  async load(filters = {}) {
    const moduleId = filters.moduleId;
    const data = moduleId
      ? await knowledgeRepository.load({ type: this.type, moduleId })
      : await knowledgeRepository.load({ type: this.type });

    const normalized = normalizeArray(data).map((item) => this.normalizer(item));
    return applyFilter(normalized, { ...filters, moduleId: undefined });
  }

  async save(payload = {}) {
    const { moduleId, data } = payload;
    if (!moduleId) {
      throw new Error('save() requires moduleId');
    }

    return knowledgeRepository.save({ type: this.type, moduleId, data });
  }

  async search(query, options = {}) {
    const { moduleId, fields, limit } = options;
    return knowledgeRepository.search({
      type: this.type,
      moduleId,
      query,
      fields,
      limit,
    });
  }

  async filter(filters = {}) {
    const { moduleId, criteria = {} } = filters;
    const items = await this.load({ moduleId });
    return applyFilter(items, criteria);
  }

  async random(options = {}) {
    const { moduleId, count = 1, criteria } = options;
    return knowledgeRepository.random({
      type: this.type,
      moduleId,
      count,
      criteria,
    });
  }

  bookmarks(options = {}) {
    return knowledgeRepository.bookmarks({
      ...options,
      type: this.bookmarkType,
    });
  }

  async statistics(options = {}) {
    return knowledgeRepository.statistics({
      ...options,
      type: this.type,
    });
  }
}
