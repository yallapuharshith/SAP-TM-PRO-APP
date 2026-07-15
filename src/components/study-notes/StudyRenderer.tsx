import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import SectionAccordion from './SectionAccordion';
import StudyBlockRenderer from '../study-renderers/StudyBlockRenderer';

type GenericBlock = {
  type: string;
  [key: string]: unknown;
};

type GenericSection = {
  id: string;
  title: string;
  content: GenericBlock[];
};

type GenericTopic = {
  id: string;
  sections: GenericSection[];
};

interface StudyRendererProps {
  topic: GenericTopic;
  initialSearch?: string;
  className?: string;
}

function blockToText(block: GenericBlock) {
  const tokens: string[] = [String(block.type || '')];

  Object.entries(block).forEach(([key, value]) => {
    if (key === 'type' || value == null) {
      return;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      tokens.push(String(value));
      return;
    }

    if (Array.isArray(value)) {
      tokens.push(value.map((item) => (typeof item === 'string' ? item : JSON.stringify(item))).join(' '));
      return;
    }

    if (typeof value === 'object') {
      tokens.push(JSON.stringify(value));
    }
  });

  return tokens.join(' ').toLowerCase();
}

function StudyRenderer({ topic, initialSearch = '', className = '' }: StudyRendererProps) {
  const [query, setQuery] = useState(initialSearch);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const seed: Record<string, boolean> = {};
    (topic.sections || []).forEach((section, index) => {
      seed[section.id] = index < 2;
    });
    return seed;
  });

  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    const seed: Record<string, boolean> = {};
    (topic.sections || []).forEach((section, index) => {
      seed[section.id] = index < 2;
    });
    setOpenMap(seed);
    setQuery(initialSearch);
  }, [initialSearch, topic.id, topic.sections]);

  const filteredSections = useMemo(() => {
    const sections = Array.isArray(topic?.sections) ? topic.sections : [];
    if (!normalizedQuery) {
      return sections;
    }

    return sections
      .map((section) => {
        const matchingBlocks = (section.content || []).filter((block) => blockToText(block).includes(normalizedQuery));

        if (section.title.toLowerCase().includes(normalizedQuery)) {
          return section;
        }

        if (matchingBlocks.length > 0) {
          return {
            ...section,
            content: matchingBlocks,
          };
        }

        return null;
      })
      .filter(Boolean) as GenericSection[];
  }, [normalizedQuery, topic?.sections]);

  const toggleSection = (id: string) => {
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={className}>
      <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3">
        <label className="sr-only" htmlFor={`topic-search-${topic.id}`}>
          Search inside topic
        </label>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            id={`topic-search-${topic.id}`}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search inside topic..."
            className="h-10 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:text-slate-200"
          />
        </div>
      </div>

      {(filteredSections || []).map((section) => (
        <SectionAccordion
          key={section.id}
          id={section.id}
          title={section.title}
          isOpen={Boolean(openMap[section.id])}
          onToggle={toggleSection}
        >
          {(section.content || []).map((block, index) => (
            <StudyBlockRenderer key={`${section.id}-${block.type}-${index}`} block={block} context={{ sectionId: section.id, blockIndex: index }} />
          ))}
        </SectionAccordion>
      ))}

      {filteredSections.length === 0 ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-600 dark:text-slate-300">
          No matching content found for the current search.
        </div>
      ) : null}
    </div>
  );
}

export default StudyRenderer;
