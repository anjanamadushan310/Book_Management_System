import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BookCategory } from './book-category.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  stock: number;

  @Column({ name: 'book_category_id' })
  bookCategoryId: number;

  @ManyToOne(() => BookCategory, category => category.books)
  @JoinColumn({ name: 'book_category_id' })
  category: BookCategory;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}