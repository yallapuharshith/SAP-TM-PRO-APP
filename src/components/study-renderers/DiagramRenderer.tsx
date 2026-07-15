import { useMemo } from 'react';
import { StudyRendererProps, DiagramBlock } from './types';

function DiagramRenderer({ block }: StudyRendererProps<DiagramBlock>) {
  const nodes = Array.isArray(block.nodes) ? block.nodes : [];
  const connections = Array.isArray(block.connections) ? block.connections : Array.isArray(block.edges) ? block.edges : [];

  const positions = useMemo(() => {
    const cols = Math.max(2, Math.ceil(Math.sqrt(Math.max(1, nodes.length))));
    return nodes.map((node, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      return {
        ...node,
        x: 10 + col * (80 / Math.max(1, cols - 1)),
        y: 18 + row * 24,
      };
    });
  }, [nodes]);

  const nodeById = useMemo(() => Object.fromEntries(positions.map((node) => [node.id, node])), [positions]);

  if (nodes.length === 0) {
    return null;
  }

  return (
    <figure className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3" role="img" aria-label={block.title || 'Diagram'}>
      {block.title ? <figcaption className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-200">{block.title}</figcaption> : null}
      {block.description ? <p className="mb-2 text-xs text-slate-600 dark:text-slate-400">{block.description}</p> : null}

      <div className="overflow-x-auto">
        <svg viewBox="0 0 100 80" className="h-56 min-w-[540px] w-full rounded-lg bg-slate-900/20 p-2" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          {connections.map((connection, index) => {
            const from = nodeById[connection.from];
            const to = nodeById[connection.to];
            if (!from || !to) {
              return null;
            }

            return (
              <g key={`${connection.from}-${connection.to}-${index}`}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="rgba(148,163,184,0.78)" strokeWidth="0.8" />
                {connection.label ? (
                  <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 1} fill="rgba(226,232,240,0.9)" fontSize="2.4" textAnchor="middle">
                    {connection.label}
                  </text>
                ) : null}
              </g>
            );
          })}

          {positions.map((node) => (
            <g key={node.id}>
              <circle cx={node.x} cy={node.y} r="5" fill="rgba(15,118,110,0.55)" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" />
              <text x={node.x} y={node.y + 8} fill="rgba(241,245,249,0.95)" fontSize="2.2" textAnchor="middle">
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </figure>
  );
}

export default DiagramRenderer;
