import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LayersIcon, PauseIcon, PlayIcon, WindArrow } from '../icons/UiIcons';
import { Panel, Placeholder, Section } from './primitives';
import { formatTime, round1 } from '../lib/format';
import type { MapPayload } from '../types';

type Layer = 'precipitation' | 'wind';

const rainColor = (value: number) => {
  const intensity = Math.min(Math.max(value, 0) / 8, 1);
  return `hsl(${Math.max(190, 210 - intensity * 170)} 82% ${Math.max(36, 72 - intensity * 28)}%)`;
};

const windColor = (value: number) =>
  `hsl(${Math.max(185, 220 - Math.min(value, 60) * 1.2)} 78% ${Math.max(42, 72 - Math.min(value, 60) * 0.4)}%)`;

export function MapRoom({ payload, loading }: { payload: MapPayload | null; loading: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.Layer[]>([]);
  const [layer, setLayer] = useState<Layer>('precipitation');
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const times = payload?.times ?? [];
  const lastIndex = Math.max(times.length - 1, 0);

  useEffect(() => {
    if (!host.current || map.current) return;
    const instance = L.map(host.current, { zoomControl: true, preferCanvas: true }).setView(
      [44.02, 12.6],
      10,
    );
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(instance);
    map.current = instance;

    // The section reveal animates this container, so re-measure once it settles.
    const settle = setTimeout(() => instance.invalidateSize(), 900);
    const observer = new ResizeObserver(() => instance.invalidateSize());
    observer.observe(host.current);

    return () => {
      clearTimeout(settle);
      observer.disconnect();
      instance.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const instance = map.current;
    if (!instance || !payload) return;

    markers.current.forEach((marker) => instance.removeLayer(marker));
    markers.current = [];

    payload.points.forEach((point) => {
      const wind = Number(point.windSpeed?.[index] ?? 0);
      const rain = Number(point.precipitation?.[index] ?? 0);
      const bearing = Number(point.windDirection?.[index] ?? 0);

      const marker =
        layer === 'wind'
          ? L.marker([point.latitude, point.longitude], {
              icon: L.divIcon({
                className: '',
                html: `<span class="wind-marker" style="transform:rotate(${bearing + 180}deg);color:${windColor(wind)}">&#10148;</span>`,
                iconSize: [22, 22],
                iconAnchor: [11, 11],
              }),
            }).bindTooltip(`${round1(wind)} km/h · ${Math.round(bearing)}°`)
          : L.circleMarker([point.latitude, point.longitude], {
              radius: 14,
              color: rainColor(rain),
              fillColor: rainColor(rain),
              fillOpacity: Math.max(0.16, Math.min(0.6, 0.16 + rain / 12)),
              weight: 1,
            }).bindTooltip(`${round1(rain)} mm/h`);

      marker.addTo(instance);
      markers.current.push(marker);
    });
  }, [payload, index, layer]);

  useEffect(() => {
    if (!playing || lastIndex === 0) return;
    const timer = setInterval(() => setIndex((value) => (value + 1) % (lastIndex + 1)), 1100);
    return () => clearInterval(timer);
  }, [playing, lastIndex]);

  return (
    <Section
      id="mappa"
      title="Mappa animata della Romagna"
      lead="Griglia oraria su Rimini, Riccione e Cattolica. Scegli pioggia o vento, poi avvia l'animazione per vedere le prossime 24 ore scorrere."
    >
      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line/70 px-5 py-4">
          <div
            role="group"
            aria-label="Livello mappa"
            className="flex rounded-full border border-line/70 bg-panel-2/60 p-1"
          >
            {[
              { id: 'precipitation' as Layer, label: 'Pioggia' },
              { id: 'wind' as Layer, label: 'Vento' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setLayer(option.id)}
                aria-pressed={layer === option.id}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-300 ${
                  layer === option.id ? 'bg-ink text-abyss' : 'text-muted hover:text-ink'
                }`}
              >
                {option.id === 'wind' ? (
                  <WindArrow degrees={90} size={14} />
                ) : (
                  <LayersIcon size={14} />
                )}
                {option.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className="flex items-center gap-2 rounded-full border border-line/70 px-4 py-2 text-[13px] font-medium text-ink transition-colors duration-300 hover:border-cyan hover:text-cyan"
          >
            {playing ? <PauseIcon size={15} /> : <PlayIcon size={15} />}
            {playing ? 'Pausa' : 'Anima 24 ore'}
          </button>

          <label className="flex min-w-[200px] flex-1 items-center gap-3 text-[12px] text-faint">
            <span className="sr-only">Ora della mappa</span>
            <input
              type="range"
              min={0}
              max={lastIndex}
              step={1}
              value={index}
              onChange={(event) => setIndex(Number(event.target.value))}
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-line accent-cyan"
            />
          </label>

          <strong className="num rounded-full bg-panel-2 px-3 py-1.5 text-[13px] text-cyan">
            {times[index] ? formatTime(times[index]) : '—'}
          </strong>
        </div>

        <div className="relative">
          <div ref={host} className="h-[420px] w-full md:h-[560px]" />
          {loading && !payload ? (
            <div className="absolute inset-0 grid place-items-center bg-abyss/70 p-6">
              <Placeholder message="Griglia in caricamento dal provider…" />
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 text-[12px] text-muted">
          {layer === 'wind' ? (
            <>
              <span className="flex items-center gap-2">
                <WindArrow degrees={90} size={14} className="text-cyan" /> la freccia indica dove va
                il vento
              </span>
              <span>colore più caldo = raffica più forte</span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-2">
                <i className="h-2.5 w-2.5 rounded-full bg-cyan" /> azzurro: pioggia debole
              </span>
              <span className="flex items-center gap-2">
                <i className="h-2.5 w-2.5 rounded-full bg-coral" /> rosso: rovescio intenso
              </span>
              <span className="text-faint">valori in mm/h</span>
            </>
          )}
          <span className="ml-auto text-faint">
            {payload?.meta
              ? `${payload.meta.source ?? 'provider'} · ${payload.points.length} punti · ${payload.meta.attribution ?? ''}`
              : 'Fonte Open-Meteo'}
          </span>
        </div>
      </Panel>
    </Section>
  );
}
