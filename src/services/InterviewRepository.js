import { BaseEntityRepository } from './BaseEntityRepository';

function normalizeInterview(entry = {}) {
  return {
    id: entry.id,
    module: entry.module,
    topicId: entry.topicId || entry.topic,
    question: entry.question || 'Placeholder interview question',
    answerGuide: entry.answerGuide || '',
    difficulty: entry.difficulty || 'Medium',
    tags: Array.isArray(entry.tags) ? entry.tags : [],
    ...entry,
  };
}

export class InterviewRepository extends BaseEntityRepository {
  constructor() {
    super({
      type: 'interview',
      normalizer: normalizeInterview,
      bookmarkType: 'interview',
    });
  }
}

export const interviewRepository = new InterviewRepository();
