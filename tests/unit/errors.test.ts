import {
  ValidationError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  sanitizeError,
} from '../../src/app/errors';

describe('Error Classes', () => {
  describe('ValidationError', () => {
    it('should create error with correct properties', () => {
      const error = new ValidationError('Invalid input', [{ field: 'name' }]);
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual([{ field: 'name' }]);
    });
  });

  describe('NotFoundError', () => {
    it('should create error with correct properties', () => {
      const error = new NotFoundError('Resource not found');
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });
  });

  describe('ConflictError', () => {
    it('should create error with correct properties', () => {
      const error = new ConflictError('Conflict detected');
      expect(error.message).toBe('Conflict detected');
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
    });
  });

  describe('InternalServerError', () => {
    it('should create error with default message', () => {
      const error = new InternalServerError();
      expect(error.message).toBe('An internal server error occurred');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    });

    it('should create error with custom message', () => {
      const error = new InternalServerError('Custom error');
      expect(error.message).toBe('Custom error');
    });
  });
});

describe('sanitizeError', () => {
  it('should sanitize AppError instances', () => {
    const error = new ValidationError('Invalid input', [{ field: 'name' }]);
    const sanitized = sanitizeError(error);
    expect(sanitized).toEqual({
      code: 'VALIDATION_ERROR',
      message: 'Invalid input',
      details: [{ field: 'name' }],
    });
  });

  it('should sanitize unknown errors', () => {
    const error = new Error('Some error');
    const sanitized = sanitizeError(error);
    expect(sanitized).toEqual({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    });
  });

  it('should sanitize non-Error objects', () => {
    const error = 'string error';
    const sanitized = sanitizeError(error);
    expect(sanitized).toEqual({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    });
  });
});
