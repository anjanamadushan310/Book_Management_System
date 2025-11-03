import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ValidationPipe,
  UseGuards,
  Request,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { BorrowBookDto, ReturnBookDto, BorrowRecordFilterDto } from '../dto/borrow.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('borrow')
@UseGuards(JwtAuthGuard)
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  @Post('borrow')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  borrowBook(@Body(ValidationPipe) borrowBookDto: BorrowBookDto) {
    return this.borrowService.borrowBook(borrowBookDto);
  }

  @Post('return')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  returnBook(@Body(ValidationPipe) returnBookDto: ReturnBookDto) {
    return this.borrowService.returnBook(returnBookDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  findAll(@Query(ValidationPipe) filterDto: BorrowRecordFilterDto) {
    return this.borrowService.findAll(filterDto);
  }

  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  getStatistics() {
    return this.borrowService.getBorrowStatistics();
  }

  @Get('overdue')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  getOverdueBooks() {
    return this.borrowService.getOverdueBooks();
  }

  @Get('my-books')
  getMyCurrentBooks(@Request() req) {
    console.log('My Books Request - User ID:', req.user.id, 'User Email:', req.user.email);
    return this.borrowService.getUserCurrentBooks(req.user.id);
  }

  @Get('my-history')
  getMyBorrowHistory(@Request() req) {
    return this.borrowService.getUserBorrowHistory(req.user.id);
  }

  @Get('user/:userId')
  getUserBorrowHistory(@Param('userId', new ParseIntPipe({ errorHttpStatusCode: 400, exceptionFactory: () => new BadRequestException('Invalid user ID format') })) userId: number) {
    return this.borrowService.getUserBorrowHistory(userId);
  }

  @Get('book/:bookId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  getBookBorrowHistory(@Param('bookId', new ParseIntPipe({ errorHttpStatusCode: 400, exceptionFactory: () => new BadRequestException('Invalid book ID format') })) bookId: number) {
    return this.borrowService.getBookBorrowHistory(bookId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LIBRARIAN)
  findOne(@Param('id', new ParseIntPipe({ errorHttpStatusCode: 400, exceptionFactory: () => new BadRequestException('Invalid borrow record ID format') })) id: number) {
    return this.borrowService.findOne(id);
  }
}