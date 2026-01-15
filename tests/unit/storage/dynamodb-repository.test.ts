import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import {
  DynamoDBUserRepository,
  DynamoDBSubscriptionRepository,
  DynamoDBChildRecordRepository,
} from '../../../src/infra/storage/dynamodb-repository';

const dynamoMock = mockClient(DynamoDBClient);

describe('DynamoDB Repositories', () => {
  beforeEach(() => {
    dynamoMock.reset();
  });

  describe('DynamoDBUserRepository', () => {
    const tableName = 'test-table';
    let repository: DynamoDBUserRepository;

    beforeEach(() => {
      const client = new DynamoDBClient({});
      repository = new DynamoDBUserRepository(client, tableName);
    });

    it('should have correct interface methods', () => {
      expect(repository.getUser).toBeDefined();
      expect(repository.upsertUser).toBeDefined();
      expect(repository.deleteUser).toBeDefined();
    });
  });

  describe('DynamoDBSubscriptionRepository', () => {
    const tableName = 'test-table';
    let repository: DynamoDBSubscriptionRepository;

    beforeEach(() => {
      const client = new DynamoDBClient({});
      repository = new DynamoDBSubscriptionRepository(client, tableName);
    });

    it('should have correct interface methods', () => {
      expect(repository.getSubscription).toBeDefined();
      expect(repository.getSubscriptionsByUserId).toBeDefined();
      expect(repository.upsertSubscription).toBeDefined();
      expect(repository.deleteSubscription).toBeDefined();
    });
  });

  describe('DynamoDBChildRecordRepository', () => {
    const tableName = 'test-table';
    let repository: DynamoDBChildRecordRepository;

    beforeEach(() => {
      const client = new DynamoDBClient({});
      repository = new DynamoDBChildRecordRepository(client, tableName);
    });

    it('should have correct interface methods', () => {
      expect(repository.getChildRecord).toBeDefined();
      expect(repository.getChildRecordsBySubscriptionId).toBeDefined();
      expect(repository.upsertChildRecord).toBeDefined();
      expect(repository.deleteChildRecord).toBeDefined();
    });
  });
});
