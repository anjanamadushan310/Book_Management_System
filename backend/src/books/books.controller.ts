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



  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateBookDto: UpdateBookDto,
  ) {
    return this.booksService.update(+id, updateBookDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  remove(@Param('id') id: string) {
    return this.booksService.remove(+id);
  }
}