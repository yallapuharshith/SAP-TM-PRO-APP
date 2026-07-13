import { BaseEntityRepository } from './BaseEntityRepository';

function normalizeFlashcard(card = {}) {
  return {
    id: card.id,
    module: card.module,
    topicId: card.topicId || card.topic,
    front: card.front || card.question || 'Placeholder front',
    back: card.back || card.answer || 'Placeholder back',
    difficulty: card.difficulty || 'Medium',
    tags: Array.isArray(card.tags) ? card.tags : [],
    ...card,
  };
}

export class FlashcardRepository extends BaseEntityRepository {
  constructor() {
    super({
      type: 'flashcards',
      normalizer: normalizeFlashcard,
      bookmarkType: 'flashcards',
    });
  }
}

export const flashcardRepository = new FlashcardRepository();
