import { WeatherIcon } from '../icons/WeatherIcon';
import { AlertIcon, DropIcon, WindIcon } from '../icons/UiIcons';
import { LiveDot, Panel, Placeholder, Section } from './primitives';
import { conditionLabel, formatDayShort, formatTemp, formatTime, round1 } from '../lib/format';
import type { HourSlot, RainOutlook } from '../lib/derive';
import type { Unit } from '../types';

function RainBanner({ outlook, loading }: { outlook: RainOutlook; loading: boolean }) {
  if (loading) return <Placeholder message="Calcolo della prossima pioggia…" />;

  const dry = !outlook.next;
  const when = outlook.next ? new Date(outlook.next.validAt) : null;
  const today =
    when &&
    when.toLocaleDateString('it-IT', { timeZone: 'Europe/Rome' }) ===
      new Date().toLocaleDateString('it-IT', { timeZone: 'Europe/Rome' });

  return (
    <Panel
      glow={!dry}
      className={`flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:gap-6 ${
        dry ? '' : 'border-cyan/40'
      }`}
    >
      <div
        className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl ${
          dry ? 'bg-panel-2 text-mint' : 'bg-cyan/10 text-cyan'
        }`}
      >
        {dry ? (
          <AlertIcon size={26} />
        ) : (
          <WeatherIcon code={outlook.next!.code} size={48} label={null} />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.18em] text-faint">Finestra 24 ore</p>
        <p className="mt-1 text-lg font-semibold leading-snug">
          {dry
            ? 'Nessuna pioggia nelle prossime 24 ore'
            : `Prossima pioggia ${today ? 'oggi' : formatDayShort(outlook.next!.validAt.slice(0, 10))} alle ${formatTime(outlook.next!.validAt)}`}
        </p>
        <p className="mt-1 text-sm text-muted">
          {dry
            ? 'Il cielo resta asciutto in tutta la serie oraria disponibile.'
            : `${conditionLabel(outlook.next!.code)} · ${round1(outlook.totalMm)} mm stimati su ${outlook.hoursWithRain} ore bagnate.`}
        </p>
      </div>
    </Panel>
  );
}

export function NextHours({
  slots,
  outlook,
  unit,
  loading,
  dataset,
}: {
  slots: HourSlot[];
  outlook: RainOutlook;
  unit: Unit;
  loading: boolean;
  dataset: string;
}) {
  const peak = slots.length ? Math.max(...slots.map((slot) => slot.temperature)) : 0;
  const floor = slots.length ? Math.min(...slots.map((slot) => slot.temperature)) : 0;
  const span = Math.max(peak - floor, 1);

  return (
    <Section
      id="ore"
      title="Le prossime ore, una per una"
      lead="Temperatura, pioggia attesa e vento ora per ora. La barra sotto ogni colonna misura quanto quell'ora è calda rispetto al resto della giornata."
      aside={<LiveDot label={dataset} />}
    >
      <div className="flex flex-col gap-6">
        <RainBanner outlook={outlook} loading={loading} />

        {slots.length === 0 ? (
          <Placeholder message="Serie oraria in caricamento dal provider…" />
        ) : (
          <Panel className="p-2">
            <ol className="rail flex snap-x gap-2 overflow-x-auto p-3">
              {slots.map((slot, index) => (
                <li
                  key={slot.validAt}
                  className={`group flex w-[104px] shrink-0 snap-start flex-col items-center gap-2.5 rounded-2xl border px-3 py-4 transition-[transform,background-color,border-color] duration-500 ease-out hover:-translate-y-1.5 ${
                    slot.rainExpected
                      ? 'border-cyan/35 bg-cyan/5'
                      : 'border-transparent bg-panel-2/40 hover:border-line'
                  }`}
                >
                  <time className="text-[11px] uppercase tracking-[0.14em] text-faint">
                    {index === 0 ? 'adesso' : formatTime(slot.validAt)}
                  </time>
                  <WeatherIcon
                    code={slot.code}
                    size={46}
                    className="transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                  <strong className="num text-lg font-semibold">
                    {formatTemp(slot.temperature, unit)}
                  </strong>
                  <div
                    className="h-1 w-full overflow-hidden rounded-full bg-line/60"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan to-amber"
                      style={{ width: `${((slot.temperature - floor) / span) * 100}%` }}
                    />
                  </div>
                  <span
                    className={`num flex items-center gap-1 text-[11px] ${
                      slot.rainExpected ? 'text-cyan' : 'text-faint'
                    }`}
                  >
                    <DropIcon size={13} />
                    {slot.precipitation === null ? '—' : `${round1(slot.precipitation)}`}
                  </span>
                  <span className="num flex items-center gap-1 text-[11px] text-faint">
                    <WindIcon size={13} />
                    {slot.wind === null ? '—' : round1(slot.wind)}
                  </span>
                </li>
              ))}
            </ol>
          </Panel>
        )}
      </div>
    </Section>
  );
}
