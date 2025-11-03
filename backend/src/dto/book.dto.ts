import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  stock: number;

  @IsNumber()
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
}