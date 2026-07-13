import { BaseEntityRepository } from './BaseEntityRepository';

function difficultyMarks(difficulty) {
  if (difficulty === 'Hard') {
    return 4;
  }
  if (difficulty === 'Medium') {
    return 3;
  }
  return 2;
}

function normalizeQuestion(question) {
  return {
    ...question,
    questionType: question.questionType || question.type || 'single_correct',
    answer: question.answer ?? question.correctAnswer,
    marks: Number(question.marks ?? difficultyMarks(question.difficulty)),
    negativeMarks: Number(question.negativeMarks ?? 0.5),
    estimatedTime: Number(question.estimatedTime ?? 90),
    tags: Array.isArray(question.tags) ? question.tags : [],
    sapTransactions: Array.isArray(question.sapTransactions) ? question.sapTransactions : [],
    sapTables: Array.isArray(question.sapTables) ? question.sapTables : [],
  };
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

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase();
}

export class QuestionRepository extends BaseEntityRepository {
  constructor() {
    super({
      type: 'questions',
      normalizer: normalizeQuestion,
      bookmarkType: 'questions',
    });
  }

  async load(filters = {}) {
    const {
      topicId,
      subTopic,
      difficulties,
      questionTypes,
      tags,
      ...baseFilters
    } = filters;

    const all = await super.load(baseFilters);

    return all.filter((question) => {
      if (topicId != null) {
        const expectedTopic = String(topicId);
        const separatorIndex = expectedTopic.indexOf('::');

        if (separatorIndex >= 0) {
          const baseTopic = expectedTopic.slice(0, separatorIndex);
          const expectedSubTopic = expectedTopic.slice(separatorIndex + 2);
          if (String(question.topic) !== baseTopic) {
            return false;
          }
          if (normalizeText(question.subTopic) !== normalizeText(expectedSubTopic)) {
            return false;
          }
        } else if (String(question.topic) !== expectedTopic) {
          return false;
        }
      }
      if (subTopic != null && normalizeText(question.subTopic) !== normalizeText(subTopic)) {
        return false;
      }
      if (difficulties && difficulties.length > 0 && !difficulties.includes(question.difficulty)) {
        return false;
      }
      if (questionTypes && questionTypes.length > 0 && !questionTypes.includes(question.questionType)) {
        return false;
      }
      if (tags && tags.length > 0 && !includesAny(question.tags, tags)) {
        return false;
      }
      return true;
    });
  }

  async getQuestions(filters = {}) {
    return this.load(filters);
  }

  async getQuestionById(id) {
    const questions = await this.load();
    return questions.find((question) => question.id === id) || null;
  }

  async getQuestionsByTopic(topicId) {
    return this.load({ topicId });
  }

  async getQuestionsByIds(ids) {
    const lookup = new Set(ids);
    const questions = await this.load();
    return questions.filter((question) => lookup.has(question.id));
  }
}

export const questionRepository = new QuestionRepository();
