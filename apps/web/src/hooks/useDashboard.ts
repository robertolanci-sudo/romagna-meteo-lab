import { useCallback, useEffect, useState } from 'react';
import { fetchForecast, fetchHistory, fetchMap, fetchMarine, fetchModels } from '../lib/api';
import type {
  ForecastPayload,
  HistoryPayload,
  LocationSlug,
  MapPayload,
  MarinePayload,
  ModelsPayload,
} from '../types';

export type Resource<T> = { data: T | null; error: string | null; loading: boolean };

const idle = <T>(): Resource<T> => ({ data: null, error: null, loading: true });

/** One loader per endpoint so a failing provider never blanks the whole console. */
function useResource<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<Resource<T>>(idle<T>());

  const run = useCallback(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true }));
    loader()
      .then((data) => active && setState({ data, error: null, loading: false }))
      .catch(
        (error: unknown) =>
          active &&
          setState({
            data: null,
            error: error instanceof Error ? error.message : 'errore sconosciuto',
            loading: false,
          }),
      );
    return () => {
      active = false;
    };
    // Deps are supplied by the caller: one resource, one explicit key set.
  }, deps);

  useEffect(run, [run]);
  return [state, run] as const;
}

export function useDashboard(slug: LocationSlug) {
  const [forecast, reloadForecast] = useResource<ForecastPayload>(
    () => fetchForecast(slug),
    [slug],
  );
  const [marine, reloadMarine] = useResource<MarinePayload>(() => fetchMarine(slug), [slug]);
  const [models, reloadModels] = useResource<ModelsPayload>(() => fetchModels(slug), [slug]);
  const [history, reloadHistory] = useResource<HistoryPayload>(() => fetchHistory(slug), [slug]);
  const [map, reloadMap] = useResource<MapPayload>(() => fetchMap(24), []);

  const refreshAll = useCallback(() => {
    reloadForecast();
    reloadMarine();
    reloadModels();
    reloadHistory();
    reloadMap();
  }, [reloadForecast, reloadMarine, reloadModels, reloadHistory, reloadMap]);

  return { forecast, marine, models, history, map, refreshAll };
}
