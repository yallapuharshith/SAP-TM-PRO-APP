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

function toModuleId(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `module${value}`;
  }

  const raw = String(value ?? '').trim();
  if (/^\d+$/.test(raw)) {
    return `module${raw}`;
  }
  return raw || undefined;
}

function inferQuestionType(question) {
  const explicitType = String(question.questionType || question.type || '').trim();
  if (explicitType) {
    return explicitType;
  }

  if (question.options?.left && question.options?.right) {
    return 'match_following';
  }

  if (Array.isArray(question.correctAnswer) || Array.isArray(question.answer)) {
    return 'multiple_correct';
  }

  return 'single_correct';
}

function normalizeOptionList(rawOptions) {
  const list = Array.isArray(rawOptions)
    ? rawOptions
    : (Array.isArray(rawOptions?.items) ? rawOptions.items : []);

  return list.map((option, index) => {
    if (typeof option === 'string') {
      return {
        id: String(index + 1),
        text: option,
      };
    }

    return {
      id: String(option?.id ?? index + 1),
      text: String(option?.text ?? option?.label ?? option?.id ?? `Option ${index + 1}`),
    };
  });
}

function resolveAnswerValue(value, options) {
  if (value == null) {
    return null;
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return null;
  }

  const byId = options.find((option) => String(option.id) === normalized);
  if (byId) {
    return byId.id;
  }

  const byText = options.find((option) => String(option.text).toLowerCase() === normalized.toLowerCase());
  if (byText) {
    return byText.id;
  }

  if (/^\d+$/.test(normalized)) {
    const index = Number(normalized) - 1;
    if (index >= 0 && index < options.length) {
      return options[index].id;
    }
  }

  return normalized;
}

function normalizeQuestion(question) {
  const questionType = inferQuestionType(question);
  const normalizedOptions = questionType === 'match_following'
    ? {
      left: Array.isArray(question.options?.left) ? question.options.left : [],
      right: Array.isArray(question.options?.right) ? question.options.right : [],
    }
    : normalizeOptionList(question.options);

  const rawAnswer = question.answer ?? question.correctAnswer;
  const normalizedAnswer = Array.isArray(rawAnswer)
    ? rawAnswer
      .map((value) => resolveAnswerValue(value, normalizedOptions))
      .filter(Boolean)
    : (questionType === 'match_following'
      ? (typeof rawAnswer === 'object' && rawAnswer !== null ? rawAnswer : {})
      : resolveAnswerValue(rawAnswer, normalizedOptions));

  return {
    ...question,
    module: toModuleId(question.module),
    questionType,
    options: normalizedOptions,
    answer: normalizedAnswer,
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
