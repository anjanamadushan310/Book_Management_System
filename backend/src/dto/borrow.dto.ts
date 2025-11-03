import { IsNumber, IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class BorrowBookDto {
  @IsNumber({}, { message: 'User ID must be a valid number' })
  @Type(() => Number)
  userId: number;

  @IsNumber({}, { message: 'Book ID must be a valid number' })
  @Type(() => Number)
  bookId: number;

  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid date string (YYYY-MM-DD)' })
  dueDate?: string;

  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @MaxLength(500, { message: 'Notes cannot exceed 500 characters' })
  notes?: string;
}

export class ReturnBookDto {
  @IsNumber()
  @Type(() => Number)
  borrowRecordId: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class BorrowRecordFilterDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  bookId?: number;

  @IsOptional()
  @IsString()
  status?: 'borrowed' | 'returned';

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;
}