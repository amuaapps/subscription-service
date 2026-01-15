import { z } from 'zod';
import { validateSchema } from '../../src/utils/validation';
import { ValidationError } from '../../src/app/errors';

describe('validateSchema', () => {
  const testSchema = z.object({
    name: z.string().min(1),
    age: z.number().min(0),
  });

  it('should return validated data for valid input', () => {
    const data = { name: 'John', age: 30 };
    const result = validateSchema(testSchema, data);
    expect(result).toEqual(data);
  });

  it('should throw ValidationError for invalid input', () => {
    const data = { name: '', age: -1 };
    expect(() => validateSchema(testSchema, data)).toThrow('Validation failed');
  });

  it('should include validation details in error', () => {
    const data = { name: '', age: -1 };
    try {
      validateSchema(testSchema, data);
      fail('Should have thrown ValidationError');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      const validationError = error as ValidationError;
      expect(validationError.name).toBe('ValidationError');
      expect(validationError.details).toBeDefined();
      expect(Array.isArray(validationError.details)).toBe(true);
      expect(validationError.statusCode).toBe(400);
      expect(validationError.code).toBe('VALIDATION_ERROR');
    }
  });

  it('should handle missing required fields', () => {
    const data = { name: 'John' };
    expect(() => validateSchema(testSchema, data)).toThrow('Validation failed');
  });

  it('should handle extra fields gracefully', () => {
    const data = { name: 'John', age: 30, extra: 'field' };
    const result = validateSchema(testSchema, data);
    expect(result).toEqual({ name: 'John', age: 30 });
  });
});
