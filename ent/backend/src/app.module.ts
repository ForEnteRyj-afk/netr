import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/user.entity';
import { Transaction } from './transactions/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      
      // 👇 ВАЖНО: Ставим порт 5433 (как на твоем скриншоте)
      port: 5433, 
      
      username: 'postgres',
      
      // 👇 ВАЖНО: Пароль, который ты ввел при установке (123)
      password: ']wz[<k_cQ&ky|EXEX!!DVWxO]t=O]PasswordGZsL]/q4F|E-O$xUi{I^Oa{2Zy_4u},2-ENGP',      
      
      database: 'silver_db', // Если базы нет, он попробует создать подключение, но базу лучше создать вручную, если будет ошибка
      entities: [User, Transaction],
      synchronize: true, // Эта настройка сама создаст таблицы
    }),
    TypeOrmModule.forFeature([User, Transaction]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}