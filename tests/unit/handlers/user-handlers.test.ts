import { UserHandlers } from '../../../src/app/handlers/user-handlers';
import { IUserRepository } from '../../../src/infra/storage/types';
import { SubscriptionService } from '../../../src/domain/subscription-service';
import { User } from '../../../src/domain/types';

describe('UserHandlers', () => {
  let handlers: UserHandlers;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let subscriptionService: SubscriptionService;

  beforeEach(() => {
    mockUserRepository = {
      getUser: jest.fn(),
      upsertUser: jest.fn(),
      deleteUser: jest.fn(),
    };

    subscriptionService = new SubscriptionService();
    handlers = new UserHandlers(mockUserRepository, subscriptionService);
  });

  describe('upsertUser', () => {
    it('should create a new user', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const body = { userId };

      mockUserRepository.getUser.mockResolvedValue(null);
      mockUserRepository.upsertUser.mockImplementation((user) => Promise.resolve(user));

      const result = await handlers.upsertUser(body);

      expect(result.userId).toBe(userId);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(mockUserRepository.upsertUser).toHaveBeenCalled();
    });

    it('should update an existing user', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const existing: User = {
        userId,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockUserRepository.getUser.mockResolvedValue(existing);
      mockUserRepository.upsertUser.mockImplementation((user) => Promise.resolve(user));

      const result = await handlers.upsertUser({ userId });

      expect(result.userId).toBe(userId);
      expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
      expect(result.updatedAt).not.toBe('2024-01-01T00:00:00Z');
    });

    it('should throw ValidationError for invalid userId', async () => {
      await expect(handlers.upsertUser({ userId: 'invalid' })).rejects.toThrow('Validation failed');
    });
  });

  describe('getUser', () => {
    it('should return a user', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const user: User = {
        userId,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockUserRepository.getUser.mockResolvedValue(user);

      const result = await handlers.getUser(userId);

      expect(result).toEqual(user);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      mockUserRepository.getUser.mockResolvedValue(null);

      await expect(handlers.getUser(userId)).rejects.toThrow('not found');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const user: User = {
        userId,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockUserRepository.getUser.mockResolvedValue(user);
      mockUserRepository.deleteUser.mockResolvedValue();

      await handlers.deleteUser(userId);

      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      mockUserRepository.getUser.mockResolvedValue(null);

      await expect(handlers.deleteUser(userId)).rejects.toThrow('not found');
    });
  });
});
