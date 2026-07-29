import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import {
  XpWithdrawalRequest,
  WithdrawalStatus,
} from '../models/xp-withdrawal-request.model';
import { XpRecords } from 'src/xp/models/xp-record.model';
import { XpLog } from 'src/xp/models/xp-log.model';
import { XpConfigurationService } from 'src/xp/services/xp-configuration.service';
import { CreateXpWithdrawalDto } from '../dto/create-xp-withdrawal.dto';
import { ProcessXpWithdrawalDto } from '../dto/process-xp-withdrawal.dto';
import { ListXpWithdrawalQueryDto } from '../dto/list-xp-withdrawal-query.dto';
import { PushService } from 'src/push/services/push.service';

const XP_TYPE_DEBIT = 'AIRTIME_CONVERSION';
const XP_TYPE_REFUND = 'AIRTIME_CONVERSION_REFUND';

@Injectable()
export class XpWithdrawalService {
  constructor(
    @InjectModel(XpWithdrawalRequest)
    private readonly withdrawalRepository: typeof XpWithdrawalRequest,
    @InjectModel(XpRecords)
    private readonly xpRecordsRepository: typeof XpRecords,
    @InjectModel(XpLog)
    private readonly xpLogRepository: typeof XpLog,
    private readonly xpConfigurationService: XpConfigurationService,
    private readonly sequelize: Sequelize,
    private readonly pushService: PushService,
  ) {}

  /**
   * Create a withdrawal request. XP is debited immediately (escrow) and held
   * while the request is PENDING; declining later refunds it.
   */
  async create(
    userId: string,
    dto: CreateXpWithdrawalDto,
  ): Promise<XpWithdrawalRequest> {
    const config = await this.xpConfigurationService.findOne();
    const rate = Number(config?.airtimeXpValuePerNaira) || 0;
    const limitPct = Number(config?.xpLimitPerTimePercentage) || 0;

    if (rate <= 0) {
      throw new BadRequestException(
        'Airtime conversion rate is not configured yet.',
      );
    }

    const airtimeAmount = Math.floor(dto.xpAmount / rate);
    if (airtimeAmount <= 0) {
      throw new BadRequestException(
        `You need at least ${rate} XP to withdraw airtime.`,
      );
    }

    const request = await this.sequelize.transaction(async (t) => {
      const record = await this.xpRecordsRepository.findOne({
        where: { userId },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const balance = record ? record.currentXpValue : 0;
      const maxConvertible =
        limitPct > 0 ? Math.floor((limitPct / 100) * balance) : balance;

      if (dto.xpAmount > balance) {
        throw new BadRequestException('Insufficient XP balance.');
      }
      if (limitPct > 0 && dto.xpAmount > maxConvertible) {
        throw new BadRequestException(
          `You can withdraw at most ${limitPct}% of your XP (${maxConvertible} XP).`,
        );
      }
      if (!record) {
        // No record means a zero balance — guarded above, but stay safe.
        throw new BadRequestException('Insufficient XP balance.');
      }

      const detail = `XP withdrawal to ${dto.network} ${dto.phone} for N${airtimeAmount}`;

      await record.update(
        {
          previousXpValue: balance,
          currentXpValue: balance - dto.xpAmount,
          lastRecordDetail: detail,
          lastUpdatedAt: new Date(),
        },
        { transaction: t },
      );

      await this.xpLogRepository.create(
        {
          userId,
          xpValue: -dto.xpAmount,
          xpType: XP_TYPE_DEBIT,
          detail,
        },
        { transaction: t },
      );

      return this.withdrawalRepository.create(
        {
          userId,
          xpAmount: dto.xpAmount,
          airtimeAmount,
          remainingXpAfter: balance - dto.xpAmount,
          xpValuePerNaira: rate,
          phone: dto.phone,
          network: dto.network,
          status: WithdrawalStatus.PENDING,
        },
        { transaction: t },
      );
    });

    // Notify admins a new request is waiting (best-effort, after commit).
    await this.pushService.sendToAdmins({
      title: 'New withdrawal request',
      body: `A student requested ₦${request.airtimeAmount} airtime (${request.network} · ${request.phone}).`,
      data: { type: 'WITHDRAWAL_REQUEST', requestId: request.id },
    });

    return request;
  }

  /** A user's own withdrawal history, newest first. */
  async findMine(userId: string): Promise<XpWithdrawalRequest[]> {
    return this.withdrawalRepository.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }

  /** Admin listing with optional status filter + pagination. */
  async findAllForAdmin(query: ListXpWithdrawalQueryDto) {
    const { status, offset = 0, limit = 50 } = query;
    return this.withdrawalRepository.findAndCountAll({
      where: status ? { status } : undefined,
      include: ['user'],
      order: [['createdAt', 'DESC']],
      offset,
      limit,
    });
  }

  /** Admin marks a pending request SENT, or DECLINED (which refunds the XP). */
  async process(
    id: string,
    adminUserId: string,
    dto: ProcessXpWithdrawalDto,
  ): Promise<XpWithdrawalRequest> {
    const request = await this.withdrawalRepository.findByPk(id);
    if (!request) {
      throw new NotFoundException('Withdrawal request not found.');
    }
    if (request.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException(
        `Request has already been ${request.status.toLowerCase()}.`,
      );
    }

    if (dto.status === WithdrawalStatus.SENT) {
      await request.update({
        status: WithdrawalStatus.SENT,
        processedByUserId: adminUserId,
        processedAt: new Date(),
      });

      // Tell the student their airtime is on the way.
      await this.pushService.sendToUser(request.userId, {
        title: 'Withdrawal approved',
        body: `Your ₦${request.airtimeAmount} airtime to ${request.phone} is on its way.`,
        data: { type: 'WITHDRAWAL_SENT', requestId: request.id },
      });

      return request;
    }

    // DECLINED — refund the escrowed XP atomically.
    await this.sequelize.transaction(async (t) => {
      await this.refundXp(request, t);
      await request.update(
        {
          status: WithdrawalStatus.DECLINED,
          declineReason: dto.declineReason,
          processedByUserId: adminUserId,
          processedAt: new Date(),
        },
        { transaction: t },
      );
    });

    // Tell the student it was declined (and their XP refunded).
    await this.pushService.sendToUser(request.userId, {
      title: 'Withdrawal declined',
      body: request.declineReason
        ? `Your withdrawal was declined: ${request.declineReason}. Your XP has been refunded.`
        : 'Your withdrawal was declined and your XP has been refunded.',
      data: { type: 'WITHDRAWAL_DECLINED', requestId: request.id },
    });

    return request;
  }

  private async refundXp(
    request: XpWithdrawalRequest,
    t: Transaction,
  ): Promise<void> {
    const detail = `Refund for declined XP withdrawal ${request.id}`;
    const record = await this.xpRecordsRepository.findOne({
      where: { userId: request.userId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (record) {
      const balance = record.currentXpValue;
      await record.update(
        {
          previousXpValue: balance,
          currentXpValue: balance + request.xpAmount,
          lastRecordDetail: detail,
          lastUpdatedAt: new Date(),
        },
        { transaction: t },
      );
    } else {
      await this.xpRecordsRepository.create(
        {
          userId: request.userId,
          previousXpValue: 0,
          currentXpValue: request.xpAmount,
          lastRecordDetail: detail,
          lastUpdatedAt: new Date(),
        },
        { transaction: t },
      );
    }

    await this.xpLogRepository.create(
      {
        userId: request.userId,
        xpValue: request.xpAmount,
        xpType: XP_TYPE_REFUND,
        detail,
      },
      { transaction: t },
    );
  }
}
