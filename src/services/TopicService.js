import { knowledgeRepository } from './KnowledgeRepository';

function formatUnit(unit) {
  if (unit == null || unit === '') {
    return 'Unit 1';
  }
  const value = String(unit).trim();
  if (/^unit\s*\d+$/i.test(value)) {
    return value.replace(/^unit/i, 'Unit');
  }
  if (/^\d+$/.test(value)) {
    return `Unit ${value}`;
  }
  return value;
}

function byUnit(topics) {
  return topics.reduce((acc, topic) => {
    const key = formatUnit(topic.unit);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(topic);
    return acc;
  }, {});
}

function buildTopicsFromQuestions(moduleId, questions) {
  const topicMap = new Map();

  const normalizeTopicValue = (value) => {
    const raw = String(value || '').trim();
    if (!raw) {
      return { key: null, label: null, sortNumber: null, sortText: null };
    }

    const moduleTopicMatch = raw.match(/\.T(\d+)$/i);
    if (moduleTopicMatch) {
      const n = Number(moduleTopicMatch[1]);
      return {
        key: raw,
        label: `Topic ${n}`,
        sortNumber: n,
        sortText: `topic-${n}`,
      };
    }

    if (/^\d+$/.test(raw)) {
      const n = Number(raw);
      return {
        key: raw,
        label: `Topic ${n}`,
        sortNumber: n,
        sortText: `topic-${n}`,
      };
    }

    return {
      key: raw,
      label: raw,
      sortNumber: null,
      sortText: raw.toLowerCase(),
    };
  };

  for (const question of questions) {
    const topicValue = normalizeTopicValue(question?.topic);
    if (!topicValue.key) {
      continue;
    }

    const questionSubTopic = String(question.subTopic || '').trim();
    const groupKey = topicValue.key;
    const id = `${moduleId}.TOPIC.${groupKey}`;
    const unit = formatUnit(question.unit);
    const current = topicMap.get(id);

    if (!current) {
      topicMap.set(id, {
        id,
        module: moduleId,
        unit,
        topicId: topicValue.key,
        topicLabel: topicValue.label,
        sortNumber: topicValue.sortNumber,
        sortText: topicValue.sortText,
        title: topicValue.label,
        subTopics: questionSubTopic ? [questionSubTopic] : [],
        questionCount: 1,
      });
      continue;
    }

    current.questionCount += 1;
    if (questionSubTopic && !current.subTopics.includes(questionSubTopic)) {
      current.subTopics.push(questionSubTopic);
    }
  }

  return Array.from(topicMap.values())
    .sort((a, b) => {
      if (a.sortNumber != null && b.sortNumber != null) {
        return a.sortNumber - b.sortNumber;
      }
      if (a.sortNumber != null) {
        return -1;
      }
      if (b.sortNumber != null) {
        return 1;
      }
      return String(a.sortText).localeCompare(String(b.sortText));
    })
    .map((topic) => ({
      ...topic,
      title: topic.topicLabel,
    }));
}

export class TopicService {
  async getAllTopics() {
    return knowledgeRepository.loadAllTopics();
  }

  async getTopicById(topicId) {
    const topics = await this.getAllTopics();
    return topics.find((topic) => topic.id === topicId) || null;
  }

  async getModuleTopics(moduleId) {
    return knowledgeRepository.loadModuleTopics(moduleId);
  }

  async getLearningTree() {
    const modules = await knowledgeRepository.loadKnowledgeIndex();
    const tree = await Promise.all(
      modules.map(async (module) => {
        const questions = await knowledgeRepository.loadModuleQuestions(module.id);
        const topics = buildTopicsFromQuestions(module.id, questions);
        return {
          module,
          units: byUnit(topics),
        };
      })
    );

    return tree;
  }

  async getWeakTopics(progress) {
    const topics = await this.getAllTopics();
    const topicStats = progress?.topicStats || {};

    return topics
      .map((topic) => {
        const stats = topicStats[topic.id] || {};
        const accuracy = Number(stats.accuracy ?? 0);
        const completion = Number(stats.completion ?? 0);
        const score = topic.revisionWeight * 100 + (100 - accuracy) + (100 - completion);
        return { topic, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((entry) => entry.topic);
  }
}

export const topicService = new TopicService();
