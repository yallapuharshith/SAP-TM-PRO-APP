import { flashcardRepository } from './FlashcardRepository';
import { interviewRepository } from './InterviewRepository';
import { knowledgeRepository } from './KnowledgeRepository';
import { questionRepository } from './QuestionRepository';
import { revisionRepository } from './RevisionRepository';

function scoreMatch(text, query) {
  const normalizedText = String(text || '').toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (normalizedText === normalizedQuery) {
    return 5;
  }
  if (normalizedText.startsWith(normalizedQuery)) {
    return 4;
  }
  if (normalizedText.includes(normalizedQuery)) {
    return 3;
  }
  return 0;
}

function normalizeEntry(type, item, score) {
  return {
    type,
    score,
    item,
  };
}

export class SearchService {
  async search(query, options = {}) {
    const term = String(query || '').trim().toLowerCase();
    if (!term) {
      return {
        query: '',
        total: 0,
        results: [],
      };
    }

    const limit = options.limit || 40;
    const [topics, notes, questions, flashcards, interview, revision] = await Promise.all([
      knowledgeRepository.loadAllTopics(),
      knowledgeRepository.loadAllNotes(),
      questionRepository.load(),
      flashcardRepository.load(),
      interviewRepository.load(),
      revisionRepository.load(),
    ]);

    const matches = [];

    topics.forEach((topic) => {
      const score = Math.max(
        scoreMatch(topic.title, term),
        scoreMatch(topic.description, term),
        ...(topic.tags || []).map((tag) => scoreMatch(tag, term))
      );

      if (score > 0) {
        matches.push(normalizeEntry('topic', topic, score));
      }
    });

    notes.forEach((note) => {
      const score = Math.max(
        scoreMatch(note.title, term),
        scoreMatch(note.summary, term),
        scoreMatch(note.fullContent, term),
        ...((note.interviewQuestions || []).map((q) => scoreMatch(q, term))),
        ...((note.consultantNotes || []).map((c) => scoreMatch(c, term)))
      );

      if (score > 0) {
        matches.push(normalizeEntry('note', note, score));
      }
    });

    questions.forEach((question) => {
      const score = Math.max(
        scoreMatch(question.question, term),
        scoreMatch(question.topic, term),
        scoreMatch(question.interviewQuestion, term),
        scoreMatch(question.realProjectScenario, term),
        ...((question.sapTables || []).map((table) => scoreMatch(table, term))),
        ...((question.sapTransactions || []).map((transaction) => scoreMatch(transaction, term))),
        ...((question.sapConfiguration || []).map((node) => scoreMatch(node, term))),
        ...((question.tags || []).map((tag) => scoreMatch(tag, term)))
      );

      if (score > 0) {
        matches.push(normalizeEntry('question', question, score));
      }
    });

    flashcards.forEach((card) => {
      const score = Math.max(
        scoreMatch(card.front, term),
        scoreMatch(card.back, term),
        ...((card.tags || []).map((tag) => scoreMatch(tag, term)))
      );

      if (score > 0) {
        matches.push(normalizeEntry('flashcard', card, score));
      }
    });

    interview.forEach((item) => {
      const score = Math.max(
        scoreMatch(item.question, term),
        scoreMatch(item.answerGuide, term),
        ...((item.tags || []).map((tag) => scoreMatch(tag, term)))
      );

      if (score > 0) {
        matches.push(normalizeEntry('interview', item, score));
      }
    });

    revision.forEach((item) => {
      const score = Math.max(
        scoreMatch(item.title, term),
        scoreMatch(item.summary, term),
        ...((item.tags || []).map((tag) => scoreMatch(tag, term))),
        ...((item.checklist || []).map((entry) => scoreMatch(entry, term)))
      );

      if (score > 0) {
        matches.push(normalizeEntry('revision', item, score));
      }
    });

    const results = matches.sort((a, b) => b.score - a.score).slice(0, limit);

    return {
      query: term,
      total: results.length,
      results,
    };
  }
}

export const searchService = new SearchService();
