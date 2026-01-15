import { Subscription, SubscriptionStatus, ChildRecord, ChildRecordStatus } from './types';
import { ConflictError } from '../app/errors';

export class SubscriptionService {
  validateSubscriptionStatusTransition(
    currentStatus: SubscriptionStatus,
    newStatus: SubscriptionStatus
  ): void {
    const validTransitions: Record<SubscriptionStatus, SubscriptionStatus[]> = {
      active: ['paused', 'cancelled'],
      paused: ['active', 'cancelled'],
      cancelled: [],
    };

    const allowedTransitions = validTransitions[currentStatus];

    if (!allowedTransitions.includes(newStatus)) {
      throw new ConflictError(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'`
      );
    }
  }

  validateChildRecordStatusTransition(
    currentStatus: ChildRecordStatus,
    newStatus: ChildRecordStatus
  ): void {
    const validTransitions: Record<ChildRecordStatus, ChildRecordStatus[]> = {
      active: ['replacing', 'replaced', 'cancelled', 'dropped'],
      replacing: ['active', 'cancelled', 'dropped'],
      replaced: [],
      cancelled: [],
      dropped: [],
    };

    const allowedTransitions = validTransitions[currentStatus];

    if (!allowedTransitions.includes(newStatus)) {
      throw new ConflictError(
        `Invalid child record status transition from '${currentStatus}' to '${newStatus}'`
      );
    }
  }

  validateMaxOneActiveChild(subscription: Subscription, newChildRecord: ChildRecord): void {
    if (newChildRecord.status !== 'active') {
      return;
    }

    const activeChildren =
      subscription.childRecords?.filter(
        (child) => child.status === 'active' && child.childId !== newChildRecord.childId
      ) || [];

    if (activeChildren.length > 0) {
      throw new ConflictError(
        'Subscription already has an active child record. Only one active child is allowed per subscription.'
      );
    }
  }

  ensureIdempotentUpsert<T extends { createdAt: string; updatedAt: string }>(
    existing: T | null,
    updates: Partial<T>
  ): T & { isNew: boolean } {
    const now = new Date().toISOString();

    if (!existing) {
      return {
        ...updates,
        createdAt: now,
        updatedAt: now,
        isNew: true,
      } as T & { isNew: boolean };
    }

    return {
      ...existing,
      ...updates,
      createdAt: existing.createdAt,
      updatedAt: now,
      isNew: false,
    };
  }

  handleSubscriptionCancellation(subscription: Subscription): Subscription {
    if (subscription.status !== 'cancelled') {
      return subscription;
    }

    const now = new Date().toISOString();
    const updatedChildRecords = subscription.childRecords?.map((child) => {
      if (child.status === 'active' || child.status === 'replacing') {
        return {
          ...child,
          status: 'cancelled' as ChildRecordStatus,
          endDate: child.endDate || now.split('T')[0],
          sponsorshipEndDate: child.sponsorshipEndDate || now.split('T')[0],
          updatedAt: now,
        };
      }
      return child;
    });

    return {
      ...subscription,
      childRecords: updatedChildRecords,
    };
  }

  validateChildRecordReplacement(
    subscription: Subscription,
    oldChildId: string,
    newChildRecord: ChildRecord
  ): void {
    if (newChildRecord.status !== 'active' && newChildRecord.status !== 'replacing') {
      return;
    }

    const oldChild = subscription.childRecords?.find((child) => child.childId === oldChildId);

    if (!oldChild) {
      throw new ConflictError(`Child record ${oldChildId} not found in subscription`);
    }

    if (oldChild.status !== 'active') {
      throw new ConflictError(
        `Cannot replace child record ${oldChildId} with status '${oldChild.status}'. Only active children can be replaced.`
      );
    }
  }
}
