import type { CSSProperties, ReactNode } from 'react';
import { conditionLabel, weatherKind, type WeatherKind } from '../lib/format';

type Props = {
  code: number;
  size?: number;
  className?: string;
  /** Rendered as the accessible name; pass null for decorative use. */
  label?: string | null;
};

const SUN = '#f5c66b';
const CLOUD = '#c3cbef';
const CLOUD_DEEP = '#7e88b8';
const RAIN = '#5ec6ef';
const BOLT = '#ffd76a';
const SNOW = '#dce8ff';

const Sun = ({ cx, cy, r }: { cx: number; cy: number; r: number }) => (
  <g>
    <g className="wx-sun-rays" style={{ transformOrigin: `${cx}px ${cy}px` }}>
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index * Math.PI) / 4;
        const inner = r + 3.5;
        const outer = r + 8.5;
        return (
          <line
            key={index}
            x1={cx + Math.cos(angle) * inner}
            y1={cy + Math.sin(angle) * inner}
            x2={cx + Math.cos(angle) * outer}
            y2={cy + Math.sin(angle) * outer}
            stroke={SUN}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
        );
      })}
    </g>
    <circle
      className="wx-sun-core"
      style={{ transformOrigin: `${cx}px ${cy}px` }}
      cx={cx}
      cy={cy}
      r={r}
      fill={SUN}
    />
    <circle cx={cx - r * 0.28} cy={cy - r * 0.3} r={r * 0.42} fill="#ffe6a8" opacity={0.75} />
  </g>
);

const Cloud = ({
  x = 0,
  y = 0,
  scale = 1,
  fill = CLOUD,
  className = 'wx-cloud',
}: {
  x?: number;
  y?: number;
  scale?: number;
  fill?: string;
  className?: string;
}) => (
  <g className={className} transform={`translate(${x} ${y}) scale(${scale})`}>
    <path
      d="M18 40c-6.6 0-12-5.4-12-12 0-6.1 4.6-11.2 10.6-11.9C18.9 9 25.6 4 33.4 4c9 0 16.4 6.6 17.7 15.2C57.9 20 63 25.6 63 32.4 63 36.6 59.6 40 55.4 40H18z"
      fill={fill}
    />
  </g>
);

const Drops = ({ xs, color = RAIN }: { xs: number[]; color?: string }) => (
  <g>
    {xs.map((x, index) => (
      <line
        key={x}
        className={`wx-drop wx-d${(index % 4) + 1}`}
        x1={x}
        y1={50}
        x2={x - 2}
        y2={58}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
    ))}
  </g>
);

const Flakes = ({ xs }: { xs: number[] }) => (
  <g>
    {xs.map((x, index) => (
      <g
        key={x}
        className={`wx-flake wx-d${(index % 4) + 1}`}
        style={{ transformOrigin: `${x}px 54px` }}
      >
        <path
          d={`M${x} 50v9M${x - 4} 52.2l8 4.6M${x - 4} 56.8l8-4.6`}
          stroke={SNOW}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      </g>
    ))}
  </g>
);

const SCENES: Record<WeatherKind, ReactNode> = {
  clear: <Sun cx={36} cy={34} r={15} />,
  partly: (
    <>
      <Sun cx={45} cy={24} r={12} />
      <Cloud x={2} y={10} scale={0.86} />
    </>
  ),
  cloudy: (
    <>
      <Cloud x={8} y={2} scale={0.72} fill={CLOUD_DEEP} className="wx-cloud-slow" />
      <Cloud x={0} y={12} scale={0.92} />
    </>
  ),
  fog: (
    <>
      <Cloud x={2} y={4} scale={0.88} fill={CLOUD_DEEP} />
      {[0, 1, 2].map((row) => (
        <line
          key={row}
          className={`wx-fog-bar wx-d${row + 1}`}
          x1={10 + row * 3}
          y1={50 + row * 6}
          x2={58 - row * 3}
          y2={50 + row * 6}
          stroke={CLOUD}
          strokeWidth={3.2}
          strokeLinecap="round"
          opacity={0.75 - row * 0.15}
        />
      ))}
    </>
  ),
  drizzle: (
    <>
      <Cloud x={2} y={6} scale={0.88} />
      <Drops xs={[24, 38, 52]} />
    </>
  ),
  rain: (
    <>
      <Cloud x={2} y={6} scale={0.88} fill={CLOUD_DEEP} />
      <Drops xs={[20, 30, 40, 50, 58]} />
    </>
  ),
  showers: (
    <>
      <Sun cx={52} cy={18} r={9} />
      <Cloud x={0} y={10} scale={0.84} />
      <Drops xs={[22, 34, 46]} />
    </>
  ),
  snow: (
    <>
      <Cloud x={2} y={6} scale={0.88} />
      <Flakes xs={[24, 40, 56]} />
    </>
  ),
  storm: (
    <>
      <Cloud x={2} y={4} scale={0.9} fill={CLOUD_DEEP} />
      <path className="wx-bolt" d="M38 46h12l-8 12h9l-17 20 5-15h-8z" fill={BOLT} />
      <Drops xs={[20, 58]} />
    </>
  ),
};

export function WeatherIcon({ code, size = 56, className = '', label }: Props) {
  const kind = weatherKind(code);
  const accessibleName = label === null ? undefined : (label ?? conditionLabel(code));
  return (
    <svg
      viewBox="0 0 72 72"
      width={size}
      height={size}
      className={className}
      role={accessibleName ? 'img' : 'presentation'}
      aria-label={accessibleName}
      aria-hidden={accessibleName ? undefined : true}
    >
      {SCENES[kind]}
    </svg>
  );
}

/** Oversized hero variant with its own atmospheric wash behind the glyph. */
export function WeatherScene({ code, style }: { code: number; style?: CSSProperties }) {
  const kind = weatherKind(code);
  const wash =
    kind === 'storm'
      ? 'rgba(136,121,247,.35)'
      : kind === 'rain' || kind === 'showers' || kind === 'drizzle'
        ? 'rgba(78,214,233,.3)'
        : kind === 'snow' || kind === 'fog'
          ? 'rgba(195,203,239,.26)'
          : 'rgba(240,194,117,.3)';
  return (
    <div className="relative grid place-items-center" style={style}>
      <div
        className="wx-breathe absolute inset-0 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle at 50% 45%, ${wash}, transparent 68%)` }}
      />
      <WeatherIcon
        code={code}
        size={240}
        className="relative w-full max-w-[240px] drop-shadow-2xl"
      />
    </div>
  );
}
