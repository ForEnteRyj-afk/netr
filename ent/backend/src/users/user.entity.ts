import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  telegramId: string;

  // Вместо общего баланса — храним количество монет
  @Column({ type: 'float', default: 0 })
  usdtBalance: number;

  @Column({ type: 'float', default: 0 })
  tonBalance: number;

  @Column({ default: 'user' })
  role: string;
}