import { CosmosClient } from '@azure/cosmos';
import {
  CosmosDBUserRepository,
  CosmosDBSubscriptionRepository,
  CosmosDBChildRecordRepository,
} from '../../../src/infra/storage/cosmosdb-repository';

jest.mock('@azure/cosmos');

describe('CosmosDB Repositories', () => {
  const mockClient = {
    database: jest.fn().mockReturnValue({
      container: jest.fn().mockReturnValue({
        item: jest.fn(),
        items: {
          upsert: jest.fn(),
          query: jest.fn(),
        },
      }),
    }),
  } as unknown as CosmosClient;

  describe('CosmosDBUserRepository', () => {
    let repository: CosmosDBUserRepository;

    beforeEach(() => {
      repository = new CosmosDBUserRepository(mockClient, 'test-db', 'test-container');
    });

    it('should have correct interface methods', () => {
      expect(repository.getUser).toBeDefined();
      expect(repository.upsertUser).toBeDefined();
      expect(repository.deleteUser).toBeDefined();
    });
  });

  describe('CosmosDBSubscriptionRepository', () => {
    let repository: CosmosDBSubscriptionRepository;

    beforeEach(() => {
      repository = new CosmosDBSubscriptionRepository(mockClient, 'test-db', 'test-container');
    });

    it('should have correct interface methods', () => {
      expect(repository.getSubscription).toBeDefined();
      expect(repository.getSubscriptionsByUserId).toBeDefined();
      expect(repository.upsertSubscription).toBeDefined();
      expect(repository.deleteSubscription).toBeDefined();
    });
  });

  describe('CosmosDBChildRecordRepository', () => {
    let repository: CosmosDBChildRecordRepository;

    beforeEach(() => {
      repository = new CosmosDBChildRecordRepository(mockClient, 'test-db', 'test-container');
    });

    it('should have correct interface methods', () => {
      expect(repository.getChildRecord).toBeDefined();
      expect(repository.getChildRecordsBySubscriptionId).toBeDefined();
      expect(repository.upsertChildRecord).toBeDefined();
      expect(repository.deleteChildRecord).toBeDefined();
    });
  });
});
