import { HttpRequest as AzureHttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { HttpRequest, HttpResponse, HttpHandler } from './types';

export function createAzureFunctionHandler(handler: HttpHandler) {
  return async (
    request: AzureHttpRequest,
    _context: InvocationContext
  ): Promise<HttpResponseInit> => {
    try {
      const pathParts = request.url.split('?')[0].split('/').filter(Boolean);
      const path = '/' + pathParts.slice(3).join('/');

      const queryParams: Record<string, string> = {};
      const url = new URL(request.url);
      url.searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });

      const headers: Record<string, string> = {};
      request.headers.forEach((value: string, key: string) => {
        headers[key] = value;
      });

      const pathParameters: Record<string, string> = {};
      const pathMatch = path.match(/\/([^/]+)/g);
      if (pathMatch && pathMatch.length > 0) {
        pathMatch.forEach((segment, index) => {
          const key = segment.replace('/', '');
          if (key) {
            pathParameters[`param${index}`] = key;
          }
        });
      }

      const body = await request.text();

      const httpRequest: HttpRequest = {
        method: request.method,
        path,
        pathParameters: Object.keys(pathParameters).length > 0 ? pathParameters : undefined,
        queryStringParameters: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        headers,
        body: body || undefined,
      };

      const response: HttpResponse = await handler(httpRequest);

      return {
        status: response.statusCode,
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
      console.error('Azure Function handler error:', error);
      return {
        status: 500,
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
