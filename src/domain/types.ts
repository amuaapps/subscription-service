export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export type ChildRecordStatus = 'active' | 'replacing' | 'replaced' | 'cancelled' | 'dropped';

export interface User {
  userId: string;
}

export interface Subscription {
  userId: string;
  subscriptionId: string;
  productId: string;
  status: SubscriptionStatus;
  metadata?: Record<string, unknown>;
  childRecords?: ChildRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface ChildRecord {
  childId: string;
  status: ChildRecordStatus;
  startDate: string;
  endDate?: string;
  firstName: string;
  lastName: string;
  sponsorshipStartDate: string;
  sponsorshipEndDate?: string;
  createdAt: string;
  updatedAt: string;
}
