import { z } from 'zod';
import { ValidationError } from '../app/errors';

export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const details = result.error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }));

    throw new ValidationError('Validation failed', details);
  }

  return result.data;
}
