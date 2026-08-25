type VercelResponse = { status(code: number): VercelResponse; json(body: unknown): void };

export default function handler(_request: unknown, response: VercelResponse): void {
  response.status(200).json({ status: 'ok', service: 'romagna-meteo-lab-api', version: 'v1' });
}
