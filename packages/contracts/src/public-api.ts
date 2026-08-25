import { z } from 'zod';

export const apiErrorSchema = z.object({
  error: z.string().min(1),
  requestId: z.string().min(1).optional(),
  details: z.record(z.string()).optional(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
