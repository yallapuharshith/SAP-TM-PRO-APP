import { FlaskConical, ListTree } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LearningObjectives from '../components/study-notes/LearningObjectives';
import ReadingProgress from '../components/study-notes/ReadingProgress';
import StudyRenderer from '../components/study-notes/StudyRenderer';
import TopicNavigation from '../components/study-notes/TopicNavigation';
import { handsOnLabsService } from '../services/HandsOnLabsService';

const PROGRESS_KEY = 'sap-tm-master-pro-hands-on-progress-v1';
const COMPLETED_KEY = 'sap-tm-master-pro-hands-on-completed-v1';
const TIME_SPENT_KEY = 'sap-tm-master-pro-hands-on-time-spent-v1';

function readMap(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function contentTextLength(section) {
  const blocks = Array.isArray(section?.content) ? section.content : [];
  return blocks.reduce((sum, block) => {
    if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'callout') {
      return sum + String(block.text || block.content || '').length;
    }
    if (block.type === 'list' || block.type === 'bullet-list' || block.type === 'numbered-list') {
      return sum + (Array.isArray(block.items) ? block.items.join(' ').length : 0);
    }
    if (block.type === 'table') {
      const rows = Array.isArray(block.rows) ? block.rows.flat().join(' ') : '';
      return sum + rows.length;
    }
    return sum;
  }, 0);
}

function inferReadMinutes(topic) {
  if (Number(topic?.estimatedMinutes) > 0) {
    return Number(topic.estimatedMinutes);
  }
  const totalChars = (topic?.sections || []).reduce((sum, section) => sum + contentTextLength(section), 0);
  return Math.max(5, Math.round(totalChars / 900));
}

function HandsOnLabs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [moduleTree, setModuleTree] = useState([]);
  const [collapsed, setCollapsed] = useState({});
  const [progressMap, setProgressMap] = useState(() => readMap(PROGRESS_KEY));
  const [completedMap, setCompletedMap] = useState(() => readMap(COMPLETED_KEY));
  const [timeSpentMap, setTimeSpentMap] = useState(() => readMap(TIME_SPENT_KEY));
  const contentRef = useRef(null);

  useEffect(() => {
    async function load() {
      const tree = await handsOnLabsService.loadModuleTree();
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
    }

    load();
  }, []);

  const allLabs = useMemo(() => moduleTree.flatMap((module) => module.topics || []), [moduleTree]);
  const labFromQuery = searchParams.get('lab');

  const activeLab = useMemo(() => {
    if (labFromQuery) {
      const selected = allLabs.find((topic) => topic.id === labFromQuery);
      if (selected) {
        return selected;
      }
    }

    return allLabs[0] || null;
  }, [allLabs, labFromQuery]);

  useEffect(() => {
    if (!activeLab?.id) {
      return;
    }

    const next = new URLSearchParams();
    next.set('lab', activeLab.id);
    const nextQuery = next.toString();

    if (searchParams.toString() === nextQuery) {
      return;
    }

    setSearchParams(next, { replace: true });
  }, [activeLab?.id, searchParams, setSearchParams]);

  useEffect(() => {
    if (!activeLab) {
      return undefined;
    }

    const handleScroll = () => {
      const target = contentRef.current;
      if (!target) {
        return;
      }

      const rect = target.getBoundingClientRect();
      const viewport = window.innerHeight || document.documentElement.clientHeight;
      const total = Math.max(1, rect.height - viewport * 0.45);
      const consumed = Math.min(total, Math.max(0, -rect.top + viewport * 0.2));
      const percent = Math.max(0, Math.min(100, Math.round((consumed / total) * 100)));

      setProgressMap((prev) => {
        if (prev[activeLab.id] === percent) {
          return prev;
        }

        const next = { ...prev, [activeLab.id]: percent };
        writeMap(PROGRESS_KEY, next);
        return next;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [activeLab]);

  useEffect(() => {
    if (!activeLab?.id) {
      return undefined;
    }

    const interval = setInterval(() => {
      setTimeSpentMap((prev) => {
        const next = {
          ...prev,
          [activeLab.id]: Number(prev[activeLab.id] || 0) + 1,
        };
        writeMap(TIME_SPENT_KEY, next);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeLab?.id]);

  const toggleModule = (moduleId) => {
    setCollapsed((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const activeLabIndex = useMemo(
    () => allLabs.findIndex((topic) => topic.id === activeLab?.id),
    [activeLab?.id, allLabs]
  );

  const previousLab = activeLabIndex > 0 ? allLabs[activeLabIndex - 1] : null;
  const nextLab = activeLabIndex >= 0 && activeLabIndex < allLabs.length - 1 ? allLabs[activeLabIndex + 1] : null;

  const activeProgress = Number(progressMap[activeLab?.id] || 0);
  const completionPercent = Math.round(
    allLabs.length ? (Object.keys(completedMap).filter((id) => completedMap[id]).length / allLabs.length) * 100 : 0
  );

  if (!activeLab) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Hands-on Labs</h3>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
          No hands-on lab content is available yet.
        </p>
      </section>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[280px,1fr]">
      <aside className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 xl:sticky xl:top-24 xl:h-fit">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Hands-on Modules</h3>
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
                  const active = topic.id === activeLab?.id;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => setSearchParams({ lab: topic.id })}
                      className={`w-full rounded-lg px-2 py-2 text-left text-xs transition ${
                        active
                          ? 'bg-primary/20 text-slate-900 dark:text-white'
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

      <main ref={contentRef}>
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">Hands-on Lab</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{activeLab.title}</h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            Complete this guided practical lab independent of Study Notes and Viva content.
          </p>
        </section>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ReadingProgress
            progressPercent={activeProgress}
            completionPercent={completionPercent}
            completedSections={activeProgress >= 98 ? activeLab.sections.length : 0}
            totalSections={activeLab.sections.length}
            timeSpentSeconds={Number(timeSpentMap[activeLab.id] || 0)}
          />
          <LearningObjectives objectives={activeLab.learningObjectives} className="mt-0" />
        </div>

        <StudyRenderer topic={activeLab} />

        <TopicNavigation
          hasPrevious={Boolean(previousLab)}
          hasNext={Boolean(nextLab)}
          onPrevious={() => previousLab && setSearchParams({ lab: previousLab.id })}
          onNext={() => nextLab && setSearchParams({ lab: nextLab.id })}
          onMarkComplete={() => {
            setCompletedMap((prev) => {
              const next = { ...prev, [activeLab.id]: !prev[activeLab.id] };
              writeMap(COMPLETED_KEY, next);
              return next;
            });
          }}
          isCompleted={Boolean(completedMap[activeLab.id])}
        />
      </main>
    </div>
  );
}

export default HandsOnLabs;
