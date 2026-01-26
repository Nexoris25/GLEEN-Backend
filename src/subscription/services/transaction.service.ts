import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SubscriptionTransaction } from '../models/subscription-transaction.model';
import { Subscription } from '../models/Subscription.model';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(SubscriptionTransaction)
    private readonly transactionModel: typeof SubscriptionTransaction,
  ) {}

  async findByUserId(userId: string) {
    const transactions = await this.transactionModel.findAll({
      where: { userId },
      include: [
        {
          model: Subscription,
          attributes: ['id', 'name'], // ✅ only what you need
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    if (!transactions.length) {
      throw new NotFoundException(
        `No subscription transactions found for user ${userId}`,
      );
    }

    // Optional: shape response
    return transactions.map(txn => ({
      id: txn.id,
      status: txn.status,
      amount: txn.amount,
      reference: txn.reference,
      createdAt: txn.createdAt,
      subscription: {
        id: txn.subscription.id,
        name: txn.subscription.name,
      },
    }));
  }
}
