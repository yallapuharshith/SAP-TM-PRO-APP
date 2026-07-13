import { BaseEntityRepository } from './BaseEntityRepository';

function normalizeRevision(entry = {}) {
  return {
    id: entry.id,
    module: entry.module,
    topicId: entry.topicId || entry.topic,
    title: entry.title || 'Revision Item',
    summary: entry.summary || '',
    checklist: Array.isArray(entry.checklist) ? entry.checklist : [],
    tags: Array.isArray(entry.tags) ? entry.tags : [],
    priority: Number(entry.priority ?? 1),
    ...entry,
  };
}

export class RevisionRepository extends BaseEntityRepository {
  constructor() {
    super({
      type: 'revision',
      normalizer: normalizeRevision,
      bookmarkType: 'revision',
    });
  }
}

export const revisionRepository = new RevisionRepository();
