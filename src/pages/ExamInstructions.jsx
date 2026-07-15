import { motion } from 'framer-motion';
import { ArrowRight, Info, Keyboard, TimerReset } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useExam } from '../components/exam-engine/ExamContext';
import { knowledgeRepository } from '../services/KnowledgeRepository';

function formatModuleLabel(moduleId, title) {
  const match = String(moduleId || '').match(/module\s*(\d+)/i);
  if (match) {
    return `Module ${match[1]}${title ? ` - ${title}` : ''}`;
  }
  return title || String(moduleId || 'Module');
}

function RuleItem({ icon: Icon, title, text }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 inline-flex rounded-lg bg-primary/15 p-2 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <p className="mt-1 text-xs leading-relaxed text-slate-300">{text}</p>
    </div>
  );
}

function ExamInstructions() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { continueExam, startExam, resetExam, status, counts, loading } = useExam();
  const [modules, setModules] = useState([]);

  const moduleId = params.moduleId || searchParams.get('moduleId') || undefined;
  const rawTopicId = searchParams.get('topicId');
  const topicId = rawTopicId && /^\d+$/.test(rawTopicId) ? Number(rawTopicId) : rawTopicId || undefined;
  const subTopic = searchParams.get('subTopic') || undefined;

  const startRoute = moduleId ? `/exam/module/${moduleId}/test` : '/exam/start';

  const selectedModule = modules.find((item) => item.id === moduleId);

  const examScope = [
    moduleId ? formatModuleLabel(moduleId, selectedModule?.title) : null,
    topicId !== undefined ? `Topic: ${topicId}` : null,
    subTopic ? `Subtopic: ${subTopic}` : null,
  ]
    .filter(Boolean)
    .join(' | ');

  useEffect(() => {
    // Skip automatic session restore for scoped starts to avoid overwriting module/topic test intent.
    if (moduleId || topicId !== undefined || subTopic) {
      return;
    }
    continueExam();
  }, [continueExam, moduleId, subTopic, topicId]);

  useEffect(() => {
    async function loadModules() {
      const moduleIndex = await knowledgeRepository.loadKnowledgeIndex();
      setModules(moduleIndex || []);
    }
    loadModules();
  }, []);

  const start = async () => {
    await startExam({ moduleId, topicId, subTopic });
    navigate(startRoute);
  };

  const startAllQuestions = async () => {
    resetExam();
    await startExam({ useAllQuestions: true });
    navigate('/exam/start');
  };

  const resume = () => {
    navigate(startRoute);
  };

  const startModuleWise = async (selectedModuleId) => {
    navigate(`/exam/module/${selectedModuleId}`);
  };

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl border border-white/10 p-6 shadow-soft"
      >
        <h3 className="text-xl font-semibold text-white">SAP TM Certification Mock Exam</h3>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          This exam simulates a professional SAP TM assessment environment. Answers are auto-saved instantly. Use the palette to navigate and mark questions for review.
        </p>
        {examScope ? (
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-accent">{examScope}</p>
        ) : null}

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <RuleItem
            icon={TimerReset}
            title="Duration"
            text="50 minutes countdown. At 5 minutes timer turns warning and at 1 minute enters critical mode."
          />
          <RuleItem
            icon={Keyboard}
            title="Shortcuts"
            text="Use Arrow Left and Arrow Right for fast navigation between questions."
          />
          <RuleItem
            icon={Info}
            title="Scoring"
            text="Each question contains marks and negative marks. Final score includes topic, difficulty and type analytics."
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={start}
            className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-70 sm:w-auto"
          >
            Start Fresh <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={startAllQuestions}
            className="w-full min-h-11 rounded-xl border border-primary/50 bg-primary/15 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/25 disabled:opacity-70 sm:w-auto"
          >
            All Questions Test
          </button>
          {status === 'in_progress' && (
            <button
              type="button"
              onClick={resume}
              className="w-full min-h-11 rounded-xl border border-warning/50 bg-warning/20 px-4 py-2.5 text-sm font-semibold text-warning sm:w-auto"
            >
              Continue Exam ({counts.answered}/{counts.total} answered)
            </button>
          )}
        </div>

        {modules.length > 0 ? (
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Module-wise</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {modules.map((module) => (
                <button
                  key={module.id}
                  type="button"
                  disabled={loading}
                  onClick={() => startModuleWise(module.id)}
                  className="min-h-11 rounded-md border border-white/15 bg-slate-800/70 px-3 py-2 text-sm text-slate-200 hover:border-accent/50 hover:text-white disabled:opacity-60 sm:min-h-0 sm:px-2.5 sm:py-1.5 sm:text-xs"
                >
                  {formatModuleLabel(module.id, module.title)}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </motion.section>
    </div>
  );
}

export default ExamInstructions;
