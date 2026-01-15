import { User, Subscription, ChildRecord } from '../../domain/types';
import {
  ICRMAdapter,
  CRMContact,
  CRMSubscription,
  CRMChildRecord,
} from './types';

export class PlaceholderCRMAdapter implements ICRMAdapter {
  private readonly enabled: boolean;

  constructor(enabled = false) {
    this.enabled = enabled;
  }

  async syncUser(user: User): Promise<CRMContact> {
    if (!this.enabled) {
      return this.createPlaceholderContact(user);
    }

    return this.createPlaceholderContact(user);
  }

  async syncSubscription(subscription: Subscription): Promise<CRMSubscription> {
    if (!this.enabled) {
      return this.createPlaceholderSubscription(subscription);
    }

    return this.createPlaceholderSubscription(subscription);
  }

  async syncChildRecord(
    subscriptionId: string,
    childRecord: ChildRecord
  ): Promise<CRMChildRecord> {
    if (!this.enabled) {
      return this.createPlaceholderChildRecord(subscriptionId, childRecord);
    }

    return this.createPlaceholderChildRecord(subscriptionId, childRecord);
  }

  async getUserFromCRM(_userId: string): Promise<CRMContact | null> {
    if (!this.enabled) {
      return null;
    }

    return null;
  }

  async getSubscriptionFromCRM(_subscriptionId: string): Promise<CRMSubscription | null> {
    if (!this.enabled) {
      return null;
    }

    return null;
  }

  async getChildRecordFromCRM(_childId: string): Promise<CRMChildRecord | null> {
    if (!this.enabled) {
      return null;
    }

    return null;
  }

  async deleteUserFromCRM(_userId: string): Promise<void> {
    if (!this.enabled) {
      return;
    }

    return;
  }

  async deleteSubscriptionFromCRM(_subscriptionId: string): Promise<void> {
    if (!this.enabled) {
      return;
    }

    return;
  }

  async deleteChildRecordFromCRM(_childId: string): Promise<void> {
    if (!this.enabled) {
      return;
    }

    return;
  }

  private createPlaceholderContact(user: User): CRMContact {
    return {
      crmContactId: `CRM-CONTACT-${user.userId}`,
      userId: user.userId,
      metadata: {
        placeholder: true,
        syncedAt: new Date().toISOString(),
      },
    };
  }

  private createPlaceholderSubscription(subscription: Subscription): CRMSubscription {
    return {
      crmSubscriptionId: `CRM-SUB-${subscription.subscriptionId}`,
      subscriptionId: subscription.subscriptionId,
      crmContactId: `CRM-CONTACT-${subscription.userId}`,
      productId: subscription.productId,
      status: subscription.status,
      metadata: {
        placeholder: true,
        syncedAt: new Date().toISOString(),
      },
    };
  }

  private createPlaceholderChildRecord(
    subscriptionId: string,
    childRecord: ChildRecord
  ): CRMChildRecord {
    return {
      crmChildId: `CRM-CHILD-${childRecord.childId}`,
      childId: childRecord.childId,
      crmSubscriptionId: `CRM-SUB-${subscriptionId}`,
      firstName: childRecord.firstName,
      lastName: childRecord.lastName,
      status: childRecord.status,
      metadata: {
        placeholder: true,
        syncedAt: new Date().toISOString(),
      },
    };
  }
}
