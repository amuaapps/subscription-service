import { HttpRequest, HttpResponse } from './types';
import { UserHandlers } from '../handlers/user-handlers';
import { SubscriptionHandlers } from '../handlers/subscription-handlers';
import { ChildRecordHandlers } from '../handlers/child-record-handlers';
import { validateSchema } from '../../utils/validation';
import {
  upsertUserRequestSchema,
  upsertSubscriptionRequestSchema,
  updateSubscriptionStatusRequestSchema,
  upsertChildRecordRequestSchema,
  updateChildRecordStatusRequestSchema,
} from '../schemas';
import { AppError } from '../errors';

export class Router {
  constructor(
    private readonly userHandlers: UserHandlers,
    private readonly subscriptionHandlers: SubscriptionHandlers,
    private readonly childRecordHandlers: ChildRecordHandlers
  ) {}

  async route(request: HttpRequest): Promise<HttpResponse> {
    try {
      const { method, path } = request;

      if (method === 'OPTIONS') {
        return this.corsResponse();
      }

      const userMatch = path.match(/^\/users\/([^/]+)$/);
      if (userMatch) {
        return this.handleUserRoute(method, userMatch[1], request);
      }

      const subscriptionMatch = path.match(/^\/subscriptions\/([^/]+)$/);
      if (subscriptionMatch) {
        return this.handleSubscriptionRoute(method, subscriptionMatch[1], request);
      }

      const subscriptionStatusMatch = path.match(/^\/subscriptions\/([^/]+)\/status$/);
      if (subscriptionStatusMatch) {
        return this.handleSubscriptionStatusRoute(method, subscriptionStatusMatch[1], request);
      }

      const childRecordMatch = path.match(/^\/subscriptions\/([^/]+)\/children\/([^/]+)$/);
      if (childRecordMatch) {
        return this.handleChildRecordRoute(method, childRecordMatch[1], childRecordMatch[2], request);
      }

      const childRecordStatusMatch = path.match(/^\/subscriptions\/([^/]+)\/children\/([^/]+)\/status$/);
      if (childRecordStatusMatch) {
        return this.handleChildRecordStatusRoute(
          method,
          childRecordStatusMatch[1],
          childRecordStatusMatch[2],
          request
        );
      }

      if (path === '/users' && method === 'POST') {
        return await this.handleCreateUser(request);
      }

      if (path === '/subscriptions' && method === 'POST') {
        return await this.handleCreateSubscription(request);
      }

      const subscriptionChildrenMatch = path.match(/^\/subscriptions\/([^/]+)\/children$/);
      if (subscriptionChildrenMatch && method === 'POST') {
        return await this.handleCreateChildRecord(subscriptionChildrenMatch[1], request);
      }

      return this.notFoundResponse();
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  private async handleUserRoute(method: string, userId: string, request: HttpRequest): Promise<HttpResponse> {
    if (method === 'GET') {
      const user = await this.userHandlers.getUser(userId);
      return this.jsonResponse(200, user);
    }

    if (method === 'PUT') {
      const body = this.parseBody(request);
      const validated = validateSchema(upsertUserRequestSchema, { userId, ...(body as object) });
      const user = await this.userHandlers.upsertUser(validated);
      return this.jsonResponse(200, user);
    }

    if (method === 'DELETE') {
      await this.userHandlers.deleteUser(userId);
      return this.jsonResponse(204, {});
    }

    return this.methodNotAllowedResponse();
  }

  private async handleCreateUser(request: HttpRequest): Promise<HttpResponse> {
    const body = this.parseBody(request);
    const validated = validateSchema(upsertUserRequestSchema, body);
    const user = await this.userHandlers.upsertUser(validated);
    return this.jsonResponse(201, user);
  }

  private async handleSubscriptionRoute(
    method: string,
    subscriptionId: string,
    request: HttpRequest
  ): Promise<HttpResponse> {
    if (method === 'GET') {
      const subscription = await this.subscriptionHandlers.getSubscription(subscriptionId);
      return this.jsonResponse(200, subscription);
    }

    if (method === 'PUT') {
      const body = this.parseBody(request);
      const validated = validateSchema(upsertSubscriptionRequestSchema, { subscriptionId, ...(body as object) });
      const subscription = await this.subscriptionHandlers.upsertSubscription(validated);
      return this.jsonResponse(200, subscription);
    }

    if (method === 'DELETE') {
      await this.subscriptionHandlers.deleteSubscription(subscriptionId);
      return this.jsonResponse(204, {});
    }

    return this.methodNotAllowedResponse();
  }

  private async handleCreateSubscription(request: HttpRequest): Promise<HttpResponse> {
    const body = this.parseBody(request);
    const validated = validateSchema(upsertSubscriptionRequestSchema, body);
    const subscription = await this.subscriptionHandlers.upsertSubscription(validated);
    return this.jsonResponse(201, subscription);
  }

  private async handleSubscriptionStatusRoute(
    method: string,
    subscriptionId: string,
    request: HttpRequest
  ): Promise<HttpResponse> {
    if (method === 'PATCH') {
      const body = this.parseBody(request);
      const validated = validateSchema(updateSubscriptionStatusRequestSchema, body);
      const subscription = await this.subscriptionHandlers.updateSubscriptionStatus(
        subscriptionId,
        validated
      );
      return this.jsonResponse(200, subscription);
    }

    return this.methodNotAllowedResponse();
  }

  private async handleChildRecordRoute(
    method: string,
    subscriptionId: string,
    childId: string,
    request: HttpRequest
  ): Promise<HttpResponse> {
    if (method === 'GET') {
      const childRecord = await this.childRecordHandlers.getChildRecord(subscriptionId, childId);
      return this.jsonResponse(200, childRecord);
    }

    if (method === 'PUT') {
      const body = this.parseBody(request);
      const validated = validateSchema(upsertChildRecordRequestSchema, { childId, ...(body as object) });
      const childRecord = await this.childRecordHandlers.upsertChildRecord(subscriptionId, validated);
      return this.jsonResponse(200, childRecord);
    }

    if (method === 'DELETE') {
      await this.childRecordHandlers.deleteChildRecord(subscriptionId, childId);
      return this.jsonResponse(204, {});
    }

    return this.methodNotAllowedResponse();
  }

  private async handleCreateChildRecord(
    subscriptionId: string,
    request: HttpRequest
  ): Promise<HttpResponse> {
    const body = this.parseBody(request);
    const validated = validateSchema(upsertChildRecordRequestSchema, body);
    const childRecord = await this.childRecordHandlers.upsertChildRecord(subscriptionId, validated);
    return this.jsonResponse(201, childRecord);
  }

  private async handleChildRecordStatusRoute(
    method: string,
    subscriptionId: string,
    childId: string,
    request: HttpRequest
  ): Promise<HttpResponse> {
    if (method === 'PATCH') {
      const body = this.parseBody(request);
      const validated = validateSchema(updateChildRecordStatusRequestSchema, body);
      const childRecord = await this.childRecordHandlers.updateChildRecordStatus(
        subscriptionId,
        childId,
        validated
      );
      return this.jsonResponse(200, childRecord);
    }

    return this.methodNotAllowedResponse();
  }

  private parseBody(request: HttpRequest): unknown {
    if (!request.body) {
      return {};
    }
    try {
      return JSON.parse(request.body);
    } catch {
      throw new AppError('Invalid JSON in request body', 400, 'INVALID_JSON');
    }
  }

  private jsonResponse(statusCode: number, data: unknown): HttpResponse {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  }

  private corsResponse(): HttpResponse {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: '',
    };
  }

  private notFoundResponse(): HttpResponse {
    return this.jsonResponse(404, {
      error: 'Not Found',
      message: 'The requested resource was not found',
    });
  }

  private methodNotAllowedResponse(): HttpResponse {
    return this.jsonResponse(405, {
      error: 'Method Not Allowed',
      message: 'The HTTP method is not allowed for this resource',
    });
  }

  private errorResponse(error: unknown): HttpResponse {
    if (error instanceof AppError) {
      return this.jsonResponse(error.statusCode, {
        error: error.name,
        message: error.message,
      });
    }

    // eslint-disable-next-line no-console
    console.error('Unexpected error:', error);
    return this.jsonResponse(500, {
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
