import type { ReactNode } from 'react';
import { useSectionReveal } from '../hooks/useReveal';

export function Section({
  id,
  title,
  lead,
  aside,
  children,
  className = '',
}: {
  id: string;
  title: string;
  lead?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const scope = useSectionReveal<HTMLElement>();
  return (
    <section
      id={id}
      ref={scope}
      className={`mx-auto w-full max-w-[1400px] scroll-mt-28 px-5 py-24 md:px-10 md:py-36 ${className}`}
    >
      <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <h2
            data-reveal
            className="text-balance text-[clamp(2rem,3.6vw,3.1rem)] font-semibold leading-[1.05] tracking-[-0.03em]"
          >
            {title}
          </h2>
          {lead ? (
            <p data-reveal className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
              {lead}
            </p>
          ) : null}
        </div>
        {aside ? (
          <div data-reveal className="shrink-0">
            {aside}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function Panel({
  children,
  className = '',
  glow = false,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  interactive?: boolean;
}) {
  return (
    <div
      data-reveal
      className={`panel ${glow ? 'panel-glow' : ''} overflow-hidden ${
        interactive
          ? 'transition-[transform,border-color,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:border-violet/50'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function PanelHead({
  title,
  note,
  icon,
}: {
  title: string;
  note?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line/70 px-6 py-5">
      <div className="flex items-center gap-3">
        {icon ? <span className="text-cyan">{icon}</span> : null}
        <h3 className="text-[15px] font-semibold tracking-[-0.01em]">{title}</h3>
      </div>
      {note ? (
        <span className="text-right text-[11px] uppercase tracking-[0.14em] text-faint">
          {note}
        </span>
      ) : null}
    </div>
  );
}

export function Stat({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="group flex flex-col gap-1.5 rounded-2xl border border-line/60 bg-panel-2/40 p-5 transition-colors duration-500 hover:border-cyan/40">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-faint">
        {icon ? (
          <span className="text-cyan/80 transition-transform duration-500 group-hover:scale-110">
            {icon}
          </span>
        ) : null}
        {label}
      </div>
      <div className="num text-2xl font-semibold text-ink">{value}</div>
      {note ? <div className="text-xs leading-snug text-muted">{note}</div> : null}
    </div>
  );
}

export function Meter({
  value,
  tone = 'violet',
}: {
  value: number;
  tone?: 'violet' | 'cyan' | 'mint';
}) {
  const color =
    tone === 'cyan'
      ? 'from-cyan to-mint'
      : tone === 'mint'
        ? 'from-mint to-cyan'
        : 'from-violet to-cyan';
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-panel-2" role="presentation">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-[width] duration-1000 ease-out`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function LiveDot({ label = 'dati live' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-mint">
      <span className="relative flex h-2 w-2">
        <span className="wx-breathe absolute inline-flex h-full w-full rounded-full bg-mint opacity-70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
      </span>
      {label}
    </span>
  );
}

export function DataTable({
  caption,
  head,
  children,
}: {
  caption: string;
  head: string[];
  children: ReactNode;
}) {
  return (
    <div className="rail overflow-x-auto">
      <table className="w-full min-w-[540px] border-collapse text-left text-[13px]">
        <caption className="pb-3 text-left text-[11px] uppercase tracking-[0.16em] text-faint">
          {caption}
        </caption>
        <thead>
          <tr className="border-b border-line/70">
            {head.map((cell) => (
              <th
                key={cell}
                scope="col"
                className="whitespace-nowrap px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-faint"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="num text-muted [&_td]:whitespace-nowrap [&_td]:px-3 [&_td]:py-2.5 [&_tr]:border-b [&_tr]:border-line/35">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function Placeholder({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-line/70 px-5 py-6 text-sm text-faint">
      <span className="wx-breathe h-2 w-2 rounded-full bg-cyan" />
      {message}
    </div>
  );
}
