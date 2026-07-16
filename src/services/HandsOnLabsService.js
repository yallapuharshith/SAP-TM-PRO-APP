const handsOnImporters = import.meta.glob('../data/hands-on/**/*.json');

function sorted(items = [], mapper = (item) => item) {
  return [...items].sort((a, b) => String(mapper(a)).localeCompare(String(mapper(b)), undefined, {
    numeric: true,
    sensitivity: 'base',
  }));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeModuleId(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) {
    return 'hands-on';
  }

  const moduleMatch = raw.match(/^module\d+$/);
  if (moduleMatch) {
    return `hands-on-${raw}`;
  }

  if (/^hands-on-/.test(raw)) {
    return raw;
  }

  return `hands-on-${raw.replace(/\s+/g, '-')}`;
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

  if (type === 'process-flow') {
    return {
      ...block,
      type: 'process-flow',
      steps: asArray(block.steps)
        .map((step, index) => {
          if (typeof step === 'string') {
            return {
              id: `step-${index + 1}`,
              title: step,
            };
          }

          const title = String(step?.title || step?.label || '').trim();
          if (!title) {
            return null;
          }

          return {
            id: step.id || `step-${index + 1}`,
            title,
            description: step.description,
            iconKey: step.iconKey,
          };
        })
        .filter(Boolean),
    };
  }

  if (type === 'comparison') {
    const columns = ['Feature', block.leftTitle || 'Left', block.rightTitle || 'Right'];
    const rows = asArray(block.rows)
      .map((row, index) => {
        if (!row || typeof row !== 'object') {
          return null;
        }

        return {
          id: row.id || `comparison-row-${index + 1}`,
          values: [row.feature || '', row.left || '', row.right || ''],
        };
      })
      .filter(Boolean);

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

function normalizeSections(rawSections) {
  const blocks = asArray(rawSections);
  if (blocks.length === 0) {
    return [];
  }

  const nested = blocks.filter((section) => section && typeof section === 'object' && Array.isArray(section.content));
  if (nested.length > 0) {
    return nested.map((section, index) => ({
      id: section.id || `section-${index + 1}`,
      title: String(section.title || `Section ${index + 1}`),
      content: asArray(section.content).map(normalizeLegacyBlock).filter(Boolean),
    }));
  }

  const sections = [];
  let currentSection = null;

  const startSection = (title, idFallback) => {
    const section = {
      id: idFallback,
      title: String(title || 'Section').trim() || 'Section',
      content: [],
    };
    sections.push(section);
    currentSection = section;
  };

  blocks.forEach((entry, index) => {
    const block = normalizeLegacyBlock(entry);
    if (!block) {
      return;
    }

    if (block.type === 'heading') {
      startSection(block.text || `Section ${sections.length + 1}`, block.id || `section-${sections.length + 1}`);
      return;
    }

    if (!currentSection) {
      startSection('Overview', 'section-overview');
    }

    currentSection.content.push(block);
  });

  return sections.filter((section) => section.content.length > 0 || String(section.title || '').trim());
}

function parsePath(path) {
  const match = path.match(/hands-on\/(module\d+)\/(.+)\.json$/i);
  if (!match) {
    return null;
  }

  return {
    moduleId: match[1],
    topicId: match[2],
  };
}

function normalizeObjectives(items) {
  return asArray(items)
    .map((item, index) => {
      if (typeof item === 'string') {
        return {
          id: `obj-${index + 1}`,
          title: item,
        };
      }

      const title = String(item?.title || item?.text || '').trim();
      if (!title) {
        return null;
      }

      return {
        id: item.id || `obj-${index + 1}`,
        title,
        description: item.description || undefined,
      };
    })
    .filter(Boolean);
}

function normalizeLab(raw, fallback = {}) {
  const moduleMeta = raw?.module || {};
  const topicMeta = raw?.topic || {};
  const metadata = raw?.metadata || {};

  return {
    id: String(raw.id || fallback.topicId || '').trim() || `hands-on-${fallback.topicId || 'lab'}`,
    moduleId: normalizeModuleId(moduleMeta.id || fallback.moduleId || 'hands-on'),
    moduleTitle: String(moduleMeta.title || 'Hands-on Labs').trim(),
    moduleSequence: Number(moduleMeta.sequence || 999),
    title: String(topicMeta.title || raw.title || fallback.topicId || 'Untitled Lab').trim(),
    sequence: Number(topicMeta.sequence || raw.sequence || 999),
    difficulty: String(metadata.difficulty || raw.difficulty || 'Intermediate'),
    estimatedMinutes: Number(metadata.estimatedReadingTime || raw.estimatedMinutes || 20),
    learningObjectives: normalizeObjectives(raw.learningObjectives),
    sections: normalizeSections(raw.sections),
  };
}

export class HandsOnLabsService {
  async loadLabs() {
    const entries = await Promise.all(
      Object.entries(handsOnImporters).map(async ([path, importer]) => {
        const parsed = parsePath(path);
        const loaded = await importer();
        const payload = loaded?.default ?? loaded;

        if (!payload) {
          return null;
        }

        return normalizeLab(payload, parsed || {});
      })
    );

    return entries
      .filter(Boolean)
      .sort((a, b) => {
        if (a.moduleSequence !== b.moduleSequence) {
          return a.moduleSequence - b.moduleSequence;
        }
        if (a.sequence !== b.sequence) {
          return a.sequence - b.sequence;
        }
        return String(a.id).localeCompare(String(b.id));
      });
  }

  async loadModuleTree() {
    const labs = await this.loadLabs();
    const grouped = labs.reduce((acc, lab) => {
      if (!acc[lab.moduleId]) {
        acc[lab.moduleId] = {
          id: lab.moduleId,
          title: lab.moduleTitle,
          sequence: lab.moduleSequence,
          topics: [],
        };
      }

      acc[lab.moduleId].topics.push(lab);
      return acc;
    }, {});

    return sorted(Object.values(grouped), (module) => module.id).map((module) => ({
      ...module,
      topics: sorted(module.topics, (topic) => topic.sequence),
    }));
  }
}

export const handsOnLabsService = new HandsOnLabsService();
