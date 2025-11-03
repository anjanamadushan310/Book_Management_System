import { Injectable, Logger } from '@nestjs/common';

export interface ErrorLogContext {
  userId?: string | number;
  method?: string;
  url?: string;
  body?: any;
  query?: any;
  params?: any;
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class ErrorLoggerService {
  private readonly logger = new Logger(ErrorLoggerService.name);

  /**
   * Log error with context information
   */
  logError(
    error: Error | any,
    context: ErrorLogContext = {},
    additionalInfo?: Record<string, any>
  ): void {
    const logData = {
      timestamp: new Date().toISOString(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      context,
      additionalInfo,
      errorType: error.constructor.name,
    };

    this.logger.error(`Error occurred: ${error.message}`, JSON.stringify(logData, null, 2));
  }

  /**
   * Log warning with context
   */
  logWarning(
    message: string,
    context: ErrorLogContext = {},
    additionalInfo?: Record<string, any>
  ): void {
    const logData = {
      timestamp: new Date().toISOString(),
      message,
      context,
      additionalInfo,
    };

    this.logger.warn(message, JSON.stringify(logData, null, 2));
  }

  /**
   * Log info with context
   */
  logInfo(
    message: string,
    context: ErrorLogContext = {},
    additionalInfo?: Record<string, any>
  ): void {
    const logData = {
      timestamp: new Date().toISOString(),
      message,
      context,
      additionalInfo,
    };

    this.logger.log(message, JSON.stringify(logData, null, 2));
  }

  /**
   * Log database operations
   */
  logDatabaseOperation(
    operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
    entity: string,
    success: boolean,
    context: ErrorLogContext = {},
    error?: Error
  ): void {
    const logData = {
      timestamp: new Date().toISOString(),
      operation,
      entity,
      success,
      context,
      error: error ? {
        message: error.message,
        stack: error.stack,
      } : null,
    };

    if (success) {
      this.logger.log(`Database ${operation} on ${entity} succeeded`, JSON.stringify(logData, null, 2));
    } else {
      this.logger.error(`Database ${operation} on ${entity} failed`, JSON.stringify(logData, null, 2));
    }
  }

  /**
   * Log authentication events
   */
  logAuthEvent(
    event: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'REGISTER_SUCCESS' | 'REGISTER_FAILED' | 'UNAUTHORIZED_ACCESS',
    userId?: string | number,
    email?: string,
    context: ErrorLogContext = {}
  ): void {
    const logData = {
      timestamp: new Date().toISOString(),
      event,
      userId,
      email,
      context,
    };

    if (event.includes('FAILED') || event === 'UNAUTHORIZED_ACCESS') {
      this.logger.warn(`Auth event: ${event}`, JSON.stringify(logData, null, 2));
    } else {
      this.logger.log(`Auth event: ${event}`, JSON.stringify(logData, null, 2));
    }
  }
}