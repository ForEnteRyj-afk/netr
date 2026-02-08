import { Controller, Get, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users/user.entity';
import { Transaction } from './transactions/transaction.entity';

// Хранилище курсов (в памяти)
let CURRENT_RATES = {
  USDT: 17.35,  // 1 USDT = ? RUB
  TON: 54.20,   // 1 TON = ? RUB
  USD_PRB: 17.30 // 1 USD = ? RUB
};

@Controller()
export class AppController {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Transaction) // Подключаем репозиторий транзакций
    private transactionsRepository: Repository<Transaction>,
  ) {}

  // --- КУРСЫ ---
  @Get('rates')
  getRates() { return CURRENT_RATES; }

  @Post('admin/update-rates')
  updateRates(@Body() newRates: any) {
    CURRENT_RATES = { ...CURRENT_RATES, ...newRates };
    return { status: 'success', rates: CURRENT_RATES };
  }

  // --- ЮЗЕРЫ ---
  @Get('users')
  getAllUsers() { return this.usersRepository.find({ order: { id: 'DESC' } }); }

  @Get('create-test')
  async createTestUser() {
    const newUser = this.usersRepository.create({
      telegramId: 'User_' + Date.now(),
      usdtBalance: 1000,
      tonBalance: 10,
      role: 'user',
    });
    await this.usersRepository.save(newUser);
    return 'Юзер создан!';
  }

  @Post('admin/update-balance')
  async updateUserBalance(@Body() body: { userId: number; usdt: number; ton: number }) {
    const user = await this.usersRepository.findOneBy({ id: body.userId });
    if (user) {
      user.usdtBalance = body.usdt;
      user.tonBalance = body.ton;
      await this.usersRepository.save(user);
      return { status: 'success' };
    }
    return { status: 'error' };
  }

  // --- ИСТОРИЯ ---
  @Get('transactions')
  async getTransactions() {
    // Возвращаем последние 20 операций (сначала новые)
    return this.transactionsRepository.find({ order: { id: 'DESC' }, take: 20 });
  }

  // --- ЛОГИКА ОБМЕНА (SWAP) ---
  @Post('swap')
  async makeSwap(@Body() body: { userId: number; from: string; to: string; amount: number }) {
    const user = await this.usersRepository.findOneBy({ id: body.userId });
    if (!user) return { status: 'error', message: 'User not found' };

    const amount = Number(body.amount);
    if (amount <= 0) return { status: 'error', message: 'Invalid amount' };

    // 1. Вычисляем кросс-курс через рубли (как у нас настроено)
    // Например: USDT -> TON. 
    // (Amount * Rate_From) / Rate_To = Result
    const rateFrom = body.from === 'USDT' ? CURRENT_RATES.USDT : CURRENT_RATES.TON;
    const rateTo = body.to === 'USDT' ? CURRENT_RATES.USDT : CURRENT_RATES.TON;
    
    const resultAmount = (amount * rateFrom) / rateTo;

    // 2. Проверяем баланс и меняем цифры
    if (body.from === 'USDT') {
        if (user.usdtBalance < amount) return { status: 'error', message: 'Недостаточно средств' };
        user.usdtBalance -= amount;
        user.tonBalance += resultAmount;
    } else {
        if (user.tonBalance < amount) return { status: 'error', message: 'Недостаточно средств' };
        user.tonBalance -= amount;
        user.usdtBalance += resultAmount;
    }

    // 3. Сохраняем юзера
    await this.usersRepository.save(user);

    // 4. Записываем в Историю (2 записи: списание и начисление, для красоты)
    const time = new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'});
    
    // Запись о списании
    await this.transactionsRepository.save({
        userId: user.id,
        type: 'swap',
        amount: `-${amount.toFixed(2)}`,
        currency: body.from,
        title: `Обмен на ${body.to}`,
        date: time
    });

    // Запись о начислении
    await this.transactionsRepository.save({
        userId: user.id,
        type: 'swap',
        amount: `+${resultAmount.toFixed(2)}`,
        currency: body.to,
        title: `Получено из ${body.from}`,
        date: time
    });

    return { status: 'success' };
  }
}