import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateBookCategoryDto {
  @IsString({ message: 'Category name must be a string' })
  @MinLength(2, { message: 'Category name at least 2 character' })
  @MaxLength(100, { message: 'Category name cannot exceed 100 characters' })
  name: string;
}

export class UpdateBookCategoryDto {
  @IsOptional()
  @IsString({ message: 'Category name must be a string' })
  @MinLength(2, { message: 'Category name at least 2 character' })
  @MaxLength(100, { message: 'Category name cannot exceed 100 characters' })
  name?: string;
}