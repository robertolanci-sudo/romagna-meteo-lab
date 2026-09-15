import { ThermometerIcon, WaveIcon, WindArrow } from '../icons/UiIcons';
import { DataTable, Meter, Panel, PanelHead, Placeholder, Section, Stat } from './primitives';
import { beachScore, compassLabel, formatTemp, formatTime, round1 } from '../lib/format';
import type { MarineNow } from '../lib/derive';
import type { Unit } from '../types';

export function SeaPanel({
  marine,
  unit,
  loading,
  place,
}: {
  marine: MarineNow;
  unit: Unit;
  loading: boolean;
  place: string;
}) {
  const score = beachScore(marine.waveHeight, marine.sst);

  return (
    <Section
      id="mare"
      title="Il mare davanti alla costa"
      lead={`Temperatura dell'acqua e stato dell'onda per ${place}. La griglia marina è offshore: sottoriva i valori restano indicativi.`}
    >
      <div className="grid grid-flow-dense gap-4 md:grid-cols-12">
        <Panel interactive className="md:col-span-5">
          <PanelHead
            title="Temperatura dell'acqua"
            note="live"
            icon={<ThermometerIcon size={18} />}
          />
          <div className="flex items-end gap-4 p-6">
            <span className="num text-[clamp(3rem,6vw,4.6rem)] font-semibold leading-none tracking-[-0.04em]">
              {marine.sst === null ? '—' : formatTemp(marine.sst, unit).replace('°', '')}
            </span>
            <span className="num pb-2 text-xl text-muted">°{unit.toUpperCase()}</span>
          </div>
          <p className="px-6 pb-6 text-sm text-muted">
            Dato Open-Meteo Marine sulla cella d&apos;acqua più vicina alla costa romagnola.
          </p>
        </Panel>

        <Panel interactive className="md:col-span-4">
          <PanelHead title="Onda significativa" note="adesso" icon={<WaveIcon size={18} />} />
          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-end gap-3">
              <span className="num text-4xl font-semibold">
                {marine.waveHeight === null ? '—' : round1(marine.waveHeight)}
              </span>
              <span className="num pb-1 text-base text-muted">m</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              <span className="flex items-center gap-2">
                <WindArrow
                  degrees={Number(marine.waveDirection ?? 0)}
                  size={16}
                  className="text-cyan"
                />
                {marine.waveDirection === null
                  ? 'direzione n/d'
                  : `${compassLabel(marine.waveDirection)} · ${Math.round(marine.waveDirection)}°`}
              </span>
              <span className="num">
                periodo {marine.wavePeriod === null ? '—' : `${round1(marine.wavePeriod)} s`}
              </span>
            </div>
          </div>
        </Panel>

        <div className="md:col-span-3">
          <Stat
            label="Finestra balneare"
            icon={<WaveIcon size={16} />}
            value={score === null ? '—' : `${score} / 100`}
            note="Indice di comfort da onda e temperatura acqua. Non è una probabilità."
          />
          <div className="mt-3 px-1">
            <Meter value={score ?? 0} tone="cyan" />
          </div>
        </div>

        <Panel className="p-6 md:col-span-12">
          {loading && !marine.rows.length ? (
            <Placeholder message="Serie marina in caricamento…" />
          ) : marine.rows.length === 0 ? (
            <Placeholder message="Dati marine temporaneamente non disponibili." />
          ) : (
            <DataTable
              caption="Prossime ore · Open-Meteo Marine"
              head={['Ora', 'Acqua', 'Onda', 'Direzione', 'Periodo']}
            >
              {marine.rows.map((row) => (
                <tr key={row.validAt} className="transition-colors hover:bg-panel-2/50">
                  <td className="text-ink">{formatTime(row.validAt)}</td>
                  <td>{formatTemp(row.values.sea_surface_temperature, unit)}</td>
                  <td>
                    {typeof row.values.wave_height === 'number'
                      ? `${round1(row.values.wave_height)} m`
                      : '—'}
                  </td>
                  <td>
                    {typeof row.values.wave_direction === 'number'
                      ? `${compassLabel(row.values.wave_direction)} ${Math.round(row.values.wave_direction)}°`
                      : '—'}
                  </td>
                  <td>
                    {typeof row.values.wave_period === 'number'
                      ? `${round1(row.values.wave_period)} s`
                      : '—'}
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </Panel>
      </div>
    </Section>
  );
}
