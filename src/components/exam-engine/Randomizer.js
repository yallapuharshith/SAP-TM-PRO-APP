export function shuffleArray(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomizeQuestion(question) {
  if (question.type === 'match_following') {
    return {
      ...question,
      options: {
        left: [...question.options.left],
        right: shuffleArray(question.options.right),
      },
    };
  }

  if (Array.isArray(question.options)) {
    return {
      ...question,
      options: shuffleArray(question.options),
    };
  }

  return { ...question };
}

export function randomizeQuestionSet(questionSet) {
  const randomized = questionSet.map((question) => randomizeQuestion(question));
  return shuffleArray(randomized);
}
