export interface ServiceConfig {
  service: {
    name: string;
    version: string;
    environment: string;
    port: number;
  };
  database: {
    provider: 'dynamodb' | 'cosmosdb';
    tableName: string;
    region?: string;
    endpoint?: string;
    databaseId?: string;
    containerId?: string;
  };
  crm: {
    enabled: boolean;
    provider: 'placeholder' | 'salesforce' | 'hubspot' | 'dynamics';
    apiUrl?: string;
    timeoutMs: number;
    retryAttempts: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    pretty: boolean;
    redactPaths: string[];
  };
  secrets: {
    provider: 'env' | 'aws-secrets-manager' | 'azure-key-vault';
    region?: string;
    vaultName?: string;
  };
}

export interface Secrets {
  databaseConnectionString?: string;
  crmApiKey?: string;
  jwtSecret?: string;
}
