import { useEffect, useRef, type ReactNode } from 'react';
import { SOURCE_META } from '../lib/guide';
import { conceptStatus, passesDone } from '../lib/logic';
import type { Concept, PaperStatus, Source } from '../lib/types';
import { useStore } from '../lib/store';

// ---------- icons (inline, 20px grid) ----------

const ICONS = {
  plus: 'M10 4v12M4 10h12',
  search: 'M9 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm4.5-1.5L17 17',
  external: 'M11 4h5v5M16 4l-7 7M14 12v4H4V6h4',
  print: 'M6 8V3h8v5M6 14H4V8h12v6h-2M6 11h8v6H6z',
  check: 'M4 10.5l4 4 8-9',
  x: 'M5 5l10 10M15 5L5 15',
  arrowRight: 'M4 10h12M11 5l5 5-5 5',
  arrowLeft: 'M16 10H4M9 5l-5 5 5 5',
  edit: 'M4 16h3l8.5-8.5-3-3L4 13v3ZM11 6l3 3',
  trash: 'M4 6h12M8 6V4h4v2M6 6l1 10h6l1-10',
  merge: 'M6 3v3a4 4 0 0 0 4 4 4 4 0 0 0 4-4V3M10 10v7M7 14l3 3 3-3',
  book: 'M3 4h5a2 2 0 0 1 2 2v10a2 2 0 0 0-2-2H3zM17 4h-5a2 2 0 0 0-2 2v10a2 2 0 0 1 2-2h5z',
  bulb: 'M7 14h6M8 17h4M10 3a5 5 0 0 0-3 9v2h6v-2a5 5 0 0 0-3-9Z',
  link: 'M8.5 11.5a3 3 0 0 0 4.2 0l2.5-2.5a3 3 0 0 0-4.2-4.2L10 5.6M11.5 8.5a3 3 0 0 0-4.2 0L4.8 11a3 3 0 0 0 4.2 4.2l.8-.8',
  chevronDown: 'M5 8l5 5 5-5',
  pin: 'M10 17s5-4.5 5-8.5a5 5 0 0 0-10 0C5 12.5 10 17 10 17Zm0-7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  info: 'M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM10 9v4M10 6.5v.5',
  pause: 'M7 5v10M13 5v10',
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, className = 'h-4 w-4' }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

// ---------- badges ----------

export function SourceBadge({ source }: { source: Source }) {
  const m = SOURCE_META[source];
  return <span className={`inline-flex items-center rounded px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide ${m.badge}`}>{m.label}</span>;
}

const CONCEPT_STYLE = {
  unknown: { label: '모름', cls: 'bg-st-unknown-bg text-st-unknown border-st-unknown-bd', dot: 'bg-st-unknown' },
  lookedup: { label: '찾아봄', cls: 'bg-st-lookup-bg text-st-lookup border-st-lookup-bd', dot: 'bg-st-lookup' },
  understood: { label: '이해함', cls: 'bg-st-understood-bg text-st-understood border-st-understood-bd', dot: 'bg-st-understood' },
} as const;

export function ConceptStatusBadge({ concept }: { concept: Pick<Concept, 'explanation' | 'links'> }) {
  const s = CONCEPT_STYLE[conceptStatus(concept)];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-semibold ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export const CONCEPT_STATUS_STYLE = CONCEPT_STYLE;

/** 3-segment pass progress bar. Blue = done, dark = in progress, grey = pending; all green when finished. */
export function PassProgress({ status, size = 'sm' }: { status: PaperStatus; size?: 'sm' | 'md' }) {
  const done = passesDone(status);
  const finished = done >= 3;
  const w = size === 'sm' ? 'w-6 h-1.5' : 'w-10 h-2';
  return (
    <span className="inline-flex items-center gap-1" aria-label={`3단계 중 ${done}단계 완료`}>
      {[0, 1, 2].map((i) => {
        let color = 'bg-line';
        if (finished) color = 'bg-st-understood';
        else if (i < done) color = 'bg-accent';
        else if (i === done && status !== 'onhold') color = 'bg-ink/70';
        return <span key={i} className={`${w} rounded-full ${color}`} />;
      })}
    </span>
  );
}

// ---------- buttons ----------

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

const BTN: Record<BtnVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'bg-white text-ink-2 border border-line hover:bg-canvas hover:border-line-strong',
  ghost: 'text-ink-4 hover:text-ink hover:bg-tint',
  danger: 'bg-white text-danger border border-line hover:bg-danger-bg',
  success: 'bg-st-understood text-white hover:brightness-95',
};

export function btn(variant: BtnVariant = 'secondary', extra = '') {
  return `inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${BTN[variant]} ${extra}`;
}

export const inputCls =
  'w-full rounded border border-line-strong bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-5 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30';

export function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p role="alert" className="mt-1 text-xs font-medium text-danger">
      {msg}
    </p>
  );
}

// ---------- modal ----------

export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  description,
  children,
  footer,
  width = 'max-w-2xl',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const first = ref.current?.querySelector<HTMLElement>('input, textarea, select, button');
    first?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-10" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className={`w-full ${width} overflow-hidden rounded-lg border border-line-strong bg-white shadow-overlay`}>
        <div className="h-1 bg-gradient-to-r from-accent to-primary" />
        <div className="flex items-start justify-between gap-4 border-b border-line px-7 pb-5 pt-6">
          <div>
            {eyebrow && <p className="mb-1 font-mono text-xs font-medium uppercase tracking-wider text-accent">{eyebrow}</p>}
            <h2 className="text-2xl font-bold text-ink">{title}</h2>
            {description && <p className="mt-1 text-sm text-ink-3">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-ink-4 hover:bg-tint hover:text-ink" aria-label="닫기">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>
        <div className="px-7 py-6">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-line bg-canvas px-7 py-4">{footer}</div>}
      </div>
    </div>
  );
}

// ---------- toasts ----------

export function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed right-6 top-20 z-50 flex w-96 flex-col gap-2 print:hidden" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-lg border bg-white px-4 py-3 shadow-overlay ${
            t.kind === 'error' ? 'border-danger/40' : t.kind === 'success' ? 'border-st-understood-bd' : 'border-line-strong'
          }`}
        >
          <span
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              t.kind === 'error' ? 'bg-danger-bg text-danger' : t.kind === 'success' ? 'bg-st-understood-bg text-st-understood' : 'bg-tint text-accent'
            }`}
          >
            <Icon name={t.kind === 'error' ? 'info' : 'check'} className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">{t.title}</p>
            {t.body && <p className="mt-0.5 text-xs text-ink-3">{t.body}</p>}
          </div>
          <button type="button" onClick={() => dismissToast(t.id)} className="text-ink-4 hover:text-ink" aria-label="알림 닫기">
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function SaveIndicator() {
  const { saveState } = useStore();
  const map = {
    saved: { text: '저장됨 ✓', cls: 'text-st-understood' },
    saving: { text: '저장 중…', cls: 'text-ink-4' },
    error: { text: '저장 실패', cls: 'text-danger' },
  } as const;
  const s = map[saveState];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 font-mono text-xs ${s.cls}`} aria-live="polite">
      <span className={`h-1.5 w-1.5 rounded-full ${saveState === 'saved' ? 'bg-st-understood' : saveState === 'saving' ? 'bg-ink-5' : 'bg-danger'}`} />
      {s.text}
    </span>
  );
}

export function CharCount({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <span className={`font-mono text-xs ${over ? 'text-danger' : 'text-ink-5'}`}>
      {value.length.toLocaleString()} / {max.toLocaleString()}자
    </span>
  );
}
