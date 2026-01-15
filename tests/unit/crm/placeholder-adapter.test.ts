import { PlaceholderCRMAdapter } from '../../../src/infra/crm/placeholder-adapter';
import { User, Subscription, ChildRecord } from '../../../src/domain/types';

describe('PlaceholderCRMAdapter', () => {
  let adapter: PlaceholderCRMAdapter;

  beforeEach(() => {
    adapter = new PlaceholderCRMAdapter(false);
  });

  describe('syncUser', () => {
    it('should return placeholder contact', async () => {
      const user: User = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const result = await adapter.syncUser(user);

      expect(result.crmContactId).toBe(`CRM-CONTACT-${user.userId}`);
      expect(result.userId).toBe(user.userId);
      expect(result.metadata?.placeholder).toBe(true);
      expect(result.metadata?.syncedAt).toBeDefined();
    });
  });

  describe('syncSubscription', () => {
    it('should return placeholder subscription', async () => {
      const subscription: Subscription = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        subscriptionId: '223e4567-e89b-12d3-a456-426614174000',
        productId: '323e4567-e89b-12d3-a456-426614174000',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const result = await adapter.syncSubscription(subscription);

      expect(result.crmSubscriptionId).toBe(`CRM-SUB-${subscription.subscriptionId}`);
      expect(result.subscriptionId).toBe(subscription.subscriptionId);
      expect(result.crmContactId).toBe(`CRM-CONTACT-${subscription.userId}`);
      expect(result.status).toBe('active');
      expect(result.metadata?.placeholder).toBe(true);
    });
  });

  describe('syncChildRecord', () => {
    it('should return placeholder child record', async () => {
      const subscriptionId = '223e4567-e89b-12d3-a456-426614174000';
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

      const result = await adapter.syncChildRecord(subscriptionId, childRecord);

      expect(result.crmChildId).toBe(`CRM-CHILD-${childRecord.childId}`);
      expect(result.childId).toBe(childRecord.childId);
      expect(result.crmSubscriptionId).toBe(`CRM-SUB-${subscriptionId}`);
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.metadata?.placeholder).toBe(true);
    });
  });

  describe('getUserFromCRM', () => {
    it('should return null when disabled', async () => {
      const result = await adapter.getUserFromCRM('123e4567-e89b-12d3-a456-426614174000');
      expect(result).toBeNull();
    });
  });

  describe('getSubscriptionFromCRM', () => {
    it('should return null when disabled', async () => {
      const result = await adapter.getSubscriptionFromCRM('223e4567-e89b-12d3-a456-426614174000');
      expect(result).toBeNull();
    });
  });

  describe('getChildRecordFromCRM', () => {
    it('should return null when disabled', async () => {
      const result = await adapter.getChildRecordFromCRM('ABC-123456-7890');
      expect(result).toBeNull();
    });
  });

  describe('delete operations', () => {
    it('should complete deleteUserFromCRM without error', async () => {
      await expect(adapter.deleteUserFromCRM('123e4567-e89b-12d3-a456-426614174000')).resolves.toBeUndefined();
    });

    it('should complete deleteSubscriptionFromCRM without error', async () => {
      await expect(adapter.deleteSubscriptionFromCRM('223e4567-e89b-12d3-a456-426614174000')).resolves.toBeUndefined();
    });

    it('should complete deleteChildRecordFromCRM without error', async () => {
      await expect(adapter.deleteChildRecordFromCRM('ABC-123456-7890')).resolves.toBeUndefined();
    });
  });

  describe('when enabled', () => {
    beforeEach(() => {
      adapter = new PlaceholderCRMAdapter(true);
    });

    it('should still return placeholder data', async () => {
      const user: User = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const result = await adapter.syncUser(user);

      expect(result.crmContactId).toBe(`CRM-CONTACT-${user.userId}`);
      expect(result.metadata?.placeholder).toBe(true);
    });
  });
});
