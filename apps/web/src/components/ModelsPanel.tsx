import { WeatherIcon } from '../icons/WeatherIcon';
import { DropIcon, SpreadIcon } from '../icons/UiIcons';
import { DataTable, Meter, Panel, PanelHead, Placeholder, Section } from './primitives';
import { formatTemp, formatDayMonth, round1, toUnit } from '../lib/format';
import type { DayConsensus, ModelSummary } from '../lib/derive';
import type { ForecastModel, Unit } from '../types';

export function ModelsPanel({
  summaries,
  days,
  models,
  unit,
  loading,
}: {
  summaries: ModelSummary[];
  days: DayConsensus[];
  models: ForecastModel[];
  unit: Unit;
  loading: boolean;
}) {
  const todaySpread = days[0]?.spread ?? null;
  const agreement =
    todaySpread === null ? null : Math.max(0, Math.round(100 - Math.min(todaySpread, 6) * 16));

  if (loading && !summaries.length) {
    return (
      <Section id="modelli" title="Cosa dicono i tre modelli">
        <Placeholder message="Confronto multimodello in caricamento…" />
      </Section>
    );
  }

  return (
    <Section
      id="modelli"
      title="Cosa dicono i tre modelli"
      lead="Ogni centro di calcolo produce la sua previsione. Quando lo spread è basso i modelli concordano; quando cresce, la giornata è incerta — e lo diciamo invece di nasconderlo."
    >
      <div className="grid grid-flow-dense gap-4 md:grid-cols-12">
        {/* auto-fit keeps the member row full whatever number of models answered */}
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))] md:col-span-12">
          {summaries.map((model) => (
            <Panel interactive key={model.key}>
              <PanelHead title={model.label} note={model.resolution} />
              <div className="flex items-center gap-5 p-6">
                <WeatherIcon code={model.code} size={62} />
                <div>
                  <p className="num text-2xl font-semibold">
                    {formatTemp(model.min, unit)} → {formatTemp(model.max, unit)}
                  </p>
                  <p className="num mt-1.5 flex items-center gap-1.5 text-[13px] text-cyan">
                    <DropIcon size={14} />
                    {round1(model.rain24h)} mm nelle prossime 24 ore
                  </p>
                </div>
              </div>
            </Panel>
          ))}
        </div>

        <Panel className="md:col-span-5">
          <PanelHead title="Accordo tra i modelli" note="oggi" icon={<SpreadIcon size={18} />} />
          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-end gap-3">
              <span className="num text-5xl font-semibold leading-none">
                {agreement === null ? '—' : agreement}
              </span>
              <span className="num pb-1 text-lg text-muted">/ 100</span>
            </div>
            <Meter value={agreement ?? 0} tone="mint" />
            <p className="text-sm text-muted">
              {todaySpread === null
                ? 'Spread non calcolabile con i dati disponibili.'
                : `Le massime di oggi differiscono di ${round1(todaySpread)}°. Più l'indice è alto, più i modelli raccontano la stessa giornata.`}
            </p>
            <p className="text-[12px] text-faint">
              È una misura di concordanza, non una probabilità di accadimento.
            </p>
          </div>
        </Panel>

        <Panel className="p-6 md:col-span-7">
          {models.length === 0 ? (
            <Placeholder message="Confronto giornaliero non disponibile." />
          ) : (
            <DataTable
              caption="Massime giornaliere per modello · °"
              head={['Giorno', ...models.map((model) => model.label), 'Spread']}
            >
              {days.slice(0, 7).map((day, index) => (
                <tr key={day.date} className="transition-colors hover:bg-panel-2/50">
                  <td className="text-ink">{formatDayMonth(day.date)}</td>
                  {models.map((model) => {
                    const value = model.daily?.temperature_2m_max?.[index];
                    return (
                      <td key={model.key}>
                        {typeof value === 'number' ? `${Math.round(toUnit(value, unit))}°` : '—'}
                      </td>
                    );
                  })}
                  <td className={day.spread !== null && day.spread > 3 ? 'text-amber' : ''}>
                    {day.spread === null ? '—' : `${round1(day.spread)}°`}
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
