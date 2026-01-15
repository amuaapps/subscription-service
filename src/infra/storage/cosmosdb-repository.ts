import { CosmosClient, Container } from '@azure/cosmos';
import { User, Subscription, ChildRecord } from '../../domain/types';
import {
  IUserRepository,
  ISubscriptionRepository,
  IChildRecordRepository,
  StorageItem,
} from './types';

export class CosmosDBUserRepository implements IUserRepository {
  private container: Container;

  constructor(client: CosmosClient, databaseId: string, containerId: string) {
    this.container = client.database(databaseId).container(containerId);
  }

  async getUser(userId: string): Promise<User | null> {
    try {
      const { resource } = await this.container
        .item(`USER#${userId}`, `USER#${userId}`)
        .read<StorageItem>();

      if (!resource) {
        return null;
      }

      return resource.data as User;
    } catch (error: unknown) {
      if ((error as { code?: number }).code === 404) {
        return null;
      }
      throw error;
    }
  }

  async upsertUser(user: User): Promise<User> {
    const item: StorageItem = {
      PK: `USER#${user.userId}`,
      SK: `USER#${user.userId}`,
      GSI1PK: `USER#${user.userId}`,
      GSI1SK: `USER#${user.userId}`,
      entityType: 'USER',
      data: user,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    await this.container.items.upsert({
      id: `USER#${user.userId}`,
      ...item,
    });

    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.container.item(`USER#${userId}`, `USER#${userId}`).delete();
  }
}

export class CosmosDBSubscriptionRepository implements ISubscriptionRepository {
  private container: Container;

  constructor(client: CosmosClient, databaseId: string, containerId: string) {
    this.container = client.database(databaseId).container(containerId);
  }

  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    try {
      const { resource } = await this.container
        .item(`SUBSCRIPTION#${subscriptionId}`, `SUBSCRIPTION#${subscriptionId}`)
        .read<StorageItem>();

      if (!resource) {
        return null;
      }

      return resource.data as Subscription;
    } catch (error: unknown) {
      if ((error as { code?: number }).code === 404) {
        return null;
      }
      throw error;
    }
  }

  async getSubscriptionsByUserId(userId: string): Promise<Subscription[]> {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.GSI1PK = @userId AND c.entityType = @entityType',
      parameters: [
        { name: '@userId', value: `USER#${userId}` },
        { name: '@entityType', value: 'SUBSCRIPTION' },
      ],
    };

    const { resources } = await this.container.items.query<StorageItem>(querySpec).fetchAll();

    return resources.map((item: StorageItem) => item.data as Subscription);
  }

  async upsertSubscription(subscription: Subscription): Promise<Subscription> {
    const item: StorageItem = {
      PK: `SUBSCRIPTION#${subscription.subscriptionId}`,
      SK: `SUBSCRIPTION#${subscription.subscriptionId}`,
      GSI1PK: `USER#${subscription.userId}`,
      GSI1SK: `SUBSCRIPTION#${subscription.subscriptionId}`,
      entityType: 'SUBSCRIPTION',
      data: subscription,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };

    await this.container.items.upsert({
      id: `SUBSCRIPTION#${subscription.subscriptionId}`,
      ...item,
    });

    return subscription;
  }

  async deleteSubscription(subscriptionId: string): Promise<void> {
    await this.container
      .item(`SUBSCRIPTION#${subscriptionId}`, `SUBSCRIPTION#${subscriptionId}`)
      .delete();
  }
}

export class CosmosDBChildRecordRepository implements IChildRecordRepository {
  private container: Container;

  constructor(client: CosmosClient, databaseId: string, containerId: string) {
    this.container = client.database(databaseId).container(containerId);
  }

  async getChildRecord(subscriptionId: string, childId: string): Promise<ChildRecord | null> {
    try {
      const { resource } = await this.container
        .item(`CHILD#${childId}`, `SUBSCRIPTION#${subscriptionId}`)
        .read<StorageItem>();

      if (!resource) {
        return null;
      }

      return resource.data as ChildRecord;
    } catch (error: unknown) {
      if ((error as { code?: number }).code === 404) {
        return null;
      }
      throw error;
    }
  }

  async getChildRecordsBySubscriptionId(subscriptionId: string): Promise<ChildRecord[]> {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.PK = @pk AND c.entityType = @entityType',
      parameters: [
        { name: '@pk', value: `SUBSCRIPTION#${subscriptionId}` },
        { name: '@entityType', value: 'CHILD_RECORD' },
      ],
    };

    const { resources } = await this.container.items.query<StorageItem>(querySpec).fetchAll();

    return resources.map((item: StorageItem) => item.data as ChildRecord);
  }

  async upsertChildRecord(subscriptionId: string, childRecord: ChildRecord): Promise<ChildRecord> {
    const item: StorageItem = {
      PK: `SUBSCRIPTION#${subscriptionId}`,
      SK: `CHILD#${childRecord.childId}`,
      GSI1PK: `CHILD#${childRecord.childId}`,
      GSI1SK: `SUBSCRIPTION#${subscriptionId}`,
      entityType: 'CHILD_RECORD',
      data: childRecord,
      createdAt: childRecord.createdAt,
      updatedAt: childRecord.updatedAt,
    };

    await this.container.items.upsert({
      id: `CHILD#${childRecord.childId}`,
      ...item,
    });

    return childRecord;
  }

  async deleteChildRecord(subscriptionId: string, childId: string): Promise<void> {
    await this.container.item(`CHILD#${childId}`, `SUBSCRIPTION#${subscriptionId}`).delete();
  }
}
