import { AdminContentService } from './AdminContentService';

const studyTopicImporters = import.meta.glob('../data/study/**/*.json');
const vivaTopicImporters = import.meta.glob('../data/viva/**/*.json');
const topicImporters = {
  ...studyTopicImporters,
  ...vivaTopicImporters,
};

function sorted(items = [], mapper = (item) => item) {
  return [...items].sort((a, b) => String(mapper(a)).localeCompare(String(mapper(b)), undefined, {
    numeric: true,
    sensitivity: 'base',
  }));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeKind(kind, fallbackKind = 'other') {
  const value = String(kind || fallbackKind).trim().toLowerCase();
  if (value === 'viva') {
    return 'viva';
  }
  if (value === 'hands-on' || value === 'handson' || value === 'hands_on' || value === 'handsonlabs') {
    return 'hands-on';
  }
  if (value === 'case-study' || value === 'casestudy' || value === 'case_study') {
    return 'case-study';
  }
  if (value === 'mcq' || value === 'practice-mcq' || value === 'practicemcq' || value === 'practice_mcq') {
    return 'mcq';
  }
  return 'other';
}

function getModuleNumber(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) {
    return null;
  }

  const moduleMatch = raw.match(/^module(\d+)$/);
  if (moduleMatch) {
    return Number(moduleMatch[1]);
  }

  if (/^\d+$/.test(raw)) {
    return Number(raw);
  }

  return null;
}

function normalizeModuleId(value) {
  const moduleNumber = getModuleNumber(value);
  if (!Number.isFinite(moduleNumber)) {
    return String(value || '').trim();
  }

  return `module${moduleNumber}`;
}

function toRelatedItem(rawItem, fallbackKind = 'other') {
  if (!rawItem) {
    return null;
  }

  if (typeof rawItem === 'string') {
    return {
      kind: fallbackKind,
      label: rawItem,
      href: '#/study-notes',
      progress: 0,
    };
  }

  const label = String(rawItem.label || rawItem.title || '').trim();
  if (!label) {
    return null;
  }

  return {
    kind: normalizeKind(rawItem.kind, fallbackKind),
    label,
    href: rawItem.href || '#/study-notes',
    progress: Number(rawItem.progress || 0),
    description: rawItem.description || undefined,
  };
}

function normalizeRelatedLearning(rawRelatedLearning) {
  if (Array.isArray(rawRelatedLearning)) {
    const flat = rawRelatedLearning
      .map((item) => toRelatedItem(item, normalizeKind(item?.kind, 'other')))
      .filter(Boolean);

    return {
      flat,
      groups: {
        viva: flat.filter((item) => item.kind === 'viva'),
        handsOnLabs: flat.filter((item) => item.kind === 'hands-on'),
        caseStudies: flat.filter((item) => item.kind === 'case-study'),
        practiceMcqs: flat.filter((item) => item.kind === 'mcq'),
      },
    };
  }

  const viva = asArray(rawRelatedLearning?.viva).map((item) => toRelatedItem(item, 'viva')).filter(Boolean);
  const handsOnLabs = asArray(rawRelatedLearning?.handsOnLabs)
    .map((item) => toRelatedItem(item, 'hands-on'))
    .filter(Boolean);
  const caseStudies = asArray(rawRelatedLearning?.caseStudies)
    .map((item) => toRelatedItem(item, 'case-study'))
    .filter(Boolean);
  const practiceMcqs = asArray(rawRelatedLearning?.practiceMcqs)
    .map((item) => toRelatedItem(item, 'mcq'))
    .filter(Boolean);

  return {
    flat: [...viva, ...handsOnLabs, ...caseStudies, ...practiceMcqs],
    groups: {
      viva,
      handsOnLabs,
      caseStudies,
      practiceMcqs,
    },
  };
}

function normalizeRevisionSummary(rawRevisionSummary) {
  const summaryItems = asArray(rawRevisionSummary);
  const bullets = summaryItems
    .map((item) => {
      if (typeof item === 'string') {
        return item;
      }
      return item?.point || item?.text || '';
    })
    .filter((item) => String(item).trim());

  const flashcards = summaryItems
    .map((item, index) => {
      if (!item || typeof item === 'string') {
        return null;
      }

      const front = String(item.front || item.question || '').trim();
      const back = String(item.back || item.answer || '').trim();
      if (!front || !back) {
        return null;
      }

      return {
        id: item.id || `rev-fc-${index + 1}`,
        front,
        back,
      };
    })
    .filter(Boolean);

  if (bullets.length === 0 && flashcards.length === 0) {
    return null;
  }

  return {
    type: 'revision-summary',
    title: 'Revision Summary',
    bullets,
    flashcards,
  };
}

function normalizeLegacyBlock(block) {
  if (!block || typeof block !== 'object') {
    return null;
  }

  const type = String(block.type || '').trim();
  if (!type) {
    return null;
  }

  if (type === 'heading') {
    return {
      ...block,
      type: 'heading',
      text: block.text || block.title || '',
      level: Number(block.level || 3),
    };
  }

  if (type === 'paragraph') {
    return {
      ...block,
      type: 'paragraph',
      text: block.text || block.content || '',
    };
  }

  if (type === 'table') {
    return {
      ...block,
      type: 'table',
      columns: Array.isArray(block.columns) ? block.columns : (Array.isArray(block.headers) ? block.headers : []),
      rows: Array.isArray(block.rows) ? block.rows : [],
    };
  }

  if (type === 'comparison') {
    const columns = ['Feature', block.leftTitle || 'Left', block.rightTitle || 'Right'];
    const rows = Array.isArray(block.rows)
      ? block.rows
          .map((row, index) => {
            if (!row || typeof row !== 'object') {
              return null;
            }

            return {
              id: row.id || `comparison-row-${index + 1}`,
              values: [row.feature || '', row.left || '', row.right || ''],
            };
          })
          .filter(Boolean)
      : [];

    return {
      type: 'comparison-table',
      title: block.title || 'Comparison',
      columns,
      rows,
    };
  }

  if (type === 'callout') {
    return {
      ...block,
      type: 'callout',
      content: block.content || block.text || '',
      title: block.title || 'Callout',
    };
  }

  return block;
}

function normalizeLegacyFlatSections(rawSections) {
  const blocks = Array.isArray(rawSections) ? rawSections : [];
  if (blocks.length === 0) {
    return [];
  }

  const looksLikeFlatBlocks = blocks.some((entry) => entry && typeof entry === 'object' && entry.type && !entry.content);
  if (!looksLikeFlatBlocks) {
    return blocks;
  }

  const sections = [];
  let currentSection = null;

  const startSection = (headingBlock, fallbackIndex) => {
    const sectionId = headingBlock?.id || `section-${fallbackIndex + 1}`;
    const sectionTitle = String(headingBlock?.title || headingBlock?.text || `Section ${fallbackIndex + 1}`).trim();
    currentSection = {
      id: `sec-${sectionId}`,
      title: sectionTitle || `Section ${fallbackIndex + 1}`,
      content: [],
    };
    sections.push(currentSection);
  };

  blocks.forEach((entry, index) => {
    const block = normalizeLegacyBlock(entry);
    if (!block) {
      return;
    }

    if (block.type === 'heading') {
      startSection(block, index);
      return;
    }

    if (!currentSection) {
      startSection(null, 0);
    }

    currentSection.content.push(block);
  });

  return sections.filter((section) => section.content.length > 0 || String(section.title || '').trim());
}

function normalizeContentSections(raw) {
  const nestedContent = raw?.content || {};
  const directSections = asArray(raw?.sections);
  const nestedSections = asArray(nestedContent.sections);
  const sections = normalizeLegacyFlatSections(nestedSections.length ? nestedSections : directSections);

  const generatedBlocks = [];

  if (nestedContent.businessBackground && Object.keys(nestedContent.businessBackground || {}).length > 0) {
    generatedBlocks.push({ type: 'business-background', ...nestedContent.businessBackground });
  }

  if (nestedContent.businessScenario && Object.keys(nestedContent.businessScenario || {}).length > 0) {
    generatedBlocks.push({ type: 'scenario-card', ...nestedContent.businessScenario });
  }

  generatedBlocks.push(...asArray(nestedContent.processFlows).map((item) => ({ type: 'process-flow', ...item })));
  generatedBlocks.push(...asArray(nestedContent.architecture).map((item) => ({ type: 'architecture-diagram', ...item })));
  generatedBlocks.push(...asArray(nestedContent.sapObjects).map((item) => ({ type: 'sap-object-card', ...item })));
  generatedBlocks.push(...asArray(nestedContent.comparisonTables).map((item) => ({ type: 'comparison-table', ...item })));
  generatedBlocks.push(...asArray(nestedContent.knowledgeChecks).map((item) => ({ type: 'knowledge-check', ...item })));

  if (nestedContent.relatedLearning) {
    const normalized = normalizeRelatedLearning(nestedContent.relatedLearning);
    generatedBlocks.push({
      type: 'related-learning',
      title: 'Related Learning',
      groups: normalized.groups,
    });
  }

  if (asArray(nestedContent.glossary).length > 0) {
    generatedBlocks.push({
      type: 'glossary',
      title: 'Glossary',
      entries: asArray(nestedContent.glossary)
        .map((entry) => {
          if (typeof entry === 'string') {
            return null;
          }

          const term = String(entry?.term || entry?.title || '').trim();
          const definition = String(entry?.definition || entry?.text || '').trim();
          if (!term || !definition) {
            return null;
          }

          return { term, definition };
        })
        .filter(Boolean),
    });
  }

  if (asArray(nestedContent.timeline).length > 0) {
    generatedBlocks.push({
      type: 'timeline',
      title: 'Timeline',
      items: asArray(nestedContent.timeline)
        .map((item, index) => {
          if (typeof item === 'string') {
            return {
              id: `timeline-${index + 1}`,
              title: item,
            };
          }

          const title = String(item?.title || item?.label || '').trim();
          if (!title) {
            return null;
          }

          return {
            id: item?.id || `timeline-${index + 1}`,
            title,
            date: item?.date,
            description: item?.description,
          };
        })
        .filter(Boolean),
    });
  }

  const revisionSummaryBlock = normalizeRevisionSummary(nestedContent.revisionSummary);
  if (revisionSummaryBlock) {
    generatedBlocks.push(revisionSummaryBlock);
  }

  if (generatedBlocks.length === 0) {
    return sections;
  }

  return [
    ...sections,
    {
      id: 'extended-content',
      title: 'Extended Content',
      content: generatedBlocks,
    },
  ];
}

function normalizeTopic(raw, fallback = {}) {
  const nestedContent = raw?.content || {};
  const metadata = raw?.metadata || {};
  const moduleMeta = raw?.module || {};
  const topicMeta = raw?.topic || {};
  const isVivaSource = String(fallback?.moduleId || '').toLowerCase() === 'viva';

  const objectives = Array.isArray(raw.learningObjectives)
    ? raw.learningObjectives
    : Array.isArray(nestedContent.learningObjectives)
      ? nestedContent.learningObjectives
      : Array.isArray(raw.objectives)
        ? raw.objectives
        : [];

  const keyTakeaways = Array.isArray(raw.keyTakeaways)
    ? raw.keyTakeaways
    : Array.isArray(raw.revisionPoints)
      ? raw.revisionPoints
      : [];

  const relatedLearning = normalizeRelatedLearning(raw.relatedLearning);

  const rawModuleId = String(moduleMeta.id || raw.moduleId || fallback.moduleId || 'module').trim();
  const moduleId = isVivaSource ? 'viva' : normalizeModuleId(rawModuleId);
  const topicId = isVivaSource
    ? String(fallback.id || raw.id || '').trim()
    : String(raw.id || fallback.id || '').trim();

  return {
    id: topicId,
    moduleId,
    moduleTitle: isVivaSource
      ? (fallback.moduleTitle || 'Viva Preparation')
      : (moduleMeta.title || raw.moduleTitle || fallback.moduleTitle || 'Module'),
    title: topicMeta.title || raw.title || fallback.id || 'Untitled Topic',
    difficulty: metadata.difficulty || raw.difficulty || 'Intermediate',
    estimatedMinutes: Number(metadata.estimatedReadingTime || raw.estimatedMinutes || 10),
    learningObjectives: objectives
      .map((item, index) => {
        if (typeof item === 'string') {
          return { id: `obj-${index + 1}`, title: item };
        }

        const title = String(item?.title || item?.text || '').trim();
        const description = String(item?.description || '').trim();

        return {
          id: item?.id || `obj-${index + 1}`,
          title,
          ...(description ? { description } : {}),
        };
      })
      .filter((objective) => objective.title),
    keyTakeaways: keyTakeaways.map((item, index) => {
      if (typeof item === 'string') {
        return { id: `takeaway-${index + 1}`, text: item };
      }
      return {
        id: item?.id || `takeaway-${index + 1}`,
        text: item?.text || String(item || ''),
      };
    }),
    sections: normalizeContentSections(raw),
    relatedLinks: asArray(raw.relatedLinks),
    relatedLearning: relatedLearning.flat,
    relatedLearningGroups: relatedLearning.groups,
  };
}

function parsePath(path) {
  const match = path.match(/study\/(module\d+)\/(.+)\.json$/i);
  if (match) {
    return {
      moduleId: match[1],
      moduleTitle: match[1],
      topicId: `${match[1]}.${match[2]}`,
    };
  }

  const vivaMatch = path.match(/viva\/(.+)\.json$/i);
  if (vivaMatch) {
    return {
      moduleId: 'viva',
      moduleTitle: 'Viva Preparation',
      topicId: `viva.${vivaMatch[1]}`,
    };
  }

  return null;
}

export class StudyNotesService {
  filterTopicsByScope(topics, scope = 'all') {
    if (scope === 'viva') {
      return topics.filter((topic) => topic.moduleId === 'viva' || String(topic.id || '').startsWith('viva.'));
    }

    if (scope === 'study') {
      return topics.filter((topic) => {
        if (topic.moduleId === 'viva' || String(topic.id || '').startsWith('viva.')) {
          return false;
        }

        const moduleNumber = getModuleNumber(topic.moduleId);
        if (!Number.isFinite(moduleNumber)) {
          return false;
        }

        return moduleNumber >= 1 && moduleNumber <= 10;
      });
    }

    return topics;
  }

  async loadTopics(options = {}) {
    const includeAdmin = options?.includeAdmin !== false;
    const entries = await Promise.all(
      Object.entries(topicImporters).map(async ([path, importer]) => {
        const parsed = parsePath(path);
        const loaded = await importer();
        const payload = loaded?.default ?? loaded;

        if (!payload) {
          return null;
        }

        return normalizeTopic(payload, {
          id: parsed?.topicId,
          moduleId: parsed?.moduleId,
          moduleTitle: parsed?.moduleTitle || parsed?.moduleId,
        });
      })
    );

    const builtInTopics = entries.filter(Boolean);
    if (!includeAdmin) {
      return sorted(builtInTopics, (topic) => topic.id);
    }

    const adminTopics = AdminContentService.getAllTopics();

    // Admin topics override built-in topics when IDs match.
    const byId = new Map();
    builtInTopics.forEach((topic) => {
      byId.set(topic.id, topic);
    });
    adminTopics.forEach((topic) => {
      byId.set(topic.id, topic);
    });

    return sorted(Array.from(byId.values()), (topic) => topic.id);
  }

  async loadModuleTree(options = {}) {
    const scope = options?.scope || 'all';
    const topics = this.filterTopicsByScope(await this.loadTopics({ includeAdmin: options?.includeAdmin }), scope);
    const grouped = topics.reduce((acc, topic) => {
      if (!acc[topic.moduleId]) {
        acc[topic.moduleId] = {
          id: topic.moduleId,
          title: topic.moduleTitle,
          topics: [],
        };
      }
      acc[topic.moduleId].topics.push(topic);
      return acc;
    }, {});

    return sorted(Object.values(grouped), (module) => module.id).map((module) => ({
      ...module,
      topics: sorted(module.topics, (topic) => topic.id),
    }));
  }
}

export const studyNotesService = new StudyNotesService();
