import { motion } from 'framer-motion';
import {
  BookMarked,
  ExternalLink,
  ListOrdered,
  ListTree,
  StickyNote,
  Timer,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LearningObjectives from '../components/study-notes/LearningObjectives';
import ReadingProgress from '../components/study-notes/ReadingProgress';
import RelatedLearning from '../components/study-notes/RelatedLearning';
import StudyRenderer from '../components/study-notes/StudyRenderer';
import TopicNavigation from '../components/study-notes/TopicNavigation';
import { studyNotesService } from '../services/StudyNotesService';

const PROGRESS_KEY = 'sap-tm-master-pro-study-notes-progress-v1';
const BOOKMARKS_KEY = 'sap-tm-master-pro-study-notes-bookmarks-v1';
const NOTES_KEY = 'sap-tm-master-pro-study-notes-personal-notes-v1';
const COMPLETED_KEY = 'sap-tm-master-pro-study-notes-completed-v1';
const TIME_SPENT_KEY = 'sap-tm-master-pro-study-notes-time-spent-v1';

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
      return sum + String(block.text || '').length;
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

function StudyNotes() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionScope = searchParams.get('section') === 'viva' ? 'viva' : 'study';
  const [moduleTree, setModuleTree] = useState([]);
  const [collapsed, setCollapsed] = useState({});
  const [progressMap, setProgressMap] = useState(() => readMap(PROGRESS_KEY));
  const [bookmarkMap, setBookmarkMap] = useState(() => readMap(BOOKMARKS_KEY));
  const [notesMap, setNotesMap] = useState(() => readMap(NOTES_KEY));
  const [completedMap, setCompletedMap] = useState(() => readMap(COMPLETED_KEY));
  const [timeSpentMap, setTimeSpentMap] = useState(() => readMap(TIME_SPENT_KEY));

  const contentRef = useRef(null);
  const noteDraftRef = useRef('');

  useEffect(() => {
    async function load() {
      const tree = await studyNotesService.loadModuleTree({ scope: sectionScope });
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
  }, [sectionScope]);

  const allTopics = useMemo(() => moduleTree.flatMap((module) => module.topics || []), [moduleTree]);

  const topicFromQuery = searchParams.get('topic');
  const activeTopic = useMemo(() => {
    if (topicFromQuery) {
      const selected = allTopics.find((topic) => topic.id === topicFromQuery);
      if (selected) {
        return selected;
      }
    }
    return allTopics[0] || null;
  }, [allTopics, topicFromQuery]);

  useEffect(() => {
    if (!activeTopic?.id) {
      return;
    }
    const inferredVivaScope = sectionScope === 'viva';

    const next = new URLSearchParams();
    next.set('topic', activeTopic.id);
    next.set('section', inferredVivaScope ? 'viva' : 'study');

    const nextQuery = next.toString();
    const current = new URLSearchParams(searchParams.toString());
    const currentQuery = current.toString();

    if (currentQuery === nextQuery) {
      return;
    }

    setSearchParams(next, { replace: true });
  }, [activeTopic?.id, searchParams, sectionScope, setSearchParams]);

  const tocItems = useMemo(() => {
    if (!activeTopic) {
      return [];
    }
    return (activeTopic.sections || []).map((section) => ({
      id: `section-${section.id}`,
      title: section.title,
    }));
  }, [activeTopic]);

  const handleNavigate = (href) => {
    if (!href) {
      return;
    }

    if (href.startsWith('#/')) {
      navigate(href.slice(1));
      return;
    }

    if (href.startsWith('/')) {
      navigate(href);
      return;
    }

    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const relatedLearningGroups = useMemo(() => {
    if (activeTopic?.relatedLearningGroups) {
      return activeTopic.relatedLearningGroups;
    }

    const flat = Array.isArray(activeTopic?.relatedLearning) ? activeTopic.relatedLearning : [];
    return {
      viva: flat.filter((item) => item.kind === 'viva'),
      handsOnLabs: flat.filter((item) => item.kind === 'hands-on'),
      caseStudies: flat.filter((item) => item.kind === 'case-study'),
      practiceMcqs: flat.filter((item) => item.kind === 'mcq'),
    };
  }, [activeTopic?.relatedLearning, activeTopic?.relatedLearningGroups]);

  const activeTopicIndex = useMemo(
    () => allTopics.findIndex((topic) => topic.id === activeTopic?.id),
    [activeTopic?.id, allTopics]
  );

  const previousTopic = activeTopicIndex > 0 ? allTopics[activeTopicIndex - 1] : null;
  const nextTopic =
    activeTopicIndex >= 0 && activeTopicIndex < allTopics.length - 1 ? allTopics[activeTopicIndex + 1] : null;

  const activeProgress = Number(progressMap[activeTopic?.id] || 0);
  const isBookmarked = Boolean(bookmarkMap[activeTopic?.id]);
  const isCompleted = Boolean(completedMap[activeTopic?.id]);
  const noteValue = String(notesMap[activeTopic?.id] || '');

  useEffect(() => {
    noteDraftRef.current = noteValue;
  }, [noteValue]);

  useEffect(() => {
    if (!activeTopic) {
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
        if (prev[activeTopic.id] === percent) {
          return prev;
        }
        const next = { ...prev, [activeTopic.id]: percent };
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
  }, [activeTopic]);

  useEffect(() => {
    if (!activeTopic?.id) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setTimeSpentMap((prev) => {
        const nextSeconds = Number(prev[activeTopic.id] || 0) + 1;
        const next = { ...prev, [activeTopic.id]: nextSeconds };
        writeMap(TIME_SPENT_KEY, next);
        return next;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [activeTopic?.id]);

  const selectTopic = (topicId) => {
    const next = new URLSearchParams(searchParams);
    next.set('topic', topicId);
    setSearchParams(next);

    setTimeout(() => {
      const contentTop = contentRef.current?.offsetTop || 0;
      window.scrollTo({ top: Math.max(contentTop - 80, 0), behavior: 'smooth' });
    }, 10);
  };

  const toggleBookmark = () => {
    if (!activeTopic) {
      return;
    }

    setBookmarkMap((prev) => {
      const next = { ...prev, [activeTopic.id]: !prev[activeTopic.id] };
      writeMap(BOOKMARKS_KEY, next);
      return next;
    });
  };

  const saveNote = () => {
    if (!activeTopic) {
      return;
    }
    const trimmed = noteDraftRef.current.trim();
    setNotesMap((prev) => {
      const next = { ...prev, [activeTopic.id]: trimmed };
      writeMap(NOTES_KEY, next);
      return next;
    });
  };

  const markComplete = () => {
    if (!activeTopic) {
      return;
    }

    setCompletedMap((prev) => {
      const next = { ...prev, [activeTopic.id]: true };
      writeMap(COMPLETED_KEY, next);
      return next;
    });

    setProgressMap((prev) => {
      const next = { ...prev, [activeTopic.id]: 100 };
      writeMap(PROGRESS_KEY, next);
      return next;
    });
  };

  const completionRate = useMemo(() => {
    if (allTopics.length === 0) {
      return 0;
    }
    const done = allTopics.filter((topic) => completedMap[topic.id]).length;
    return Math.round((done / allTopics.length) * 100);
  }, [allTopics, completedMap]);

  const totalSections = Math.max(1, Array.isArray(activeTopic?.sections) ? activeTopic.sections.length : 0);
  const completedSections = Math.min(totalSections, Math.round((activeProgress / 100) * totalSections));
  const activeTimeSpentSeconds = Number(timeSpentMap[activeTopic?.id] || 0);

  if (!activeTopic) {
    return (
      <div className="glass-card rounded-2xl border border-white/10 p-6 shadow-soft">
        <p className="text-sm text-slate-700 dark:text-slate-300">Loading Study Notes...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
      <aside
        className="glass-card h-fit rounded-2xl border border-white/10 p-4 shadow-soft xl:sticky xl:top-24"
        aria-label="Module and topic navigation"
      >
        <div className="mb-3 flex items-center gap-2">
          <ListTree className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {sectionScope === 'viva' ? 'Viva Topics' : 'Modules'}
          </h3>
        </div>

        <div className="space-y-2">
          {moduleTree.map((module) => {
            const isCollapsed = Boolean(collapsed[module.id]);

            return (
              <div key={module.id} className="rounded-xl border border-white/10 bg-white/5">
                <button
                  type="button"
                  onClick={() => setCollapsed((prev) => ({ ...prev, [module.id]: !prev[module.id] }))}
                  className="flex min-h-11 w-full items-center justify-between px-3 py-2 text-left"
                  aria-expanded={!isCollapsed}
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                    {module.title}
                  </span>
                  <span className="text-xs text-slate-400">{isCollapsed ? '+' : '-'}</span>
                </button>

                {!isCollapsed && (
                  <div className="space-y-1 border-t border-white/10 p-2">
                    {module.topics.map((topic) => {
                      const selected = topic.id === activeTopic.id;
                      return (
                        <button
                          key={topic.id}
                          type="button"
                          onClick={() => selectTopic(topic.id)}
                          className={`w-full rounded-lg px-2 py-2 text-left text-xs transition ${
                            selected
                              ? 'bg-primary/20 text-primary'
                                : 'text-slate-700 hover:bg-white/10 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                          }`}
                        >
                          {topic.title}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      <main ref={contentRef} className="space-y-4" aria-live="polite">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl border border-white/10 p-6 shadow-soft"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{activeTopic.title}</h2>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {activeTopic.moduleTitle}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-slate-700 dark:text-slate-300">
                Difficulty: {activeTopic.difficulty}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-slate-700 dark:text-slate-300">
                <Timer className="h-3.5 w-3.5" />
                {inferReadMinutes(activeTopic)} min
              </span>
              <span
                className={`rounded-full border px-2 py-1 ${
                  isCompleted
                    ? 'border-success/40 bg-success/15 text-success'
                    : 'border-warning/40 bg-warning/15 text-warning'
                }`}
              >
                {isCompleted ? 'Completed' : 'In Progress'}
              </span>
            </div>
          </div>

          <LearningObjectives objectives={activeTopic.learningObjectives} />

          <StudyRenderer topic={activeTopic} className="mt-2" />

          <TopicNavigation
            hasPrevious={Boolean(previousTopic)}
            hasNext={Boolean(nextTopic)}
            onPrevious={() => previousTopic && selectTopic(previousTopic.id)}
            onNext={() => nextTopic && selectTopic(nextTopic.id)}
            onMarkComplete={markComplete}
            isCompleted={isCompleted}
          />
        </motion.section>
      </main>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:h-fit" aria-label="Study tools and progress">
        <section className="glass-card rounded-2xl border border-white/10 p-4 shadow-soft">
          <div className="mb-2 flex items-center gap-2">
            <ListOrdered className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Table of Contents</h3>
          </div>
          <div className="max-h-44 space-y-1 overflow-y-auto pr-1">
            {tocItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="block w-full rounded-md px-2 py-1 text-left text-xs text-slate-700 hover:bg-white/10 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                {item.title}
              </button>
            ))}
          </div>
        </section>

        <ReadingProgress
          progressPercent={activeProgress}
          completionPercent={completionRate}
          completedSections={completedSections}
          totalSections={totalSections}
          timeSpentSeconds={activeTimeSpentSeconds}
        />

        <section className="glass-card rounded-2xl border border-white/10 p-4 shadow-soft">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-warning" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Bookmarks</h3>
            </div>
            <button
              type="button"
              onClick={toggleBookmark}
              className={`rounded-md px-2 py-1 text-xs font-semibold ${
                isBookmarked ? 'bg-warning/20 text-warning' : 'bg-white/10 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Save important topics for quick revision.</p>
        </section>

        <section className="glass-card rounded-2xl border border-white/10 p-4 shadow-soft">
          <div className="mb-2 flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Personal Notes</h3>
          </div>
          <textarea
            defaultValue={noteValue}
            onChange={(event) => {
              noteDraftRef.current = event.target.value;
            }}
            className="min-h-24 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-500 dark:text-slate-200"
            placeholder="Write your own summary, formula, or reminder..."
            aria-label="Personal notes for this topic"
          />
          <button
            type="button"
            onClick={saveNote}
            className="mt-2 min-h-11 rounded-lg border border-accent/35 bg-accent/15 px-3 py-2 text-xs font-semibold text-accent"
          >
            Save Note
          </button>
        </section>

        <section className="glass-card rounded-2xl border border-white/10 p-4 shadow-soft">
          <RelatedLearning groups={relatedLearningGroups} onNavigate={handleNavigate} className="border-0 bg-transparent p-0" />

          {(activeTopic.relatedLinks || []).length > 0 ? (
            <div className="mt-3 border-t border-white/10 pt-3">
              <div className="mb-2 flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Related Links</h3>
              </div>
              <div className="space-y-1">
                {(activeTopic.relatedLinks || []).map((link, index) => (
                  <button
                    key={`${link.href}-${index}`}
                    type="button"
                    onClick={() => handleNavigate(link.href)}
                    className="block w-full rounded-md px-2 py-1 text-left text-xs text-slate-700 hover:bg-white/10 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </aside>
    </div>
  );
}

export default StudyNotes;
