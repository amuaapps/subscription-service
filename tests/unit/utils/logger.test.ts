import { Logger, createLogger } from '../../../src/utils/logger';

describe('Logger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('log levels', () => {
    it('should log debug messages when level is debug', () => {
      const logger = new Logger('debug');
      logger.debug('test message');

      expect(consoleLogSpy).toHaveBeenCalled();
      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.level).toBe('debug');
      expect(logOutput.message).toBe('test message');
    });

    it('should not log debug messages when level is info', () => {
      const logger = new Logger('info');
      logger.debug('test message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should log info messages when level is info', () => {
      const logger = new Logger('info');
      logger.info('test message');

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      const logger = new Logger('warn');
      logger.warn('test warning');

      expect(consoleLogSpy).toHaveBeenCalled();
      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.level).toBe('warn');
    });

    it('should log error messages to console.error', () => {
      const logger = new Logger('error');
      logger.error('test error');

      expect(consoleErrorSpy).toHaveBeenCalled();
      const logOutput = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logOutput.level).toBe('error');
    });
  });

  describe('context logging', () => {
    it('should log with context', () => {
      const logger = new Logger('info');
      logger.info('test message', { userId: '123', action: 'create' });

      expect(consoleLogSpy).toHaveBeenCalled();
      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.userId).toBe('123');
      expect(logOutput.action).toBe('create');
    });

    it('should include timestamp', () => {
      const logger = new Logger('info');
      logger.info('test message');

      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.timestamp).toBeDefined();
      expect(new Date(logOutput.timestamp).toISOString()).toBe(logOutput.timestamp);
    });
  });

  describe('PII redaction', () => {
    it('should redact password fields', () => {
      const logger = new Logger('info');
      logger.info('test message', { password: 'secret123' });

      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.password).toBe('[REDACTED]');
    });

    it('should redact apiKey fields', () => {
      const logger = new Logger('info');
      logger.info('test message', { apiKey: 'key123' });

      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.apiKey).toBe('[REDACTED]');
    });

    it('should redact secret fields', () => {
      const logger = new Logger('info');
      logger.info('test message', { secret: 'secret123' });

      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.secret).toBe('[REDACTED]');
    });

    it('should redact token fields', () => {
      const logger = new Logger('info');
      logger.info('test message', { token: 'token123' });

      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.token).toBe('[REDACTED]');
    });

    it('should redact nested sensitive fields', () => {
      const logger = new Logger('info');
      logger.info('test message', {
        user: {
          name: 'John',
          password: 'secret123',
        },
      });

      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.user.name).toBe('John');
      expect(logOutput.user.password).toBe('[REDACTED]');
    });

    it('should use custom redact paths', () => {
      const logger = new Logger('info', false, ['email', 'ssn']);
      logger.info('test message', { email: 'test@example.com', ssn: '123-45-6789' });

      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.email).toBe('[REDACTED]');
      expect(logOutput.ssn).toBe('[REDACTED]');
    });

    it('should handle arrays with sensitive data', () => {
      const logger = new Logger('info');
      logger.info('test message', {
        users: [
          { name: 'John', password: 'secret1' },
          { name: 'Jane', password: 'secret2' },
        ],
      });

      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.users[0].password).toBe('[REDACTED]');
      expect(logOutput.users[1].password).toBe('[REDACTED]');
    });

    it('should not redact non-sensitive fields', () => {
      const logger = new Logger('info');
      logger.info('test message', { userId: '123', action: 'create' });

      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.userId).toBe('123');
      expect(logOutput.action).toBe('create');
    });
  });

  describe('pretty printing', () => {
    it('should format output with pretty printing', () => {
      const logger = new Logger('info', true);
      logger.info('test message');

      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('\n');
      expect(output).toContain('  ');
    });

    it('should format output without pretty printing', () => {
      const logger = new Logger('info', false);
      logger.info('test message');

      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).not.toContain('\n  ');
    });
  });

  describe('createLogger factory', () => {
    it('should create logger with default settings', () => {
      const logger = createLogger();
      logger.info('test message');

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should create logger with custom settings', () => {
      const logger = createLogger('debug', true, ['custom']);
      logger.debug('test message', { custom: 'value' });

      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.custom).toBe('[REDACTED]');
    });
  });
});
