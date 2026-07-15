import {
  AppWindow,
  ArrowRight,
  Boxes,
  Building2,
  CircleGauge,
  Cloud,
  Cog,
  Database,
  Network,
  Server,
  ShieldCheck,
  Workflow,
} from 'lucide-react';

export type ArchitectureIconKey =
  | 'app-window'
  | 'boxes'
  | 'building-2'
  | 'cloud'
  | 'cog'
  | 'database'
  | 'gauge'
  | 'network'
  | 'server'
  | 'shield-check'
  | 'workflow';

export interface ArchitectureGroup {
  id: string;
  title: string;
  description?: string;
}

export interface ArchitectureNode {
  id: string;
  title: string;
  description?: string;
  groupId?: string;
  iconKey?: ArchitectureIconKey;
}

export interface ArchitectureConnection {
  from: string;
  to: string;
  label?: string;
}

export interface ArchitectureDiagramProps {
  title?: string;
  description?: string;
  groups?: ArchitectureGroup[];
  nodes: ArchitectureNode[];
  connections: ArchitectureConnection[];
  className?: string;
}

const iconMap = {
  'app-window': AppWindow,
  boxes: Boxes,
  'building-2': Building2,
  cloud: Cloud,
  cog: Cog,
  database: Database,
  gauge: CircleGauge,
  network: Network,
  server: Server,
  'shield-check': ShieldCheck,
  workflow: Workflow,
} as const;

function ArchitectureDiagram({
  title = 'Architecture Diagram',
  description,
  groups = [],
  nodes,
  connections,
  className = '',
}: ArchitectureDiagramProps) {
  const safeNodes = Array.isArray(nodes) ? nodes.filter((node) => node?.id && node?.title) : [];
  const safeConnections = Array.isArray(connections)
    ? connections.filter((connection) => connection?.from && connection?.to)
    : [];

  if (safeNodes.length === 0) {
    return null;
  }

  const groupedMap = new Map<string, ArchitectureNode[]>();

  groups.forEach((group) => groupedMap.set(group.id, []));
  safeNodes.forEach((node) => {
    const groupKey = node.groupId && groupedMap.has(node.groupId) ? node.groupId : 'ungrouped';
    if (!groupedMap.has(groupKey)) {
      groupedMap.set(groupKey, []);
    }
    groupedMap.get(groupKey)?.push(node);
  });

  const orderedGroups = [
    ...groups.map((group) => ({
      id: group.id,
      title: group.title,
      description: group.description,
      nodes: groupedMap.get(group.id) || [],
    })),
    ...(groupedMap.get('ungrouped')?.length
      ? [
          {
            id: 'ungrouped',
            title: 'Other Components',
            description: undefined,
            nodes: groupedMap.get('ungrouped') || [],
          },
        ]
      : []),
  ].filter((group) => group.nodes.length > 0);

  return (
    <section className={`mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 ${className}`.trim()} aria-label="Architecture diagram">
      <div className="mb-3 border-b border-white/10 pb-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
        {description ? <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{description}</p> : null}
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-flex min-w-max gap-3">
          {orderedGroups.map((group) => (
            <article key={group.id} className="w-72 shrink-0 rounded-xl border border-white/10 bg-white/5 p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">{group.title}</h4>
              {group.description ? <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{group.description}</p> : null}

              <div className="mt-2 space-y-2">
                {group.nodes.map((node) => {
                  const Icon = node.iconKey ? iconMap[node.iconKey] : Workflow;
                  return (
                    <div key={node.id} className="rounded-lg border border-white/10 bg-white/5 p-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{node.title}</p>
                      </div>
                      {node.description ? <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{node.description}</p> : null}
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </div>

      {safeConnections.length ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">Connections</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {safeConnections.map((connection, index) => (
              <div key={`${connection.from}-${connection.to}-${index}`} className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-700 dark:text-slate-300">
                <span className="truncate font-semibold text-slate-800 dark:text-slate-100">{connection.from}</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                <span className="truncate font-semibold text-slate-800 dark:text-slate-100">{connection.to}</span>
                {connection.label ? <span className="truncate text-slate-500 dark:text-slate-400">({connection.label})</span> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ArchitectureDiagram;
