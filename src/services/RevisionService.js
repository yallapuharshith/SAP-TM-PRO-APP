import { questionGenerator } from './QuestionGenerator';
import { knowledgeRepository } from './KnowledgeRepository';
import { revisionRepository } from './RevisionRepository';
import { studyService } from './StudyService';
import { topicService } from './TopicService';

export class RevisionService {
  async load(filters = {}) {
    return revisionRepository.load(filters);
  }

  async getQuickRevision() {
    const [topics, revisionItems] = await Promise.all([
      topicService.getAllTopics(),
      revisionRepository.load(),
    ]);

    const weightedTopics = topics
      .sort((a, b) => Number(b.revisionWeight || 0) - Number(a.revisionWeight || 0))
      .slice(0, 10);

    if (revisionItems.length === 0) {
      return weightedTopics;
    }

    const byTopicId = new Map(revisionItems.map((item) => [item.topicId, item]));
    return weightedTopics.map((topic) => ({
      ...topic,
      revision: byTopicId.get(topic.id) || null,
    }));
  }

  async getConsultantNotes() {
    const notes = await knowledgeRepository.loadAllNotes();
    return notes.map((note) => ({
      id: note.id,
      topicId: note.topicId,
      title: note.title,
      consultantNotes: note.consultantNotes,
    }));
  }

  async getCertificationNotes() {
    const notes = await knowledgeRepository.loadAllNotes();
    return notes.map((note) => ({
      id: note.id,
      title: note.title,
      summary: note.summary,
      revisionChecklist: note.revisionChecklist,
    }));
  }

  async getWrongQuestions() {
    const progress = studyService.getProgress();
    return questionGenerator.createAdaptiveRevisionSet({
      wrongQuestionIds: progress.wrongQuestionIds,
      limit: 25,
    });
  }

  async getBookmarkedQuestions() {
    const progress = studyService.getProgress();
    return questionGenerator.createAdaptiveRevisionSet({
      bookmarkedQuestionIds: progress.bookmarks.questions,
      limit: 25,
    });
  }

  async getAdaptiveRevision() {
    const progress = studyService.getProgress();
    const weakTopics = await topicService.getWeakTopics(progress);

    return questionGenerator.createAdaptiveRevisionSet({
      wrongQuestionIds: progress.wrongQuestionIds,
      bookmarkedQuestionIds: progress.bookmarks.questions,
      weakTopicIds: weakTopics.map((topic) => topic.id),
      limit: 30,
    });
  }

  async search(query, options = {}) {
    return revisionRepository.search(query, options);
  }

  async filter(criteria = {}) {
    return revisionRepository.filter({ criteria });
  }

  async random(options = {}) {
    return revisionRepository.random(options);
  }

  bookmarks(options = {}) {
    return revisionRepository.bookmarks(options);
  }

  async statistics() {
    return revisionRepository.statistics();
  }
}

export const revisionService = new RevisionService();
