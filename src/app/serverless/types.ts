export interface HttpRequest {
  method: string;
  path: string;
  pathParameters?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  headers: Record<string, string>;
  body?: string;
}

export interface HttpResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

export type HttpHandler = (request: HttpRequest) => Promise<HttpResponse>;
