import { ChildRecordHandlers } from '../../../src/app/handlers/child-record-handlers';
import {
  ISubscriptionRepository,
  IChildRecordRepository,
} from '../../../src/infra/storage/types';
import { SubscriptionService } from '../../../src/domain/subscription-service';
import { Subscription, ChildRecord } from '../../../src/domain/types';

describe('ChildRecordHandlers', () => {
  let handlers: ChildRecordHandlers;
  let mockSubscriptionRepository: jest.Mocked<ISubscriptionRepository>;
  let mockChildRecordRepository: jest.Mocked<IChildRecordRepository>;
  let subscriptionService: SubscriptionService;

  beforeEach(() => {
    mockSubscriptionRepository = {
      getSubscription: jest.fn(),
      getSubscriptionsByUserId: jest.fn(),
      upsertSubscription: jest.fn(),
      deleteSubscription: jest.fn(),
    };

    mockChildRecordRepository = {
      getChildRecord: jest.fn(),
      getChildRecordsBySubscriptionId: jest.fn(),
      upsertChildRecord: jest.fn(),
      deleteChildRecord: jest.fn(),
    };

    subscriptionService = new SubscriptionService();
    handlers = new ChildRecordHandlers(
      mockSubscriptionRepository,
      mockChildRecordRepository,
      subscriptionService
    );
  });

  describe('upsertChildRecord', () => {
    it('should create a new child record', async () => {
      const subscriptionId = '223e4567-e89b-12d3-a456-426614174000';
      const subscription: Subscription = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        subscriptionId,
        productId: '323e4567-e89b-12d3-a456-426614174000',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockSubscriptionRepository.getSubscription.mockResolvedValue(subscription);
      mockChildRecordRepository.getChildRecord.mockResolvedValue(null);
      mockChildRecordRepository.getChildRecordsBySubscriptionId.mockResolvedValue([]);
      mockChildRecordRepository.upsertChildRecord.mockImplementation((_, child) =>
        Promise.resolve(child)
      );

      const result = await handlers.upsertChildRecord(subscriptionId, {
        childId: 'ABC-123456-7890',
        status: 'active',
        startDate: '2024-01-01',
        firstName: 'John',
        lastName: 'Doe',
        sponsorshipStartDate: '2024-01-01',
      });

      expect(result.childId).toBe('ABC-123456-7890');
      expect(result.subscriptionId).toBe(subscriptionId);
      expect(mockChildRecordRepository.upsertChildRecord).toHaveBeenCalled();
    });

    it('should throw error when subscription does not exist', async () => {
      mockSubscriptionRepository.getSubscription.mockResolvedValue(null);

      await expect(
        handlers.upsertChildRecord('nonexistent', {
          childId: 'ABC-123456-7890',
          status: 'active',
          startDate: '2024-01-01',
          firstName: 'John',
          lastName: 'Doe',
          sponsorshipStartDate: '2024-01-01',
        })
      ).rejects.toThrow('not found');
    });
  });

  describe('getChildRecord', () => {
    it('should return a child record', async () => {
      const subscriptionId = '223e4567-e89b-12d3-a456-426614174000';
      const subscription: Subscription = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        subscriptionId,
        productId: '323e4567-e89b-12d3-a456-426614174000',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const childRecord: ChildRecord = {
        childId: 'ABC-123456-7890',
        status: 'active',
        startDate: '2024-01-01',
        firstName: 'John',
        lastName: 'Doe',
        sponsorshipStartDate: '2024-01-01',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockSubscriptionRepository.getSubscription.mockResolvedValue(subscription);
      mockChildRecordRepository.getChildRecord.mockResolvedValue(childRecord);

      const result = await handlers.getChildRecord(subscriptionId, childRecord.childId);

      expect(result.childId).toBe(childRecord.childId);
      expect(result.subscriptionId).toBe(subscriptionId);
    });

    it('should throw error when child record does not exist', async () => {
      const subscription: Subscription = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        subscriptionId: '223e4567-e89b-12d3-a456-426614174000',
        productId: '323e4567-e89b-12d3-a456-426614174000',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockSubscriptionRepository.getSubscription.mockResolvedValue(subscription);
      mockChildRecordRepository.getChildRecord.mockResolvedValue(null);

      await expect(
        handlers.getChildRecord(subscription.subscriptionId, 'nonexistent')
      ).rejects.toThrow('not found');
    });
  });

  describe('updateChildRecordStatus', () => {
    it('should update child record status', async () => {
      const subscriptionId = '223e4567-e89b-12d3-a456-426614174000';
      const subscription: Subscription = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        subscriptionId,
        productId: '323e4567-e89b-12d3-a456-426614174000',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const childRecord: ChildRecord = {
        childId: 'ABC-123456-7890',
        status: 'active',
        startDate: '2024-01-01',
        firstName: 'John',
        lastName: 'Doe',
        sponsorshipStartDate: '2024-01-01',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockSubscriptionRepository.getSubscription.mockResolvedValue(subscription);
      mockChildRecordRepository.getChildRecord.mockResolvedValue(childRecord);
      mockChildRecordRepository.upsertChildRecord.mockImplementation((_, child) =>
        Promise.resolve(child)
      );

      const result = await handlers.updateChildRecordStatus(
        subscriptionId,
        childRecord.childId,
        { status: 'replacing' }
      );

      expect(result.status).toBe('replacing');
    });

    it('should throw error for invalid status transition', async () => {
      const subscriptionId = '223e4567-e89b-12d3-a456-426614174000';
      const subscription: Subscription = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        subscriptionId,
        productId: '323e4567-e89b-12d3-a456-426614174000',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const childRecord: ChildRecord = {
        childId: 'ABC-123456-7890',
        status: 'cancelled',
        startDate: '2024-01-01',
        firstName: 'John',
        lastName: 'Doe',
        sponsorshipStartDate: '2024-01-01',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockSubscriptionRepository.getSubscription.mockResolvedValue(subscription);
      mockChildRecordRepository.getChildRecord.mockResolvedValue(childRecord);

      await expect(
        handlers.updateChildRecordStatus(subscriptionId, childRecord.childId, {
          status: 'active',
        })
      ).rejects.toThrow('Invalid child record status transition');
    });
  });

  describe('deleteChildRecord', () => {
    it('should delete a child record', async () => {
      const subscriptionId = '223e4567-e89b-12d3-a456-426614174000';
      const subscription: Subscription = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        subscriptionId,
        productId: '323e4567-e89b-12d3-a456-426614174000',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const childRecord: ChildRecord = {
        childId: 'ABC-123456-7890',
        status: 'active',
        startDate: '2024-01-01',
        firstName: 'John',
        lastName: 'Doe',
        sponsorshipStartDate: '2024-01-01',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockSubscriptionRepository.getSubscription.mockResolvedValue(subscription);
      mockChildRecordRepository.getChildRecord.mockResolvedValue(childRecord);
      mockChildRecordRepository.deleteChildRecord.mockResolvedValue();

      await handlers.deleteChildRecord(subscriptionId, childRecord.childId);

      expect(mockChildRecordRepository.deleteChildRecord).toHaveBeenCalledWith(
        subscriptionId,
        childRecord.childId
      );
    });
  });
});
