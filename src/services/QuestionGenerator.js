import { questionRepository } from './QuestionRepository';

function shuffle(items) {
  const list = [...items];
  for (let index = list.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
  }
  return list;
}

function randomizeOptions(question) {
  if (question.questionType === 'match_following' && question.options?.left && question.options?.right) {
    return {
      ...question,
      options: {
        left: [...question.options.left],
        right: shuffle(question.options.right),
      },
    };
  }

  if (Array.isArray(question.options)) {
    return {
      ...question,
      options: shuffle(question.options),
    };
  }

  return { ...question };
}

export class QuestionGenerator {
  async createExamSet(config = {}) {
    const {
      limit = 25,
      moduleId,
      topicId,
      subTopic,
      difficulties,
      questionTypes,
      tags,
      shuffleQuestions = true,
      shuffleOptions = true,
    } = config;

    const candidates = await questionRepository.getQuestions({
      moduleId,
      topicId,
      subTopic,
      difficulties,
      questionTypes,
      tags,
    });

    const ordered = shuffleQuestions ? shuffle(candidates) : candidates;
    const shouldLimit = Number.isFinite(Number(limit)) && Number(limit) > 0;
    const sliced = shouldLimit ? ordered.slice(0, Number(limit)) : ordered;

    return shuffleOptions ? sliced.map((question) => randomizeOptions(question)) : sliced;
  }

  async createAdaptiveRevisionSet({ wrongQuestionIds = [], bookmarkedQuestionIds = [], weakTopicIds = [], limit = 20 } = {}) {
    const wrong = await questionRepository.getQuestionsByIds(wrongQuestionIds);
    const bookmarked = await questionRepository.getQuestionsByIds(bookmarkedQuestionIds);

    const weakByTopicGroups = await Promise.all(weakTopicIds.map((topicId) => questionRepository.getQuestionsByTopic(topicId)));
    const weakByTopics = weakByTopicGroups.flat();

    const merged = [...wrong, ...bookmarked, ...weakByTopics];
    const deduped = Array.from(new Map(merged.map((question) => [question.id, question])).values());

    return shuffle(deduped).slice(0, limit).map((question) => randomizeOptions(question));
  }
}

export const questionGenerator = new QuestionGenerator();
