import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ValidationService {
  /**
   * Validates if a given ID is a positive integer
   */
  validateId(id: any, entityName: string = 'ID'): number {
    const numId = Number(id);
    
    if (!id || isNaN(numId) || numId <= 0 || !Number.isInteger(numId)) {
      throw new BadRequestException(`Invalid ${entityName.toLowerCase()} format. Must be a positive integer.`);
    }
    
    return numId;
  }

  /**
   * Validates email format
   */
  validateEmail(email: string): string {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(trimmedEmail)) {
      throw new BadRequestException('Invalid email format');
    }

    return trimmedEmail;
  }

  /**
   * Validates and trims string fields
   */
  validateAndTrimString(value: string, fieldName: string, minLength: number = 1, maxLength: number = 255): string {
    if (!value || typeof value !== 'string') {
      throw new BadRequestException(`${fieldName} is required and must be a string`);
    }

    const trimmed = value.trim();
    
    if (trimmed.length < minLength) {
      throw new BadRequestException(`${fieldName} must be at least ${minLength} characters long`);
    }

    if (trimmed.length > maxLength) {
      throw new BadRequestException(`${fieldName} must be no longer than ${maxLength} characters`);
    }

    return trimmed;
  }

  /**
   * Validates numeric values
   */
  validateNumber(value: any, fieldName: string, min: number = 0, max?: number): number {
    const num = Number(value);
    
    if (isNaN(num)) {
      throw new BadRequestException(`${fieldName} must be a valid number`);
    }

    if (num < min) {
      throw new BadRequestException(`${fieldName} must be at least ${min}`);
    }

    if (max !== undefined && num > max) {
      throw new BadRequestException(`${fieldName} must be no more than ${max}`);
    }

    return num;
  }

  /**
   * Validates date values
   */
  validateDate(dateString: string, fieldName: string, mustBeFuture: boolean = false): Date {
    if (!dateString) {
      throw new BadRequestException(`${fieldName} is required`);
    }

    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      throw new BadRequestException(`${fieldName} must be a valid date`);
    }

    if (mustBeFuture && date <= new Date()) {
      throw new BadRequestException(`${fieldName} must be in the future`);
    }

    return date;
  }

  /**
   * Validates pagination parameters
   */
  validatePagination(page?: number, limit?: number): { page: number; limit: number } {
    const validatedPage = page ? this.validateNumber(page, 'Page', 1, 1000) : 1;
    const validatedLimit = limit ? this.validateNumber(limit, 'Limit', 1, 100) : 10;

    return {
      page: validatedPage,
      limit: validatedLimit,
    };
  }
}