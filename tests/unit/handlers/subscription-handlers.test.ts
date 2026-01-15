import { SubscriptionHandlers } from '../../../src/app/handlers/subscription-handlers';
import {
  ISubscriptionRepository,
  IChildRecordRepository,
  IUserRepository,
} from '../../../src/infra/storage/types';
import { SubscriptionService } from '../../../src/domain/subscription-service';
import { Subscription, User } from '../../../src/domain/types';

describe('SubscriptionHandlers', () => {
  let handlers: SubscriptionHandlers;
  let mockSubscriptionRepository: jest.Mocked<ISubscriptionRepository>;
  let mockChildRecordRepository: jest.Mocked<IChildRecordRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;
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

    mockUserRepository = {
      getUser: jest.fn(),
      upsertUser: jest.fn(),
      deleteUser: jest.fn(),
    };

    subscriptionService = new SubscriptionService();
    handlers = new SubscriptionHandlers(
      mockSubscriptionRepository,
      mockChildRecordRepository,
      mockUserRepository,
      subscriptionService
    );
  });

  describe('upsertSubscription', () => {
    it('should create a new subscription', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const subscriptionId = '223e4567-e89b-12d3-a456-426614174000';
      const user: User = {
        userId,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockUserRepository.getUser.mockResolvedValue(user);
      mockSubscriptionRepository.getSubscription.mockResolvedValue(null);
      mockChildRecordRepository.getChildRecordsBySubscriptionId.mockResolvedValue([]);
      mockSubscriptionRepository.upsertSubscription.mockImplementation((sub) =>
        Promise.resolve(sub)
      );

      const result = await handlers.upsertSubscription({
        userId,
        subscriptionId,
        productId: '323e4567-e89b-12d3-a456-426614174000',
        status: 'active',
        metadata: {},
      });

      expect(result.subscriptionId).toBe(subscriptionId);
      expect(result.status).toBe('active');
      expect(mockSubscriptionRepository.upsertSubscription).toHaveBeenCalled();
    });

    it('should throw error when user does not exist', async () => {
      mockUserRepository.getUser.mockResolvedValue(null);

      await expect(
        handlers.upsertSubscription({
          userId: '123e4567-e89b-12d3-a456-426614174000',
          subscriptionId: '223e4567-e89b-12d3-a456-426614174000',
          productId: '323e4567-e89b-12d3-a456-426614174000',
          status: 'active',
          metadata: {},
        })
      ).rejects.toThrow('not found');
    });
  });

  describe('getSubscription', () => {
    it('should return a subscription with child records', async () => {
      const subscription: Subscription = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        subscriptionId: '223e4567-e89b-12d3-a456-426614174000',
        productId: '323e4567-e89b-12d3-a456-426614174000',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockSubscriptionRepository.getSubscription.mockResolvedValue(subscription);
      mockChildRecordRepository.getChildRecordsBySubscriptionId.mockResolvedValue([]);

      const result = await handlers.getSubscription(subscription.subscriptionId);

      expect(result.subscriptionId).toBe(subscription.subscriptionId);
    });

    it('should throw error when subscription does not exist', async () => {
      mockSubscriptionRepository.getSubscription.mockResolvedValue(null);

      await expect(handlers.getSubscription('nonexistent')).rejects.toThrow('not found');
    });
  });

  describe('updateSubscriptionStatus', () => {
    it('should update subscription status', async () => {
      const subscription: Subscription = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        subscriptionId: '223e4567-e89b-12d3-a456-426614174000',
        productId: '323e4567-e89b-12d3-a456-426614174000',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockSubscriptionRepository.getSubscription.mockResolvedValue(subscription);
      mockChildRecordRepository.getChildRecordsBySubscriptionId.mockResolvedValue([]);
      mockSubscriptionRepository.upsertSubscription.mockImplementation((sub) =>
        Promise.resolve(sub)
      );

      const result = await handlers.updateSubscriptionStatus(subscription.subscriptionId, {
        status: 'paused',
      });

      expect(result.status).toBe('paused');
    });

    it('should throw error for invalid status transition', async () => {
      const subscription: Subscription = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        subscriptionId: '223e4567-e89b-12d3-a456-426614174000',
        productId: 'PROD-001',
        status: 'cancelled',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockSubscriptionRepository.getSubscription.mockResolvedValue(subscription);

      await expect(
        handlers.updateSubscriptionStatus(subscription.subscriptionId, {
          status: 'active',
        })
      ).rejects.toThrow('Invalid status transition');
    });
  });

  describe('deleteSubscription', () => {
    it('should delete subscription and child records', async () => {
      const subscription: Subscription = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        subscriptionId: '223e4567-e89b-12d3-a456-426614174000',
        productId: '323e4567-e89b-12d3-a456-426614174000',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockSubscriptionRepository.getSubscription.mockResolvedValue(subscription);
      mockChildRecordRepository.getChildRecordsBySubscriptionId.mockResolvedValue([]);
      mockSubscriptionRepository.deleteSubscription.mockResolvedValue();

      await handlers.deleteSubscription(subscription.subscriptionId);

      expect(mockSubscriptionRepository.deleteSubscription).toHaveBeenCalledWith(
        subscription.subscriptionId
      );
    });
  });
});
