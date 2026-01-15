import { ISubscriptionRepository, IChildRecordRepository } from '../../infra/storage/types';
import {
  upsertChildRecordRequestSchema,
  updateChildRecordStatusRequestSchema,
} from '../schemas';
import { validateSchema } from '../../utils/validation';
import { NotFoundError } from '../errors';
import { ChildRecord } from '../../domain/types';
import { SubscriptionService } from '../../domain/subscription-service';
import { ChildRecordResponse } from '../responses';

export class ChildRecordHandlers {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly childRecordRepository: IChildRecordRepository,
    private readonly subscriptionService: SubscriptionService
  ) {}

  async upsertChildRecord(
    subscriptionId: string,
    body: unknown
  ): Promise<ChildRecordResponse> {
    const validated = validateSchema(upsertChildRecordRequestSchema, body);

    const subscription = await this.subscriptionRepository.getSubscription(subscriptionId);

    if (!subscription) {
      throw new NotFoundError(`Subscription ${subscriptionId} not found`);
    }

    const existing = await this.childRecordRepository.getChildRecord(
      subscriptionId,
      validated.childId
    );

    const childRecord = this.subscriptionService.ensureIdempotentUpsert<ChildRecord>(existing, {
      childId: validated.childId,
      status: validated.status,
      startDate: validated.startDate,
      endDate: validated.endDate,
      firstName: validated.firstName,
      lastName: validated.lastName,
      sponsorshipStartDate: validated.sponsorshipStartDate,
      sponsorshipEndDate: validated.sponsorshipEndDate,
    });

    const allChildRecords = await this.childRecordRepository.getChildRecordsBySubscriptionId(
      subscriptionId
    );

    const subscriptionWithChildren = {
      ...subscription,
      childRecords: allChildRecords,
    };

    this.subscriptionService.validateMaxOneActiveChild(subscriptionWithChildren, childRecord);

    const saved = await this.childRecordRepository.upsertChildRecord(subscriptionId, childRecord);

    return {
      subscriptionId,
      childId: saved.childId,
      status: saved.status,
      startDate: saved.startDate,
      endDate: saved.endDate,
      firstName: saved.firstName,
      lastName: saved.lastName,
      sponsorshipStartDate: saved.sponsorshipStartDate,
      sponsorshipEndDate: saved.sponsorshipEndDate,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async getChildRecord(subscriptionId: string, childId: string): Promise<ChildRecordResponse> {
    const subscription = await this.subscriptionRepository.getSubscription(subscriptionId);

    if (!subscription) {
      throw new NotFoundError(`Subscription ${subscriptionId} not found`);
    }

    const childRecord = await this.childRecordRepository.getChildRecord(subscriptionId, childId);

    if (!childRecord) {
      throw new NotFoundError(`Child record ${childId} not found in subscription ${subscriptionId}`);
    }

    return {
      subscriptionId,
      childId: childRecord.childId,
      status: childRecord.status,
      startDate: childRecord.startDate,
      endDate: childRecord.endDate,
      firstName: childRecord.firstName,
      lastName: childRecord.lastName,
      sponsorshipStartDate: childRecord.sponsorshipStartDate,
      sponsorshipEndDate: childRecord.sponsorshipEndDate,
      createdAt: childRecord.createdAt,
      updatedAt: childRecord.updatedAt,
    };
  }

  async updateChildRecordStatus(
    subscriptionId: string,
    childId: string,
    body: unknown
  ): Promise<ChildRecordResponse> {
    const validated = validateSchema(updateChildRecordStatusRequestSchema, body);

    const subscription = await this.subscriptionRepository.getSubscription(subscriptionId);

    if (!subscription) {
      throw new NotFoundError(`Subscription ${subscriptionId} not found`);
    }

    const childRecord = await this.childRecordRepository.getChildRecord(subscriptionId, childId);

    if (!childRecord) {
      throw new NotFoundError(`Child record ${childId} not found in subscription ${subscriptionId}`);
    }

    this.subscriptionService.validateChildRecordStatusTransition(
      childRecord.status,
      validated.status
    );

    const now = new Date().toISOString();
    const updated: ChildRecord = {
      ...childRecord,
      status: validated.status,
      updatedAt: now,
    };

    const saved = await this.childRecordRepository.upsertChildRecord(subscriptionId, updated);

    return {
      subscriptionId,
      childId: saved.childId,
      status: saved.status,
      startDate: saved.startDate,
      endDate: saved.endDate,
      firstName: saved.firstName,
      lastName: saved.lastName,
      sponsorshipStartDate: saved.sponsorshipStartDate,
      sponsorshipEndDate: saved.sponsorshipEndDate,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async deleteChildRecord(subscriptionId: string, childId: string): Promise<void> {
    const subscription = await this.subscriptionRepository.getSubscription(subscriptionId);

    if (!subscription) {
      throw new NotFoundError(`Subscription ${subscriptionId} not found`);
    }

    const childRecord = await this.childRecordRepository.getChildRecord(subscriptionId, childId);

    if (!childRecord) {
      throw new NotFoundError(`Child record ${childId} not found in subscription ${subscriptionId}`);
    }

    await this.childRecordRepository.deleteChildRecord(subscriptionId, childId);
  }
}
