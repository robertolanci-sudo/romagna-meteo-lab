import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CopyIcon, WidgetIcon } from '../icons/UiIcons';
import { Panel, PanelHead, Section } from './primitives';
import { useToast } from './Toast';
import { LOCATIONS } from '../lib/api';
import {
  DEFAULT_CONFIG,
  LAYOUT_HEIGHT,
  toQuery,
  type WidgetConfig,
  type WidgetLayout,
  type WidgetTheme,
} from '../widget/config';
import type { LocationSlug, Unit } from '../types';

const LAYOUTS: Array<{ id: WidgetLayout; label: string; note: string }> = [
  { id: 'card', label: 'Scheda', note: 'meteo, mare e prossime ore' },
  { id: 'compact', label: 'Compatto', note: 'una riga: aria e acqua' },
  { id: 'strip', label: 'Striscia', note: 'larga, per header di sito' },
];

const THEMES: Array<{ id: WidgetTheme; label: string }> = [
  { id: 'dark', label: 'Scuro' },
  { id: 'light', label: 'Chiaro' },
  { id: 'glass', label: 'Vetro' },
];

const ACCENTS = ['#4ed6e9', '#8879f7', '#76dbb1', '#f0c275', '#f4806f'];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] uppercase tracking-[0.16em] text-faint">{label}</span>
      {children}
    </div>
  );
}

function Choice<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ id: T; label: string; note?: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          aria-pressed={value === option.id}
          className={`rounded-2xl border px-4 py-2.5 text-left transition-colors duration-300 ${
            value === option.id
              ? 'border-cyan/70 bg-cyan/10 text-ink'
              : 'border-line/70 text-muted hover:border-line hover:text-ink'
          }`}
        >
          <span className="block text-[13px] font-medium">{option.label}</span>
          {option.note ? <span className="block text-[11px] text-faint">{option.note}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function WidgetStudio({ origin }: { origin: string }) {
  const toast = useToast();
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_CONFIG);

  const update = <K extends keyof WidgetConfig>(key: K, value: WidgetConfig[K]) =>
    setConfig((current) => ({ ...current, [key]: value }));

  const url = useMemo(() => `${origin}/widget.html?${toQuery(config)}`, [origin, config]);

  const snippet = useMemo(
    () =>
      `<iframe
  src="${url}"
  title="Meteo e temperatura del mare — ${LOCATIONS.find((l) => l.slug === config.location)?.label}"
  width="100%"
  height="${LAYOUT_HEIGHT[config.layout]}"
  style="border:0;border-radius:24px;max-width:460px"
  loading="lazy"
></iframe>`,
    [url, config.layout, config.location],
  );

  const copy = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(message);
    } catch {
      toast('Copia non riuscita: seleziona il codice manualmente.');
    }
  };

  return (
    <Section
      id="widget"
      title="Porta meteo e temperatura del mare sul tuo sito"
      lead="Scegli località, formato e colori: il codice qui sotto è un iframe autonomo che si aggiorna da solo ogni dieci minuti. Funziona su WordPress, Wix, Shopify e qualunque pagina HTML."
      aside={<WidgetIcon size={30} className="text-cyan" />}
    >
      <div className="grid grid-flow-dense gap-4 lg:grid-cols-12">
        <Panel className="lg:col-span-7">
          <PanelHead title="Configura" note="anteprima in tempo reale" />
          <div className="flex flex-col gap-6 p-6">
            <Field label="Località">
              <Choice
                value={config.location}
                onChange={(value: LocationSlug) => update('location', value)}
                options={LOCATIONS.map((location) => ({
                  id: location.slug,
                  label: location.label,
                  note: location.coords,
                }))}
              />
            </Field>

            <Field label="Formato">
              <Choice
                value={config.layout}
                onChange={(value) => update('layout', value)}
                options={LAYOUTS}
              />
            </Field>

            <Field label="Tema">
              <Choice
                value={config.theme}
                onChange={(value) => update('theme', value)}
                options={THEMES}
              />
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Unità">
                <Choice
                  value={config.unit}
                  onChange={(value: Unit) => update('unit', value)}
                  options={[
                    { id: 'c' as Unit, label: '°C' },
                    { id: 'f' as Unit, label: '°F' },
                  ]}
                />
              </Field>

              <Field label="Colore d'accento">
                <div className="flex flex-wrap gap-2">
                  {ACCENTS.map((accent) => (
                    <button
                      key={accent}
                      type="button"
                      onClick={() => update('accent', accent)}
                      aria-label={`Accento ${accent}`}
                      aria-pressed={config.accent === accent}
                      className={`h-9 w-9 rounded-full border-2 transition-transform duration-300 hover:scale-110 ${
                        config.accent === accent ? 'border-ink' : 'border-transparent'
                      }`}
                      style={{ background: accent }}
                    />
                  ))}
                </div>
              </Field>
            </div>

            <Field label="Contenuti">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'sea' as const, label: 'Temperatura del mare' },
                  { key: 'hours' as const, label: 'Prossime ore' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => update(item.key, !config[item.key])}
                    aria-pressed={config[item.key]}
                    className={`rounded-2xl border px-4 py-2.5 text-[13px] font-medium transition-colors duration-300 ${
                      config[item.key]
                        ? 'border-mint/70 bg-mint/10 text-ink'
                        : 'border-line/70 text-muted hover:text-ink'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </Panel>

        <Panel glow className="lg:col-span-5">
          <PanelHead title="Anteprima" note={`${LAYOUT_HEIGHT[config.layout]} px`} />
          <div className="p-6">
            <div className="rounded-3xl bg-[radial-gradient(circle_at_30%_20%,rgba(136,121,247,.22),transparent_60%)] p-4">
              <iframe
                key={url}
                src={url}
                title="Anteprima del widget meteo"
                className="w-full rounded-2xl border-0"
                height={LAYOUT_HEIGHT[config.layout]}
              />
            </div>
          </div>
        </Panel>

        <Panel className="lg:col-span-12">
          <PanelHead title="Codice da incollare" note="iframe autonomo" />
          <div className="flex flex-col gap-4 p-6">
            <pre className="rail overflow-x-auto rounded-2xl border border-line/60 bg-abyss/70 p-5 text-[12.5px] leading-relaxed text-muted">
              <code>{snippet}</code>
            </pre>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => copy(snippet, 'Codice iframe copiato negli appunti.')}
                className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-abyss transition-transform duration-300 hover:-translate-y-0.5"
              >
                <CopyIcon size={16} />
                Copia il codice
              </button>
              <button
                type="button"
                onClick={() => copy(url, 'Link diretto del widget copiato.')}
                className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-[13px] font-semibold text-ink transition-colors duration-300 hover:border-cyan hover:text-cyan"
              >
                <CopyIcon size={16} />
                Copia solo il link
              </button>
              <a
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-[13px] font-semibold text-muted transition-colors duration-300 hover:border-line hover:text-ink"
              >
                Apri a tutta pagina
              </a>
            </div>
            <p className="text-[12px] leading-relaxed text-faint">
              Il widget si ridimensiona da solo: se vuoi l&apos;altezza automatica, ascolta sulla
              pagina ospite il messaggio{' '}
              <code className="num text-cyan">romagna-meteo-widget:height</code> e applicalo
              all&apos;iframe.
            </p>
          </div>
        </Panel>
      </div>
    </Section>
  );
}
