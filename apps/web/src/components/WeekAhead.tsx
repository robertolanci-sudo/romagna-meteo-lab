import { WeatherIcon } from '../icons/WeatherIcon';
import { DropIcon } from '../icons/UiIcons';
import { Panel, Placeholder, Section } from './primitives';
import { conditionLabel, formatDayMonth, formatDayShort, round1, toUnit } from '../lib/format';
import type { DayConsensus } from '../lib/derive';
import type { Unit } from '../types';

const WIDTH = 900;
const HEIGHT = 300;
const MARGIN = { top: 44, right: 26, bottom: 60, left: 46 };

function SevenDayChart({ days, unit }: { days: DayConsensus[]; unit: Unit }) {
  const usable = days
    .slice(0, 7)
    .filter((day) => typeof day.max === 'number' && typeof day.min === 'number');
  if (usable.length < 2) return <Placeholder message="Grafico dei sette giorni in caricamento…" />;

  const values = usable.flatMap((day) => [toUnit(day.min!, unit), toUnit(day.max!, unit)]);
  const low = Math.floor(Math.min(...values) - 1);
  const high = Math.ceil(Math.max(...values) + 1);
  const range = Math.max(high - low, 4);

  const x = (index: number) =>
    MARGIN.left + (index * (WIDTH - MARGIN.left - MARGIN.right)) / Math.max(usable.length - 1, 1);
  const y = (value: number) =>
    MARGIN.top + ((high - value) / range) * (HEIGHT - MARGIN.top - MARGIN.bottom);

  const line = (key: 'max' | 'min') =>
    usable.map((day, index) => `${x(index)},${y(toUnit(day[key]!, unit))}`).join(' ');

  const band = `${usable.map((day, index) => `${x(index)},${y(toUnit(day.max!, unit))}`).join(' ')} ${usable
    .map((day, index) => `${x(usable.length - 1 - index)},${y(toUnit(day.min!, unit))}`)
    .join(' ')}`;

  return (
    <figure className="m-0">
      <div className="rail overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full min-w-[640px]"
          role="img"
          aria-label={`Temperature previste nei prossimi ${usable.length} giorni, minime e massime mediate tra i modelli.`}
        >
          <defs>
            <linearGradient id="week-band" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f0c275" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#4ed6e9" stopOpacity="0.16" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3].map((step) => {
            const value = high - (range * step) / 3;
            return (
              <g key={step}>
                <line
                  x1={MARGIN.left}
                  y1={y(value)}
                  x2={WIDTH - MARGIN.right}
                  y2={y(value)}
                  stroke="#232a4d"
                  strokeWidth="1"
                />
                <text
                  x={MARGIN.left - 10}
                  y={y(value) + 4}
                  textAnchor="end"
                  fill="#5d6485"
                  fontSize="11"
                >
                  {Math.round(value)}°
                </text>
              </g>
            );
          })}

          <polygon points={band} fill="url(#week-band)" />
          <polyline
            points={line('max')}
            fill="none"
            stroke="#f0c275"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={line('min')}
            fill="none"
            stroke="#4ed6e9"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {usable.map((day, index) => (
            <g key={day.date}>
              <circle cx={x(index)} cy={y(toUnit(day.max!, unit))} r="5" fill="#f0c275" />
              <text
                x={x(index)}
                y={y(toUnit(day.max!, unit)) - 13}
                textAnchor="middle"
                fill="#eef1ff"
                fontSize="13"
                fontWeight="600"
              >
                {Math.round(toUnit(day.max!, unit))}°
              </text>
              <circle cx={x(index)} cy={y(toUnit(day.min!, unit))} r="5" fill="#4ed6e9" />
              <text
                x={x(index)}
                y={y(toUnit(day.min!, unit)) + 22}
                textAnchor="middle"
                fill="#949cbe"
                fontSize="12"
              >
                {Math.round(toUnit(day.min!, unit))}°
              </text>
              <text x={x(index)} y={HEIGHT - 12} textAnchor="middle" fill="#949cbe" fontSize="12">
                {formatDayShort(day.date)}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <figcaption className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 px-2 text-[12px] text-muted">
        <span className="flex items-center gap-2">
          <i className="h-2.5 w-2.5 rounded-full bg-amber" /> massima
        </span>
        <span className="flex items-center gap-2">
          <i className="h-2.5 w-2.5 rounded-full bg-cyan" /> minima
        </span>
        <span className="text-faint">
          valori mediati fra i modelli disponibili, non probabilità
        </span>
      </figcaption>
    </figure>
  );
}

export function WeekAhead({
  days,
  unit,
  loading,
}: {
  days: DayConsensus[];
  unit: Unit;
  loading: boolean;
}) {
  const strip = days.slice(0, 14);

  return (
    <Section
      id="settimana"
      title="Sette giorni leggibili, quattordici a colpo d'occhio"
      lead="Le linee sono il consenso di ECMWF, ICON e Météo-France. Dove le due curve si avvicinano la giornata è stabile; dove si allargano cambia il tempo."
    >
      <div className="flex flex-col gap-6">
        <Panel className="p-6 md:p-8">
          {loading && !days.length ? (
            <Placeholder message="Consenso dei modelli in caricamento…" />
          ) : (
            <SevenDayChart days={days} unit={unit} />
          )}
        </Panel>

        {strip.length ? (
          <Panel className="p-2">
            <ol className="rail flex snap-x gap-2 overflow-x-auto p-3">
              {strip.map((day) => (
                <li
                  key={day.date}
                  className="group flex w-[126px] shrink-0 snap-start flex-col items-center gap-2 rounded-2xl border border-transparent bg-panel-2/40 px-3 py-4 transition-[transform,border-color] duration-500 ease-out hover:-translate-y-1.5 hover:border-violet/45"
                >
                  <time className="text-[11px] uppercase tracking-[0.12em] text-faint">
                    {formatDayMonth(day.date)}
                  </time>
                  <WeatherIcon
                    code={day.code}
                    size={48}
                    label={conditionLabel(day.code)}
                    className="transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                  <strong className="num text-lg font-semibold">
                    {day.max === null ? '—' : `${Math.round(toUnit(day.max, unit))}°`}
                  </strong>
                  <span className="num text-[12px] text-muted">
                    min {day.min === null ? '—' : `${Math.round(toUnit(day.min, unit))}°`}
                  </span>
                  <span className="num flex items-center gap-1 text-[11px] text-cyan">
                    <DropIcon size={13} />
                    {day.precipitation === null ? '—' : `${round1(day.precipitation)} mm`}
                  </span>
                </li>
              ))}
            </ol>
          </Panel>
        ) : null}
      </div>
    </Section>
  );
}
