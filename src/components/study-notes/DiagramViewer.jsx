import { useMemo } from 'react';

function DiagramViewer({ block }) {
  const { nodes = [], edges = [], title, description } = block;

  const positions = useMemo(() => {
    const cols = Math.max(2, Math.ceil(Math.sqrt(Math.max(1, nodes.length))));
    return nodes.map((node, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      return {
        ...node,
        x: 10 + col * (80 / Math.max(1, cols - 1)),
        y: 15 + row * 28,
      };
    });
  }, [nodes]);

  const nodeById = useMemo(
    () => Object.fromEntries(positions.map((node) => [node.id, node])),
    [positions]
  );

  return (
    <figure className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3" role="img" aria-label={title || 'Diagram'}>
      {title ? <figcaption className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-200">{title}</figcaption> : null}
      {description ? <p className="mb-2 text-xs text-slate-600 dark:text-slate-400">{description}</p> : null}
      <svg viewBox="0 0 100 80" className="h-44 w-full rounded-lg bg-slate-900/20 p-2" preserveAspectRatio="none" aria-hidden="true">
        {edges.map((edge, index) => {
          const from = nodeById[edge.from];
          const to = nodeById[edge.to];
          if (!from || !to) {
            return null;
          }
          return (
            <g key={`${edge.from}-${edge.to}-${index}`}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="rgba(148,163,184,0.7)" strokeWidth="0.8" />
              {edge.label ? (
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 - 1}
                  fill="rgba(226,232,240,0.9)"
                  fontSize="2.4"
                  textAnchor="middle"
                >
                  {edge.label}
                </text>
              ) : null}
            </g>
          );
        })}

        {positions.map((node) => (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r="4.5" fill="rgba(99,102,241,0.65)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
            <text x={node.x} y={node.y + 7} fill="rgba(241,245,249,0.95)" fontSize="2.4" textAnchor="middle">
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}

export default DiagramViewer;
