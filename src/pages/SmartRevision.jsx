import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, GitBranch } from 'lucide-react';
import { knowledgeRepository } from '../services/KnowledgeRepository';
import { topicService } from '../services/TopicService';

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

function flattenTopics(units = {}) {
  return Object.entries(units).flatMap(([unit, topics]) =>
    (Array.isArray(topics) ? topics : []).map((topic) => ({
      ...topic,
      unit,
      label: topic.title || topic.topicLabel || topic.topicId || topic.id,
    }))
  );
}

function TopicLinkageDiagram({ topics, moduleId, onStartTopic }) {
  if (!topics.length) {
    return (
      <p className="text-xs text-slate-400">No topic graph available for this module yet.</p>
    );
  }

  return (
    <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
      {topics.map((topic, index) => {
        const isLast = index === topics.length - 1;
        return (
          <div key={`${topic.id}-${index}`} className="relative pl-9">
            {!isLast && (
              <span className="absolute left-[14px] top-6 h-[calc(100%+0.35rem)] w-[2px] bg-gradient-to-b from-primary/70 to-accent/70" />
            )}
            <span className="absolute left-[8px] top-2 inline-flex h-4 w-4 items-center justify-center rounded-full border border-primary/60 bg-primary/25 text-[10px] text-primary">
              {index + 1}
            </span>
            <button
              type="button"
              onClick={() => onStartTopic(moduleId, topic)}
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-left transition hover:border-accent/50 hover:bg-white/10"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">{topic.label}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{topic.unit} · {topic.questionCount || 0} questions</p>
                </div>
                {!isLast ? <ArrowRight className="mt-0.5 h-3.5 w-3.5 text-accent" /> : null}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}

function SmartRevision() {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [learningTree, setLearningTree] = useState([]);
  const [revisionItems, setRevisionItems] = useState([]);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    async function loadData() {
      const [moduleIndex, tree, revisions, questionBank] = await Promise.all([
        knowledgeRepository.loadKnowledgeIndex(),
        topicService.getLearningTree(),
        knowledgeRepository.loadAllRevision(),
        knowledgeRepository.loadAllQuestions(),
      ]);

      setModules(moduleIndex || []);
      setLearningTree(Array.isArray(tree) ? tree : []);
      setRevisionItems(Array.isArray(revisions) ? revisions : []);
      setQuestions(Array.isArray(questionBank) ? questionBank : []);
    }

    loadData();
  }, []);

  const revisionByModule = useMemo(() => {
    const treeByModule = new Map(learningTree.map((entry) => [entry.module.id, entry.units]));

    return modules.map((module) => {
      const moduleRevision = revisionItems.filter((item) => normalizeModuleId(item.module) === module.id);
      const moduleQuestionExplanations = questions.filter(
        (question) => normalizeModuleId(question.module) === module.id && question.explanation
      );
      const topics = flattenTopics(treeByModule.get(module.id) || {});

      return {
        module,
        revisionCount: moduleRevision.length,
        explanationCount: moduleQuestionExplanations.length,
        topicCount: topics.length,
        topics,
      };
    });
  }, [learningTree, modules, questions, revisionItems]);

  const startTopicExam = (moduleId, topic) => {
    const topicId = topic?.topicId ?? topic?.id;
    if (!topicId) {
      navigate(`/exam/module/${moduleId}`);
      return;
    }

    const query = new URLSearchParams({ topicId: String(topicId) }).toString();
    navigate(`/exam/module/${moduleId}?${query}`);
  };

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl border border-white/10 p-6 shadow-soft"
      >
        <h3 className="text-xl font-semibold text-white">Smart Revision</h3>
        <p className="mt-2 text-sm text-slate-300">
          Module-wise visual linkage maps showing all topics in a connected revision flow.
        </p>
      </motion.section>

      <section className="grid gap-4 xl:grid-cols-1">
        {revisionByModule.map((entry) => (
          <article key={entry.module.id} className="glass-card rounded-2xl border border-white/10 p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-white">{formatModuleLabel(entry.module.id, entry.module.title)}</h4>
                <p className="mt-1 text-xs text-slate-400">
                  {entry.topicCount} topics linked · {entry.revisionCount} revision cards · {entry.explanationCount} explained questions
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/exam/module/${entry.module.id}`)}
                className="rounded-lg border border-primary/40 bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/30"
              >
                Start Module Test
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/25 p-3">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent">
                <GitBranch className="h-3.5 w-3.5" />
                Topic Linkage Diagram
              </div>
              <TopicLinkageDiagram
                topics={entry.topics}
                moduleId={entry.module.id}
                onStartTopic={startTopicExam}
              />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default SmartRevision;
