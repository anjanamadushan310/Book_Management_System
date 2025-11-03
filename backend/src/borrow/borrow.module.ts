import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowRecord } from '../entities/borrow-record.entity';
import { Book } from '../entities/book.entity';
import { User } from '../entities/user.entity';
import { BorrowService } from './borrow.service';
import { BorrowController } from './borrow.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BorrowRecord, Book, User])],
  controllers: [BorrowController],
  providers: [BorrowService],
  exports: [BorrowService],
})
export class BorrowModule {}