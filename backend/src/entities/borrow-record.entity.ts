import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Book } from './book.entity';

export enum BorrowStatus {
  BORROWED = 'borrowed',
  RETURNED = 'returned',
}

@Entity('borrow_records')
export class BorrowRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'book_id' })
  bookId: number;

  @Column({
    type: 'enum',
    enum: BorrowStatus,
    default: BorrowStatus.BORROWED,
  })
  status: BorrowStatus;

  @Column({ name: 'borrow_date' })
  borrowDate: Date;

  @Column({ name: 'return_date', nullable: true })
  returnDate: Date;

  @Column({ name: 'due_date' })
  dueDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Book)
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}