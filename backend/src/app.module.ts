import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfigFactory } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';
import { BooksModule } from './books/books.module';
import { BookCategoriesModule } from './book-categories/book-categories.module';
import { BorrowModule } from './borrow/borrow.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: typeOrmConfigFactory,
      inject: [ConfigService],
    }),
    CommonModule,
    AuthModule,
    SeedModule,
    BooksModule,
    BookCategoriesModule,
    BorrowModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
