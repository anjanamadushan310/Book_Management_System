import { Injectable, NotFoundException, ConflictException, BadRequestException, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookCategory } from '../entities/book-category.entity';
import { CreateBookCategoryDto, UpdateBookCategoryDto } from '../dto/book-category.dto';

@Injectable()
export class BookCategoriesService {
  constructor(
    @InjectRepository(BookCategory)
    private bookCategoryRepository: Repository<BookCategory>,
  ) {}

  async create(createBookCategoryDto: CreateBookCategoryDto): Promise<BookCategory> {
    try {
      // Check if category with same name already exists
      const existingCategory = await this.bookCategoryRepository.findOne({
        where: { name: createBookCategoryDto.name.trim() },
      });

      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }

      const category = this.bookCategoryRepository.create({
        ...createBookCategoryDto,
        name: createBookCategoryDto.name.trim(),
      });
      return await this.bookCategoryRepository.save(category);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to create category');
    }
  }

  async findAll(): Promise<BookCategory[]> {
    return await this.bookCategoryRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<BookCategory> {
    try {
      if (!id || isNaN(id) || id <= 0) {
        throw new BadRequestException('Invalid category ID');
      }

      const category = await this.bookCategoryRepository.findOne({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      return category;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve category');
    }
  }

  async update(id: number, updateBookCategoryDto: UpdateBookCategoryDto): Promise<BookCategory> {
    try {
      const category = await this.findOne(id);

      // Check if updating to a name that already exists
      if (updateBookCategoryDto.name) {
        const trimmedName = updateBookCategoryDto.name.trim();
        const existingCategory = await this.bookCategoryRepository.findOne({
          where: { name: trimmedName },
        });

        if (existingCategory && existingCategory.id !== id) {
          throw new ConflictException('Category with this name already exists');
        }

        updateBookCategoryDto.name = trimmedName;
      }

      Object.assign(category, updateBookCategoryDto);
      return await this.bookCategoryRepository.save(category);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to update category');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const category = await this.findOne(id);
      
      // Check if category has any books
      const bookRepository = this.bookCategoryRepository.manager.getRepository('Book');
      const bookCount = await bookRepository.count({
        where: { bookCategoryId: id },
      });

      if (bookCount > 0) {
        throw new BadRequestException('Cannot delete category that has books assigned to it');
      }

      await this.bookCategoryRepository.remove(category);
      return { message: 'Category deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete category');
    }
  }
}