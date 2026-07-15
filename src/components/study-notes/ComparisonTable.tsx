import { Download } from 'lucide-react';

export interface ComparisonTableRow {
  id?: string;
  values: Array<string | number | null | undefined>;
  highlight?: boolean;
}

export interface ComparisonTableProps {
  title?: string;
  columns: string[];
  rows: ComparisonTableRow[];
  highlightDifferences?: boolean;
  className?: string;
  exportFileName?: string;
}

function normalizeCell(value: string | number | null | undefined) {
  return String(value ?? '').trim().toLowerCase();
}

function escapeCsv(value: string | number | null | undefined) {
  const raw = String(value ?? '');
  if (raw.includes('"') || raw.includes(',') || raw.includes('\n')) {
    return `"${raw.replaceAll('"', '""')}"`;
  }
  return raw;
}

function toCsv(columns: string[], rows: ComparisonTableRow[]) {
  const header = columns.map(escapeCsv).join(',');
  const body = rows
    .map((row) => {
      const values = columns.map((_, index) => escapeCsv(row.values[index]));
      return values.join(',');
    })
    .join('\n');
  return `${header}\n${body}`;
}

function triggerCsvDownload(fileName: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function ComparisonTable({
  title = 'Comparison Table',
  columns,
  rows,
  highlightDifferences = true,
  className = '',
  exportFileName = 'comparison-table',
}: ComparisonTableProps) {
  const safeColumns = Array.isArray(columns) ? columns.filter((column) => String(column).trim()) : [];
  const safeRows = Array.isArray(rows) ? rows.filter((row) => Array.isArray(row?.values)) : [];

  if (safeColumns.length < 2 || safeColumns.length > 3 || safeRows.length === 0) {
    return null;
  }

  const handleExport = () => {
    const csv = toCsv(safeColumns, safeRows);
    triggerCsvDownload(exportFileName, csv);
  };

  return (
    <section className={`mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 ${className}`.trim()} aria-label="Comparison table">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/15"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-white/10 text-slate-700 dark:text-slate-200">
            <tr>
              {safeColumns.map((column, index) => (
                <th key={`comparison-col-${index}`} className="whitespace-nowrap px-3 py-2 font-semibold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {safeRows.map((row, rowIndex) => {
              const values = safeColumns.map((_, colIndex) => row.values[colIndex]);
              const uniqueCount = new Set(values.map((value) => normalizeCell(value))).size;
              const rowHasDifference = Boolean(row.highlight) || (highlightDifferences && uniqueCount > 1);

              return (
                <tr
                  key={row.id || `comparison-row-${rowIndex + 1}`}
                  className={`border-t border-white/10 ${rowHasDifference ? 'bg-warning/10' : ''}`}
                >
                  {values.map((value, colIndex) => (
                    <td
                      key={`comparison-cell-${rowIndex + 1}-${colIndex + 1}`}
                      className={`px-3 py-2 align-top text-slate-700 dark:text-slate-300 ${rowHasDifference ? 'font-medium' : ''}`}
                    >
                      {String(value ?? '-')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ComparisonTable;
