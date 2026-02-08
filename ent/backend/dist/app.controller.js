"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./users/user.entity");
const transaction_entity_1 = require("./transactions/transaction.entity");
let CURRENT_RATES = {
    USDT: 17.35,
    TON: 54.20,
    USD_PRB: 17.30
};
let AppController = class AppController {
    usersRepository;
    transactionsRepository;
    constructor(usersRepository, transactionsRepository) {
        this.usersRepository = usersRepository;
        this.transactionsRepository = transactionsRepository;
    }
    getRates() { return CURRENT_RATES; }
    updateRates(newRates) {
        CURRENT_RATES = { ...CURRENT_RATES, ...newRates };
        return { status: 'success', rates: CURRENT_RATES };
    }
    getAllUsers() { return this.usersRepository.find({ order: { id: 'DESC' } }); }
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
    async updateUserBalance(body) {
        const user = await this.usersRepository.findOneBy({ id: body.userId });
        if (user) {
            user.usdtBalance = body.usdt;
            user.tonBalance = body.ton;
            await this.usersRepository.save(user);
            return { status: 'success' };
        }
        return { status: 'error' };
    }
    async getTransactions() {
        return this.transactionsRepository.find({ order: { id: 'DESC' }, take: 20 });
    }
    async makeSwap(body) {
        const user = await this.usersRepository.findOneBy({ id: body.userId });
        if (!user)
            return { status: 'error', message: 'User not found' };
        const amount = Number(body.amount);
        if (amount <= 0)
            return { status: 'error', message: 'Invalid amount' };
        const rateFrom = body.from === 'USDT' ? CURRENT_RATES.USDT : CURRENT_RATES.TON;
        const rateTo = body.to === 'USDT' ? CURRENT_RATES.USDT : CURRENT_RATES.TON;
        const resultAmount = (amount * rateFrom) / rateTo;
        if (body.from === 'USDT') {
            if (user.usdtBalance < amount)
                return { status: 'error', message: 'Недостаточно средств' };
            user.usdtBalance -= amount;
            user.tonBalance += resultAmount;
        }
        else {
            if (user.tonBalance < amount)
                return { status: 'error', message: 'Недостаточно средств' };
            user.tonBalance -= amount;
            user.usdtBalance += resultAmount;
        }
        await this.usersRepository.save(user);
        const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        await this.transactionsRepository.save({
            userId: user.id,
            type: 'swap',
            amount: `-${amount.toFixed(2)}`,
            currency: body.from,
            title: `Обмен на ${body.to}`,
            date: time
        });
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
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)('rates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getRates", null);
__decorate([
    (0, common_1.Post)('admin/update-rates'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateRates", null);
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('create-test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "createTestUser", null);
__decorate([
    (0, common_1.Post)('admin/update-balance'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "updateUserBalance", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)('swap'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "makeSwap", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AppController);
//# sourceMappingURL=app.controller.js.map