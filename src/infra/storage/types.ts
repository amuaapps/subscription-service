import { User, Subscription, ChildRecord } from '../../domain/types';

export interface IUserRepository {
  getUser(userId: string): Promise<User | null>;
  upsertUser(user: User): Promise<User>;
  deleteUser(userId: string): Promise<void>;
}

export interface ISubscriptionRepository {
  getSubscription(subscriptionId: string): Promise<Subscription | null>;
  getSubscriptionsByUserId(userId: string): Promise<Subscription[]>;
  upsertSubscription(subscription: Subscription): Promise<Subscription>;
  deleteSubscription(subscriptionId: string): Promise<void>;
}

export interface IChildRecordRepository {
  getChildRecord(subscriptionId: string, childId: string): Promise<ChildRecord | null>;
  getChildRecordsBySubscriptionId(subscriptionId: string): Promise<ChildRecord[]>;
  upsertChildRecord(subscriptionId: string, childRecord: ChildRecord): Promise<ChildRecord>;
  deleteChildRecord(subscriptionId: string, childId: string): Promise<void>;
}

export interface StorageItem {
  PK: string;
  SK: string;
  GSI1PK?: string;
  GSI1SK?: string;
  entityType: string;
  data: unknown;
  createdAt: string;
  updatedAt: string;
  ttl?: number;
}
