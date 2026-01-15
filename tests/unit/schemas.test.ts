import {
  upsertUserRequestSchema,
  upsertSubscriptionRequestSchema,
  updateSubscriptionStatusRequestSchema,
  upsertChildRecordRequestSchema,
  updateChildRecordStatusRequestSchema,
  childIdSchema,
  uuidSchema,
  isoDateSchema,
} from '../../src/app/schemas';

describe('Schema Validation', () => {
  describe('uuidSchema', () => {
    it('should accept valid UUIDs', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      expect(() => uuidSchema.parse(validUuid)).not.toThrow();
    });

    it('should reject invalid UUIDs', () => {
      const invalidUuid = 'not-a-uuid';
      expect(() => uuidSchema.parse(invalidUuid)).toThrow();
    });
  });

  describe('childIdSchema', () => {
    it('should accept valid child IDs', () => {
      const validChildId = 'ABC-123456-7890';
      expect(() => childIdSchema.parse(validChildId)).not.toThrow();
    });

    it('should reject invalid child ID format', () => {
      const invalidChildId = 'ABC-12345-7890';
      expect(() => childIdSchema.parse(invalidChildId)).toThrow();
    });

    it('should reject child ID with lowercase letters', () => {
      const invalidChildId = 'abc-123456-7890';
      expect(() => childIdSchema.parse(invalidChildId)).toThrow();
    });
  });

  describe('isoDateSchema', () => {
    it('should accept valid ISO 8601 dates', () => {
      const validDate = '2024-01-15';
      expect(() => isoDateSchema.parse(validDate)).not.toThrow();
    });

    it('should reject invalid date formats', () => {
      const invalidDate = '01/15/2024';
      expect(() => isoDateSchema.parse(invalidDate)).toThrow();
    });
  });

  describe('upsertUserRequestSchema', () => {
    it('should validate correct user request', () => {
      const request = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };
      expect(() => upsertUserRequestSchema.parse(request)).not.toThrow();
    });

    it('should reject request with invalid userId', () => {
      const request = {
        userId: 'invalid-uuid',
      };
      expect(() => upsertUserRequestSchema.parse(request)).toThrow();
    });
  });

  describe('upsertSubscriptionRequestSchema', () => {
    it('should validate correct subscription request', () => {
      const request = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        subscriptionId: '223e4567-e89b-12d3-a456-426614174000',
        productId: '323e4567-e89b-12d3-a456-426614174000',
        status: 'active',
      };
      expect(() => upsertSubscriptionRequestSchema.parse(request)).not.toThrow();
    });

    it('should accept optional metadata', () => {
      const request = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        subscriptionId: '223e4567-e89b-12d3-a456-426614174000',
        productId: '323e4567-e89b-12d3-a456-426614174000',
        status: 'active',
        metadata: { key: 'value' },
      };
      expect(() => upsertSubscriptionRequestSchema.parse(request)).not.toThrow();
    });

    it('should reject invalid status', () => {
      const request = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        subscriptionId: '223e4567-e89b-12d3-a456-426614174000',
        productId: '323e4567-e89b-12d3-a456-426614174000',
        status: 'invalid-status',
      };
      expect(() => upsertSubscriptionRequestSchema.parse(request)).toThrow();
    });
  });

  describe('updateSubscriptionStatusRequestSchema', () => {
    it('should validate correct status update', () => {
      const request = { status: 'paused' };
      expect(() => updateSubscriptionStatusRequestSchema.parse(request)).not.toThrow();
    });

    it('should reject invalid status', () => {
      const request = { status: 'invalid' };
      expect(() => updateSubscriptionStatusRequestSchema.parse(request)).toThrow();
    });
  });

  describe('upsertChildRecordRequestSchema', () => {
    it('should validate correct child record request', () => {
      const request = {
        childId: 'ABC-123456-7890',
        status: 'active',
        startDate: '2024-01-01',
        firstName: 'John',
        lastName: 'Doe',
        sponsorshipStartDate: '2024-01-01',
      };
      expect(() => upsertChildRecordRequestSchema.parse(request)).not.toThrow();
    });

    it('should accept optional endDate and sponsorshipEndDate', () => {
      const request = {
        childId: 'ABC-123456-7890',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        firstName: 'John',
        lastName: 'Doe',
        sponsorshipStartDate: '2024-01-01',
        sponsorshipEndDate: '2024-12-31',
      };
      expect(() => upsertChildRecordRequestSchema.parse(request)).not.toThrow();
    });

    it('should reject when endDate is before startDate', () => {
      const request = {
        childId: 'ABC-123456-7890',
        status: 'active',
        startDate: '2024-12-31',
        endDate: '2024-01-01',
        firstName: 'John',
        lastName: 'Doe',
        sponsorshipStartDate: '2024-01-01',
      };
      expect(() => upsertChildRecordRequestSchema.parse(request)).toThrow();
    });

    it('should reject when sponsorshipEndDate is before sponsorshipStartDate', () => {
      const request = {
        childId: 'ABC-123456-7890',
        status: 'active',
        startDate: '2024-01-01',
        firstName: 'John',
        lastName: 'Doe',
        sponsorshipStartDate: '2024-12-31',
        sponsorshipEndDate: '2024-01-01',
      };
      expect(() => upsertChildRecordRequestSchema.parse(request)).toThrow();
    });

    it('should reject invalid childId format', () => {
      const request = {
        childId: 'INVALID',
        status: 'active',
        startDate: '2024-01-01',
        firstName: 'John',
        lastName: 'Doe',
        sponsorshipStartDate: '2024-01-01',
      };
      expect(() => upsertChildRecordRequestSchema.parse(request)).toThrow();
    });
  });

  describe('updateChildRecordStatusRequestSchema', () => {
    it('should validate correct status update', () => {
      const request = {
        status: 'replaced',
        endDate: '2024-12-31',
        sponsorshipEndDate: '2024-12-31',
      };
      expect(() => updateChildRecordStatusRequestSchema.parse(request)).not.toThrow();
    });

    it('should accept minimal request', () => {
      const request = { status: 'cancelled' };
      expect(() => updateChildRecordStatusRequestSchema.parse(request)).not.toThrow();
    });
  });
});
