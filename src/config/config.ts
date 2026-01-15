import { ServiceConfig } from './types';

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }
  return parsed;
}

function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true';
}

export function loadConfig(): ServiceConfig {
  return {
    service: {
      name: getEnv('SERVICE_NAME', 'subscription-service'),
      version: getEnv('SERVICE_VERSION', '1.0.0'),
      environment: getEnv('NODE_ENV', 'development'),
      port: getEnvNumber('PORT', 3000),
    },
    database: {
      provider: getEnv('DB_PROVIDER', 'dynamodb') as 'dynamodb' | 'cosmosdb',
      tableName: getEnv('DB_TABLE_NAME', 'subscriptions'),
      region: process.env.DB_REGION,
      endpoint: process.env.DB_ENDPOINT,
      databaseId: process.env.DB_DATABASE_ID,
      containerId: process.env.DB_CONTAINER_ID,
    },
    crm: {
      enabled: getEnvBoolean('CRM_ENABLED', false),
      provider: getEnv('CRM_PROVIDER', 'placeholder') as
        | 'placeholder'
        | 'salesforce'
        | 'hubspot'
        | 'dynamics',
      apiUrl: process.env.CRM_API_URL,
      timeoutMs: getEnvNumber('CRM_TIMEOUT_MS', 5000),
      retryAttempts: getEnvNumber('CRM_RETRY_ATTEMPTS', 3),
    },
    logging: {
      level: getEnv('LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error',
      pretty: getEnvBoolean('LOG_PRETTY', false),
      redactPaths: (process.env.LOG_REDACT_PATHS || 'password,apiKey,secret,token').split(','),
    },
    secrets: {
      provider: getEnv('SECRETS_PROVIDER', 'env') as
        | 'env'
        | 'aws-secrets-manager'
        | 'azure-key-vault',
      region: process.env.SECRETS_REGION,
      vaultName: process.env.SECRETS_VAULT_NAME,
    },
  };
}

export function validateConfig(config: ServiceConfig): void {
  if (config.database.provider === 'dynamodb' && !config.database.region) {
    throw new Error('DB_REGION is required when using DynamoDB');
  }

  if (
    config.database.provider === 'cosmosdb' &&
    (!config.database.databaseId || !config.database.containerId)
  ) {
    throw new Error('DB_DATABASE_ID and DB_CONTAINER_ID are required when using CosmosDB');
  }

  if (config.crm.enabled && config.crm.provider !== 'placeholder' && !config.crm.apiUrl) {
    throw new Error('CRM_API_URL is required when CRM is enabled with a real provider');
  }

  if (!['debug', 'info', 'warn', 'error'].includes(config.logging.level)) {
    throw new Error('LOG_LEVEL must be one of: debug, info, warn, error');
  }
}
