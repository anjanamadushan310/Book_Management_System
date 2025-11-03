import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../entities/user.entity';
import { Book } from '../entities/book.entity';
import { BookCategory } from '../entities/book-category.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(BookCategory)
    private bookCategoryRepository: Repository<BookCategory>,
    private configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.seedUsers();
    await this.seedBookCategories();
    await this.seedBooks();
  }

  private async seedUsers() {
    // Always ensure hardcoded librarian exists using environment variables
    const librarianEmail = this.configService.get<string>('LIBRARIAN_EMAIL', 'librarian@library.com');
    const librarianPassword = this.configService.get<string>('LIBRARIAN_PASSWORD', 'admin123');
    const librarianName = this.configService.get<string>('LIBRARIAN_NAME', 'System Librarian');

    const existingLibrarian = await this.userRepository.findOne({
      where: { email: librarianEmail },
    });

    if (!existingLibrarian) {
      const hashedLibrarianPassword = await bcrypt.hash(librarianPassword, 12);
      
      const librarian = this.userRepository.create({
        email: librarianEmail,
        name: librarianName,
        password: hashedLibrarianPassword,
        role: UserRole.LIBRARIAN,
      });

      await this.userRepository.save(librarian);
      console.log(`Hardcoded librarian created: ${librarianEmail}`);
    } else {
      console.log(`Hardcoded librarian already exists: ${librarianEmail}`);
    }

    // Check if we need to create a sample user (for testing)
    const userCount = await this.userRepository.count();
    if (userCount === 1) { // Only librarian exists
      const hashedUserPassword = await bcrypt.hash('user123', 12);
      
      const sampleUser = this.userRepository.create({
        email: 'user@library.com',
        name: 'Sample User',
        password: hashedUserPassword,
        role: UserRole.USER,
      });

      await this.userRepository.save(sampleUser);
      console.log('Sample user created for testing');
    }
  }

  private async seedBookCategories() {
    const categoryCount = await this.bookCategoryRepository.count();
    if (categoryCount > 0) {
      console.log('Book categories already exist, skipping category seeding');
      return;
    }

    const categories = [
      { name: 'Fiction' },
      { name: 'Non-Fiction' },
      { name: 'Science' },
      { name: 'Technology' },
      { name: 'History' },
    ];

    await this.bookCategoryRepository.save(categories);
    console.log('Book categories seeded successfully');
  }

  private async seedBooks() {
    const bookCount = await this.bookRepository.count();
    if (bookCount > 0) {
      console.log('Books already exist, skipping book seeding');
      return;
    }

    // Get categories to use their IDs
    const fiction = await this.bookCategoryRepository.findOne({ where: { name: 'Fiction' } });
    const nonFiction = await this.bookCategoryRepository.findOne({ where: { name: 'Non-Fiction' } });
    const science = await this.bookCategoryRepository.findOne({ where: { name: 'Science' } });
    const technology = await this.bookCategoryRepository.findOne({ where: { name: 'Technology' } });
    const history = await this.bookCategoryRepository.findOne({ where: { name: 'History' } });

    if (!fiction || !nonFiction || !science || !technology || !history) {
      console.log('Categories not found, skipping book seeding');
      return;
    }

    const books = [
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        price: 15.99,
        stock: 25,
        bookCategoryId: fiction.id,
      },
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        price: 12.99,
        stock: 30,
        bookCategoryId: fiction.id,
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        price: 18.99,
        stock: 20,
        bookCategoryId: nonFiction.id,
      },
      {
        title: 'The Intelligent Investor',
        author: 'Benjamin Graham',
        price: 22.99,
        stock: 15,
        bookCategoryId: nonFiction.id,
      },
      {
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        price: 16.99,
        stock: 18,
        bookCategoryId: science.id,
      },
      {
        title: 'The Elegant Universe',
        author: 'Brian Greene',
        price: 19.99,
        stock: 12,
        bookCategoryId: science.id,
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        price: 35.99,
        stock: 22,
        bookCategoryId: technology.id,
      },
      {
        title: 'The Pragmatic Programmer',
        author: 'David Thomas and Andrew Hunt',
        price: 32.99,
        stock: 28,
        bookCategoryId: technology.id,
      },
      {
        title: 'The Guns of August',
        author: 'Barbara Tuchman',
        price: 17.99,
        stock: 14,
        bookCategoryId: history.id,
      },
      {
        title: 'A People\'s History of the United States',
        author: 'Howard Zinn',
        price: 20.99,
        stock: 16,
        bookCategoryId: history.id,
      },
    ];

    await this.bookRepository.save(books);
    console.log('Books seeded successfully');
  }
}