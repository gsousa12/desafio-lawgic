import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { ApiResponse } from '../types/api/api.types';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ApiResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const customMessage = this.reflector.get<string>(
      'responseMessage',
      context.getHandler(),
    );

    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        const message =
          customMessage ||
          this.getDefaultMessage(request.method, response.statusCode);

        return this.formatResponse(data, message);
      }),
    );
  }

  private getDefaultMessage(method: string, statusCode: number): string {
    const messages = {
      GET:
        statusCode === HttpStatus.OK
          ? 'Data retrieved successfully'
          : 'Operation completed',
      POST:
        statusCode === HttpStatus.CREATED
          ? 'Resource created successfully'
          : 'Operation completed',
      PUT: 'Resource updated successfully',
      PATCH: 'Resource updated successfully',
      DELETE: 'Resource deleted successfully',
    };

    return messages[method] || 'Operation completed successfully';
  }

  private formatResponse(data: any, message: string): ApiResponse<any> {
    const response: ApiResponse<any> = {
      success: true,
      message: message,
    };

    if (data === null || data === undefined) {
      return response;
    }

    if (Array.isArray(data)) {
      if (data.length === 1) {
        response.data = data[0];
      } else {
        response.data = data;
      }
      return response;
    }

    if (data && typeof data === 'object' && data.data && data.meta) {
      response.meta = data.meta;
      response.data =
        Array.isArray(data.data) && data.data.length === 1
          ? data.data[0]
          : data.data;
      return response;
    }

    response.data = data;
    return response;
  }
}
