import { flashcardRepository } from './FlashcardRepository';
import { interviewRepository } from './InterviewRepository';
import { questionRepository } from './QuestionRepository';
import { revisionRepository } from './RevisionRepository';

const REPO_MAP = {
  questions: questionRepository,
  flashcards: flashcardRepository,
  interview: interviewRepository,
  revision: revisionRepository,
};

export class BookmarkService {
  get(type) {
    const repository = REPO_MAP[type];
    if (!repository) {
      return [];
    }
    return repository.bookmarks({ action: 'get' });
  }

  toggle(type, id) {
    const repository = REPO_MAP[type];
    if (!repository) {
      throw new Error(`Unknown bookmark type: ${type}`);
    }
    return repository.bookmarks({ action: 'toggle', id });
  }

  add(type, id) {
    const repository = REPO_MAP[type];
    if (!repository) {
      throw new Error(`Unknown bookmark type: ${type}`);
    }
    return repository.bookmarks({ action: 'add', id });
  }

  remove(type, id) {
    const repository = REPO_MAP[type];
    if (!repository) {
      throw new Error(`Unknown bookmark type: ${type}`);
    }
    return repository.bookmarks({ action: 'remove', id });
  }

  getAll() {
    return {
      questions: this.get('questions'),
      flashcards: this.get('flashcards'),
      interview: this.get('interview'),
      revision: this.get('revision'),
    };
  }
}

export const bookmarkService = new BookmarkService();
