import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    // Verify that the category exists
    const category = await this.bookCategoryRepository.findOne({
      where: { id: createBookDto.bookCategoryId },
    });

    if (!category) {
      throw new BadRequestException(`Category with ID ${createBookDto.bookCategoryId} not found`);
    }

    const book = this.bookRepository.create(createBookDto);
    return await this.bookRepository.save(book);
  }

  async findAll(filterDto?: FilterBooksDto): Promise<Book[]> {
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
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);

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
  }

  async remove(id: number): Promise<void> {
    const book = await this.findOne(id);
    await this.bookRepository.remove(book);
  }
}