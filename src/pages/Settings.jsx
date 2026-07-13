import { motion } from 'framer-motion';
import { Database, MoonStar, Shield } from 'lucide-react';

const settingsCards = [
  {
    id: 's1',
    title: 'Theme Preferences',
    description: 'Dark and light mode are persisted with local storage and shared across sessions.',
    icon: MoonStar,
  },
  {
    id: 's2',
    title: 'Local Progress Storage',
    description: 'Study progress and exam attempts will be versioned for migration-safe updates.',
    icon: Database,
  },
  {
    id: 's3',
    title: 'Data Integrity',
    description: 'Question packs are isolated from UI components for maintainable growth beyond 1000+ items.',
    icon: Shield,
  },
];

function Settings() {
  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl border border-white/10 p-6 shadow-soft"
      >
        <h3 className="text-lg font-semibold text-white">Platform Settings</h3>
        <p className="mt-2 text-sm text-slate-300">
          Application-level preferences and foundational data behavior are configured for production-grade expansion.
        </p>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {settingsCards.map((card, index) => (
          <motion.article
            key={card.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
            whileHover={{ y: -4 }}
            className="glass-card rounded-2xl border border-white/10 p-5 shadow-soft"
          >
            <div className="mb-4 inline-flex rounded-xl bg-primary/15 p-2 text-primary">
              <card.icon className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">{card.title}</h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">{card.description}</p>
          </motion.article>
        ))}
      </section>
    </div>
  );
}

export default Settings;
