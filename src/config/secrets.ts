import { Secrets } from './types';

export interface ISecretsProvider {
  getSecrets(): Promise<Secrets>;
  getSecret(key: string): Promise<string | undefined>;
}

export class EnvSecretsProvider implements ISecretsProvider {
  async getSecrets(): Promise<Secrets> {
    return {
      databaseConnectionString: process.env.DATABASE_CONNECTION_STRING,
      crmApiKey: process.env.CRM_API_KEY,
      jwtSecret: process.env.JWT_SECRET,
    };
  }

  async getSecret(key: string): Promise<string | undefined> {
    return process.env[key];
  }
}

export class AWSSecretsManagerProvider implements ISecretsProvider {
  constructor(
    private readonly _region: string,
    private readonly _secretName: string
  ) {}

  async getSecrets(): Promise<Secrets> {
    throw new Error('AWS Secrets Manager not yet implemented');
  }

  async getSecret(_key: string): Promise<string | undefined> {
    throw new Error('AWS Secrets Manager not yet implemented');
  }
}

export class AzureKeyVaultProvider implements ISecretsProvider {
  constructor(private readonly _vaultName: string) {}

  async getSecrets(): Promise<Secrets> {
    throw new Error('Azure Key Vault not yet implemented');
  }

  async getSecret(_key: string): Promise<string | undefined> {
    throw new Error('Azure Key Vault not yet implemented');
  }
}

export function createSecretsProvider(
  provider: 'env' | 'aws-secrets-manager' | 'azure-key-vault',
  options?: { region?: string; vaultName?: string }
): ISecretsProvider {
  switch (provider) {
    case 'env':
      return new EnvSecretsProvider();
    case 'aws-secrets-manager':
      if (!options?.region) {
        throw new Error('Region is required for AWS Secrets Manager');
      }
      return new AWSSecretsManagerProvider(options.region, 'subscription-service-secrets');
    case 'azure-key-vault':
      if (!options?.vaultName) {
        throw new Error('Vault name is required for Azure Key Vault');
      }
      return new AzureKeyVaultProvider(options.vaultName);
    default:
      throw new Error(`Unknown secrets provider: ${provider}`);
  }
}
