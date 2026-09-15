import { useRef } from 'react';
import { gsap, useGSAP } from '../hooks/useReveal';
import { WeatherScene } from '../icons/WeatherIcon';
import {
  HumidityIcon,
  PressureIcon,
  SunriseIcon,
  ThermometerIcon,
  UvIcon,
  VisibilityIcon,
  WaveIcon,
  WindArrow,
} from '../icons/UiIcons';
import { LiveDot, Stat } from './primitives';
import {
  compassLabel,
  conditionLabel,
  formatTemp,
  formatTime,
  formatDayLong,
  round1,
  uvLabel,
} from '../lib/format';
import type { ForecastPayload, Unit } from '../types';
import type { MarineNow } from '../lib/derive';

export function Hero({
  forecast,
  marine,
  unit,
  place,
  coords,
  loading,
}: {
  forecast: ForecastPayload | null;
  marine: MarineNow;
  unit: Unit;
  place: string;
  coords: string;
  loading: boolean;
}) {
  const scope = useRef<HTMLElement>(null);
  const current = forecast?.current;
  const code = Number(current?.weather_code ?? 0);
  const temperature = typeof current?.temperature_2m === 'number' ? current.temperature_2m : null;

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-hero-line]', { y: 40, opacity: 0, duration: 0.9, stagger: 0.1 })
        .from('[data-hero-scene]', { scale: 0.8, opacity: 0, duration: 1.1 }, '-=0.7')
        .from('[data-hero-stat]', { y: 26, opacity: 0, duration: 0.7, stagger: 0.06 }, '-=0.6');

      gsap.to('[data-hero-scene]', {
        yPercent: 14,
        ease: 'none',
        scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    },
    { scope },
  );

  return (
    <section
      id="adesso"
      ref={scope}
      className="relative mx-auto w-full max-w-[1400px] scroll-mt-28 px-5 pb-20 pt-32 md:px-10 md:pb-28 md:pt-44"
    >
      <div className="grid items-center gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="max-w-5xl">
          <div data-hero-line className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <LiveDot label={loading ? 'sincronizzazione' : 'osservazione live'} />
            <span className="text-[13px] text-faint">
              {current?.time ? `${formatDayLong(current.time)} · ${formatTime(current.time)}` : '—'}
            </span>
          </div>

          <h1
            data-hero-line
            className="mt-6 text-balance text-[clamp(2.6rem,5.2vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.035em]"
          >
            Il cielo sopra {place}, letto adesso e per i prossimi quattordici giorni.
          </h1>

          <p data-hero-line className="mt-6 max-w-2xl text-[16px] leading-relaxed text-muted">
            Osservazione corrente, consenso di tre modelli europei e temperatura del mare — su una
            sola riga temporale, con la provenienza di ogni dato sempre visibile.
          </p>

          <div data-hero-line className="mt-10 flex flex-wrap items-end gap-x-8 gap-y-5">
            <div className="flex items-start">
              <span className="num text-[clamp(4.4rem,9vw,7.4rem)] font-semibold leading-[0.85] tracking-[-0.05em]">
                {temperature === null ? '—' : formatTemp(temperature, unit).replace('°', '')}
              </span>
              <span className="num mt-3 text-2xl text-muted">°{unit.toUpperCase()}</span>
            </div>
            <div className="pb-2">
              <p className="text-xl font-medium">{conditionLabel(code)}</p>
              <p className="mt-1 text-[13px] text-faint">
                {place} · {coords}
              </p>
            </div>
          </div>

          <div data-hero-line className="mt-9 flex flex-wrap gap-3">
            <a
              href="#ore"
              className="rounded-full bg-ink px-6 py-3 text-[14px] font-semibold text-abyss transition-transform duration-300 hover:-translate-y-0.5"
            >
              Guarda le prossime ore
            </a>
            <a
              href="#widget"
              className="rounded-full border border-line px-6 py-3 text-[14px] font-semibold text-ink transition-colors duration-300 hover:border-cyan hover:text-cyan"
            >
              Metti il meteo sul tuo sito
            </a>
          </div>
        </div>

        <div data-hero-scene className="relative mx-auto w-full max-w-[420px]">
          <WeatherScene code={code} />
          <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[
              {
                label: 'Percepita',
                icon: <ThermometerIcon size={18} />,
                value: formatTemp(current?.apparent_temperature, unit),
              },
              {
                label: 'Vento',
                icon: <WindArrow degrees={Number(current?.wind_direction_10m ?? 0)} size={18} />,
                value:
                  typeof current?.wind_speed_10m === 'number'
                    ? `${compassLabel(Number(current.wind_direction_10m ?? 0))} ${round1(current.wind_speed_10m)}`
                    : '—',
                unit: 'km/h',
              },
              {
                label: 'Mare',
                icon: <WaveIcon size={18} />,
                value: marine.sst === null ? '—' : formatTemp(marine.sst, unit),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-line/60 bg-panel/60 px-3 py-4 backdrop-blur-sm"
              >
                <dt className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-faint">
                  <span className="text-cyan">{item.icon}</span>
                  {item.label}
                </dt>
                <dd className="num mt-2 text-base font-semibold">
                  {item.value}
                  {item.unit ? (
                    <span className="ml-1 text-[11px] text-faint">{item.unit}</span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Dense bento: 12 columns, grid-flow-dense, 6+3+3 then 4+4+4 — no empty cell. */}
      <div className="mt-20 grid grid-flow-dense grid-cols-2 gap-4 md:mt-28 md:grid-cols-12">
        <div data-hero-stat className="md:col-span-6">
          <Stat
            label="Umidità relativa"
            icon={<HumidityIcon size={16} />}
            value={
              typeof current?.relative_humidity_2m === 'number'
                ? `${current.relative_humidity_2m}%`
                : '—'
            }
            note="Valore osservato alla stazione di riferimento più vicina."
          />
        </div>
        <div data-hero-stat className="md:col-span-3">
          <Stat
            label="Pressione"
            icon={<PressureIcon size={16} />}
            value={
              typeof current?.surface_pressure === 'number'
                ? `${round1(current.surface_pressure)} hPa`
                : '—'
            }
          />
        </div>
        <div data-hero-stat className="md:col-span-3">
          <Stat
            label="Visibilità"
            icon={<VisibilityIcon size={16} />}
            value={
              typeof current?.visibility === 'number'
                ? `${round1(current.visibility / 1000)} km`
                : '—'
            }
          />
        </div>
        <div data-hero-stat className="md:col-span-4">
          <Stat
            label="Indice UV"
            icon={<UvIcon size={16} />}
            value={
              typeof current?.uv_index === 'number'
                ? `${round1(current.uv_index)} · ${uvLabel(current.uv_index)}`
                : '—'
            }
          />
        </div>
        <div data-hero-stat className="md:col-span-4">
          <Stat
            label="Alba e tramonto"
            icon={<SunriseIcon size={16} />}
            value={
              forecast?.daily?.sunrise?.[0] && forecast?.daily?.sunset?.[0]
                ? `${formatTime(forecast.daily.sunrise[0])} — ${formatTime(forecast.daily.sunset[0])}`
                : '—'
            }
          />
        </div>
        <div data-hero-stat className="md:col-span-4">
          <Stat
            label="Onda significativa"
            icon={<WaveIcon size={16} />}
            value={marine.waveHeight === null ? '—' : `${round1(marine.waveHeight)} m`}
            note={
              marine.wavePeriod === null
                ? 'Griglia marina offshore.'
                : `Periodo ${round1(marine.wavePeriod)} s · griglia offshore.`
            }
          />
        </div>
      </div>
    </section>
  );
}
