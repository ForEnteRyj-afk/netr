import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number; // Кто совершил действие

  @Column()
  type: string; // Тип: 'swap' (обмен), 'deposit' (ввод), 'withdraw' (вывод)

  @Column()
  amount: string; // Сколько (+100 или -50)

  @Column()
  currency: string; // Валюта (USDT, TON)

  @Column()
  title: string; // Заголовок (например "Обмен USDT на TON")

  @Column()
  date: string; // Дата и время
}