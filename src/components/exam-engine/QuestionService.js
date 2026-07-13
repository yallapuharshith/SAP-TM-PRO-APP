import { questionGenerator } from '../../services/QuestionGenerator';

export async function loadQuestions(config = 25) {
  const normalized = typeof config === 'number' ? { limit: config } : { ...(config || {}) };
  const limit = normalized.limit == null ? null : Number(normalized.limit || 25);

  const questions = await questionGenerator.createExamSet({
    limit,
    moduleId: normalized.moduleId,
    topicId: normalized.topicId,
    subTopic: normalized.subTopic,
    difficulties: normalized.difficulties,
    questionTypes: normalized.questionTypes,
    tags: normalized.tags,
    shuffleQuestions: true,
    shuffleOptions: true,
  });

  return questions.map((question) => ({
    ...question,
    type: question.questionType,
    correctAnswer: question.answer,
  }));
}
