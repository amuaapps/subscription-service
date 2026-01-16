import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { HttpRequest, HttpHandler } from './types';

export function createLambdaHandler(handler: HttpHandler) {
  return async (
    event: APIGatewayProxyEvent,
    _context: Context
  ): Promise<APIGatewayProxyResult> => {
    try {
      const pathParams = event.pathParameters
        ? Object.fromEntries(
            Object.entries(event.pathParameters).filter(([, v]) => v !== undefined) as [string, string][]
          )
        : undefined;

      const queryParams = event.queryStringParameters
        ? Object.fromEntries(
            Object.entries(event.queryStringParameters).filter(([, v]) => v !== undefined) as [string, string][]
          )
        : undefined;

      const headers = Object.fromEntries(
        Object.entries(event.headers).filter(([, v]) => v !== undefined) as [string, string][]
      );

      const request: HttpRequest = {
        method: event.httpMethod,
        path: event.path,
        pathParameters: pathParams,
        queryStringParameters: queryParams,
        headers,
        body: event.body || undefined,
      };

      const response = await handler(request);

      return {
        statusCode: response.statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          ...response.headers,
        },
        body: response.body,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Lambda handler error:', error);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
      };
    }
  };
}
