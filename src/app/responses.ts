import { Subscription } from '../domain/types';

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown[];
}

export interface UserResponse {
  userId: string;
}

export interface SubscriptionResponse {
  userId: string;
  subscriptionId: string;
  productId: string;
  status: string;
  metadata?: Record<string, unknown>;
  childRecords?: ChildRecordResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface ChildRecordResponse {
  subscriptionId: string;
  childId: string;
  status: string;
  startDate: string;
  endDate?: string;
  firstName: string;
  lastName: string;
  sponsorshipStartDate: string;
  sponsorshipEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionsListResponse {
  subscriptions: SubscriptionResponse[];
  count: number;
}

export function mapSubscriptionToResponse(subscription: Subscription): SubscriptionResponse {
  return {
    userId: subscription.userId,
    subscriptionId: subscription.subscriptionId,
    productId: subscription.productId,
    status: subscription.status,
    metadata: subscription.metadata,
    childRecords: subscription.childRecords?.map((child) => ({
      subscriptionId: subscription.subscriptionId,
      childId: child.childId,
      status: child.status,
      startDate: child.startDate,
      endDate: child.endDate,
      firstName: child.firstName,
      lastName: child.lastName,
      sponsorshipStartDate: child.sponsorshipStartDate,
      sponsorshipEndDate: child.sponsorshipEndDate,
      createdAt: child.createdAt,
      updatedAt: child.updatedAt,
    })),
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
  };
}
