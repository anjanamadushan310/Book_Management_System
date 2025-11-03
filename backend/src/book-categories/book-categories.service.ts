import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
    // Check if category with same name already exists
    const existingCategory = await this.bookCategoryRepository.findOne({
      where: { name: createBookCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = this.bookCategoryRepository.create(createBookCategoryDto);
    return await this.bookCategoryRepository.save(category);
  }

  async findAll(): Promise<BookCategory[]> {
    return await this.bookCategoryRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<BookCategory> {
    const category = await this.bookCategoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: number, updateBookCategoryDto: UpdateBookCategoryDto): Promise<BookCategory> {
    const category = await this.findOne(id);

    // Check if updating to a name that already exists
    if (updateBookCategoryDto.name) {
      const existingCategory = await this.bookCategoryRepository.findOne({
        where: { name: updateBookCategoryDto.name },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    Object.assign(category, updateBookCategoryDto);
    return await this.bookCategoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.bookCategoryRepository.remove(category);
  }
}