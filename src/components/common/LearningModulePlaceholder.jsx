import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function LearningModulePlaceholder({
  title,
  description,
  points = [],
  ctaLabel = 'Open Practice MCQ',
  ctaRoute = '/exam',
}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl border border-white/10 p-6 shadow-soft"
      >
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">{description}</p>

        <button
          type="button"
          onClick={() => navigate(ctaRoute)}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-white shadow-glow"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {points.map((point, index) => (
          <motion.article
            key={`${point}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card rounded-2xl border border-white/10 p-4 shadow-soft"
          >
            <p className="text-sm font-semibold text-white">Module Section {index + 1}</p>
            <p className="mt-2 text-xs text-slate-300">{point}</p>
          </motion.article>
        ))}
      </section>
    </div>
  );
}

export default LearningModulePlaceholder;
