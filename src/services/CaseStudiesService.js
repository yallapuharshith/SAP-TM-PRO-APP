const caseStudyImporters = import.meta.glob('../data/capstone/case-studies/**/*.json');

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
    return 'case-studies';
  }

  if (/^sprint\s*\d+$/i.test(raw)) {
    const number = raw.replace(/[^0-9]/g, '');
    return `case-studies-sprint-${number}`;
  }

  if (/^case-studies-/.test(raw)) {
    return raw;
  }

  return `case-studies-${raw.replace(/\s+/g, '-')}`;
}

function toCaseStudyTitle(caseStudyKey) {
  const number = String(caseStudyKey || '').match(/(\d+)/)?.[1];
  return number ? `Capstone Case Study ${number}` : 'Capstone Case Study';
}

function toTimelineItems(events = []) {
  return asArray(events)
    .map((event, index) => {
      if (!event || typeof event !== 'object') {
        return null;
      }

      const title = String(event.activity || event.title || '').trim();
      if (!title) {
        return null;
      }

      return {
        id: event.id || `timeline-${index + 1}`,
        title,
        date: event.time || event.date,
      };
    })
    .filter(Boolean);
}

function expandBlock(rawBlock) {
  if (!rawBlock || typeof rawBlock !== 'object') {
    return [];
  }

  const type = String(rawBlock.type || '').trim();
  if (!type) {
    return [];
  }

  if (type === 'heading') {
    return [{
      ...rawBlock,
      type: 'heading',
      text: rawBlock.text || rawBlock.title || '',
      level: Number(rawBlock.level || 3),
    }];
  }

  if (type === 'paragraph') {
    return [{
      ...rawBlock,
      type: 'paragraph',
      text: rawBlock.text || rawBlock.content || '',
    }];
  }

  if (type === 'table') {
    return [{
      ...rawBlock,
      type: 'table',
      columns: asArray(rawBlock.columns).length ? rawBlock.columns : rawBlock.headers,
      rows: asArray(rawBlock.rows),
    }];
  }

  if (type === 'process-flow') {
    return [{
      ...rawBlock,
      type: 'process-flow',
      steps: asArray(rawBlock.steps)
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
    }];
  }

  if (type === 'bullet-list' || type === 'numbered-list' || type === 'checklist') {
    const normalizedType = type === 'checklist' ? 'bullet-list' : type;
    return [{
      ...rawBlock,
      type: normalizedType,
      items: asArray(rawBlock.items),
    }];
  }

  if (type === 'callout') {
    return [{
      ...rawBlock,
      type: 'callout',
      title: rawBlock.title || 'Callout',
      content: rawBlock.content || rawBlock.text || '',
    }];
  }

  // Custom case-study block mappings to supported render blocks.
  if (type === 'cover') {
    const title = String(rawBlock.title || '').trim();
    const subtitle = String(rawBlock.subtitle || '').trim();
    const description = String(rawBlock.description || '').trim();
    return [
      {
        type: 'heading',
        text: title || 'Case Study',
        level: 2,
      },
      {
        type: 'paragraph',
        text: [subtitle, description].filter(Boolean).join(' - '),
      },
    ];
  }

  if (type === 'meeting-notes') {
    return [
      {
        type: 'paragraph',
        text: `Participants: ${asArray(rawBlock.participants).join(', ')}`,
      },
      {
        type: 'bullet-list',
        items: asArray(rawBlock.notes),
      },
    ];
  }

  if (type === 'scenario') {
    return [
      {
        type: 'callout',
        calloutType: 'important',
        title: String(rawBlock.scenarioTitle || 'Scenario'),
        content: String(rawBlock.background || ''),
      },
      {
        type: 'numbered-list',
        items: asArray(rawBlock.questions),
      },
    ];
  }

  if (type === 'decision-point') {
    return [
      {
        type: 'paragraph',
        text: String(rawBlock.question || ''),
      },
      {
        type: 'table',
        columns: ['Option', 'Choice'],
        rows: asArray(rawBlock.options).map((option) => [String(option?.id || ''), String(option?.text || '')]),
      },
      {
        type: 'callout',
        calloutType: 'best-practice',
        title: `Recommended Answer: ${String(rawBlock.recommendedAnswer || '')}`,
        content: String(rawBlock.explanation || ''),
      },
    ];
  }

  if (type === 'consultant-deliverable') {
    return [
      {
        type: 'heading',
        text: String(rawBlock.title || 'Deliverables'),
        level: 4,
      },
      {
        type: 'bullet-list',
        items: asArray(rawBlock.deliverables),
      },
    ];
  }

  if (type === 'summary') {
    return [{
      type: 'callout',
      calloutType: 'example',
      title: String(rawBlock.title || 'Summary'),
      content: String(rawBlock.content || ''),
    }];
  }

  if (type === 'timeline') {
    return [{
      type: 'timeline',
      title: String(rawBlock.title || 'Timeline'),
      items: toTimelineItems(rawBlock.events || rawBlock.items),
    }];
  }

  if (type === 'architecture-diagram') {
    return [{
      type: 'process-flow',
      title: String(rawBlock.title || 'Architecture'),
      orientation: 'horizontal',
      steps: asArray(rawBlock.components),
    }];
  }

  if (type === 'email') {
    return [{
      type: 'callout',
      calloutType: 'important',
      title: `${String(rawBlock.subject || 'Email')} - ${String(rawBlock.from || '')}`,
      content: String(rawBlock.body || ''),
    }];
  }

  if (type === 'consultant-task') {
    return [
      {
        type: 'heading',
        text: String(rawBlock.title || 'Consultant Task'),
        level: 4,
      },
      {
        type: 'bullet-list',
        items: asArray(rawBlock.tasks),
      },
    ];
  }

  return [{
    type: 'paragraph',
    text: String(rawBlock.content || rawBlock.text || ''),
  }];
}

function normalizeSections(rawSections) {
  const blocks = asArray(rawSections);
  if (blocks.length === 0) {
    return [];
  }

  const sections = [];
  let currentSection = {
    id: 'section-overview',
    title: 'Overview',
    content: [],
  };

  sections.push(currentSection);

  blocks.forEach((entry, index) => {
    const type = String(entry?.type || '').trim();

    if (type === 'heading') {
      const title = String(entry?.title || entry?.text || '').trim() || `Section ${sections.length + 1}`;
      currentSection = {
        id: String(entry?.id || `section-${index + 1}`),
        title,
        content: [],
      };
      sections.push(currentSection);
      return;
    }

    const expanded = expandBlock(entry);
    if (expanded.length) {
      currentSection.content.push(...expanded);
    }
  });

  return sections.filter((section) => section.content.length > 0 || String(section.title || '').trim());
}

function parsePath(path) {
  const match = path.match(/capstone\/case-studies\/([^/]+)\/(.+)\.json$/i);
  if (!match) {
    return null;
  }

  return {
    caseStudyKey: match[1],
    caseStudyTitle: toCaseStudyTitle(match[1]),
    moduleId: match[1],
    topicKey: match[2],
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

function normalizeCaseStudy(raw, fallback = {}) {
  const title = String(raw?.title || fallback.topicKey || 'Untitled Case Study').trim();
  const topicSequence = Number(raw?.topic || raw?.sequence || 999);
  const moduleTitle = String(raw?.caseStudyTitle || fallback.caseStudyTitle || raw?.module || 'Capstone Case Studies').trim();
  const moduleId = normalizeModuleId(raw?.caseStudyId || fallback.caseStudyKey || raw?.module || fallback.moduleId || 'case-studies');
  const moduleSequence = Number(
    raw?.caseStudySequence
      || String(raw?.caseStudyId || fallback.caseStudyKey || '').replace(/[^0-9]/g, '')
      || String(raw?.module || '').replace(/[^0-9]/g, '')
      || 999
  );

  return {
    id: String(raw?.id || fallback.topicKey || '').trim() || `case-${fallback.topicKey || 'topic'}`,
    moduleId,
    moduleTitle,
    moduleSequence,
    title,
    sequence: topicSequence,
    difficulty: String(raw?.difficulty || 'Intermediate'),
    estimatedMinutes: Number(raw?.estimatedMinutes || 30),
    learningObjectives: normalizeObjectives(raw?.learningObjectives),
    sections: normalizeSections(raw?.sections),
  };
}

export class CaseStudiesService {
  async loadTopics() {
    const entries = await Promise.all(
      Object.entries(caseStudyImporters).map(async ([path, importer]) => {
        const parsed = parsePath(path);
        const loaded = await importer();
        const payload = loaded?.default ?? loaded;

        if (!payload) {
          return null;
        }

        return normalizeCaseStudy(payload, parsed || {});
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
    const topics = await this.loadTopics();
    const grouped = topics.reduce((acc, topic) => {
      if (!acc[topic.moduleId]) {
        acc[topic.moduleId] = {
          id: topic.moduleId,
          title: topic.moduleTitle,
          sequence: topic.moduleSequence,
          topics: [],
        };
      }

      acc[topic.moduleId].topics.push(topic);
      return acc;
    }, {});

    return sorted(Object.values(grouped), (module) => module.sequence).map((module) => ({
      ...module,
      topics: sorted(module.topics, (topic) => topic.sequence),
    }));
  }
}

export const caseStudiesService = new CaseStudiesService();
