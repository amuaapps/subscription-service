import { z } from 'zod';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CHILD_ID_REGEX = /^[A-Z]{3}-\d{6}-\d{4}$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const uuidSchema = z.string().regex(UUID_REGEX, 'Must be a valid UUID');

export const childIdSchema = z
  .string()
  .regex(CHILD_ID_REGEX, 'Must match format ABC-XXXXXX-XXXX');

export const isoDateSchema = z.string().regex(ISO_DATE_REGEX, 'Must be a valid ISO 8601 date');

export const subscriptionStatusSchema = z.enum(['active', 'paused', 'cancelled']);

export const childRecordStatusSchema = z.enum([
  'active',
  'replacing',
  'replaced',
  'cancelled',
  'dropped',
]);

export const upsertUserRequestSchema = z.object({
  userId: uuidSchema,
});

export const upsertSubscriptionRequestSchema = z.object({
  userId: uuidSchema,
  subscriptionId: uuidSchema,
  productId: uuidSchema,
  status: subscriptionStatusSchema,
  metadata: z.record(z.unknown()).optional(),
});

export const updateSubscriptionStatusRequestSchema = z.object({
  status: subscriptionStatusSchema,
});

export const upsertChildRecordRequestSchema = z
  .object({
    childId: childIdSchema,
    status: childRecordStatusSchema,
    startDate: isoDateSchema,
    endDate: isoDateSchema.optional(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    sponsorshipStartDate: isoDateSchema,
    sponsorshipEndDate: isoDateSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'endDate must be greater than or equal to startDate',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      if (data.sponsorshipEndDate && data.sponsorshipStartDate) {
        return new Date(data.sponsorshipEndDate) >= new Date(data.sponsorshipStartDate);
      }
      return true;
    },
    {
      message: 'sponsorshipEndDate must be greater than or equal to sponsorshipStartDate',
      path: ['sponsorshipEndDate'],
    }
  );

export const updateChildRecordStatusRequestSchema = z.object({
  status: childRecordStatusSchema,
  endDate: isoDateSchema.optional(),
  sponsorshipEndDate: isoDateSchema.optional(),
});

export type UpsertUserRequest = z.infer<typeof upsertUserRequestSchema>;
export type UpsertSubscriptionRequest = z.infer<typeof upsertSubscriptionRequestSchema>;
export type UpdateSubscriptionStatusRequest = z.infer<
  typeof updateSubscriptionStatusRequestSchema
>;
export type UpsertChildRecordRequest = z.infer<typeof upsertChildRecordRequestSchema>;
export type UpdateChildRecordStatusRequest = z.infer<
  typeof updateChildRecordStatusRequestSchema
>;
