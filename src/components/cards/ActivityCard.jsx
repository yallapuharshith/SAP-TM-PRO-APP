import { motion } from 'framer-motion';

function ActivityCard({ title, items }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl border border-white/10 p-5 shadow-soft"
    >
      <h3 className="mb-4 text-sm font-semibold text-white">{title}</h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-100">{item.label}</p>
              <p className="text-xs text-slate-400">{item.meta}</p>
            </div>
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-300">
              {item.time}
            </span>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}

export default ActivityCard;
