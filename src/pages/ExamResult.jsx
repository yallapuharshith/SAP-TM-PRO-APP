import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReviewModal from '../components/exam/ReviewModal';
import { useExam } from '../components/exam-engine/ExamContext';

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function AnalyticsTable({ title, data }) {
  const rows = Object.entries(data || {});

  return (
    <div className="glass-card rounded-2xl border border-white/10 p-4 shadow-soft">
      <h4 className="mb-3 text-sm font-semibold text-white">{title}</h4>
      <div className="space-y-2">
        {rows.map(([label, values]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-200">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-semibold text-slate-100">{label}</span>
              <span>{values.correct}/{values.total} correct</span>
            </div>
            <p className="text-slate-400">Wrong: {values.wrong} · Skipped: {values.skipped}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value, tone }) {
  const toneClass = {
    primary: 'border-primary/40 bg-primary/15 text-primary',
    success: 'border-success/40 bg-success/15 text-success',
    warning: 'border-warning/40 bg-warning/15 text-warning',
    danger: 'border-danger/40 bg-danger/15 text-danger',
    neutral: 'border-white/15 bg-white/10 text-slate-100',
  };

  return (
    <div className={`rounded-xl border p-3 ${toneClass[tone]}`}>
      <p className="text-xs uppercase tracking-wide">{title}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

function ExamResult() {
  const navigate = useNavigate();
  const { result, questions, answers, resetExam, status } = useExam();
  const [reviewQuestionId, setReviewQuestionId] = useState(null);

  useEffect(() => {
    if (status !== 'submitted' || !result) {
      navigate('/exam');
    }
  }, [navigate, result, status]);

  const reviewQuestion = useMemo(() => {
    return questions.find((question) => question.id === reviewQuestionId) || null;
  }, [questions, reviewQuestionId]);

  if (status !== 'submitted' || !result) {
    return null;
  }

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl border border-white/10 p-6 shadow-soft"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-white">Exam Result</h3>
            <p className="mt-1 text-sm text-slate-300">Comprehensive performance overview and review mode.</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${result.passed ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
            {result.passed ? 'PASS' : 'FAIL'}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard title="Score" value={`${result.obtainedMarks}/${result.maxMarks}`} tone="primary" />
          <StatCard title="Percentage" value={`${result.percentage}%`} tone="success" />
          <StatCard title="Correct" value={result.correctCount} tone="success" />
          <StatCard title="Wrong" value={result.wrongCount} tone="danger" />
          <StatCard title="Skipped" value={result.skippedCount} tone="warning" />
          <StatCard title="Accuracy" value={`${result.accuracy}%`} tone="primary" />
          <StatCard title="Time Taken" value={formatTime(result.timeTakenSeconds)} tone="neutral" />
          <StatCard title="Marked" value={result.markedCount} tone="warning" />
          <StatCard title="Total" value={result.totalQuestions} tone="neutral" />
        </div>
      </motion.section>

      <section className="grid gap-4 lg:grid-cols-3">
        <AnalyticsTable title="Topic Wise" data={result.analytics.byTopic} />
        <AnalyticsTable title="Difficulty Wise" data={result.analytics.byDifficulty} />
        <AnalyticsTable title="Question Type Wise" data={result.analytics.byType} />
      </section>

      <section className="glass-card rounded-2xl border border-white/10 p-5 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white">Review Answers</h4>
          <button
            type="button"
            onClick={() => {
              resetExam();
              navigate('/exam');
            }}
            className="rounded-xl bg-gradient-to-r from-primary to-accent px-3 py-2 text-xs font-semibold text-white"
          >
            Attempt New Exam
          </button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {questions.map((question, index) => {
            const detail = result.questionDetails.find((item) => item.questionId === question.id);
            const tone = !detail.answered
              ? 'border-slate-500/30 bg-slate-700/20 text-slate-200'
              : detail.correct
                ? 'border-success/35 bg-success/15 text-success'
                : 'border-danger/35 bg-danger/15 text-danger';

            return (
              <button
                key={question.id}
                type="button"
                onClick={() => setReviewQuestionId(question.id)}
                className={`rounded-xl border p-3 text-left text-xs transition-all hover:brightness-110 ${tone}`}
              >
                <p className="font-semibold">Q{index + 1}. {question.topic}</p>
                <p className="mt-1 opacity-90">{detail.correct ? 'Correct' : detail.answered ? 'Wrong' : 'Skipped'}</p>
              </button>
            );
          })}
        </div>
      </section>

      <ReviewModal
        open={Boolean(reviewQuestion)}
        question={reviewQuestion}
        yourAnswer={reviewQuestion ? answers[reviewQuestion.id] : null}
        onClose={() => setReviewQuestionId(null)}
      />
    </div>
  );
}

export default ExamResult;
