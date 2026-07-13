import { questionRepository } from './QuestionRepository';

function normalizeIncoming(moduleId, items) {
  const list = Array.isArray(items) ? items : [];

  return list.map((item, index) => ({
    id: item.id || `${moduleId}-Q-${index + 1}`,
    module: item.module || moduleId,
    unit: item.unit || 'Unit 1',
    topic: item.topic || `${moduleId}.T${index + 1}`,
    subTopic: item.subTopic || 'Placeholder sub-topic',
    difficulty: item.difficulty || 'Medium',
    questionType: item.questionType || 'single_correct',
    question: item.question || 'Placeholder question text',
    options: Array.isArray(item.options) ? item.options : [],
    answer: item.answer ?? null,
    explanation: item.explanation || 'Placeholder explanation',
    tags: Array.isArray(item.tags) ? item.tags : [],
    ...item,
  }));
}

export class QuestionImportService {
  validate(items = []) {
    const list = Array.isArray(items) ? items : [];

    const errors = list
      .map((item, index) => {
        if (!item || typeof item !== 'object') {
          return `Row ${index + 1}: must be an object`;
        }
        if (!item.question) {
          return `Row ${index + 1}: question is required`;
        }
        if (!('answer' in item)) {
          return `Row ${index + 1}: answer is required`;
        }
        return null;
      })
      .filter(Boolean);

    return {
      valid: errors.length === 0,
      total: list.length,
      errors,
    };
  }

  async import(moduleId, items) {
    const validation = this.validate(items);
    if (!validation.valid) {
      throw new Error(`Question import failed: ${validation.errors.join('; ')}`);
    }

    const payload = normalizeIncoming(moduleId, items);
    await questionRepository.save({ moduleId, data: payload });

    return {
      moduleId,
      imported: payload.length,
    };
  }
}

export const questionImportService = new QuestionImportService();
