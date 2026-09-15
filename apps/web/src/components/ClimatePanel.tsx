import { HistoryIcon } from '../icons/UiIcons';
import { DataTable, Panel, PanelHead, Placeholder, Section } from './primitives';
import { formatTemp, round1, toUnit } from '../lib/format';
import type { HistoryPayload, Unit } from '../types';

function Spark({ payload, unit }: { payload: HistoryPayload; unit: Unit }) {
  const values = (payload.recent ?? [])
    .map((row) => row.max)
    .filter((value): value is number => typeof value === 'number')
    .map((value) => toUnit(value, unit));

  if (values.length < 2) return <Placeholder message="Serie recente non disponibile." />;

  const low = Math.min(...values);
  const high = Math.max(...values);
  const span = Math.max(high - low, 1);
  const point = (value: number, index: number) =>
    `${(index / (values.length - 1)) * 600} ${132 - ((value - low) / span) * 104}`;
  const line = values.map(point).join(' L');

  return (
    <figure className="m-0 px-6 pb-6">
      <svg
        viewBox="0 0 600 150"
        preserveAspectRatio="none"
        className="h-36 w-full"
        role="img"
        aria-label={`Temperatura massima giornaliera recente, da ${Math.round(low)} a ${Math.round(high)} gradi.`}
      >
        <defs>
          <linearGradient id="climate-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8879f7" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8879f7" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M${line} L600 150 L0 150 Z`} fill="url(#climate-fill)" />
        <path
          d={`M${line}`}
          fill="none"
          stroke="#8879f7"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <figcaption className="mt-3 flex justify-between text-[12px] text-faint">
        <span className="num">min {Math.round(low)}°</span>
        <span>Tmax giornaliera · ultimi 30 giorni</span>
        <span className="num">max {Math.round(high)}°</span>
      </figcaption>
    </figure>
  );
}

export function ClimatePanel({
  payload,
  unit,
  loading,
}: {
  payload: HistoryPayload | null;
  unit: Unit;
  loading: boolean;
}) {
  const meta = payload?.meta;
  const anniversary = payload?.anniversary ?? [];

  return (
    <Section
      id="clima"
      title="Lo stesso giorno, negli anni scorsi"
      lead={
        meta
          ? `Archivio ${meta.dataset ?? 'di reanalisi'} dal ${meta.startDate} al ${meta.endDate}. Serve a capire se oggi è una giornata normale per la costa, o un'eccezione.`
          : "Archivio di reanalisi per la costa romagnola: serve a capire se oggi è una giornata normale o un'eccezione."
      }
    >
      <div className="grid grid-flow-dense gap-4 md:grid-cols-12">
        <Panel className="md:col-span-7">
          <PanelHead
            title="Andamento recente"
            note={meta?.dataset ?? 'reanalisi'}
            icon={<HistoryIcon size={18} />}
          />
          {loading && !payload ? (
            <div className="p-6">
              <Placeholder message="Archivio in caricamento…" />
            </div>
          ) : payload ? (
            <Spark payload={payload} unit={unit} />
          ) : (
            <div className="p-6">
              <Placeholder message="Dati storici temporaneamente non disponibili." />
            </div>
          )}
        </Panel>

        <Panel className="md:col-span-5">
          <PanelHead title="Copertura dell'archivio" note="provenienza" />
          <dl className="flex flex-col gap-4 p-6 text-sm">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-faint">Dataset</dt>
              <dd className="mt-1">{meta?.dataset ?? 'ERA5-Land'}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-faint">Intervallo</dt>
              <dd className="num mt-1">
                {meta?.startDate && meta?.endDate ? `${meta.startDate} → ${meta.endDate}` : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-faint">Attribuzione</dt>
              <dd className="mt-1 text-muted">
                {meta?.attribution ?? 'Reanalisi Copernicus C3S, aggiornata con ritardo.'}
              </dd>
            </div>
          </dl>
        </Panel>

        <Panel className="p-6 md:col-span-12">
          {anniversary.length === 0 ? (
            <Placeholder message="Nessun giorno omologo disponibile." />
          ) : (
            <DataTable
              caption="Oggi e lo stesso giorno degli anni precedenti"
              head={['Data', 'Tmax', 'Tmin', 'Media', 'Pioggia', 'Fonte']}
            >
              {anniversary.map((row) => (
                <tr key={row.date} className="transition-colors hover:bg-panel-2/50">
                  <td className="text-ink">{row.date}</td>
                  <td>{formatTemp(row.max, unit)}</td>
                  <td>{formatTemp(row.min, unit)}</td>
                  <td>{formatTemp(row.mean, unit)}</td>
                  <td>
                    {typeof row.precipitation === 'number'
                      ? `${round1(row.precipitation)} mm`
                      : '—'}
                  </td>
                  <td className="text-faint">{row.source ?? '—'}</td>
                </tr>
              ))}
            </DataTable>
          )}
        </Panel>
      </div>
    </Section>
  );
}
