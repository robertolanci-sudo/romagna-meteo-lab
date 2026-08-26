type VercelRequest = { method?: string; url?: string };
type VercelResponse = {
  status(code: number): VercelResponse;
  setHeader(name: string, value: string): void;
  send(body: string): void;
};

type DailyPayload = {
  daily?: {
    time?: string[];
    temperature_2m_max?: Array<number | null>;
    temperature_2m_min?: Array<number | null>;
    temperature_2m_mean?: Array<number | null>;
    precipitation_sum?: Array<number | null>;
  };
};

const locations: Record<string, [number, number]> = {
  rimini: [44.0594, 12.5683],
  riccione: [43.9996, 12.6561],
  cattolica: [43.9618, 12.7363],
};

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'GET') {
    response.status(405).send(JSON.stringify({ error: 'method_not_allowed' }));
    return;
  }
  const url = new URL(request.url ?? '/', 'https://romagna-meteo-lab.vercel.app');
  const slug = url.pathname.split('/').filter(Boolean).at(-2) ?? '';
  const point = locations[slug];
  if (!point) {
    response.status(404).send(JSON.stringify({ error: 'location_not_found' }));
    return;
  }
  try {
    const today = new Date();
    const end = new Date(today);
    end.setUTCDate(end.getUTCDate() - 5);
    const start = new Date(end);
    start.setUTCFullYear(start.getUTCFullYear() - 5);
    const upstreamUrl = new URL('https://archive-api.open-meteo.com/v1/archive');
    upstreamUrl.searchParams.set('latitude', String(point[0]));
    upstreamUrl.searchParams.set('longitude', String(point[1]));
    upstreamUrl.searchParams.set('start_date', isoDate(start));
    upstreamUrl.searchParams.set('end_date', isoDate(end));
    upstreamUrl.searchParams.set(
      'daily',
      'temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum',
    );
    upstreamUrl.searchParams.set('timezone', 'Europe/Rome');
    upstreamUrl.searchParams.set('models', 'era5_land');
    const upstream = await fetch(upstreamUrl);
    if (!upstream.ok) {
      response
        .status(502)
        .send(JSON.stringify({ error: 'provider_unavailable', providerStatus: upstream.status }));
      return;
    }
    const payload = (await upstream.json()) as DailyPayload;
    const daily = payload.daily;
    const dates = daily?.time ?? [];
    if (!dates.length) {
      response.status(502).send(JSON.stringify({ error: 'malformed_provider_payload' }));
      return;
    }
    const max = daily?.temperature_2m_max ?? [];
    const min = daily?.temperature_2m_min ?? [];
    const mean = daily?.temperature_2m_mean ?? [];
    const rain = daily?.precipitation_sum ?? [];
    const valid = (value: number | null | undefined): value is number => typeof value === 'number';
    const annual = new Map<
      number,
      { days: number; max: number[]; min: number[]; mean: number[]; precipitation: number }
    >();
    dates.forEach((date, index) => {
      const year = Number(date.slice(0, 4));
      const bucket = annual.get(year) ?? { days: 0, max: [], min: [], mean: [], precipitation: 0 };
      if (valid(max[index])) bucket.max.push(max[index]);
      if (valid(min[index])) bucket.min.push(min[index]);
      if (valid(mean[index])) bucket.mean.push(mean[index]);
      if (valid(rain[index])) bucket.precipitation += rain[index];
      bucket.days += 1;
      annual.set(year, bucket);
    });
    const annualSummary = [...annual.entries()].map(([year, values]) => ({
      year,
      days: values.days,
      max: values.max.length ? Math.max(...values.max) : null,
      min: values.min.length ? Math.min(...values.min) : null,
      mean: values.mean.length
        ? values.mean.reduce((sum, value) => sum + value, 0) / values.mean.length
        : null,
      precipitation: Number(values.precipitation.toFixed(1)),
    }));
    const targetDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome' }).format(today);
    const targetMonthDay = targetDate.slice(5);
    const anniversary = dates.flatMap((date, index) =>
      date.slice(5) === targetMonthDay && valid(max[index])
        ? [
            {
              date,
              max: max[index],
              min: valid(min[index]) ? min[index] : null,
              mean: valid(mean[index]) ? mean[index] : null,
              precipitation: valid(rain[index]) ? rain[index] : null,
              source: 'ERA5-Land',
            },
          ]
        : [],
    );
    try {
      const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast');
      forecastUrl.searchParams.set('latitude', String(point[0]));
      forecastUrl.searchParams.set('longitude', String(point[1]));
      forecastUrl.searchParams.set(
        'daily',
        'temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum',
      );
      forecastUrl.searchParams.set('forecast_days', '1');
      forecastUrl.searchParams.set('timezone', 'Europe/Rome');
      const forecastResponse = await fetch(forecastUrl);
      if (forecastResponse.ok) {
        const forecast = (await forecastResponse.json()) as DailyPayload;
        const forecastDaily = forecast.daily;
        if (
          forecastDaily?.time?.[0] === targetDate &&
          valid(forecastDaily.temperature_2m_max?.[0])
        ) {
          anniversary.unshift({
            date: targetDate,
            max: forecastDaily.temperature_2m_max?.[0] ?? null,
            min: forecastDaily.temperature_2m_min?.[0] ?? null,
            mean: forecastDaily.temperature_2m_mean?.[0] ?? null,
            precipitation: forecastDaily.precipitation_sum?.[0] ?? null,
            source: 'forecast · provvisorio',
          });
        }
      }
    } catch {
      // Keep the ERA5-Land years available if the provisional live value fails.
    }
    const recent = dates.slice(-30).map((date, offset) => {
      const index = dates.length - 30 + offset;
      return {
        date,
        max: max[index] ?? null,
        min: min[index] ?? null,
        mean: mean[index] ?? null,
        precipitation: rain[index] ?? null,
      };
    });
    response.status(200).setHeader('content-type', 'application/json; charset=utf-8');
    response.send(
      JSON.stringify({
        annual: annualSummary,
        anniversary,
        recent,
        meta: {
          source: 'open-meteo-archive',
          dataset: 'ERA5-Land',
          targetDate,
          startDate: dates[0],
          endDate: dates.at(-1),
          attribution: 'Historical weather by Open-Meteo.com · ERA5-Land / Copernicus C3S',
        },
      }),
    );
  } catch (error) {
    response.status(502).send(
      JSON.stringify({
        error: 'provider_unavailable',
        detail: error instanceof Error ? error.message : 'unknown',
      }),
    );
  }
}
