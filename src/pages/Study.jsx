import { motion } from 'framer-motion';
import { BookOpenText, BrainCircuit, FolderKanban, Layers2, Route } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

function Study() {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [learningTree, setLearningTree] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    async function loadStudyData() {
      const [moduleIndex, tree, dashboardSummary] = await Promise.all([
        knowledgeRepository.loadKnowledgeIndex(),
        topicService.getLearningTree(),
        studyService.getDashboardSummary(),
      ]);

      setModules(moduleIndex);
      setLearningTree(tree);
      setSummary(dashboardSummary);
    }

    loadStudyData();
  }, []);

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

  const startExam = (params = {}) => {
    const search = new URLSearchParams();
    if (params.moduleId) {
      search.set('moduleId', String(params.moduleId));
    }
    if (params.topicId !== undefined && params.topicId !== null && String(params.topicId).length > 0) {
      search.set('topicId', String(params.topicId));
    }
    if (params.subTopic !== undefined && params.subTopic !== null && String(params.subTopic).trim().length > 0) {
      search.set('subTopic', String(params.subTopic));
    }
    const query = search.toString();
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
                            subTopic: topic.filterSubTopic,
                          })
                        }
                        className="rounded-md border border-white/15 bg-slate-800/70 px-2 py-1 text-xs text-slate-200 hover:border-accent/50 hover:text-white"
                        title={`Start topic-wise exam: ${topic.title || topic.id}`}
                      >
                        {topic.title || topic.id}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.article>
        ))}
      </section>
    </div>
  );
}

export default Study;
