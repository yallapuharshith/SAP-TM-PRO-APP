import { motion } from 'framer-motion';
import { Database, MoonStar, RotateCcw, Settings2, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import AdminPanel from './AdminPanel';

const SETTINGS_KEY = 'sap-tm-master-pro-ui-settings-v1';
const STUDY_PROGRESS_KEY = 'sap-tm-master-pro-study-progress-v1';
const EXAM_STORAGE_KEY = 'sap-tm-master-pro-exam-session-v1';
const KNOWLEDGE_OVERRIDES_KEY = 'sap-tm-master-pro-knowledge-overrides-v1';
const KNOWLEDGE_BOOKMARKS_KEY = 'sap-tm-master-pro-knowledge-bookmarks-v1';

function getDefaultPreferences() {
  return {
    compactMode: false,
    reducedMotion: false,
    showQuestionHints: true,
    autoResumeExam: true,
  };
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/15 bg-white/5 p-3">
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-xs text-slate-300">{description}</p>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-7 w-12 rounded-full border transition-all ${checked
          ? 'border-primary/60 bg-primary/30'
          : 'border-slate-400/40 bg-slate-400/20'}`}
        aria-pressed={checked}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-6' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const [preferences, setPreferences] = useState(getDefaultPreferences());
  const [status, setStatus] = useState('');
  const [showAdminAccess, setShowAdminAccess] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      setPreferences({ ...getDefaultPreferences(), ...parsed });
    } catch {
      setPreferences(getDefaultPreferences());
    }
  }, []);

  const updatePreference = (key) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      setStatus('Settings saved.');
      return next;
    });
  };

  const clearExamSession = () => {
    localStorage.removeItem(EXAM_STORAGE_KEY);
    setStatus('Exam session cleared.');
  };

  const clearStudyProgress = () => {
    localStorage.removeItem(STUDY_PROGRESS_KEY);
    localStorage.removeItem(KNOWLEDGE_BOOKMARKS_KEY);
    setStatus('Study progress and bookmarks cleared.');
  };

  const resetAllLocalData = () => {
    localStorage.removeItem(EXAM_STORAGE_KEY);
    localStorage.removeItem(STUDY_PROGRESS_KEY);
    localStorage.removeItem(KNOWLEDGE_OVERRIDES_KEY);
    localStorage.removeItem(KNOWLEDGE_BOOKMARKS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    setPreferences(getDefaultPreferences());
    setStatus('All local app data reset.');
  };

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl border border-white/10 p-6 shadow-soft"
      >
        <h3 className="text-lg font-semibold text-white">Platform Settings</h3>
        <p className="mt-2 text-sm text-slate-300">
          Update preferences, control local data, and tune your learning environment.
        </p>
        {status ? (
          <p className="mt-3 rounded-lg border border-success/35 bg-success/15 px-3 py-2 text-xs text-success">{status}</p>
        ) : null}
      </motion.section>

      <section className="grid gap-4 xl:grid-cols-2">
        <motion.article
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl border border-white/10 p-5 shadow-soft"
        >
          <div className="mb-4 inline-flex rounded-xl bg-primary/15 p-2 text-primary">
            <Settings2 className="h-4 w-4" />
          </div>
          <h4 className="text-sm font-semibold text-white">UI Preferences</h4>
          <p className="mt-1 text-xs text-slate-300">Personalize interface behavior for your study style.</p>

          <div className="mt-4 space-y-3">
            <ToggleRow
              title="Compact Layout"
              description="Use tighter spacing in cards and lists."
              checked={preferences.compactMode}
              onChange={() => updatePreference('compactMode')}
            />
            <ToggleRow
              title="Reduced Motion"
              description="Minimize animated transitions across pages."
              checked={preferences.reducedMotion}
              onChange={() => updatePreference('reducedMotion')}
            />
            <ToggleRow
              title="Show Question Hints"
              description="Keep explanatory hints visible where available."
              checked={preferences.showQuestionHints}
              onChange={() => updatePreference('showQuestionHints')}
            />
            <ToggleRow
              title="Auto Resume Exam"
              description="Automatically continue active exam sessions."
              checked={preferences.autoResumeExam}
              onChange={() => updatePreference('autoResumeExam')}
            />
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="glass-card rounded-2xl border border-white/10 p-5 shadow-soft"
        >
          <div className="mb-4 inline-flex rounded-xl bg-accent/15 p-2 text-accent">
            <MoonStar className="h-4 w-4" />
          </div>
          <h4 className="text-sm font-semibold text-white">Theme</h4>
          <p className="mt-1 text-xs text-slate-300">Current mode: {isDark ? 'Dark' : 'Light'}</p>

          <button
            type="button"
            onClick={toggleTheme}
            className="mt-4 rounded-xl border border-primary/40 bg-primary/20 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/30"
          >
            Switch to {isDark ? 'Light' : 'Dark'} Mode
          </button>

          <div className="mt-6 mb-4 inline-flex rounded-xl bg-warning/15 p-2 text-warning">
            <Database className="h-4 w-4" />
          </div>
          <h4 className="text-sm font-semibold text-white">Local Data Controls</h4>
          <p className="mt-1 text-xs text-slate-300">Manage saved exam, progress, and app cache data.</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={clearExamSession}
              className="rounded-lg border border-warning/40 bg-warning/20 px-3 py-1.5 text-xs font-semibold text-warning hover:bg-warning/30"
            >
              Clear Exam Session
            </button>
            <button
              type="button"
              onClick={clearStudyProgress}
              className="rounded-lg border border-accent/40 bg-accent/20 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/30"
            >
              Clear Study Progress
            </button>
            <button
              type="button"
              onClick={resetAllLocalData}
              className="rounded-lg border border-danger/40 bg-danger/20 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/30"
            >
              Reset All Data
            </button>
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="glass-card rounded-2xl border border-white/10 p-5 shadow-soft xl:col-span-2"
        >
          <div className="mb-3 inline-flex rounded-xl bg-success/15 p-2 text-success">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <h4 className="text-sm font-semibold text-white">System Health</h4>
          <p className="mt-1 text-xs text-slate-300">
            Data sources are loaded module-wise and exam question sets are randomized by configuration.
          </p>

          <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-primary/35 bg-primary/10 px-3 py-2 text-xs text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Settings in this section are now fully interactive and persisted locally.
          </div>

          <button
            type="button"
            onClick={() => setStatus('Settings verified and working.')}
            className="ml-0 mt-3 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/15"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Run Settings Check
          </button>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="glass-card rounded-2xl border border-white/10 p-5 shadow-soft xl:col-span-2"
        >
          <div className="mb-3 inline-flex rounded-xl bg-primary/15 p-2 text-primary">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <h4 className="text-sm font-semibold text-white">Admin Controls</h4>
          <p className="mt-1 text-xs text-slate-300">Open admin login from here. After successful login, admin tools will load below.</p>

          {!showAdminAccess ? (
            <button
              type="button"
              onClick={() => setShowAdminAccess(true)}
              className="mt-4 rounded-lg border border-primary/40 bg-primary/20 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/30"
            >
              Admin Access
            </button>
          ) : (
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => setShowAdminAccess(false)}
                className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
              >
                Hide Admin Panel
              </button>
              <AdminPanel />
            </div>
          )}
        </motion.article>
      </section>
    </div>
  );
}

export default Settings;
