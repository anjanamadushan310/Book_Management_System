import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto, UpdateBookDto, FilterBooksDto } from '../dto/book.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('books')
@UseGuards(JwtAuthGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  create(@Body(ValidationPipe) createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get()
  findAll(@Query(ValidationPipe) filterDto: FilterBooksDto) {
    return this.booksService.findAll(filterDto);
  }

  @Get('all/no-pagination')
  findAllNoPagination(@Query(ValidationPipe) filterDto: FilterBooksDto) {
    return this.booksService.findAllWithoutPagination(filterDto);
  }

  @Get(':id')
  findOne(@Param('id', new ParseIntPipe({ errorHttpStatusCode: 400, exceptionFactory: () => new BadRequestException('Invalid book ID format') })) id: number) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  update(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400, exceptionFactory: () => new BadRequestException('Invalid book ID format') })) id: number,
    @Body(ValidationPipe) updateBookDto: UpdateBookDto,
  ) {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  remove(@Param('id', new ParseIntPipe({ errorHttpStatusCode: 400, exceptionFactory: () => new BadRequestException('Invalid book ID format') })) id: number) {
    return this.booksService.remove(id);
  }
}