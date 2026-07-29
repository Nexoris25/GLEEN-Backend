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
import { User } from 'src/user/models/user.model';

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DECLINED = 'DECLINED',
}

export enum AirtimeNetwork {
  MTN = 'MTN',
  AIRTEL = 'AIRTEL',
  GLO = 'GLO',
  NINE_MOBILE = '9MOBILE',
}

@Table({
  tableName: 'xp_withdrawal_requests',
  timestamps: true,
})
export class XpWithdrawalRequest extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId: string;

  @ApiProperty({ description: 'Amount of XP spent on this withdrawal' })
  @Column(DataType.DOUBLE)
  xpAmount: number;

  @ApiProperty({ description: 'Airtime value in Naira' })
  @Column(DataType.INTEGER)
  airtimeAmount: number;

  @ApiProperty({ description: 'XP-per-Naira rate captured at request time' })
  @Column(DataType.DOUBLE)
  xpValuePerNaira: number;

  @ApiProperty({ description: 'Recipient phone number for the airtime' })
  @Column(DataType.STRING)
  phone: string;

  @ApiProperty({
    enum: AirtimeNetwork,
    description: 'Recipient mobile network',
  })
  @Column(DataType.STRING)
  network: AirtimeNetwork;

  @ApiProperty({ enum: WithdrawalStatus })
  @Default(WithdrawalStatus.PENDING)
  @Column(DataType.STRING)
  status: WithdrawalStatus;

  @ApiProperty({ description: 'Reason supplied by admin when declined' })
  @Column({ type: DataType.STRING, allowNull: true })
  declineReason: string | null;

  @ApiProperty({ description: 'Admin user id that processed the request' })
  @Column({ type: DataType.UUID, allowNull: true })
  processedByUserId: string | null;

  @ApiProperty({ description: 'When the request was processed' })
  @Column({ type: DataType.DATE, allowNull: true })
  processedAt: Date | null;

  @ApiProperty({ type: () => User })
  @BelongsTo(() => User, 'userId')
  user: User;
}
