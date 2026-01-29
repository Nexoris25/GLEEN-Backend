import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SubscriptionTransaction } from '../models/subscription-transaction.model';
import { UpdateSubscriptionTransactionDto } from '../dto/subscription-transaction.dto';
import stringify from 'safe-stable-stringify';
import { User } from 'src/user/models/user.model';
import { Op } from 'sequelize';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Subscription } from 'src/subscription/models/Subscription.model';

@Injectable()
export class SubscriptionTransactionService {
    constructor(
        @InjectModel(SubscriptionTransaction)
        private readonly txnModel: typeof SubscriptionTransaction,
    ) {}
private readonly MAX_LIMIT = 500;
private baseInclude = [
    {
      model: User,
      attributes: ['id', 'fullName', 'role', 'avatar', 'gender'],
    },
  ];

  // -----------------------
  // PAID
  // -----------------------
async findPaid(pagination?: PaginationDto) {
const limit = pagination?.limit;
const offset = pagination?.offset;
const usePagination = limit !== undefined || offset !== undefined;
const safeLimit = usePagination ? Math.min(limit ?? 10, this.MAX_LIMIT) : this.MAX_LIMIT;
const safeOffset = usePagination ? offset ?? 0 : 0;

const { rows, count } = await this.txnModel.findAndCountAll({
where: { status: 'PAID' },
include: this.baseInclude,
limit: safeLimit,
offset: safeOffset,
order: [['createdAt', 'DESC']],
});

return {
data: rows,
meta: {
totalItems: count,
limit: safeLimit,
offset: safeOffset,
currentCount: rows.length,
hasNext: safeOffset + safeLimit < count,
hasPrevious: safeOffset > 0,
capped: !usePagination,
},
};
}

// -----------------------
// PENDING
// -----------------------
async findPending(pagination?: PaginationDto) {
const limit = pagination?.limit;
const offset = pagination?.offset;
const usePagination = limit !== undefined || offset !== undefined;
const safeLimit = usePagination ? Math.min(limit ?? 10, this.MAX_LIMIT) : this.MAX_LIMIT;
const safeOffset = usePagination ? offset ?? 0 : 0;

const { rows, count } = await this.txnModel.findAndCountAll({
where: { status: 'PENDING' },
include: this.baseInclude,
limit: safeLimit,
offset: safeOffset,
order: [['createdAt', 'DESC']],
});

return {
data: rows,
meta: {
totalItems: count,
limit: safeLimit,
offset: safeOffset,
currentCount: rows.length,
hasNext: safeOffset + safeLimit < count,
hasPrevious: safeOffset > 0,
capped: !usePagination,
},
};
}


// -----------------------
// FAILED
// -----------------------
async findFailed(pagination?: PaginationDto) {
const limit = pagination?.limit;
const offset = pagination?.offset;
const usePagination = limit !== undefined || offset !== undefined;
const safeLimit = usePagination ? Math.min(limit ?? 10, this.MAX_LIMIT) : this.MAX_LIMIT;
const safeOffset = usePagination ? offset ?? 0 : 0;

const { rows, count } = await this.txnModel.findAndCountAll({
where: { status: 'FAILED' },
include: this.baseInclude,
limit: safeLimit,
offset: safeOffset,
order: [['createdAt', 'DESC']],
});

return {
data: rows,
meta: {
totalItems: count,
limit: safeLimit,
offset: safeOffset,
currentCount: rows.length,
hasNext: safeOffset + safeLimit < count,
hasPrevious: safeOffset > 0,
capped: !usePagination,
},
};
}



// -----------------------
// ABANDONED (PENDING > 30 mins)
// -----------------------
async findAbandoned(minutes = 30, pagination?: PaginationDto) {
  const limit = pagination?.limit;
  const offset = pagination?.offset;
  const usePagination = limit !== undefined || offset !== undefined;

  const safeLimit = usePagination
    ? Math.min(limit ?? 10, this.MAX_LIMIT)
    : this.MAX_LIMIT;

  const safeOffset = usePagination ? offset ?? 0 : 0;

  const cutoff = new Date(Date.now() - minutes * 60 * 1000);

  const { rows, count } = await this.txnModel.findAndCountAll({
    where: {
      status: 'PENDING',
      createdAt: {
        [Op.lt]: cutoff,
      },
    },
    include: this.baseInclude,
    limit: safeLimit,
    offset: safeOffset,
    order: [['createdAt', 'DESC']],
  });

  return {
    data: rows,
    meta: {
      totalItems: count,
      limit: safeLimit,
      offset: safeOffset,
      currentCount: rows.length,
      hasNext: safeOffset + safeLimit < count,
      hasPrevious: safeOffset > 0,
      capped: !usePagination,
    },
  };
}



async findBySubscriptionOrReference(
subscriptionId?: string,
reference?: string,
pagination?: PaginationDto,
) {
const limit = pagination?.limit;
const offset = pagination?.offset;
const usePagination = limit !== undefined || offset !== undefined;

const safeLimit = usePagination
? Math.min(limit ?? 10, this.MAX_LIMIT)
: this.MAX_LIMIT;

const safeOffset = usePagination ? offset ?? 0 : 0;

const where: any = {};

// Apply filter only if at least one param is provided
if (subscriptionId || reference) {
where[Op.or] = [
    subscriptionId ? { id: subscriptionId } : null,
    reference ? { reference: reference } : null,
].filter(Boolean);
}

const { rows, count } = await this.txnModel.findAndCountAll({
where,
include: this.baseInclude,
limit: safeLimit,
offset: safeOffset,
order: [['createdAt', 'DESC']],
distinct: true, // important when using include
});

return {
data: rows,
meta: {
totalItems: count,
limit: safeLimit,
offset: safeOffset,
currentCount: rows.length,
hasNext: safeOffset + safeLimit < count,
hasPrevious: safeOffset > 0,
capped: !usePagination,
},
};
}


async findAllByUser(userId: string) {
  return this.txnModel.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });
}




// -----------------------
// Active
// -----------------------
async findLatestByUser(userId: string) {
  return this.txnModel.findOne({
    where: {
      userId,
      status: 'PAID',
      expiryDate: {
        [Op.gt]: new Date(), // expiryDate > current date
      },
    },
    include: [
      {
        model: Subscription,
        attributes: ['id', 'name'],
      },
    ],
    order: [
    //  ['expiryDate', 'DESC'],   // prefer the subscription that expires last
      ['createdAt', 'DESC'],    // fallback safety
    ],
  });
}





    // old

    /*
    // ✅ Create transaction
    async create(dto: CreateSubscriptionTransactionDto, userId: string): Promise<SubscriptionTransaction> {
        try {
            return await this.txnModel.create({ ...dto, userId });
        } catch (error) {
            throw new BadRequestException({
                message: 'Error creating transaction',
                details: stringify(error),
            });
        }
    }
*/
    // ✅ Fetch transactions by userId (with subscription name)
    async findByUser(userId: string, offset = 0, limit = 10) {
        try {
            if (!userId) throw new BadRequestException('userId is required');

            const { rows, count } = await this.txnModel.findAndCountAll({
                where: { userId },
                include: [
                    {
                        association: 'subscription',
                        attributes: ['id', 'name'], // include subscription name
                    },
                ],
                offset,
                limit,
                order: [['createdAt', 'DESC']],
            });
/*
            const data = rows.map(txn => ({
                id: txn.id,
                reference: txn.reference,
                amount: txn.amount,
                status: txn.status,
                subscriptionId: txn.subscriptionId,
                subscriptionName: txn.subscription?.name || null,
                createdAt: txn.createdAt,
                updatedAt: txn.updatedAt,
                expiryDate: txn.expiryDate,
            }));

            return { rows: data, count };
            */
            return { rows, count };
        } catch (error) {
            throw new BadRequestException({
                message: 'Error fetching transactions',
                details: stringify(error),
            });
        }
    }

    // ✅ Find single transaction
    async findOne(id: string, userId: string) {
        try {
            const txn = await this.txnModel.findOne({
                where: { id, userId },
                include: [{ association: 'subscription', attributes: ['id', 'name'] }],
            });

            if (!txn) throw new BadRequestException(`Transaction ${id} not found`);

            return {
                id: txn.id,
                reference: txn.reference,
                amount: txn.amount,
                status: txn.status,
                subscriptionId: txn.subscriptionId,
                subscriptionName: txn.subscription?.name || null,
                createdAt: txn.createdAt,
                updatedAt: txn.updatedAt,
            };
        } catch (error) {
            throw new BadRequestException({
                message: 'Error fetching transaction',
                details: stringify(error),
            });
        }
    }

    // ✅ Update transaction
    async update(id: string, dto: UpdateSubscriptionTransactionDto, userId: string) {
        const txn = await this.txnModel.findOne({ where: { id, userId } });
        if (!txn) throw new BadRequestException(`Transaction ${id} not found`);

        try {
            return await txn.update(dto as any);
        } catch (error) {
            throw new BadRequestException({
                message: 'Error updating transaction',
                details: stringify(error),
            });
        }
    }

    // ✅ Delete transaction
    async remove(id: string, userId: string) {
        const deleted = await this.txnModel.destroy({ where: { id, userId } });
        if (!deleted) throw new BadRequestException(`Transaction ${id} not found or not allowed`);
    }
}
