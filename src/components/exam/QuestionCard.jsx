import { motion } from 'framer-motion';
import OptionCard from './OptionCard';

function SequenceBuilder({ options, answer, onChange }) {
  const selected = Array.isArray(answer) ? answer : [];

  const toggleChoice = (optionId) => {
    if (selected.includes(optionId)) {
      onChange(selected.filter((item) => item !== optionId));
      return;
    }
    onChange([...selected, optionId]);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-accent/30 bg-accent/10 p-3 text-xs text-accent">
        Build correct sequence by selecting options in order.
      </div>
      <div className="flex min-h-12 flex-wrap gap-2 rounded-xl border border-white/10 bg-slate-900/40 p-3">
        {selected.length === 0 ? (
          <span className="text-xs text-slate-400">No sequence selected</span>
        ) : (
          selected.map((item, index) => {
            const option = options.find((opt) => opt.id === item);
            return (
              <span key={item} className="rounded-full border border-primary/40 bg-primary/15 px-2 py-1 text-xs text-primary">
                {index + 1}. {option?.text}
              </span>
            );
          })
        )}
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {options.map((option, index) => (
          <OptionCard
            key={option.id}
            id={option.id}
            label={option.text}
            displayIndex={index + 1}
            selected={selected.includes(option.id)}
            onSelect={() => toggleChoice(option.id)}
            mode="multiple"
          />
        ))}
      </div>
    </div>
  );
}

function MatchTheFollowing({ options, answer, onChange }) {
  const value = typeof answer === 'object' && answer !== null ? answer : {};

  return (
    <div className="space-y-3">
      {options.left.map((left) => (
        <div key={left.id} className="grid gap-2 rounded-xl border border-white/10 bg-slate-900/30 p-3 md:grid-cols-[1fr_180px]">
          <p className="text-sm text-slate-100">{left.text}</p>
          <select
            value={value[left.id] ?? ''}
            onChange={(event) => onChange({ ...value, [left.id]: event.target.value })}
            className="rounded-lg border border-white/15 bg-slate-900/70 px-2 py-2 text-sm text-slate-100 outline-none focus:border-primary"
          >
            <option value="">Select match</option>
            {options.right.map((right) => (
              <option key={right.id} value={right.id}>
                {right.text}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

function QuestionCard({ question, answer, onChange }) {
  if (!question) {
    return null;
  }

  const type = question.type || question.questionType;
  const hasArrayOptions = Array.isArray(question.options);
  const isSingle = type === 'single_correct'
    || type === 'true_false'
    || type === 'case_study'
    || type === 'scenario'
    || type === 'assertion_reason'
    || (!type && hasArrayOptions);
  const isMulti = type === 'multiple_correct';
  const isSequence = type === 'sequence' || type === 'drag_drop' || type === 'order_sequence';
  const isMatch = type === 'match_following';

  return (
    <motion.section
      key={question.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="glass-card space-y-5 rounded-2xl border border-white/10 p-5 shadow-soft"
    >
      <div className="space-y-3">
        <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs uppercase tracking-wide text-slate-300">
          {String(type).replaceAll('_', ' ')}
        </span>
        {(type === 'case_study' || type === 'scenario') && question.caseContext && (
          <div className="rounded-xl border border-accent/35 bg-accent/10 p-4 text-sm text-slate-100">
            {question.caseContext}
          </div>
        )}
        <h4 className="text-base font-semibold leading-relaxed text-white">{question.question}</h4>
      </div>

      {isSingle && hasArrayOptions && (
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <OptionCard
              key={option.id}
              id={option.id}
              label={option.text}
              displayIndex={index + 1}
              selected={answer === option.id}
              onSelect={() => onChange(option.id)}
            />
          ))}
        </div>
      )}

      {isMulti && hasArrayOptions && (
        <div className="space-y-2">
          {question.options.map((option, index) => {
            const selectedAnswers = Array.isArray(answer) ? answer : [];
            const selected = selectedAnswers.includes(option.id);

            return (
              <OptionCard
                key={option.id}
                id={option.id}
                label={option.text}
                displayIndex={index + 1}
                selected={selected}
                mode="multiple"
                onSelect={() => {
                  if (selected) {
                    onChange(selectedAnswers.filter((item) => item !== option.id));
                  } else {
                    onChange([...selectedAnswers, option.id]);
                  }
                }}
              />
            );
          })}
        </div>
      )}

      {isSequence && hasArrayOptions && (
        <SequenceBuilder options={question.options} answer={answer} onChange={onChange} />
      )}

      {isMatch && question.options?.left && question.options?.right && (
        <MatchTheFollowing options={question.options} answer={answer} onChange={onChange} />
      )}
    </motion.section>
  );
}

export default QuestionCard;
