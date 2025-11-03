import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { BookCategoriesService } from './book-categories.service';
import { CreateBookCategoryDto, UpdateBookCategoryDto } from '../dto/book-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('book-categories')
@UseGuards(JwtAuthGuard)
export class BookCategoriesController {
  constructor(private readonly bookCategoriesService: BookCategoriesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  create(@Body(ValidationPipe) createBookCategoryDto: CreateBookCategoryDto) {
    return this.bookCategoriesService.create(createBookCategoryDto);
  }

  @Get()
  findAll() {
    return this.bookCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseIntPipe({ errorHttpStatusCode: 400, exceptionFactory: () => new BadRequestException('Invalid category ID format') })) id: number) {
    return this.bookCategoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  update(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400, exceptionFactory: () => new BadRequestException('Invalid category ID format') })) id: number,
    @Body(ValidationPipe) updateBookCategoryDto: UpdateBookCategoryDto,
  ) {
    return this.bookCategoriesService.update(id, updateBookCategoryDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  remove(@Param('id', new ParseIntPipe({ errorHttpStatusCode: 400, exceptionFactory: () => new BadRequestException('Invalid category ID format') })) id: number) {
    return this.bookCategoriesService.remove(id);
  }
}