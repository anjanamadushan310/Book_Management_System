import { Injectable, NotFoundException, BadRequestException, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BorrowRecord, BorrowStatus } from '../entities/borrow-record.entity';
import { Book } from '../entities/book.entity';
import { User } from '../entities/user.entity';
import { BorrowBookDto, ReturnBookDto, BorrowRecordFilterDto } from '../dto/borrow.dto';

@Injectable()
export class BorrowService {
  constructor(
    @InjectRepository(BorrowRecord)
    private borrowRecordRepository: Repository<BorrowRecord>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async borrowBook(borrowBookDto: BorrowBookDto): Promise<BorrowRecord> {
    try {
      const { userId, bookId, dueDate, notes } = borrowBookDto;

      // Verify user exists
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Verify book exists and has stock
      const book = await this.bookRepository.findOne({ where: { id: bookId } });
      if (!book) {
        throw new NotFoundException(`Book with ID ${bookId} not found`);
      }

      if (book.stock <= 0) {
        throw new BadRequestException(`Book "${book.title}" is out of stock`);
      }

      // Check if user already has this book borrowed
      const existingBorrow = await this.borrowRecordRepository.findOne({
        where: {
          userId,
          bookId,
          status: BorrowStatus.BORROWED,
        },
      });

      if (existingBorrow) {
        throw new BadRequestException(`User already has this book borrowed`);
      }

      // Validate due date if provided
      let calculatedDueDate: Date;
      const borrowDate = new Date();
      
      if (dueDate) {
        calculatedDueDate = new Date(dueDate);
        if (isNaN(calculatedDueDate.getTime())) {
          throw new BadRequestException('Invalid due date format');
        }
        if (calculatedDueDate <= borrowDate) {
          throw new BadRequestException('Due date must be in the future');
        }
      } else {
        // Default 14 days from now
        calculatedDueDate = new Date(borrowDate.getTime() + 14 * 24 * 60 * 60 * 1000);
      }

      // Create borrow record
      const borrowRecord = this.borrowRecordRepository.create({
        userId,
        bookId,
        status: BorrowStatus.BORROWED,
        borrowDate,
        dueDate: calculatedDueDate,
        notes: notes?.trim(),
      });

      // Use transaction to ensure data consistency
      const queryRunner = this.borrowRecordRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Reduce book stock
        book.stock -= 1;
        await queryRunner.manager.save(book);

        // Save borrow record
        const savedRecord = await queryRunner.manager.save(borrowRecord);

        await queryRunner.commitTransaction();

        // Return with relations
        const result = await this.borrowRecordRepository.findOne({
          where: { id: savedRecord.id },
          relations: ['user', 'book', 'book.category'],
        });
        
        return result!;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to borrow book');
    }
  }

  async returnBook(returnBookDto: ReturnBookDto): Promise<BorrowRecord> {
    try {
      const { borrowRecordId, notes } = returnBookDto;

      // Find the borrow record
      const borrowRecord = await this.borrowRecordRepository.findOne({
        where: { id: borrowRecordId },
        relations: ['book'],
      });

      if (!borrowRecord) {
        throw new NotFoundException(`Borrow record with ID ${borrowRecordId} not found`);
      }

      if (borrowRecord.status === BorrowStatus.RETURNED) {
        throw new BadRequestException('Book has already been returned');
      }

      // Use transaction to ensure data consistency
      const queryRunner = this.borrowRecordRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Update borrow record
        borrowRecord.status = BorrowStatus.RETURNED;
        borrowRecord.returnDate = new Date();
        if (notes?.trim()) {
          borrowRecord.notes = borrowRecord.notes 
            ? `${borrowRecord.notes}\nReturn notes: ${notes.trim()}`
            : `Return notes: ${notes.trim()}`;
        }

        // Increase book stock
        const book = borrowRecord.book;
        book.stock += 1;
        await queryRunner.manager.save(book);

        // Save updated borrow record
        const savedRecord = await queryRunner.manager.save(borrowRecord);

        await queryRunner.commitTransaction();

        // Return with relations
        const result = await this.borrowRecordRepository.findOne({
          where: { id: savedRecord.id },
          relations: ['user', 'book', 'book.category'],
        });
        
        return result!;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to return book');
    }
  }

  async findAll(filterDto?: BorrowRecordFilterDto): Promise<any> {
    const page = filterDto?.page || 1;
    const limit = filterDto?.limit || 10;
    const skip = (page - 1) * limit;

    const query = this.borrowRecordRepository
      .createQueryBuilder('borrowRecord')
      .leftJoinAndSelect('borrowRecord.user', 'user')
      .leftJoinAndSelect('borrowRecord.book', 'book')
      .leftJoinAndSelect('book.category', 'category');

    if (filterDto?.userId) {
      query.andWhere('borrowRecord.userId = :userId', { userId: filterDto.userId });
    }

    if (filterDto?.bookId) {
      query.andWhere('borrowRecord.bookId = :bookId', { bookId: filterDto.bookId });
    }

    if (filterDto?.status) {
      query.andWhere('borrowRecord.status = :status', { status: filterDto.status });
    }

    const [data, total] = await query
      .orderBy('borrowRecord.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async findOne(id: number): Promise<BorrowRecord> {
    const borrowRecord = await this.borrowRecordRepository.findOne({
      where: { id },
      relations: ['user', 'book', 'book.category'],
    });

    if (!borrowRecord) {
      throw new NotFoundException(`Borrow record with ID ${id} not found`);
    }

    return borrowRecord;
  }

  async getUserBorrowHistory(userId: number): Promise<BorrowRecord[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.borrowRecordRepository.find({
      where: { userId },
      relations: ['book', 'book.category'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserCurrentBooks(userId: number): Promise<BorrowRecord[]> {
    console.log('Getting current books for user ID:', userId);
    
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const borrowedBooks = await this.borrowRecordRepository.find({
      where: { 
        userId,
        status: BorrowStatus.BORROWED,
      },
      relations: ['book', 'book.category', 'user'],
      order: { dueDate: 'ASC' },
    });

    console.log(`Found ${borrowedBooks.length} borrowed books for user ${userId} (${user.email})`);
    return borrowedBooks;
  }

  async getBookBorrowHistory(bookId: number): Promise<BorrowRecord[]> {
    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }

    return this.borrowRecordRepository.find({
      where: { bookId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOverdueBooks(): Promise<BorrowRecord[]> {
    const today = new Date();
    
    return this.borrowRecordRepository
      .createQueryBuilder('borrowRecord')
      .leftJoinAndSelect('borrowRecord.user', 'user')
      .leftJoinAndSelect('borrowRecord.book', 'book')
      .leftJoinAndSelect('book.category', 'category')
      .where('borrowRecord.status = :status', { status: BorrowStatus.BORROWED })
      .andWhere('borrowRecord.dueDate < :today', { today })
      .orderBy('borrowRecord.dueDate', 'ASC')
      .getMany();
  }

  async getBorrowStatistics() {
    const totalBorrowed = await this.borrowRecordRepository.count({
      where: { status: BorrowStatus.BORROWED },
    });

    const totalReturned = await this.borrowRecordRepository.count({
      where: { status: BorrowStatus.RETURNED },
    });

    const overdue = await this.getOverdueBooks();
    const overdueCount = overdue.length;

    return {
      totalBorrowed,
      totalReturned,
      overdueCount,
      totalRecords: totalBorrowed + totalReturned,
    };
  }
}