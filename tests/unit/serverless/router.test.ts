import { Router } from '../../../src/app/serverless/router';
import { UserHandlers } from '../../../src/app/handlers/user-handlers';
import { SubscriptionHandlers } from '../../../src/app/handlers/subscription-handlers';
import { ChildRecordHandlers } from '../../../src/app/handlers/child-record-handlers';
import { HttpRequest } from '../../../src/app/serverless/types';

describe('Router', () => {
  let router: Router;
  let mockUserHandlers: jest.Mocked<UserHandlers>;
  let mockSubscriptionHandlers: jest.Mocked<SubscriptionHandlers>;
  let mockChildRecordHandlers: jest.Mocked<ChildRecordHandlers>;

  beforeEach(() => {
    mockUserHandlers = {
      upsertUser: jest.fn(),
      getUser: jest.fn(),
      deleteUser: jest.fn(),
    } as unknown as jest.Mocked<UserHandlers>;

    mockSubscriptionHandlers = {
      upsertSubscription: jest.fn(),
      getSubscription: jest.fn(),
      updateSubscriptionStatus: jest.fn(),
      deleteSubscription: jest.fn(),
    } as unknown as jest.Mocked<SubscriptionHandlers>;

    mockChildRecordHandlers = {
      upsertChildRecord: jest.fn(),
      getChildRecord: jest.fn(),
      updateChildRecordStatus: jest.fn(),
      deleteChildRecord: jest.fn(),
    } as unknown as jest.Mocked<ChildRecordHandlers>;

    router = new Router(mockUserHandlers, mockSubscriptionHandlers, mockChildRecordHandlers);
  });

  describe('OPTIONS requests', () => {
    it('should handle CORS preflight', async () => {
      const request: HttpRequest = {
        method: 'OPTIONS',
        path: '/users/123',
        headers: {},
      };

      const response = await router.route(request);

      expect(response.statusCode).toBe(200);
      expect(response.headers?.['Access-Control-Allow-Origin']).toBe('*');
    });
  });

  describe('User routes', () => {
    it('should handle GET /users/:userId', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      mockUserHandlers.getUser.mockResolvedValue({
        userId,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const request: HttpRequest = {
        method: 'GET',
        path: `/users/${userId}`,
        headers: {},
      };

      const response = await router.route(request);

      expect(response.statusCode).toBe(200);
      expect(mockUserHandlers.getUser).toHaveBeenCalledWith(userId);
    });

    it('should handle POST /users', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      mockUserHandlers.upsertUser.mockResolvedValue({
        userId,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const request: HttpRequest = {
        method: 'POST',
        path: '/users',
        headers: {},
        body: JSON.stringify({ userId }),
      };

      const response = await router.route(request);

      expect(response.statusCode).toBe(201);
      expect(mockUserHandlers.upsertUser).toHaveBeenCalled();
    });

    it('should handle PUT /users/:userId', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      mockUserHandlers.upsertUser.mockResolvedValue({
        userId,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const request: HttpRequest = {
        method: 'PUT',
        path: `/users/${userId}`,
        headers: {},
        body: JSON.stringify({}),
      };

      const response = await router.route(request);

      expect(response.statusCode).toBe(200);
    });

    it('should handle DELETE /users/:userId', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      mockUserHandlers.deleteUser.mockResolvedValue();

      const request: HttpRequest = {
        method: 'DELETE',
        path: `/users/${userId}`,
        headers: {},
      };

      const response = await router.route(request);

      expect(response.statusCode).toBe(204);
      expect(mockUserHandlers.deleteUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('Subscription routes', () => {
    it('should handle GET /subscriptions/:subscriptionId', async () => {
      const subscriptionId = '223e4567-e89b-12d3-a456-426614174000';
      mockSubscriptionHandlers.getSubscription.mockResolvedValue({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        subscriptionId,
        productId: '323e4567-e89b-12d3-a456-426614174000',
        status: 'active',
        childRecords: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const request: HttpRequest = {
        method: 'GET',
        path: `/subscriptions/${subscriptionId}`,
        headers: {},
      };

      const response = await router.route(request);

      expect(response.statusCode).toBe(200);
      expect(mockSubscriptionHandlers.getSubscription).toHaveBeenCalledWith(subscriptionId);
    });

    it('should handle PATCH /subscriptions/:subscriptionId/status', async () => {
      const subscriptionId = '223e4567-e89b-12d3-a456-426614174000';
      mockSubscriptionHandlers.updateSubscriptionStatus.mockResolvedValue({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        subscriptionId,
        productId: '323e4567-e89b-12d3-a456-426614174000',
        status: 'paused',
        childRecords: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const request: HttpRequest = {
        method: 'PATCH',
        path: `/subscriptions/${subscriptionId}/status`,
        headers: {},
        body: JSON.stringify({ status: 'paused' }),
      };

      const response = await router.route(request);

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Child record routes', () => {
    it('should handle GET /subscriptions/:subscriptionId/children/:childId', async () => {
      const subscriptionId = '223e4567-e89b-12d3-a456-426614174000';
      const childId = 'ABC-123456-7890';

      mockChildRecordHandlers.getChildRecord.mockResolvedValue({
        subscriptionId,
        childId,
        status: 'active',
        startDate: '2024-01-01',
        firstName: 'John',
        lastName: 'Doe',
        sponsorshipStartDate: '2024-01-01',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const request: HttpRequest = {
        method: 'GET',
        path: `/subscriptions/${subscriptionId}/children/${childId}`,
        headers: {},
      };

      const response = await router.route(request);

      expect(response.statusCode).toBe(200);
      expect(mockChildRecordHandlers.getChildRecord).toHaveBeenCalledWith(subscriptionId, childId);
    });

    it('should handle POST /subscriptions/:subscriptionId/children', async () => {
      const subscriptionId = '223e4567-e89b-12d3-a456-426614174000';
      const childId = 'ABC-123456-7890';

      mockChildRecordHandlers.upsertChildRecord.mockResolvedValue({
        subscriptionId,
        childId,
        status: 'active',
        startDate: '2024-01-01',
        firstName: 'John',
        lastName: 'Doe',
        sponsorshipStartDate: '2024-01-01',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const request: HttpRequest = {
        method: 'POST',
        path: `/subscriptions/${subscriptionId}/children`,
        headers: {},
        body: JSON.stringify({
          childId,
          status: 'active',
          startDate: '2024-01-01',
          firstName: 'John',
          lastName: 'Doe',
          sponsorshipStartDate: '2024-01-01',
        }),
      };

      const response = await router.route(request);

      expect(response.statusCode).toBe(201);
    });
  });

  describe('Error handling', () => {
    it('should return 404 for unknown routes', async () => {
      const request: HttpRequest = {
        method: 'GET',
        path: '/unknown',
        headers: {},
      };

      const response = await router.route(request);

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Not Found');
    });

    it('should return 405 for unsupported methods', async () => {
      const request: HttpRequest = {
        method: 'PATCH',
        path: '/users/123',
        headers: {},
      };

      const response = await router.route(request);

      expect(response.statusCode).toBe(405);
    });

    it('should return 400 for invalid JSON', async () => {
      const request: HttpRequest = {
        method: 'POST',
        path: '/users',
        headers: {},
        body: 'invalid json',
      };

      const response = await router.route(request);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('AppError');
    });
  });
});
