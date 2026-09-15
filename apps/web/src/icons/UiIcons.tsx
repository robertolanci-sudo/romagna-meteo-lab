type IconProps = { size?: number; className?: string; title?: string };

const base = (size: number, className: string, title?: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  className,
  role: title ? ('img' as const) : ('presentation' as const),
  'aria-label': title,
  'aria-hidden': title ? undefined : true,
});

/** Compass arrow that points where the wind is going. */
export function WindArrow({
  degrees = 0,
  size = 22,
  className = '',
  title,
}: IconProps & { degrees?: number }) {
  return (
    <svg {...base(size, className, title)}>
      <g
        style={{ transform: `rotate(${degrees + 180}deg)`, transformOrigin: '12px 12px' }}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3.5 17 20l-5-3.6L7 20z" />
      </g>
    </svg>
  );
}

export function WindIcon({ size = 22, className = '', title }: IconProps) {
  return (
    <svg
      {...base(size, className, title)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
    >
      <g className="wx-cloud">
        <path d="M3 8.5h9.4a2.6 2.6 0 1 0-2.6-2.9" />
        <path d="M3 12.5h13a2.6 2.6 0 1 1-2.6 2.9" opacity={0.75} />
        <path d="M3 16.5h6.6" opacity={0.5} />
      </g>
    </svg>
  );
}

export function WaveIcon({ size = 22, className = '', title }: IconProps) {
  return (
    <svg
      {...base(size, className, title)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
    >
      <g className="wx-wave">
        <path d="M-12 14c3 0 3-3 6-3s3 3 6 3 3-3 6-3 3 3 6 3 3-3 6-3 3 3 6 3" />
        <path d="M-12 19c3 0 3-3 6-3s3 3 6 3 3-3 6-3 3 3 6 3 3-3 6-3 3 3 6 3" opacity={0.55} />
      </g>
    </svg>
  );
}

export function ThermometerIcon({ size = 22, className = '', title }: IconProps) {
  return (
    <svg
      {...base(size, className, title)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
    >
      <path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0z" />
      <path className="wx-breathe" d="M12 17.6V10.5" strokeWidth={2.6} />
    </svg>
  );
}

export function DropIcon({ size = 22, className = '', title }: IconProps) {
  return (
    <svg
      {...base(size, className, title)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinejoin="round"
    >
      <path d="M12 3.2 6.9 10.4a6.2 6.2 0 1 0 10.2 0z" />
      <path className="wx-breathe" d="M9.4 13.6a2.8 2.8 0 0 0 2.6 3.2" strokeLinecap="round" />
    </svg>
  );
}

export function SunriseIcon({ size = 22, className = '', title }: IconProps) {
  return (
    <svg
      {...base(size, className, title)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
    >
      <circle className="wx-breathe" cx="12" cy="14" r="3.4" />
      <path d="M12 6.2V3.4M4.9 14H2.4M21.6 14h-2.5M6.6 8.6 4.9 6.9M19.1 6.9l-1.7 1.7M2.6 19.6h18.8" />
    </svg>
  );
}

export function UvIcon({ size = 22, className = '', title }: IconProps) {
  return (
    <svg
      {...base(size, className, title)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="3.6" />
      <g className="wx-sun-rays" style={{ transformOrigin: '12px 12px' }}>
        <path d="M12 2.6v2.4M12 19v2.4M2.6 12H5M19 12h2.4M5.6 5.6 7.3 7.3M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7" />
      </g>
    </svg>
  );
}

export function PressureIcon({ size = 22, className = '', title }: IconProps) {
  return (
    <svg
      {...base(size, className, title)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
    >
      <path d="M4 16.5a8.5 8.5 0 1 1 16 0" />
      <path className="wx-breathe" d="M12 16.5 15.6 10" strokeWidth={2.2} />
      <circle cx="12" cy="16.5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function VisibilityIcon({ size = 22, className = '', title }: IconProps) {
  return (
    <svg
      {...base(size, className, title)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
    >
      <path d="M2.4 12S6 5.8 12 5.8 21.6 12 21.6 12 18 18.2 12 18.2 2.4 12 2.4 12z" />
      <circle className="wx-breathe" cx="12" cy="12" r="3" />
    </svg>
  );
}

export function HumidityIcon({ size = 22, className = '', title }: IconProps) {
  return (
    <svg
      {...base(size, className, title)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
    >
      <path d="M12 3.4 7.4 9.8a5.6 5.6 0 1 0 9.2 0z" strokeLinejoin="round" />
      <path d="M10 15.4 14 11" />
      <circle cx="10.1" cy="11.2" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="13.9" cy="15.2" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LayersIcon({ size = 22, className = '', title }: IconProps) {
  return (
    <svg
      {...base(size, className, title)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinejoin="round"
    >
      <path d="m12 3 9 5-9 5-9-5z" />
      <path d="m3.6 12.4 8.4 4.6 8.4-4.6" opacity={0.6} />
      <path d="m3.6 16.4 8.4 4.6 8.4-4.6" opacity={0.35} />
    </svg>
  );
}

export function HistoryIcon({ size = 22, className = '', title }: IconProps) {
  return (
    <svg
      {...base(size, className, title)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
    >
      <path d="M3.6 12a8.4 8.4 0 1 0 2.6-6.1" />
      <path d="M3.2 4.4v4.2h4.2" />
      <path d="M12 7.8V12l3 1.8" />
    </svg>
  );
}

export function SpreadIcon({ size = 22, className = '', title }: IconProps) {
  return (
    <svg
      {...base(size, className, title)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
    >
      <path d="M4 7.5h16M4 16.5h16" opacity={0.45} />
      <path className="wx-breathe" d="M8.5 4v16M15.5 4v16" />
    </svg>
  );
}

export function WidgetIcon({ size = 22, className = '', title }: IconProps) {
  return (
    <svg
      {...base(size, className, title)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" opacity={0.6} />
      <rect x="3" y="13" width="8" height="8" rx="2" opacity={0.6} />
      <rect className="wx-breathe" x="13" y="10" width="8" height="11" rx="2" />
    </svg>
  );
}

export function RefreshIcon({ size = 20, className = '', title }: IconProps) {
  return (
    <svg
      {...base(size, className, title)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    >
      <path d="M20 11.6A8 8 0 1 0 18.4 17" />
      <path d="M20.4 5.6v5.4H15" />
    </svg>
  );
}

export function PlayIcon({ size = 18, className = '', title }: IconProps) {
  return (
    <svg {...base(size, className, title)} fill="currentColor">
      <path d="M8 5.2 18 12 8 18.8z" />
    </svg>
  );
}

export function PauseIcon({ size = 18, className = '', title }: IconProps) {
  return (
    <svg {...base(size, className, title)} fill="currentColor">
      <rect x="7" y="5" width="3.6" height="14" rx="1.4" />
      <rect x="13.4" y="5" width="3.6" height="14" rx="1.4" />
    </svg>
  );
}

export function CopyIcon({ size = 18, className = '', title }: IconProps) {
  return (
    <svg
      {...base(size, className, title)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="11" height="11" rx="2.4" />
      <path d="M15 5.6A2.6 2.6 0 0 0 12.4 3H6.6A2.6 2.6 0 0 0 4 5.6v5.8A2.6 2.6 0 0 0 6.6 14" />
    </svg>
  );
}

export function AlertIcon({ size = 22, className = '', title }: IconProps) {
  return (
    <svg
      {...base(size, className, title)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    >
      <path d="M12 3.6 21 19.4H3z" strokeLinejoin="round" />
      <path className="wx-breathe" d="M12 9.6v4.2" />
      <circle cx="12" cy="16.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PinIcon({ size = 20, className = '', title }: IconProps) {
  return (
    <svg
      {...base(size, className, title)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinejoin="round"
    >
      <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

/** Brand mark: a rotating radar sweep over a stable horizon. */
export function BrandMark({ size = 34, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="none" stroke="#2b3360" strokeWidth="1.4" />
      <circle cx="20" cy="20" r="11" fill="none" stroke="#2b3360" strokeWidth="1.2" opacity={0.8} />
      <g className="wx-sun-rays" style={{ transformOrigin: '20px 20px' }}>
        <path d="M20 20 20 2 A18 18 0 0 1 33 7.4z" fill="#4ed6e9" opacity={0.28} />
        <line
          x1="20"
          y1="20"
          x2="20"
          y2="2"
          stroke="#4ed6e9"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>
      <circle className="wx-breathe" cx="20" cy="20" r="3.2" fill="#8879f7" />
    </svg>
  );
}
