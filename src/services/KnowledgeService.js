import { flashcardRepository } from './FlashcardRepository';
import { interviewRepository } from './InterviewRepository';
import { knowledgeRepository } from './KnowledgeRepository';
import { questionRepository } from './QuestionRepository';
import { revisionRepository } from './RevisionRepository';

export class KnowledgeService {
  async getModules() {
    return knowledgeRepository.loadKnowledgeIndex();
  }

  async getModuleContent(moduleId) {
    const [metadata, topics, notes, questions, flashcards, interview, revision] = await Promise.all([
      knowledgeRepository.loadModuleMetadata(moduleId),
      knowledgeRepository.loadModuleTopics(moduleId),
      knowledgeRepository.loadModuleNotes(moduleId),
      questionRepository.load({ moduleId }),
      flashcardRepository.load({ moduleId }),
      interviewRepository.load({ moduleId }),
      revisionRepository.load({ moduleId }),
    ]);

    return {
      moduleId,
      metadata,
      topics,
      notes,
      questions,
      flashcards,
      interview,
      revision,
    };
  }

  async getKnowledgeStatistics() {
    return knowledgeRepository.statistics();
  }

  async getModuleStatistics(moduleId) {
    const content = await this.getModuleContent(moduleId);
    return {
      moduleId,
      notes: content.notes.length,
      topics: content.topics.length,
      questions: content.questions.length,
      flashcards: content.flashcards.length,
      interview: content.interview.length,
      revision: content.revision.length,
    };
  }
}

export const knowledgeService = new KnowledgeService();
