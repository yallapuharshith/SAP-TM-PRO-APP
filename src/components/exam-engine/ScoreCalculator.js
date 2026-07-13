function areArraysEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  return [...a].sort().every((value, index) => value === [...b].sort()[index]);
}

function isMatchAnswerEqual(expected, actual) {
  const expectedKeys = Object.keys(expected);
  const actualKeys = Object.keys(actual || {});
  if (expectedKeys.length !== actualKeys.length) {
    return false;
  }
  return expectedKeys.every((key) => actual[key] === expected[key]);
}

export function isAnswered(question, answer) {
  if (answer === null || answer === undefined) {
    return false;
  }

  if (question.type === 'multiple_correct' || question.type === 'sequence') {
    return Array.isArray(answer) && answer.length > 0;
  }

  if (question.type === 'match_following') {
    return typeof answer === 'object' && Object.keys(answer).length > 0;
  }

  return answer !== '';
}

export function isCorrect(question, answer) {
  if (!isAnswered(question, answer)) {
    return false;
  }

  if (question.type === 'multiple_correct' || question.type === 'sequence') {
    return areArraysEqual(question.correctAnswer, answer);
  }

  if (question.type === 'match_following') {
    return isMatchAnswerEqual(question.correctAnswer, answer);
  }

  return question.correctAnswer === answer;
}

export function calculateScore({ questions, answers, markedForReview, startedAt, submittedAt, durationSeconds }) {
  let obtainedMarks = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  const questionDetails = questions.map((question) => {
    const answer = answers[question.id];
    const answered = isAnswered(question, answer);
    const correct = isCorrect(question, answer);

    if (!answered) {
      skippedCount += 1;
    } else if (correct) {
      obtainedMarks += question.marks;
      correctCount += 1;
    } else {
      obtainedMarks -= question.negativeMarks;
      wrongCount += 1;
    }

    return {
      questionId: question.id,
      topic: question.topic,
      difficulty: question.difficulty,
      type: question.type,
      answer,
      answered,
      correct,
      marks: question.marks,
      negativeMarks: question.negativeMarks,
    };
  });

  const maxMarks = questions.reduce((total, question) => total + question.marks, 0);
  const percentage = maxMarks > 0 ? (obtainedMarks / maxMarks) * 100 : 0;
  const accuracy = correctCount + wrongCount > 0 ? (correctCount / (correctCount + wrongCount)) * 100 : 0;
  const timeTakenSeconds = Math.max(0, (submittedAt || Date.now()) - (startedAt || Date.now())) / 1000;

  const byTopic = buildBucket(questionDetails, 'topic');
  const byDifficulty = buildBucket(questionDetails, 'difficulty');
  const byType = buildBucket(questionDetails, 'type');

  return {
    obtainedMarks: Number(obtainedMarks.toFixed(2)),
    maxMarks,
    percentage: Number(percentage.toFixed(2)),
    accuracy: Number(accuracy.toFixed(2)),
    correctCount,
    wrongCount,
    skippedCount,
    markedCount: markedForReview.length,
    totalQuestions: questions.length,
    timeTakenSeconds: Math.min(durationSeconds, Math.floor(timeTakenSeconds)),
    passed: percentage >= 65,
    analytics: {
      byTopic,
      byDifficulty,
      byType,
    },
    questionDetails,
  };
}

function buildBucket(details, key) {
  const bucket = {};

  details.forEach((detail) => {
    const label = detail[key];
    if (!bucket[label]) {
      bucket[label] = {
        total: 0,
        correct: 0,
        wrong: 0,
        skipped: 0,
      };
    }

    bucket[label].total += 1;
    if (!detail.answered) {
      bucket[label].skipped += 1;
    } else if (detail.correct) {
      bucket[label].correct += 1;
    } else {
      bucket[label].wrong += 1;
    }
  });

  return bucket;
}
