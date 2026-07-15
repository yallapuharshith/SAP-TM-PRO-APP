import { Clock3, Timer } from 'lucide-react';

function formatTime(seconds = 0) {
  const safe = Math.max(0, Number(seconds) || 0);
  const min = Math.floor(safe / 60);
  const sec = safe % 60;
  return `${min}m ${String(sec).padStart(2, '0')}s`;
}

function ReadingProgress({ progressPercent, completionPercent, completedSections, totalSections, timeSpentSeconds }) {
  return (
    <section className="glass-card rounded-2xl border border-white/10 p-4 shadow-soft" aria-label="Reading progress">
      <div className="mb-2 flex items-center gap-2">
        <Timer className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Progress</h3>
      </div>
      <p className="text-xs text-slate-700 dark:text-slate-300">Topic reading progress: {progressPercent}%</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-700/60">
        <div style={{ width: `${progressPercent}%` }} className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500" />
      </div>

      <p className="mt-3 text-xs text-slate-700 dark:text-slate-300">Module completion: {completionPercent}%</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Sections completed: {completedSections}/{totalSections}
      </p>
      <div className="mt-2 inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-700 dark:text-slate-300">
        <Clock3 className="h-3.5 w-3.5" />
        Time spent: {formatTime(timeSpentSeconds)}
      </div>
    </section>
  );
}

export default ReadingProgress;
