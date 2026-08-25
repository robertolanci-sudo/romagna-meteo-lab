import { rankModels, type ModelBattleInput } from '@romagna-meteo/domain';

export class ModelBattleApi {
  constructor(private readonly inputs: ModelBattleInput[] = []) {}

  handle(request: Request): Response {
    const url = new URL(request.url);
    const metric = url.searchParams.get('metric') ?? 'mae';
    const rows = rankModels(this.inputs, metric);
    return new Response(
      JSON.stringify({
        data: rows,
        meta: {
          metric,
          note: 'Lower score is better; incomplete coverage is not ranked as reliable.',
        },
      }),
      {
        headers: { 'content-type': 'application/json; charset=utf-8' },
      },
    );
  }
}
