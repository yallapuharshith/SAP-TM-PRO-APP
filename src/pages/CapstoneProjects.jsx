import { BriefcaseBusiness, ListTree } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import LearningObjectives from '../components/study-notes/LearningObjectives';
import StudyRenderer from '../components/study-notes/StudyRenderer';
import TopicNavigation from '../components/study-notes/TopicNavigation';
import { caseStudiesService } from '../services/CaseStudiesService';

function CapstoneProjects() {
  const [moduleTree, setModuleTree] = useState([]);
  const [collapsed, setCollapsed] = useState({});
  const [activeTopicId, setActiveTopicId] = useState(null);

  useEffect(() => {
    async function load() {
      const tree = await caseStudiesService.loadModuleTree();
      setModuleTree(tree);
      setCollapsed(
        tree.reduce(
          (acc, module, index) => ({
            ...acc,
            [module.id]: index !== 0,
          }),
          {}
        )
      );

      const firstTopic = tree[0]?.topics?.[0] || null;
      if (firstTopic?.id) {
        setActiveTopicId((prev) => prev || firstTopic.id);
      }
    }

    load();
  }, []);

  const allTopics = useMemo(() => moduleTree.flatMap((module) => module.topics || []), [moduleTree]);
  const activeTopic = useMemo(
    () => allTopics.find((topic) => topic.id === activeTopicId) || allTopics[0] || null,
    [activeTopicId, allTopics]
  );

  const activeTopicIndex = useMemo(
    () => allTopics.findIndex((topic) => topic.id === activeTopic?.id),
    [activeTopic?.id, allTopics]
  );

  const previousTopic = activeTopicIndex > 0 ? allTopics[activeTopicIndex - 1] : null;
  const nextTopic =
    activeTopicIndex >= 0 && activeTopicIndex < allTopics.length - 1 ? allTopics[activeTopicIndex + 1] : null;

  const toggleModule = (moduleId) => {
    setCollapsed((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  if (!activeTopic) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Capstone Case Studies</h3>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
          No case studies available yet.
        </p>
      </section>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[280px,1fr]">
      <aside className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 xl:sticky xl:top-24 xl:h-fit">
        <div className="flex items-center gap-2">
          <BriefcaseBusiness className="h-4 w-4 text-success" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Case Study Modules</h3>
        </div>

        {moduleTree.map((module) => (
          <div key={module.id} className="rounded-xl border border-white/10 bg-white/5">
            <button
              type="button"
              onClick={() => toggleModule(module.id)}
              className="flex min-h-11 w-full items-center justify-between px-3 py-2 text-left"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                {module.title}
              </span>
              <ListTree className="h-4 w-4 text-slate-500" />
            </button>

            {!collapsed[module.id] ? (
              <div className="space-y-1 border-t border-white/10 p-2">
                {(module.topics || []).map((topic) => {
                  const active = topic.id === activeTopic?.id;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => setActiveTopicId(topic.id)}
                      className={`w-full rounded-lg px-2 py-2 text-left text-xs transition ${
                        active
                          ? 'bg-success/20 text-slate-900 dark:text-white'
                          : 'bg-white/5 text-slate-700 hover:bg-white/10 dark:text-slate-300'
                      }`}
                    >
                      {topic.title}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        ))}
      </aside>

      <main>
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-success">Capstone Case Study</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{activeTopic.title}</h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            Build consultant-level architecture, realization and testing decisions through phased project simulation.
          </p>
        </section>

        <LearningObjectives objectives={activeTopic.learningObjectives} />
        <StudyRenderer topic={activeTopic} />

        <TopicNavigation
          hasPrevious={Boolean(previousTopic)}
          hasNext={Boolean(nextTopic)}
          onPrevious={() => previousTopic && setActiveTopicId(previousTopic.id)}
          onNext={() => nextTopic && setActiveTopicId(nextTopic.id)}
          onMarkComplete={() => {}}
          isCompleted={false}
        />
      </main>
    </div>
  );
}

export default CapstoneProjects;
