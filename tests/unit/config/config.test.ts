import { loadConfig, validateConfig } from '../../../src/config/config';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('loadConfig', () => {
    it('should load config with default values', () => {
      delete process.env.NODE_ENV;
      const config = loadConfig();

      expect(config.service.name).toBe('subscription-service');
      expect(config.service.environment).toBe('development');
      expect(config.service.port).toBe(3000);
      expect(config.database.provider).toBe('dynamodb');
      expect(config.crm.enabled).toBe(false);
      expect(config.logging.level).toBe('info');
    });

    it('should load config from environment variables', () => {
      process.env.SERVICE_NAME = 'test-service';
      process.env.NODE_ENV = 'production';
      process.env.PORT = '8080';
      process.env.DB_PROVIDER = 'cosmosdb';
      process.env.CRM_ENABLED = 'true';
      process.env.LOG_LEVEL = 'debug';

      const config = loadConfig();

      expect(config.service.name).toBe('test-service');
      expect(config.service.environment).toBe('production');
      expect(config.service.port).toBe(8080);
      expect(config.database.provider).toBe('cosmosdb');
      expect(config.crm.enabled).toBe(true);
      expect(config.logging.level).toBe('debug');
    });

    it('should parse boolean values correctly', () => {
      process.env.CRM_ENABLED = 'TRUE';
      process.env.LOG_PRETTY = 'false';

      const config = loadConfig();

      expect(config.crm.enabled).toBe(true);
      expect(config.logging.pretty).toBe(false);
    });

    it('should parse number values correctly', () => {
      process.env.PORT = '9000';
      process.env.CRM_TIMEOUT_MS = '10000';

      const config = loadConfig();

      expect(config.service.port).toBe(9000);
      expect(config.crm.timeoutMs).toBe(10000);
    });

    it('should throw error for invalid number', () => {
      process.env.PORT = 'invalid';

      expect(() => loadConfig()).toThrow('must be a valid number');
    });

    it('should parse redact paths from comma-separated string', () => {
      process.env.LOG_REDACT_PATHS = 'email,ssn,creditCard';

      const config = loadConfig();

      expect(config.logging.redactPaths).toEqual(['email', 'ssn', 'creditCard']);
    });
  });

  describe('validateConfig', () => {
    it('should validate DynamoDB config requires region', () => {
      const config = loadConfig();
      config.database.provider = 'dynamodb';
      config.database.region = undefined;

      expect(() => validateConfig(config)).toThrow('DB_REGION is required');
    });

    it('should validate CosmosDB config requires databaseId and containerId', () => {
      const config = loadConfig();
      config.database.provider = 'cosmosdb';
      config.database.databaseId = undefined;

      expect(() => validateConfig(config)).toThrow('DB_DATABASE_ID and DB_CONTAINER_ID are required');
    });

    it('should validate CRM config requires apiUrl when enabled', () => {
      const config = loadConfig();
      config.database.region = 'us-east-1';
      config.crm.enabled = true;
      config.crm.provider = 'salesforce';
      config.crm.apiUrl = undefined;

      expect(() => validateConfig(config)).toThrow('CRM_API_URL is required');
    });

    it('should allow placeholder CRM without apiUrl', () => {
      const config = loadConfig();
      config.database.region = 'us-east-1';
      config.crm.enabled = true;
      config.crm.provider = 'placeholder';
      config.crm.apiUrl = undefined;

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should validate log level', () => {
      const config = loadConfig();
      config.database.region = 'us-east-1';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config.logging.level = 'invalid' as any;

      expect(() => validateConfig(config)).toThrow('LOG_LEVEL must be one of');
    });

    it('should pass validation with valid config', () => {
      const config = loadConfig();
      config.database.region = 'us-east-1';

      expect(() => validateConfig(config)).not.toThrow();
    });
  });
});
