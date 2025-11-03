import { Injectable, NotFoundException, BadRequestException, ConflictException, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import { BookCategory } from '../entities/book-category.entity';
import { CreateBookDto, UpdateBookDto, FilterBooksDto } from '../dto/book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(BookCategory)
    private bookCategoryRepository: Repository<BookCategory>,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    try {
      // Check if book with same title and author exists
      const existingBook = await this.bookRepository.findOne({
        where: { 
          title: createBookDto.title,
          author: createBookDto.author,
        },
      });

      if (existingBook) {
        throw new ConflictException('Book with this title and author already exists');
      }

      // Verify that the category exists
      const category = await this.bookCategoryRepository.findOne({
        where: { id: createBookDto.bookCategoryId },
      });

      if (!category) {
        throw new BadRequestException(`Category with ID ${createBookDto.bookCategoryId} not found`);
      }

      const book = this.bookRepository.create(createBookDto);
      return await this.bookRepository.save(book);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to create book');
    }
  }

  async findAll(filterDto?: FilterBooksDto): Promise<any> {
    const page = filterDto?.page || 1;
    const limit = filterDto?.limit || 10;
    const skip = (page - 1) * limit;

    const query = this.bookRepository.createQueryBuilder('book')
      .leftJoinAndSelect('book.category', 'category');

    if (filterDto?.categoryId) {
      query.where('book.bookCategoryId = :categoryId', { categoryId: filterDto.categoryId });
    }

    const [data, total] = await query
      .orderBy('book.createdAt', 'DESC')
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

  async findAllWithoutPagination(filterDto?: FilterBooksDto): Promise<Book[]> {
    const query = this.bookRepository.createQueryBuilder('book')
      .leftJoinAndSelect('book.category', 'category');

    if (filterDto?.categoryId) {
      query.where('book.bookCategoryId = :categoryId', { categoryId: filterDto.categoryId });
    }

    return await query
      .orderBy('book.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: number): Promise<Book> {
    try {
      if (!id || isNaN(id) || id <= 0) {
        throw new BadRequestException('Invalid book ID');
      }

      const book = await this.bookRepository.findOne({
        where: { id },
        relations: ['category'],
      });

      if (!book) {
        throw new NotFoundException(`Book with ID ${id} not found`);
      }

      return book;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve book');
    }
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    try {
      const book = await this.findOne(id);

      // Check for duplicate title/author if title or author is being updated
      if (updateBookDto.title || updateBookDto.author) {
        const existingBook = await this.bookRepository.findOne({
          where: { 
            title: updateBookDto.title || book.title,
            author: updateBookDto.author || book.author,
          },
        });

        if (existingBook && existingBook.id !== id) {
          throw new ConflictException('Book with this title and author already exists');
        }
      }

      // If updating category, verify it exists
      if (updateBookDto.bookCategoryId) {
        const category = await this.bookCategoryRepository.findOne({
          where: { id: updateBookDto.bookCategoryId },
        });

        if (!category) {
          throw new BadRequestException(`Category with ID ${updateBookDto.bookCategoryId} not found`);
        }
      }
      
      Object.assign(book, updateBookDto);
      
      return await this.bookRepository.save(book);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to update book');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const book = await this.findOne(id);
      
      // Check if book has any active borrow records
      const borrowRecordRepository = this.bookRepository.manager.getRepository('BorrowRecord');
      const activeBorrows = await borrowRecordRepository.count({
        where: { bookId: id, status: 'borrowed' },
      });

      if (activeBorrows > 0) {
        throw new BadRequestException('Cannot delete book with active borrow records');
      }

      await this.bookRepository.remove(book);
      return { message: 'Book deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete book');
    }
  }
}