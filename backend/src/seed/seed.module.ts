import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Book } from '../entities/book.entity';
import { BookCategory } from '../entities/book-category.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Book, BookCategory])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}