import { motion } from 'framer-motion';
import { BookOpenText, BrainCircuit, FolderKanban, Layers2, Route } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ProgressCard from '../components/cards/ProgressCard';
import { knowledgeRepository } from '../services/KnowledgeRepository';
import { studyService } from '../services/StudyService';
import { topicService } from '../services/TopicService';

const moduleIcons = [BookOpenText, BrainCircuit, FolderKanban, Layers2, Route];

function formatModuleLabel(moduleId, title) {
  const match = String(moduleId || '').match(/module\s*(\d+)/i);
  if (match) {
    return `Module ${match[1]}${title ? ` - ${title}` : ''}`;
  }
  return title || String(moduleId || 'Module');
}

function normalizeModuleId(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `module${value}`;
  }

  const raw = String(value || '').trim();
  if (/^\d+$/.test(raw)) {
    return `module${raw}`;
  }

  return raw;
}

function optionText(option) {
  if (typeof option === 'string') {
    return option;
  }
  return option?.text || option?.label || String(option?.id || '');
}

function optionTextById(options, id) {
  const list = Array.isArray(options) ? options : [];
  const match = list.find((option) => String(option?.id) === String(id));
  return match ? optionText(match) : String(id ?? 'N/A');
}

function Study() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [modules, setModules] = useState([]);
  const [learningTree, setLearningTree] = useState([]);
  const [summary, setSummary] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [revisionItems, setRevisionItems] = useState([]);

  useEffect(() => {
    async function loadStudyData() {
      const [moduleIndex, tree, dashboardSummary, questionBank, revisionBank] = await Promise.all([
        knowledgeRepository.loadKnowledgeIndex(),
        topicService.getLearningTree(),
        studyService.getDashboardSummary(),
        knowledgeRepository.loadAllQuestions(),
        knowledgeRepository.loadAllRevision(),
      ]);

      setModules(moduleIndex);
      setLearningTree(tree);
      setSummary(dashboardSummary);
      setAllQuestions(Array.isArray(questionBank) ? questionBank : []);
      setRevisionItems(Array.isArray(revisionBank) ? revisionBank : []);
    }

    loadStudyData();
  }, []);

  useEffect(() => {
    const section = searchParams.get('section') || location.hash?.replace('#', '').trim();
    if (!section) {
      return;
    }

    const timer = setTimeout(() => {
      const target = document.getElementById(section);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);

    return () => clearTimeout(timer);
  }, [location.hash, location.search, searchParams]);

  const moduleProgress = useMemo(() => {
    const completionMap = new Map(
      (summary?.certificationReadinessDetail?.moduleCompletion || []).map((item) => [item.id, item.completion])
    );

    return modules.map((module, index) => ({
      id: module.id,
      title: formatModuleLabel(module.id, module.title),
      subtitle: module.description,
      progress: Math.round(completionMap.get(module.id) || 0),
      icon: moduleIcons[index % moduleIcons.length],
    }));
  }, [modules, summary]);

  const notesByModule = useMemo(() => {
    return modules.map((module) => {
      const items = allQuestions
        .filter((question) => normalizeModuleId(question.module) === module.id && question.explanation)
        .map((question) => ({
          id: question.id,
          topic: question.topic,
          question: question.question,
          explanation: question.explanation,
          options: Array.isArray(question.options) ? question.options : [],
          answer: question.answer ?? question.correctAnswer,
        }));

      return {
        module,
        items,
      };
    });
  }, [allQuestions, modules]);

  const revisionByModule = useMemo(() => {
    return modules.map((module) => {
      const items = revisionItems.filter((item) => normalizeModuleId(item.module) === module.id);
      return {
        module,
        items,
      };
    });
  }, [modules, revisionItems]);

  const startExam = (params = {}) => {
    const search = new URLSearchParams();
    if (params.moduleId) {
      const moduleValue = String(params.moduleId);
      if (params.topicId == null && params.subTopic == null) {
        navigate(`/exam/module/${moduleValue}`);
        return;
      }

      search.set('moduleId', moduleValue);
    }
    if (params.topicId !== undefined && params.topicId !== null && String(params.topicId).length > 0) {
      search.set('topicId', String(params.topicId));
    }
    if (params.subTopic !== undefined && params.subTopic !== null && String(params.subTopic).trim().length > 0) {
      search.set('subTopic', String(params.subTopic));
    }
    const query = search.toString();
    if (params.moduleId) {
      navigate(query ? `/exam/module/${params.moduleId}?${query}` : `/exam/module/${params.moduleId}`);
      return;
    }

    navigate(query ? `/exam?${query}` : '/exam');
  };

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl border border-white/10 p-6 shadow-soft"
      >
        <h3 className="text-lg font-semibold text-white">Study Planner</h3>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Module -&gt; Unit -&gt; Topic -&gt; Notes -&gt; Revision -&gt; Practice pipeline is now fully data-driven from storage/knowledge modules.
        </p>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {moduleProgress.map((module) => (
          <motion.article
            key={module.id}
            whileHover={{ y: -3 }}
            className="glass-card rounded-2xl border border-white/10 p-5 shadow-soft"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-accent/15 p-2 text-accent">
                <module.icon className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-semibold text-white">{module.title}</h4>
            </div>
            <ProgressCard title="Completion" progress={module.progress} subtitle={module.subtitle} />
            <div className="mt-3">
              <button
                type="button"
                onClick={() => startExam({ moduleId: module.id })}
                className="rounded-lg border border-primary/40 bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/30"
              >
                Module-wise Test
              </button>
            </div>
          </motion.article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {learningTree.map((entry) => (
          <motion.article
            key={entry.module.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl border border-white/10 p-5 shadow-soft"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-white">{formatModuleLabel(entry.module.id, entry.module.title)}</h4>
                <p className="mt-1 text-xs text-slate-400">{entry.module.description}</p>
              </div>
              <button
                type="button"
                onClick={() => startExam({ moduleId: entry.module.id })}
                className="rounded-lg border border-primary/40 bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/30"
              >
                Start Module Test
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {Object.entries(entry.units).map(([unit, topics]) => (
                <div key={unit} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">{unit}</p>
                    <p className="text-xs text-slate-400">{topics.length} topics</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {topics.map((topic) => (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() =>
                          startExam({
                            moduleId: entry.module.id,
                            topicId: topic.topicId,
                          })
                        }
                        className="rounded-md border border-white/15 bg-slate-800/70 px-2 py-1 text-xs text-slate-200 hover:border-accent/50 hover:text-white"
                        title={`Start topic-wise exam: ${topic.title || topic.id}`}
                      >
                        {topic.title || topic.id} ({topic.questionCount})
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.article>
        ))}
      </section>

      <section id="notes" className="glass-card rounded-2xl border border-white/10 p-5 shadow-soft">
        <h4 className="text-base font-semibold text-white">Notes Section (Question Explanations)</h4>
        <p className="mt-1 text-sm text-slate-300">
          Every question explanation is available module-wise for quick revision and interview prep.
        </p>

        <div className="mt-4 space-y-3">
          {notesByModule.map((entry) => (
            <details key={entry.module.id} className="rounded-xl border border-white/10 bg-white/5 p-3" open={entry.module.id === modules[0]?.id}>
              <summary className="cursor-pointer list-none text-sm font-semibold text-white">
                {formatModuleLabel(entry.module.id, entry.module.title)} ({entry.items.length} explanations)
              </summary>

              <div className="mt-3 max-h-[26rem] space-y-2 overflow-y-auto pr-1">
                {entry.items.length === 0 ? (
                  <p className="text-xs text-slate-400">No explanations available for this module yet.</p>
                ) : (
                  entry.items.map((item, itemIndex) => {
                    const answerLabel = Array.isArray(item.answer)
                      ? item.answer.map((value) => optionTextById(item.options, value)).join(', ')
                      : optionTextById(item.options, item.answer);

                    return (
                      <article key={`${entry.module.id}-${item.id}-${itemIndex}`} className="rounded-lg border border-white/10 bg-slate-900/35 p-3">
                        <p className="text-xs uppercase tracking-wide text-accent">{item.id} - {item.topic || 'General'}</p>
                        <p className="mt-1 text-sm font-medium text-slate-100">{item.question}</p>
                        {item.options.length > 0 ? (
                          <ul className="mt-2 space-y-1 text-xs text-slate-300">
                            {item.options.map((option, index) => (
                              <li key={`${item.id}-opt-${index}`}>{index + 1}. {optionText(option)}</li>
                            ))}
                          </ul>
                        ) : null}
                        <p className="mt-2 text-xs text-slate-300"><span className="font-semibold text-slate-100">Answer:</span> {answerLabel}</p>
                        <p className="mt-1 text-xs text-slate-300"><span className="font-semibold text-slate-100">Explanation:</span> {item.explanation}</p>
                      </article>
                    );
                  })
                )}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section id="revision" className="glass-card rounded-2xl border border-white/10 p-5 shadow-soft">
        <h4 className="text-base font-semibold text-white">Revision Section (Module-wise)</h4>
        <p className="mt-1 text-sm text-slate-300">
          Revision points are organized by module for fast recap before mock tests.
        </p>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {revisionByModule.map((entry) => (
            <article key={entry.module.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-2">
                <h5 className="text-sm font-semibold text-white">{formatModuleLabel(entry.module.id, entry.module.title)}</h5>
                <button
                  type="button"
                  onClick={() => startExam({ moduleId: entry.module.id })}
                  className="rounded-lg border border-primary/40 bg-primary/20 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/30"
                >
                  Practice Module
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {entry.items.length === 0 ? (
                  <p className="text-xs text-slate-400">No dedicated revision cards found. Use module-wise questions for revision.</p>
                ) : (
                  entry.items.map((item, itemIndex) => (
                    <div key={`${entry.module.id}-${item.id}-${itemIndex}`} className="rounded-lg border border-white/10 bg-slate-900/35 p-3">
                      <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-300">{item.summary}</p>
                      {Array.isArray(item.checklist) && item.checklist.length > 0 ? (
                        <ul className="mt-2 space-y-1 text-xs text-slate-300">
                          {item.checklist.map((point, index) => (
                            <li key={`${item.id}-check-${index}`}>{index + 1}. {point}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Study;
