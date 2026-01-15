import { IUserRepository } from '../../infra/storage/types';
import { upsertUserRequestSchema } from '../schemas';
import { validateSchema } from '../../utils/validation';
import { NotFoundError } from '../errors';
import { User } from '../../domain/types';
import { SubscriptionService } from '../../domain/subscription-service';

export class UserHandlers {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly subscriptionService: SubscriptionService
  ) {}

  async upsertUser(body: unknown): Promise<User> {
    const validated = validateSchema(upsertUserRequestSchema, body);

    const existing = await this.userRepository.getUser(validated.userId);

    const user = this.subscriptionService.ensureIdempotentUpsert<User>(existing, {
      userId: validated.userId,
    });

    return await this.userRepository.upsertUser(user);
  }

  async getUser(userId: string): Promise<User> {
    const user = await this.userRepository.getUser(userId);

    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.userRepository.getUser(userId);

    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    await this.userRepository.deleteUser(userId);
  }
}
