import {
  EnvSecretsProvider,
  createSecretsProvider,
  AWSSecretsManagerProvider,
  AzureKeyVaultProvider,
} from '../../../src/config/secrets';

describe('Secrets Providers', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('EnvSecretsProvider', () => {
    it('should load secrets from environment variables', async () => {
      process.env.DATABASE_CONNECTION_STRING = 'test-connection';
      process.env.CRM_API_KEY = 'test-api-key';
      process.env.JWT_SECRET = 'test-jwt-secret';

      const provider = new EnvSecretsProvider();
      const secrets = await provider.getSecrets();

      expect(secrets.databaseConnectionString).toBe('test-connection');
      expect(secrets.crmApiKey).toBe('test-api-key');
      expect(secrets.jwtSecret).toBe('test-jwt-secret');
    });

    it('should return undefined for missing secrets', async () => {
      const provider = new EnvSecretsProvider();
      const secrets = await provider.getSecrets();

      expect(secrets.databaseConnectionString).toBeUndefined();
      expect(secrets.crmApiKey).toBeUndefined();
    });

    it('should get individual secret', async () => {
      process.env.CUSTOM_SECRET = 'custom-value';

      const provider = new EnvSecretsProvider();
      const secret = await provider.getSecret('CUSTOM_SECRET');

      expect(secret).toBe('custom-value');
    });
  });

  describe('createSecretsProvider', () => {
    it('should create EnvSecretsProvider', () => {
      const provider = createSecretsProvider('env');
      expect(provider).toBeInstanceOf(EnvSecretsProvider);
    });

    it('should create AWSSecretsManagerProvider with region', () => {
      const provider = createSecretsProvider('aws-secrets-manager', { region: 'us-east-1' });
      expect(provider).toBeInstanceOf(AWSSecretsManagerProvider);
    });

    it('should throw error for AWS without region', () => {
      expect(() => createSecretsProvider('aws-secrets-manager')).toThrow('Region is required');
    });

    it('should create AzureKeyVaultProvider with vault name', () => {
      const provider = createSecretsProvider('azure-key-vault', { vaultName: 'my-vault' });
      expect(provider).toBeInstanceOf(AzureKeyVaultProvider);
    });

    it('should throw error for Azure without vault name', () => {
      expect(() => createSecretsProvider('azure-key-vault')).toThrow('Vault name is required');
    });

    it('should throw error for unknown provider', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => createSecretsProvider('unknown' as any)).toThrow('Unknown secrets provider');
    });
  });

  describe('AWSSecretsManagerProvider', () => {
    it('should throw not implemented error', async () => {
      const provider = new AWSSecretsManagerProvider('us-east-1', 'test-secret');
      await expect(provider.getSecrets()).rejects.toThrow('not yet implemented');
      await expect(provider.getSecret('key')).rejects.toThrow('not yet implemented');
    });
  });

  describe('AzureKeyVaultProvider', () => {
    it('should throw not implemented error', async () => {
      const provider = new AzureKeyVaultProvider('my-vault');
      await expect(provider.getSecrets()).rejects.toThrow('not yet implemented');
      await expect(provider.getSecret('key')).rejects.toThrow('not yet implemented');
    });
  });
});
