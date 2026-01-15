import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { User, Subscription, ChildRecord } from '../../domain/types';
import {
  IUserRepository,
  ISubscriptionRepository,
  IChildRecordRepository,
  StorageItem,
} from './types';

export class DynamoDBUserRepository implements IUserRepository {
  constructor(
    private readonly client: DynamoDBClient,
    private readonly tableName: string
  ) {}

  async getUser(userId: string): Promise<User | null> {
    const result = await this.client.send(
      new GetItemCommand({
        TableName: this.tableName,
        Key: marshall({
          PK: `USER#${userId}`,
          SK: `USER#${userId}`,
        }),
      })
    );

    if (!result.Item) {
      return null;
    }

    const item = unmarshall(result.Item) as StorageItem;
    return item.data as User;
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

    await this.client.send(
      new PutItemCommand({
        TableName: this.tableName,
        Item: marshall(item),
      })
    );

    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.client.send(
      new DeleteItemCommand({
        TableName: this.tableName,
        Key: marshall({
          PK: `USER#${userId}`,
          SK: `USER#${userId}`,
        }),
      })
    );
  }
}

export class DynamoDBSubscriptionRepository implements ISubscriptionRepository {
  constructor(
    private readonly client: DynamoDBClient,
    private readonly tableName: string
  ) {}

  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    const result = await this.client.send(
      new GetItemCommand({
        TableName: this.tableName,
        Key: marshall({
          PK: `SUBSCRIPTION#${subscriptionId}`,
          SK: `SUBSCRIPTION#${subscriptionId}`,
        }),
      })
    );

    if (!result.Item) {
      return null;
    }

    const item = unmarshall(result.Item) as StorageItem;
    return item.data as Subscription;
  }

  async getSubscriptionsByUserId(userId: string): Promise<Subscription[]> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: marshall({
          ':pk': `USER#${userId}`,
        }),
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return [];
    }

    return result.Items.map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const storageItem = unmarshall(item as any) as StorageItem;
      return storageItem.data as Subscription;
    });
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

    await this.client.send(
      new PutItemCommand({
        TableName: this.tableName,
        Item: marshall(item),
      })
    );

    return subscription;
  }

  async deleteSubscription(subscriptionId: string): Promise<void> {
    await this.client.send(
      new DeleteItemCommand({
        TableName: this.tableName,
        Key: marshall({
          PK: `SUBSCRIPTION#${subscriptionId}`,
          SK: `SUBSCRIPTION#${subscriptionId}`,
        }),
      })
    );
  }
}

export class DynamoDBChildRecordRepository implements IChildRecordRepository {
  constructor(
    private readonly client: DynamoDBClient,
    private readonly tableName: string
  ) {}

  async getChildRecord(subscriptionId: string, childId: string): Promise<ChildRecord | null> {
    const result = await this.client.send(
      new GetItemCommand({
        TableName: this.tableName,
        Key: marshall({
          PK: `SUBSCRIPTION#${subscriptionId}`,
          SK: `CHILD#${childId}`,
        }),
      })
    );

    if (!result.Item) {
      return null;
    }

    const item = unmarshall(result.Item) as StorageItem;
    return item.data as ChildRecord;
  }

  async getChildRecordsBySubscriptionId(subscriptionId: string): Promise<ChildRecord[]> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: marshall({
          ':pk': `SUBSCRIPTION#${subscriptionId}`,
          ':sk': 'CHILD#',
        }),
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return [];
    }

    return result.Items.map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const storageItem = unmarshall(item as any) as StorageItem;
      return storageItem.data as ChildRecord;
    });
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

    await this.client.send(
      new PutItemCommand({
        TableName: this.tableName,
        Item: marshall(item),
      })
    );

    return childRecord;
  }

  async deleteChildRecord(subscriptionId: string, childId: string): Promise<void> {
    await this.client.send(
      new DeleteItemCommand({
        TableName: this.tableName,
        Key: marshall({
          PK: `SUBSCRIPTION#${subscriptionId}`,
          SK: `CHILD#${childId}`,
        }),
      })
    );
  }
}
