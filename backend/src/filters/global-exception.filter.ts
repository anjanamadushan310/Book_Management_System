import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any = null;

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      
      if (typeof errorResponse === 'string') {
        message = errorResponse;
      } else if (typeof errorResponse === 'object') {
        message = (errorResponse as any).message || errorResponse;
        // Handle validation errors from class-validator
        if (Array.isArray((errorResponse as any).message)) {
          message = 'Validation failed';
          details = (errorResponse as any).message;
        }
      }
    }
    // Handle database errors
    else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = this.handleDatabaseError(exception);
    }
    // Handle other TypeORM errors
    else if (exception && typeof exception === 'object' && 'name' in exception) {
      const error = exception as any;
      
      if (error.name === 'EntityNotFoundError') {
        status = HttpStatus.NOT_FOUND;
        message = 'Resource not found';
      } else if (error.name === 'ConnectionError') {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Database connection error';
      }
    }

    // Log error details
    const errorLog = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      user: (request as any).user?.id || 'anonymous',
      statusCode: status,
      message,
      stack: exception instanceof Error ? exception.stack : 'No stack trace',
    };

    if (status >= 500) {
      this.logger.error('Server Error', errorLog);
    } else if (status >= 400) {
      this.logger.warn('Client Error', errorLog);
    }

    const responseBody: any = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (details) {
      responseBody.details = details;
    }

    response.status(status).json(responseBody);
  }

  private handleDatabaseError(error: QueryFailedError): string {
    const message = error.message.toLowerCase();
    
    // Handle unique constraint violations
    if (message.includes('unique constraint') || message.includes('duplicate key')) {
      if (message.includes('email')) {
        return 'Email address is already registered';
      }
      if (message.includes('name')) {
        return 'Name already exists';
      }
      return 'This record already exists';
    }
    
    // Handle foreign key constraint violations
    if (message.includes('foreign key constraint') || message.includes('violates foreign key')) {
      if (message.includes('user')) {
        return 'Invalid user reference';
      }
      if (message.includes('book')) {
        return 'Invalid book reference';
      }
      if (message.includes('category')) {
        return 'Invalid category reference';
      }
      return 'Invalid reference to related record';
    }
    
    // Handle check constraint violations
    if (message.includes('check constraint')) {
      return 'Invalid data: constraint violation';
    }
    
    // Handle not null constraint violations
    if (message.includes('not null constraint') || message.includes('null value')) {
      return 'Required field is missing';
    }
    
    // Generic database error
    return 'Database operation failed';
  }
}