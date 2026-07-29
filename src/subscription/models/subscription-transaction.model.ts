import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { Subscription } from './Subscription.model';
import { User } from 'src/user/models/user.model';
import { SubscriptionPlanEnum } from 'src/shared-types/subscription-plan.enum';
import { PaymentProvider } from 'src/shared-types/payment-provider.enum';
import { PaymentMethod } from 'src/shared-types/payment-method.enum';

@Table({
  tableName: 'subscription_transactions',
  timestamps: true,
})
export class SubscriptionTransaction extends Model<SubscriptionTransaction> {
  @ApiProperty({ description: 'Transaction ID (UUID)' })
  @IsUUID(4)
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  id: string;

  @ApiProperty({
    description: 'Transaction status',
    enum: ['PAID', 'PENDING', 'FAILED', 'CANCELLED', 'REFUNDED'],
    example: 'PENDING',
  })
  @Default('PENDING')
  @Column({
    type: DataType.ENUM('PAID', 'PENDING', 'FAILED', 'CANCELLED', 'REFUNDED'),
    allowNull: false,
  })
  status!: 'PAID' | 'PENDING' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

  @ApiProperty({
    description: 'Subscription plan type',
    enum: SubscriptionPlanEnum,
    example: SubscriptionPlanEnum.MONTHLY,
  })
  @Default(SubscriptionPlanEnum.MONTHLY)
  @Column({
    type: DataType.ENUM(
      SubscriptionPlanEnum.MONTHLY,
      SubscriptionPlanEnum.YEARLY,
    ),
    allowNull: false,
  })
  plan!: SubscriptionPlanEnum;

  @ApiProperty({ description: 'User ID of the owner of this transaction' })
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @ApiProperty({
    description: 'When this subscription transaction / access expires',
    example: '2025-06-15T23:59:59.999Z',
    nullable: true,
  })
  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: null,
  })
  expiryDate: Date | null;

  @ApiProperty({ description: 'Unique transaction reference' })
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  reference: string;

  @ApiProperty({ description: 'Transaction amount' })
  @Column({
    type: DataType.DOUBLE,
    allowNull: false,
  })
  amount: number;

  @ApiProperty({ description: 'Subscription ID this transaction belongs to' })
  @ForeignKey(() => Subscription)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  subscriptionId: string;

  @ApiProperty({
    description: 'Payment processor that settles the charge',
    enum: PaymentProvider,
    example: PaymentProvider.PAYSTACK,
  })
  @Default(PaymentProvider.PAYSTACK)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  provider: PaymentProvider;

  @ApiProperty({
    description: 'Wallet / instrument the user paid with',
    enum: PaymentMethod,
    required: false,
    nullable: true,
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  paymentMethod: PaymentMethod | null;

  @ApiProperty({
    description:
      'Client-supplied idempotency key; unique per (user, key) to dedupe retries',
    required: false,
    nullable: true,
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  idempotencyKey: string | null;

  @ApiProperty({
    description: 'Gateway checkout URL, kept so an idempotent re-init can return it',
    required: false,
    nullable: true,
  })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  authorizationUrl: string | null;

  @ApiProperty({
    description: 'Raw gateway payload / extra context',
    required: false,
    nullable: true,
  })
  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  metadata: Record<string, any> | null;

  // -------------------
  // Associations
  // -------------------

  @BelongsTo(() => Subscription)
  subscription: Subscription;

  @BelongsTo(() => User)
  user: User;
}
