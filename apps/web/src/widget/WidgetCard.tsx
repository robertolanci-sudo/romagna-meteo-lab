import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { WeatherIcon } from '../icons/WeatherIcon';
import { ThermometerIcon, WaveIcon, WindArrow } from '../icons/UiIcons';
import { fetchForecast, fetchMarine, LOCATIONS } from '../lib/api';
import { hourSlots, marineNow, type HourSlot, type MarineNow } from '../lib/derive';
import { compassLabel, conditionLabel, formatTemp, formatTime, round1 } from '../lib/format';
import type { ForecastPayload } from '../types';
import { THEME_TOKENS, type WidgetConfig } from './config';

type State = {
  forecast: ForecastPayload | null;
  marine: MarineNow | null;
  slots: HourSlot[];
  error: boolean;
  loading: boolean;
};

const REFRESH_MS = 10 * 60 * 1000;

export function WidgetCard({ config }: { config: WidgetConfig }) {
  const [state, setState] = useState<State>({
    forecast: null,
    marine: null,
    slots: [],
    error: false,
    loading: true,
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [forecast, marine] = await Promise.all([
          fetchForecast(config.location),
          config.sea ? fetchMarine(config.location) : Promise.resolve(null),
        ]);
        if (!active) return;
        setState({
          forecast,
          marine: marine ? marineNow(marine) : null,
          slots: hourSlots(forecast, 8),
          error: false,
          loading: false,
        });
      } catch {
        if (active) setState((current) => ({ ...current, error: true, loading: false }));
      }
    };

    void load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [config.location, config.sea]);

  // Let the embedding page size its iframe to the real content height.
  useEffect(() => {
    const report = () => {
      const height = document.documentElement.scrollHeight;
      window.parent?.postMessage({ type: 'romagna-meteo-widget:height', height }, '*');
    };
    report();
    const observer = new ResizeObserver(report);
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, [state, config.layout]);

  const tokens = THEME_TOKENS[config.theme];
  const current = state.forecast?.current;
  const code = Number(current?.weather_code ?? 0);
  const place = LOCATIONS.find((item) => item.slug === config.location)?.label ?? config.location;

  const shell: CSSProperties = {
    background: tokens.surface,
    border: `1px solid ${tokens.border}`,
    color: tokens.ink,
    backdropFilter: config.theme === 'glass' ? 'blur(14px)' : undefined,
  };

  if (state.error) {
    return (
      <div style={shell} className="rounded-3xl p-5 text-sm" role="status">
        <p style={{ color: tokens.muted }}>Meteo di {place} non disponibile in questo momento.</p>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div style={shell} className="rounded-3xl p-5" role="status" aria-live="polite">
        <div className="flex items-center gap-3">
          <span
            className="wx-breathe h-2.5 w-2.5 rounded-full"
            style={{ background: config.accent }}
          />
          <span className="text-sm" style={{ color: tokens.muted }}>
            Carico il meteo di {place}…
          </span>
        </div>
      </div>
    );
  }

  const temperature = formatTemp(current?.temperature_2m, config.unit);
  const sea = state.marine?.sst ?? null;

  const Attribution = () => (
    <a
      href={`${window.location.origin}/#adesso`}
      target="_blank"
      rel="noreferrer noopener"
      className="text-[10px] uppercase tracking-[0.14em] transition-opacity hover:opacity-100"
      style={{ color: tokens.faint, opacity: 0.8 }}
    >
      Romagna Meteo Lab
    </a>
  );

  if (config.layout === 'compact') {
    return (
      <div style={shell} className="flex items-center gap-4 rounded-3xl px-5 py-4">
        <WeatherIcon code={code} size={52} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: tokens.faint }}>
            {place}
          </p>
          <p className="num text-3xl font-semibold leading-tight">{temperature}</p>
        </div>
        {config.sea ? (
          <div className="text-right">
            <p
              className="flex items-center justify-end gap-1.5 text-[11px] uppercase tracking-[0.14em]"
              style={{ color: tokens.faint }}
            >
              <WaveIcon size={13} />
              mare
            </p>
            <p className="num text-xl font-semibold" style={{ color: config.accent }}>
              {sea === null ? '—' : formatTemp(sea, config.unit)}
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  if (config.layout === 'strip') {
    return (
      <div style={shell} className="rounded-3xl px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <WeatherIcon code={code} size={44} />
          <div>
            <p className="num text-2xl font-semibold leading-none">{temperature}</p>
            <p className="text-[12px]" style={{ color: tokens.muted }}>
              {place} · {conditionLabel(code)}
            </p>
          </div>
          {config.sea ? (
            <div className="ml-auto flex items-center gap-2">
              <WaveIcon size={16} className="opacity-70" />
              <span className="num text-lg font-semibold" style={{ color: config.accent }}>
                {sea === null ? '—' : formatTemp(sea, config.unit)}
              </span>
              <span className="text-[11px]" style={{ color: tokens.faint }}>
                acqua
              </span>
            </div>
          ) : null}
        </div>
        {config.hours && state.slots.length ? (
          <ol className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {state.slots.map((slot, index) => (
              <li key={slot.validAt} className="flex shrink-0 flex-col items-center gap-1">
                <span
                  className="text-[10px] uppercase tracking-[0.12em]"
                  style={{ color: tokens.faint }}
                >
                  {index === 0 ? 'ora' : formatTime(slot.validAt)}
                </span>
                <WeatherIcon code={slot.code} size={28} label={null} />
                <span className="num text-[13px] font-semibold">
                  {formatTemp(slot.temperature, config.unit)}
                </span>
              </li>
            ))}
          </ol>
        ) : null}
        <div className="mt-3 flex justify-end">
          <Attribution />
        </div>
      </div>
    );
  }

  return (
    <div style={shell} className="rounded-3xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: tokens.faint }}>
            {place}
          </p>
          <p className="num mt-1 text-[44px] font-semibold leading-none tracking-[-0.03em]">
            {temperature}
          </p>
          <p className="mt-1.5 text-[13px]" style={{ color: tokens.muted }}>
            {conditionLabel(code)}
          </p>
        </div>
        <WeatherIcon code={code} size={82} />
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-2xl px-3 py-2.5" style={{ background: `${tokens.border}55` }}>
          <dt
            className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em]"
            style={{ color: tokens.faint }}
          >
            <ThermometerIcon size={12} /> percepita
          </dt>
          <dd className="num mt-1 text-[15px] font-semibold">
            {formatTemp(current?.apparent_temperature, config.unit)}
          </dd>
        </div>
        <div className="rounded-2xl px-3 py-2.5" style={{ background: `${tokens.border}55` }}>
          <dt
            className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em]"
            style={{ color: tokens.faint }}
          >
            <WindArrow degrees={Number(current?.wind_direction_10m ?? 0)} size={12} /> vento
          </dt>
          <dd className="num mt-1 text-[15px] font-semibold">
            {typeof current?.wind_speed_10m === 'number'
              ? `${compassLabel(Number(current.wind_direction_10m ?? 0))} ${round1(current.wind_speed_10m)}`
              : '—'}
          </dd>
        </div>
        <div
          className="rounded-2xl px-3 py-2.5"
          style={{ background: `${tokens.border}55`, opacity: config.sea ? 1 : 0.45 }}
        >
          <dt
            className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em]"
            style={{ color: tokens.faint }}
          >
            <WaveIcon size={12} /> acqua
          </dt>
          <dd className="num mt-1 text-[15px] font-semibold" style={{ color: config.accent }}>
            {!config.sea || sea === null ? '—' : formatTemp(sea, config.unit)}
          </dd>
        </div>
      </dl>

      {config.hours && state.slots.length ? (
        <ol className="mt-4 flex justify-between gap-2">
          {state.slots.slice(0, 6).map((slot, index) => (
            <li key={slot.validAt} className="flex flex-col items-center gap-1">
              <span
                className="text-[10px] uppercase tracking-[0.1em]"
                style={{ color: tokens.faint }}
              >
                {index === 0 ? 'ora' : formatTime(slot.validAt)}
              </span>
              <WeatherIcon code={slot.code} size={26} label={null} />
              <span className="num text-[12px] font-semibold">
                {formatTemp(slot.temperature, config.unit)}
              </span>
            </li>
          ))}
        </ol>
      ) : null}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[10px]" style={{ color: tokens.faint }}>
          {current?.time ? `aggiornato ${formatTime(current.time)}` : ''}
        </span>
        <Attribution />
      </div>
    </div>
  );
}
