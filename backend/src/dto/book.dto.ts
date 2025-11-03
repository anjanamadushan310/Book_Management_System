import { IsString, IsNumber, IsOptional, Min, MinLength, MaxLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateBookDto {
  @IsString({ message: 'Book title must be a string' })
  @MinLength(1, { message: 'Book title cannot be empty' })
  @MaxLength(200, { message: 'Book title cannot exceed 200 characters' })
  title: string;

  @IsString({ message: 'Author name must be a string' })
  @MinLength(1, { message: 'Author name cannot be empty' })
  @MaxLength(100, { message: 'Author name cannot exceed 100 characters' })
  author: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a valid number with maximum 2 decimal places' })
  @Min(0, { message: 'Price cannot be negative' })
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @IsNumber({}, { message: 'Stock must be a valid number' })
  @Min(0, { message: 'Stock cannot be negative' })
  @Transform(({ value }) => parseInt(value))
  stock: number;

  @IsNumber({}, { message: 'Category ID must be a valid number' })
  @Type(() => Number)
  bookCategoryId: number;
}

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  stock?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  bookCategoryId?: number;
}

export class FilterBooksDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;
}

export class PaginationResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}