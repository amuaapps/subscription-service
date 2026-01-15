import { SubscriptionService } from '../../src/domain/subscription-service';
import { Subscription, ChildRecord } from '../../src/domain/types';

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  beforeEach(() => {
    service = new SubscriptionService();
  });

  describe('validateSubscriptionStatusTransition', () => {
    it('should allow active to paused transition', () => {
      expect(() => service.validateSubscriptionStatusTransition('active', 'paused')).not.toThrow();
    });

    it('should allow active to cancelled transition', () => {
      expect(() =>
        service.validateSubscriptionStatusTransition('active', 'cancelled')
      ).not.toThrow();
    });

    it('should allow paused to active transition', () => {
      expect(() => service.validateSubscriptionStatusTransition('paused', 'active')).not.toThrow();
    });

    it('should allow paused to cancelled transition', () => {
      expect(() =>
        service.validateSubscriptionStatusTransition('paused', 'cancelled')
      ).not.toThrow();
    });

    it('should reject cancelled to any transition', () => {
      expect(() => service.validateSubscriptionStatusTransition('cancelled', 'active')).toThrow(
        'Invalid status transition'
      );
      expect(() => service.validateSubscriptionStatusTransition('cancelled', 'paused')).toThrow(
        'Invalid status transition'
      );
    });

    it('should reject active to active transition', () => {
      expect(() => service.validateSubscriptionStatusTransition('active', 'active')).toThrow(
        'Invalid status transition'
      );
    });
  });

  describe('validateChildRecordStatusTransition', () => {
    it('should allow active to replacing transition', () => {
      expect(() =>
        service.validateChildRecordStatusTransition('active', 'replacing')
      ).not.toThrow();
    });

    it('should allow active to replaced transition', () => {
      expect(() => service.validateChildRecordStatusTransition('active', 'replaced')).not.toThrow();
    });

    it('should allow active to cancelled transition', () => {
      expect(() =>
        service.validateChildRecordStatusTransition('active', 'cancelled')
      ).not.toThrow();
    });

    it('should allow active to dropped transition', () => {
      expect(() => service.validateChildRecordStatusTransition('active', 'dropped')).not.toThrow();
    });

    it('should allow replacing to active transition', () => {
      expect(() =>
        service.validateChildRecordStatusTransition('replacing', 'active')
      ).not.toThrow();
    });

    it('should reject replaced to any transition', () => {
      expect(() => service.validateChildRecordStatusTransition('replaced', 'active')).toThrow(
        'Invalid child record status transition'
      );
    });

    it('should reject cancelled to any transition', () => {
      expect(() => service.validateChildRecordStatusTransition('cancelled', 'active')).toThrow(
        'Invalid child record status transition'
      );
    });

    it('should reject dropped to any transition', () => {
      expect(() => service.validateChildRecordStatusTransition('dropped', 'active')).toThrow(
        'Invalid child record status transition'
      );
    });
  });

  describe('validateMaxOneActiveChild', () => {
    it('should allow adding active child when none exist', () => {
      const subscription: Subscription = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        subscriptionId: '223e4567-e89b-12d3-a456-426614174000',
        productId: '323e4567-e89b-12d3-a456-426614174000',
        status: 'active',
        childRecords: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const newChild: ChildRecord = {
        childId: 'ABC-123456-7890',
        status: 'active',
        startDate: '2024-01-01',
        firstName: 'John',
        lastName: 'Doe',
        sponsorshipStartDate: '2024-01-01',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      expect(() => service.validateMaxOneActiveChild(subscription, newChild)).not.toThrow();
    });

    it('should allow adding non-active child when active child exists', () => {
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

      const newChild: ChildRecord = {
        childId: 'DEF-654321-0987',
        status: 'replacing',
        startDate: '2024-02-01',
        firstName: 'Jane',
        lastName: 'Smith',
        sponsorshipStartDate: '2024-02-01',
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-02-01T00:00:00Z',
      };

      expect(() => service.validateMaxOneActiveChild(subscription, newChild)).not.toThrow();
    });

    it('should reject adding second active child', () => {
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

      const newChild: ChildRecord = {
        childId: 'DEF-654321-0987',
        status: 'active',
        startDate: '2024-02-01',
        firstName: 'Jane',
        lastName: 'Smith',
        sponsorshipStartDate: '2024-02-01',
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-02-01T00:00:00Z',
      };

      expect(() => service.validateMaxOneActiveChild(subscription, newChild)).toThrow(
        'already has an active child record'
      );
    });

    it('should allow updating existing active child', () => {
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

      const updatedChild: ChildRecord = {
        childId: 'ABC-123456-7890',
        status: 'active',
        startDate: '2024-01-01',
        firstName: 'John',
        lastName: 'Doe',
        sponsorshipStartDate: '2024-01-01',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
      };

      expect(() => service.validateMaxOneActiveChild(subscription, updatedChild)).not.toThrow();
    });
  });

  describe('ensureIdempotentUpsert', () => {
    it('should create new record with timestamps when none exists', () => {
      type TestRecord = { name: string; createdAt: string; updatedAt: string };
      const updates: Partial<TestRecord> = { name: 'Test' };
      const result = service.ensureIdempotentUpsert<TestRecord>(null, updates);

      expect(result.isNew).toBe(true);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.createdAt).toBe(result.updatedAt);
    });

    it('should update existing record preserving createdAt', () => {
      type TestRecord = { name: string; createdAt: string; updatedAt: string };
      const existing: TestRecord = {
        name: 'Old',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      const updates: Partial<TestRecord> = { name: 'New' };
      const result = service.ensureIdempotentUpsert<TestRecord>(existing, updates);

      expect(result.isNew).toBe(false);
      expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
      expect(result.updatedAt).not.toBe('2024-01-01T00:00:00Z');
      expect((result as TestRecord).name).toBe('New');
    });
  });

  describe('handleSubscriptionCancellation', () => {
    it('should not modify subscription if not cancelled', () => {
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

      const result = service.handleSubscriptionCancellation(subscription);
      expect(result.childRecords?.[0].status).toBe('active');
    });

    it('should cancel active child records when subscription is cancelled', () => {
      const subscription: Subscription = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        subscriptionId: '223e4567-e89b-12d3-a456-426614174000',
        productId: '323e4567-e89b-12d3-a456-426614174000',
        status: 'cancelled',
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

      const result = service.handleSubscriptionCancellation(subscription);
      expect(result.childRecords?.[0].status).toBe('cancelled');
      expect(result.childRecords?.[0].endDate).toBeDefined();
      expect(result.childRecords?.[0].sponsorshipEndDate).toBeDefined();
    });

    it('should not modify already cancelled child records', () => {
      const subscription: Subscription = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        subscriptionId: '223e4567-e89b-12d3-a456-426614174000',
        productId: '323e4567-e89b-12d3-a456-426614174000',
        status: 'cancelled',
        childRecords: [
          {
            childId: 'ABC-123456-7890',
            status: 'replaced',
            startDate: '2024-01-01',
            endDate: '2024-06-01',
            firstName: 'John',
            lastName: 'Doe',
            sponsorshipStartDate: '2024-01-01',
            sponsorshipEndDate: '2024-06-01',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-06-01T00:00:00Z',
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const result = service.handleSubscriptionCancellation(subscription);
      expect(result.childRecords?.[0].status).toBe('replaced');
      expect(result.childRecords?.[0].endDate).toBe('2024-06-01');
    });
  });

  describe('validateChildRecordReplacement', () => {
    it('should allow replacement of active child', () => {
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

      const newChild: ChildRecord = {
        childId: 'DEF-654321-0987',
        status: 'active',
        startDate: '2024-02-01',
        firstName: 'Jane',
        lastName: 'Smith',
        sponsorshipStartDate: '2024-02-01',
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-02-01T00:00:00Z',
      };

      expect(() =>
        service.validateChildRecordReplacement(subscription, 'ABC-123456-7890', newChild)
      ).not.toThrow();
    });

    it('should reject replacement of non-existent child', () => {
      const subscription: Subscription = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        subscriptionId: '223e4567-e89b-12d3-a456-426614174000',
        productId: '323e4567-e89b-12d3-a456-426614174000',
        status: 'active',
        childRecords: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const newChild: ChildRecord = {
        childId: 'DEF-654321-0987',
        status: 'active',
        startDate: '2024-02-01',
        firstName: 'Jane',
        lastName: 'Smith',
        sponsorshipStartDate: '2024-02-01',
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-02-01T00:00:00Z',
      };

      expect(() =>
        service.validateChildRecordReplacement(subscription, 'ABC-123456-7890', newChild)
      ).toThrow('not found in subscription');
    });

    it('should reject replacement of non-active child', () => {
      const subscription: Subscription = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        subscriptionId: '223e4567-e89b-12d3-a456-426614174000',
        productId: '323e4567-e89b-12d3-a456-426614174000',
        status: 'active',
        childRecords: [
          {
            childId: 'ABC-123456-7890',
            status: 'replaced',
            startDate: '2024-01-01',
            endDate: '2024-06-01',
            firstName: 'John',
            lastName: 'Doe',
            sponsorshipStartDate: '2024-01-01',
            sponsorshipEndDate: '2024-06-01',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-06-01T00:00:00Z',
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const newChild: ChildRecord = {
        childId: 'DEF-654321-0987',
        status: 'active',
        startDate: '2024-02-01',
        firstName: 'Jane',
        lastName: 'Smith',
        sponsorshipStartDate: '2024-02-01',
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-02-01T00:00:00Z',
      };

      expect(() =>
        service.validateChildRecordReplacement(subscription, 'ABC-123456-7890', newChild)
      ).toThrow('Only active children can be replaced');
    });

    it('should not validate when new child is not active or replacing', () => {
      const subscription: Subscription = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        subscriptionId: '223e4567-e89b-12d3-a456-426614174000',
        productId: '323e4567-e89b-12d3-a456-426614174000',
        status: 'active',
        childRecords: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const newChild: ChildRecord = {
        childId: 'DEF-654321-0987',
        status: 'cancelled',
        startDate: '2024-02-01',
        firstName: 'Jane',
        lastName: 'Smith',
        sponsorshipStartDate: '2024-02-01',
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-02-01T00:00:00Z',
      };

      expect(() =>
        service.validateChildRecordReplacement(subscription, 'ABC-123456-7890', newChild)
      ).not.toThrow();
    });
  });
});
