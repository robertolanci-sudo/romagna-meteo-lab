import { useMemo, useState } from 'react';
import { TopNav } from './components/TopNav';
import { Hero } from './components/Hero';
import { NextHours } from './components/NextHours';
import { WeekAhead } from './components/WeekAhead';
import { SeaPanel } from './components/SeaPanel';
import { MapRoom } from './components/MapRoom';
import { ModelsPanel } from './components/ModelsPanel';
import { ClimatePanel } from './components/ClimatePanel';
import { WidgetStudio } from './components/WidgetStudio';
import { Footer } from './components/Footer';
import { ToastProvider, useToast } from './components/Toast';
import { useDashboard } from './hooks/useDashboard';
import { LOCATIONS } from './lib/api';
import { dayConsensus, hourSlots, marineNow, modelSummaries, rainOutlook } from './lib/derive';
import type { LocationSlug, Unit } from './types';

function Dashboard() {
  const toast = useToast();
  const [slug, setSlug] = useState<LocationSlug>('rimini');
  const [unit, setUnit] = useState<Unit>('c');
  const { forecast, marine, models, history, map, refreshAll } = useDashboard(slug);

  const place = LOCATIONS.find((location) => location.slug === slug) ?? LOCATIONS[0];

  const slots = useMemo(() => hourSlots(forecast.data, 24), [forecast.data]);
  const outlook = useMemo(() => rainOutlook(slots), [slots]);
  const sea = useMemo(() => marineNow(marine.data), [marine.data]);
  const days = useMemo(() => dayConsensus(models.data?.models, 14), [models.data]);
  const summaries = useMemo(() => modelSummaries(models.data?.models), [models.data]);
  const memberModels = useMemo(
    () => (models.data?.models ?? []).filter((model) => model.daily?.time?.length),
    [models.data],
  );

  const handleRefresh = () => {
    refreshAll();
    toast('Aggiorno tutti i dati dal layer API.');
  };

  const handleSlug = (next: LocationSlug) => {
    setSlug(next);
    toast(`Console spostata su ${LOCATIONS.find((l) => l.slug === next)?.label ?? next}.`);
  };

  return (
    <>
      <div className="ambient-field" aria-hidden="true" />
      <a
        href="#adesso"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-abyss"
      >
        Vai al contenuto
      </a>

      <TopNav
        slug={slug}
        onSlug={handleSlug}
        unit={unit}
        onUnit={setUnit}
        onRefresh={handleRefresh}
      />

      <main className="w-full max-w-full overflow-x-hidden">
        <Hero
          forecast={forecast.data}
          marine={sea}
          unit={unit}
          place={place.label}
          coords={place.coords}
          loading={forecast.loading}
        />

        <NextHours
          slots={slots}
          outlook={outlook}
          unit={unit}
          loading={forecast.loading}
          dataset={forecast.data?.meta?.dataset ?? 'multimodello'}
        />

        <WeekAhead days={days} unit={unit} loading={models.loading} />

        <SeaPanel marine={sea} unit={unit} loading={marine.loading} place={place.label} />

        <MapRoom payload={map.data} loading={map.loading} />

        <ModelsPanel
          summaries={summaries}
          days={days}
          models={memberModels}
          unit={unit}
          loading={models.loading}
        />

        <ClimatePanel payload={history.data} unit={unit} loading={history.loading} />

        <WidgetStudio origin={window.location.origin} />
      </main>

      <Footer />
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  );
}
