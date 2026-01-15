import { mapSubscriptionToResponse } from '../../src/app/responses';
import { Subscription } from '../../src/domain/types';

describe('mapSubscriptionToResponse', () => {
  it('should map subscription without child records', () => {
    const subscription: Subscription = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      subscriptionId: '223e4567-e89b-12d3-a456-426614174000',
      productId: '323e4567-e89b-12d3-a456-426614174000',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const response = mapSubscriptionToResponse(subscription);

    expect(response).toEqual({
      userId: subscription.userId,
      subscriptionId: subscription.subscriptionId,
      productId: subscription.productId,
      status: subscription.status,
      metadata: undefined,
      childRecords: undefined,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    });
  });

  it('should map subscription with child records', () => {
    const subscription: Subscription = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      subscriptionId: '223e4567-e89b-12d3-a456-426614174000',
      productId: '323e4567-e89b-12d3-a456-426614174000',
      status: 'active',
      childRecords: [
        {
          childId: 'ABC-123456-7890',
          status: 'active',
          startDate: '2024-01-01',
          firstName: 'John',
          lastName: 'Doe',
          sponsorshipStartDate: '2024-01-01',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const response = mapSubscriptionToResponse(subscription);

    expect(response.childRecords).toHaveLength(1);
    expect(response.childRecords?.[0]).toEqual({
      childId: 'ABC-123456-7890',
      status: 'active',
      startDate: '2024-01-01',
      endDate: undefined,
      firstName: 'John',
      lastName: 'Doe',
      sponsorshipStartDate: '2024-01-01',
      sponsorshipEndDate: undefined,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });
  });

  it('should map subscription with metadata', () => {
    const subscription: Subscription = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      subscriptionId: '223e4567-e89b-12d3-a456-426614174000',
      productId: '323e4567-e89b-12d3-a456-426614174000',
      status: 'active',
      metadata: { key: 'value', number: 42 },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const response = mapSubscriptionToResponse(subscription);

    expect(response.metadata).toEqual({ key: 'value', number: 42 });
  });
});
