import { User, Subscription, ChildRecord } from '../../domain/types';

export interface CRMContact {
  crmContactId: string;
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  metadata?: Record<string, unknown>;
}

export interface CRMSubscription {
  crmSubscriptionId: string;
  subscriptionId: string;
  crmContactId: string;
  productId: string;
  status: string;
  metadata?: Record<string, unknown>;
}

export interface CRMChildRecord {
  crmChildId: string;
  childId: string;
  crmSubscriptionId: string;
  firstName: string;
  lastName: string;
  status: string;
  metadata?: Record<string, unknown>;
}

export interface ICRMAdapter {
  syncUser(user: User): Promise<CRMContact>;
  syncSubscription(subscription: Subscription): Promise<CRMSubscription>;
  syncChildRecord(subscriptionId: string, childRecord: ChildRecord): Promise<CRMChildRecord>;
  
  getUserFromCRM(userId: string): Promise<CRMContact | null>;
  getSubscriptionFromCRM(subscriptionId: string): Promise<CRMSubscription | null>;
  getChildRecordFromCRM(childId: string): Promise<CRMChildRecord | null>;
  
  deleteUserFromCRM(userId: string): Promise<void>;
  deleteSubscriptionFromCRM(subscriptionId: string): Promise<void>;
  deleteChildRecordFromCRM(childId: string): Promise<void>;
}

export interface CRMSyncResult {
  success: boolean;
  crmId?: string;
  error?: string;
  timestamp: string;
}
