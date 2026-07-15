import { useState } from 'react';
import {
  AlertTriangle,
  BadgeInfo,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export type CalloutType =
  | 'info'
  | 'warning'
  | 'success'
  | 'tip'
  | 'critical'
  | 'note'
  | 'interview-tip'
  | 'best-practice'
  | 'scenario'
  | 'example';
export type CalloutIconKey =
  | 'alert-triangle'
  | 'badge-info'
  | 'check-circle'
  | 'lightbulb'
  | 'shield-alert'
  | 'sparkles';
export type CalloutColor = 'primary' | 'accent' | 'warning' | 'success' | 'danger' | 'neutral';

export interface CalloutProps {
  type?: CalloutType;
  title: string;
  content: string;
  icon?: CalloutIconKey;
  color?: CalloutColor;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

const iconMap = {
  'alert-triangle': AlertTriangle,
  'badge-info': BadgeInfo,
  'check-circle': CheckCircle2,
  lightbulb: Lightbulb,
  'shield-alert': ShieldAlert,
  sparkles: Sparkles,
} as const;

const typeDefaults: Record<CalloutType, { icon: CalloutIconKey; color: CalloutColor }> = {
  info: { icon: 'badge-info', color: 'primary' },
  warning: { icon: 'alert-triangle', color: 'warning' },
  success: { icon: 'check-circle', color: 'success' },
  tip: { icon: 'lightbulb', color: 'accent' },
  critical: { icon: 'shield-alert', color: 'danger' },
  note: { icon: 'sparkles', color: 'neutral' },
  'interview-tip': { icon: 'lightbulb', color: 'primary' },
  'best-practice': { icon: 'check-circle', color: 'success' },
  scenario: { icon: 'sparkles', color: 'accent' },
  example: { icon: 'badge-info', color: 'accent' },
};

const colorClasses: Record<CalloutColor, { box: string; text: string }> = {
  primary: { box: 'border-primary/35 bg-primary/10 text-primary', text: 'text-slate-700 dark:text-slate-200' },
  accent: { box: 'border-accent/35 bg-accent/10 text-accent', text: 'text-slate-700 dark:text-slate-200' },
  warning: { box: 'border-warning/40 bg-warning/10 text-warning', text: 'text-slate-700 dark:text-slate-200' },
  success: { box: 'border-success/35 bg-success/10 text-success', text: 'text-slate-700 dark:text-slate-200' },
  danger: { box: 'border-rose-500/35 bg-rose-500/10 text-rose-500', text: 'text-slate-700 dark:text-slate-200' },
  neutral: { box: 'border-white/15 bg-white/10 text-slate-700 dark:text-slate-200', text: 'text-slate-700 dark:text-slate-200' },
};

const markdownClassName =
  'prose prose-sm max-w-none text-slate-700 dark:prose-invert dark:text-slate-200 prose-p:my-2 prose-ul:my-2 prose-ol:my-2';

function Callout({
  type = 'info',
  title,
  content,
  icon,
  color,
  collapsible = false,
  defaultCollapsed = false,
  className = '',
}: CalloutProps) {
  const [collapsed, setCollapsed] = useState(Boolean(defaultCollapsed));

  if (!title || !content) {
    return null;
  }

  const normalizedType = (typeDefaults[type] ? type : 'info') as CalloutType;
  const selectedColor = color || typeDefaults[normalizedType].color;
  const selectedIcon = icon || typeDefaults[normalizedType].icon;
  const Icon = iconMap[selectedIcon];
  const palette = colorClasses[selectedColor];

  return (
    <section className={`mt-4 rounded-xl border p-3 ${palette.box} ${className}`.trim()} role="note" aria-label={normalizedType}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <h4 className="text-xs font-semibold uppercase tracking-wide">{title}</h4>
        </div>

        {collapsible ? (
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="inline-flex min-h-8 items-center gap-1 rounded-md border border-white/20 bg-white/10 px-2 py-1 text-[11px] font-semibold"
            aria-expanded={!collapsed}
          >
            {collapsed ? 'Expand' : 'Collapse'}
            {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </button>
        ) : null}
      </div>

      {!collapsed ? (
        <div className={`mt-2 ${palette.text}`}>
          <div className={markdownClassName}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default Callout;
