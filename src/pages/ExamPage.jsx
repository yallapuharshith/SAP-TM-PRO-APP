import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExamHeader from '../components/exam/ExamHeader';
import QuestionCard from '../components/exam/QuestionCard';
import QuestionFooter from '../components/exam/QuestionFooter';
import QuestionNavigator from '../components/exam/QuestionNavigator';
import QuestionPalette from '../components/exam/QuestionPalette';
import SubmitModal from '../components/exam/SubmitModal';
import { useExam } from '../components/exam-engine/ExamContext';

function ExamPage() {
  const navigate = useNavigate();
  const [submitOpen, setSubmitOpen] = useState(false);
  const {
    status,
    questions,
    currentIndex,
    currentQuestion,
    answers,
    counts,
    timeRemaining,
    timerEnabled,
    markedForReview,
    bookmarks,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    updateAnswer,
    toggleMarkForReview,
    toggleBookmark,
    submitExam,
    getQuestionStatus,
  } = useExam();

  useEffect(() => {
    if (status !== 'in_progress' || questions.length === 0) {
      navigate('/exam');
    }
  }, [navigate, questions.length, status]);

  useEffect(() => {
    if (status === 'submitted') {
      navigate('/exam/result');
    }
  }, [navigate, status]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight') {
        nextQuestion();
      }
      if (event.key === 'ArrowLeft') {
        previousQuestion();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [nextQuestion, previousQuestion]);

  const currentAnswer = useMemo(() => {
    if (!currentQuestion) {
      return undefined;
    }
    return answers[currentQuestion.id];
  }, [answers, currentQuestion]);

  const onSubmitConfirm = () => {
    submitExam();
    setSubmitOpen(false);
    navigate('/exam/result');
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <ExamHeader
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          total={questions.length}
          timeRemaining={timeRemaining}
          timerEnabled={timerEnabled}
          counts={counts}
          isBookmarked={bookmarks.includes(currentQuestion.id)}
          isMarkedForReview={markedForReview.includes(currentQuestion.id)}
        />

        <QuestionNavigator
          currentIndex={currentIndex}
          total={questions.length}
          onPrevious={previousQuestion}
          onNext={nextQuestion}
        />

        <QuestionCard
          question={currentQuestion}
          answer={currentAnswer}
          onChange={(answer) => updateAnswer(currentQuestion.id, answer)}
        />

        <QuestionFooter
          onPrevious={previousQuestion}
          onNext={nextQuestion}
          onMarkReview={() => toggleMarkForReview(currentQuestion.id)}
          onBookmark={() => toggleBookmark(currentQuestion.id)}
          onSave={() => goToQuestion(currentIndex)}
          onSubmit={() => setSubmitOpen(true)}
        />
      </div>

      <QuestionPalette
        questions={questions}
        currentIndex={currentIndex}
        getStatus={getQuestionStatus}
        onJump={goToQuestion}
      />

      <SubmitModal
        open={submitOpen}
        counts={counts}
        onCancel={() => setSubmitOpen(false)}
        onConfirm={onSubmitConfirm}
      />
    </div>
  );
}

export default ExamPage;
