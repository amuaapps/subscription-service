import {
  ISubscriptionRepository,
  IChildRecordRepository,
  IUserRepository,
} from '../../infra/storage/types';
import {
  upsertSubscriptionRequestSchema,
  updateSubscriptionStatusRequestSchema,
} from '../schemas';
import { validateSchema } from '../../utils/validation';
import { NotFoundError } from '../errors';
import { Subscription } from '../../domain/types';
import { SubscriptionService } from '../../domain/subscription-service';
import { SubscriptionResponse, mapSubscriptionToResponse } from '../responses';

export class SubscriptionHandlers {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly childRecordRepository: IChildRecordRepository,
    private readonly userRepository: IUserRepository,
    private readonly subscriptionService: SubscriptionService
  ) {}

  async upsertSubscription(body: unknown): Promise<SubscriptionResponse> {
    const validated = validateSchema(upsertSubscriptionRequestSchema, body);

    const user = await this.userRepository.getUser(validated.userId);
    if (!user) {
      throw new NotFoundError(`User ${validated.userId} not found`);
    }

    const existing = await this.subscriptionRepository.getSubscription(
      validated.subscriptionId
    );

    const subscription = this.subscriptionService.ensureIdempotentUpsert<Subscription>(existing, {
      userId: validated.userId,
      subscriptionId: validated.subscriptionId,
      productId: validated.productId,
      status: validated.status,
      metadata: validated.metadata,
    });

    const childRecords = await this.childRecordRepository.getChildRecordsBySubscriptionId(
      validated.subscriptionId
    );

    const saved = await this.subscriptionRepository.upsertSubscription({
      ...subscription,
      childRecords,
    });

    return mapSubscriptionToResponse(saved);
  }

  async getSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
    const subscription = await this.subscriptionRepository.getSubscription(subscriptionId);

    if (!subscription) {
      throw new NotFoundError(`Subscription ${subscriptionId} not found`);
    }

    const childRecords = await this.childRecordRepository.getChildRecordsBySubscriptionId(
      subscriptionId
    );

    return mapSubscriptionToResponse({
      ...subscription,
      childRecords,
    });
  }

  async getSubscriptionsByUserId(userId: string): Promise<SubscriptionResponse[]> {
    const user = await this.userRepository.getUser(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    const subscriptions = await this.subscriptionRepository.getSubscriptionsByUserId(userId);

    const subscriptionsWithChildren = await Promise.all(
      subscriptions.map(async (subscription) => {
        const childRecords = await this.childRecordRepository.getChildRecordsBySubscriptionId(
          subscription.subscriptionId
        );
        return {
          ...subscription,
          childRecords,
        };
      })
    );

    return subscriptionsWithChildren.map(mapSubscriptionToResponse);
  }

  async updateSubscriptionStatus(
    subscriptionId: string,
    body: unknown
  ): Promise<SubscriptionResponse> {
    const validated = validateSchema(updateSubscriptionStatusRequestSchema, body);

    const subscription = await this.subscriptionRepository.getSubscription(subscriptionId);

    if (!subscription) {
      throw new NotFoundError(`Subscription ${subscriptionId} not found`);
    }

    this.subscriptionService.validateSubscriptionStatusTransition(
      subscription.status,
      validated.status
    );

    const now = new Date().toISOString();
    let updatedSubscription: Subscription = {
      ...subscription,
      status: validated.status,
      updatedAt: now,
    };

    if (validated.status === 'cancelled') {
      updatedSubscription = this.subscriptionService.handleSubscriptionCancellation(
        updatedSubscription
      );
    }

    const childRecords = await this.childRecordRepository.getChildRecordsBySubscriptionId(
      subscriptionId
    );

    if (validated.status === 'cancelled' && childRecords.length > 0) {
      await Promise.all(
        childRecords
          .filter((child) => child.status === 'active' || child.status === 'replacing')
          .map((child) =>
            this.childRecordRepository.upsertChildRecord(subscriptionId, {
              ...child,
              status: 'cancelled',
              endDate: child.endDate || now.split('T')[0],
              sponsorshipEndDate: child.sponsorshipEndDate || now.split('T')[0],
              updatedAt: now,
            })
          )
      );
    }

    const saved = await this.subscriptionRepository.upsertSubscription(updatedSubscription);

    const updatedChildRecords = await this.childRecordRepository.getChildRecordsBySubscriptionId(
      subscriptionId
    );

    return mapSubscriptionToResponse({
      ...saved,
      childRecords: updatedChildRecords,
    });
  }

  async deleteSubscription(subscriptionId: string): Promise<void> {
    const subscription = await this.subscriptionRepository.getSubscription(subscriptionId);

    if (!subscription) {
      throw new NotFoundError(`Subscription ${subscriptionId} not found`);
    }

    const childRecords = await this.childRecordRepository.getChildRecordsBySubscriptionId(
      subscriptionId
    );

    await Promise.all(
      childRecords.map((child) =>
        this.childRecordRepository.deleteChildRecord(subscriptionId, child.childId)
      )
    );

    await this.subscriptionRepository.deleteSubscription(subscriptionId);
  }
}
