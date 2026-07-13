import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

function OptionCard({ id, label, selected, onSelect, mode = 'single' }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-xl border p-3 text-left transition-all',
        selected
          ? 'border-primary/60 bg-primary/20 text-white shadow-glow'
          : 'border-white/15 bg-white/5 text-slate-200 hover:border-primary/40 hover:bg-white/10'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            'mt-0.5 h-5 w-5 flex-shrink-0 border text-[10px] font-bold',
            mode === 'multiple' ? 'rounded-md' : 'rounded-full',
            selected ? 'border-primary bg-primary text-white' : 'border-slate-500'
          )}>
            <div className="grid h-full w-full place-items-center">{selected ? <Check className="h-3 w-3" /> : ''}</div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">{id}</p>
            <p className="text-sm text-slate-100">{label}</p>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export default OptionCard;
