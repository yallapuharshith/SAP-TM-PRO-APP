import { StudyRendererProps, TableBlock } from './types';

function TableRenderer({ block }: StudyRendererProps<TableBlock>) {
  const columns = Array.isArray(block.columns) ? block.columns : [];
  const rows = Array.isArray(block.rows) ? block.rows : [];

  if (columns.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-white/5">
      <table className="min-w-full text-left text-xs text-slate-700 dark:text-slate-300">
        <thead className="bg-white/10 text-slate-700 dark:text-slate-200">
          <tr>
            {columns.map((column, index) => (
              <th key={`th-${index}`} className="px-3 py-2 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`tr-${rowIndex}`} className="border-t border-white/10">
              {(row || []).map((cell, cellIndex) => (
                <td key={`td-${rowIndex}-${cellIndex}`} className="px-3 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TableRenderer;
