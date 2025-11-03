import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookCategory } from '../entities/book-category.entity';
import { BookCategoriesService } from './book-categories.service';
import { BookCategoriesController } from './book-categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BookCategory])],
  controllers: [BookCategoriesController],
  providers: [BookCategoriesService],
  exports: [BookCategoriesService],
})
export class BookCategoriesModule {}