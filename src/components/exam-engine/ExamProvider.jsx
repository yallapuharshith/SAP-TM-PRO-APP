import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExamContext } from './ExamContext';
import { calculateScore, isAnswered } from './ScoreCalculator';
import { loadQuestions } from './QuestionService';
import { StorageManager } from './StorageManager';

const EXAM_DURATION_SECONDS = 50 * 60;

const initialState = {
  status: 'idle',
  examMode: 'standard',
  timerEnabled: true,
  questions: [],
  answers: {},
  visited: [],
  markedForReview: [],
  bookmarks: [],
  skipped: [],
  currentIndex: 0,
  startedAt: null,
  submittedAt: null,
  timeRemaining: EXAM_DURATION_SECONDS,
  result: null,
};

function normalizeAnswer(question, answer) {
  if (question.type === 'multiple_correct' || question.type === 'sequence') {
    return Array.isArray(answer) ? answer : [];
  }

  if (question.type === 'match_following') {
    return typeof answer === 'object' && answer !== null ? answer : {};
  }

  return answer ?? '';
}

function ensureUnique(list, item) {
  return list.includes(item) ? list : [...list, item];
}

function removeItem(list, item) {
  return list.filter((value) => value !== item);
}

function withCurrentMarkedVisited(state) {
  const currentQuestion = state.questions[state.currentIndex];
  if (!currentQuestion) {
    return state;
  }

  return {
    ...state,
    visited: ensureUnique(state.visited, currentQuestion.id),
  };
}

export function ExamProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const currentQuestion = state.questions[state.currentIndex] || null;

  const hasActiveSession = useMemo(() => {
    return state.status === 'in_progress' || state.status === 'submitted';
  }, [state.status]);

  const saveStateToStorage = useCallback((nextState) => {
    StorageManager.save({
      ...nextState,
      loading: undefined,
    });
  }, []);

  useEffect(() => {
    if (state.status === 'in_progress' || state.status === 'submitted') {
      saveStateToStorage(state);
    }
  }, [state, saveStateToStorage]);

  useEffect(() => {
    if (state.status !== 'in_progress' || !state.timerEnabled) {
      return undefined;
    }

    const timerId = setInterval(() => {
      setState((prev) => {
        if (prev.status !== 'in_progress') {
          return prev;
        }

        const nextTime = prev.timeRemaining - 1;
        if (nextTime <= 0) {
          const submittedAt = Date.now();
          const result = calculateScore({
            questions: prev.questions,
            answers: prev.answers,
            markedForReview: prev.markedForReview,
            startedAt: prev.startedAt,
            submittedAt,
            durationSeconds: EXAM_DURATION_SECONDS,
          });

          const nextState = {
            ...prev,
            status: 'submitted',
            submittedAt,
            timeRemaining: 0,
            result,
          };
          return nextState;
        }

        return {
          ...prev,
          timeRemaining: nextTime,
        };
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [state.status, state.timerEnabled]);

  const restoreSession = useCallback(async () => {
    const persisted = StorageManager.load();
    if (!persisted || !persisted.questions || persisted.questions.length === 0) {
      return false;
    }

    const inferredAllQuestions = persisted.examMode === 'all_questions'
      || (persisted.examMode == null && Array.isArray(persisted.questions) && persisted.questions.length >= 1000);

    const restoredExamMode = inferredAllQuestions ? 'all_questions' : 'standard';
    const restoredTimerEnabled = inferredAllQuestions
      ? false
      : (typeof persisted.timerEnabled === 'boolean' ? persisted.timerEnabled : true);

    let restoredQuestions = Array.isArray(persisted.questions) ? persisted.questions : [];
    let restoredAnswers = persisted.answers || {};
    let restoredVisited = Array.isArray(persisted.visited) ? persisted.visited : [];
    let restoredMarkedForReview = Array.isArray(persisted.markedForReview) ? persisted.markedForReview : [];
    let restoredBookmarks = Array.isArray(persisted.bookmarks) ? persisted.bookmarks : [];
    let restoredSkipped = Array.isArray(persisted.skipped) ? persisted.skipped : [];
    let restoredCurrentIndex = Number(persisted.currentIndex || 0);

    if (inferredAllQuestions) {
      // Keep all-questions sessions in sync with latest imported question bank.
      const latestQuestions = await loadQuestions({ limit: null });
      const validIds = new Set(latestQuestions.map((question) => question.id));

      restoredQuestions = latestQuestions;
      restoredAnswers = Object.fromEntries(
        Object.entries(restoredAnswers).filter(([questionId]) => validIds.has(questionId))
      );
      restoredVisited = restoredVisited.filter((questionId) => validIds.has(questionId));
      restoredMarkedForReview = restoredMarkedForReview.filter((questionId) => validIds.has(questionId));
      restoredBookmarks = restoredBookmarks.filter((questionId) => validIds.has(questionId));
      restoredSkipped = restoredSkipped.filter((questionId) => validIds.has(questionId));
      restoredCurrentIndex = Math.min(
        Math.max(0, restoredCurrentIndex),
        Math.max(0, latestQuestions.length - 1)
      );
    }

    setState({
      ...initialState,
      ...persisted,
      examMode: restoredExamMode,
      timerEnabled: restoredTimerEnabled,
      questions: restoredQuestions,
      answers: restoredAnswers,
      visited: restoredVisited,
      markedForReview: restoredMarkedForReview,
      bookmarks: restoredBookmarks,
      skipped: restoredSkipped,
      currentIndex: restoredCurrentIndex,
    });
    return true;
  }, []);

  const startExam = useCallback(async (config = {}) => {
    setLoading(true);
    const isAllQuestions = config.useAllQuestions === true;
    const isTopicScoped = config.topicId != null || config.subTopic != null;
    const examMode = isAllQuestions ? 'all_questions' : 'standard';
    const questions = await loadQuestions({
      limit: isAllQuestions || isTopicScoped ? null : 25,
      moduleId: config.moduleId,
      topicId: config.topicId,
      subTopic: config.subTopic,
      difficulties: config.difficulties,
      questionTypes: config.questionTypes,
      tags: config.tags,
    });
    const startedAt = Date.now();

    setState({
      ...initialState,
      status: 'in_progress',
      examMode,
      timerEnabled: examMode !== 'all_questions',
      questions,
      visited: questions[0] ? [questions[0].id] : [],
      startedAt,
      timeRemaining: EXAM_DURATION_SECONDS,
    });
    setLoading(false);
  }, []);

  const continueExam = useCallback(async () => {
    await restoreSession();
  }, [restoreSession]);

  const goToQuestion = useCallback((index) => {
    setState((prev) => {
      if (index < 0 || index >= prev.questions.length) {
        return prev;
      }

      const prepared = withCurrentMarkedVisited(prev);
      const current = prepared.questions[prepared.currentIndex];
      const currentAnswer = current ? prepared.answers[current.id] : undefined;
      const shouldMarkSkipped = current && !isAnswered(current, currentAnswer);

      return {
        ...prepared,
        currentIndex: index,
        skipped: shouldMarkSkipped ? ensureUnique(prepared.skipped, current.id) : prepared.skipped,
        visited: ensureUnique(prepared.visited, prepared.questions[index].id),
      };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setState((prev) => {
      const nextIndex = Math.min(prev.currentIndex + 1, prev.questions.length - 1);
      if (nextIndex === prev.currentIndex) {
        return prev;
      }

      const prepared = withCurrentMarkedVisited(prev);
      const current = prepared.questions[prepared.currentIndex];
      const currentAnswer = current ? prepared.answers[current.id] : undefined;
      const shouldMarkSkipped = current && !isAnswered(current, currentAnswer);

      return {
        ...prepared,
        currentIndex: nextIndex,
        skipped: shouldMarkSkipped ? ensureUnique(prepared.skipped, current.id) : prepared.skipped,
        visited: ensureUnique(prepared.visited, prepared.questions[nextIndex].id),
      };
    });
  }, []);

  const previousQuestion = useCallback(() => {
    setState((prev) => {
      const prevIndex = Math.max(prev.currentIndex - 1, 0);
      if (prevIndex === prev.currentIndex) {
        return prev;
      }

      return {
        ...withCurrentMarkedVisited(prev),
        currentIndex: prevIndex,
        visited: ensureUnique(prev.visited, prev.questions[prevIndex].id),
      };
    });
  }, []);

  const updateAnswer = useCallback((questionId, answer) => {
    setState((prev) => {
      const question = prev.questions.find((item) => item.id === questionId);
      if (!question) {
        return prev;
      }

      const normalized = normalizeAnswer(question, answer);
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: normalized,
        },
        skipped: removeItem(prev.skipped, questionId),
        visited: ensureUnique(prev.visited, questionId),
      };
    });
  }, []);

  const clearAnswer = useCallback((questionId) => {
    setState((prev) => {
      const nextAnswers = { ...prev.answers };
      delete nextAnswers[questionId];
      return {
        ...prev,
        answers: nextAnswers,
      };
    });
  }, []);

  const toggleMarkForReview = useCallback((questionId) => {
    setState((prev) => {
      const marked = prev.markedForReview.includes(questionId)
        ? removeItem(prev.markedForReview, questionId)
        : [...prev.markedForReview, questionId];
      return {
        ...prev,
        markedForReview: marked,
      };
    });
  }, []);

  const toggleBookmark = useCallback((questionId) => {
    setState((prev) => {
      const bookmarks = prev.bookmarks.includes(questionId)
        ? removeItem(prev.bookmarks, questionId)
        : [...prev.bookmarks, questionId];
      return {
        ...prev,
        bookmarks,
      };
    });
  }, []);

  const submitExam = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'in_progress') {
        return prev;
      }

      const submittedAt = Date.now();
      const result = calculateScore({
        questions: prev.questions,
        answers: prev.answers,
        markedForReview: prev.markedForReview,
        startedAt: prev.startedAt,
        submittedAt,
        durationSeconds: EXAM_DURATION_SECONDS,
      });

      return {
        ...prev,
        status: 'submitted',
        submittedAt,
        result,
      };
    });
  }, []);

  const resetExam = useCallback(() => {
    StorageManager.clear();
    setState(initialState);
  }, []);

  const getQuestionStatus = useCallback(
    (questionId) => {
      if (!state.visited.includes(questionId)) {
        return 'not_visited';
      }

      const question = state.questions.find((item) => item.id === questionId);
      const answer = state.answers[questionId];
      const answered = question ? isAnswered(question, answer) : false;

      if (answered) {
        return 'answered';
      }

      if (state.markedForReview.includes(questionId)) {
        return 'marked';
      }

      if (state.skipped.includes(questionId)) {
        return 'skipped';
      }

      return 'visited';
    },
    [state.answers, state.markedForReview, state.questions, state.skipped, state.visited]
  );

  const counts = useMemo(() => {
    const answered = state.questions.reduce((total, question) => {
      const answer = state.answers[question.id];
      return total + (isAnswered(question, answer) ? 1 : 0);
    }, 0);

    return {
      total: state.questions.length,
      answered,
      notAnswered: Math.max(0, state.questions.length - answered),
      marked: state.markedForReview.length,
      visited: state.visited.length,
      remaining: Math.max(0, state.questions.length - state.visited.length),
    };
  }, [state.answers, state.markedForReview.length, state.questions, state.visited.length]);

  const value = useMemo(
    () => ({
      ...state,
      loading,
      counts,
      currentQuestion,
      hasActiveSession,
      examDurationSeconds: EXAM_DURATION_SECONDS,
      restoreSession,
      startExam,
      continueExam,
      goToQuestion,
      nextQuestion,
      previousQuestion,
      updateAnswer,
      clearAnswer,
      toggleMarkForReview,
      toggleBookmark,
      submitExam,
      resetExam,
      getQuestionStatus,
    }),
    [
      state,
      loading,
      counts,
      currentQuestion,
      hasActiveSession,
      restoreSession,
      startExam,
      continueExam,
      goToQuestion,
      nextQuestion,
      previousQuestion,
      updateAnswer,
      clearAnswer,
      toggleMarkForReview,
      toggleBookmark,
      submitExam,
      resetExam,
      getQuestionStatus,
    ]
  );

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}
