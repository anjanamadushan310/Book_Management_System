import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateBookCategoryDto {
  @IsString()
  @MinLength(2)
  name: string;
}

export class UpdateBookCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}