import { Repository } from 'typeorm';
import { User } from './users/user.entity';
import { Transaction } from './transactions/transaction.entity';
export declare class AppController {
    private usersRepository;
    private transactionsRepository;
    constructor(usersRepository: Repository<User>, transactionsRepository: Repository<Transaction>);
    getRates(): {
        USDT: number;
        TON: number;
        USD_PRB: number;
    };
    updateRates(newRates: any): {
        status: string;
        rates: {
            USDT: number;
            TON: number;
            USD_PRB: number;
        };
    };
    getAllUsers(): Promise<User[]>;
    createTestUser(): Promise<string>;
    updateUserBalance(body: {
        userId: number;
        usdt: number;
        ton: number;
    }): Promise<{
        status: string;
    }>;
    getTransactions(): Promise<Transaction[]>;
    makeSwap(body: {
        userId: number;
        from: string;
        to: string;
        amount: number;
    }): Promise<{
        status: string;
        message: string;
    } | {
        status: string;
        message?: undefined;
    }>;
}
