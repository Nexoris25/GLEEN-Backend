import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  DataType,
  Default,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({
  tableName: 'subscriptions',
  timestamps: true,
})
export class Subscription extends Model {
  @ApiProperty()
  @Default(DataType.UUIDV4)
  @IsUUID(4)
  @PrimaryKey
  @Column({
    type: DataType.UUID,
  })
  id: string;

  @ApiProperty()
  @Unique('unique_name_range_constraint')
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @ApiProperty({
    enum: [
      'HOURLY',
      'DAILY',
      'WEEKLY',
      'MONTHLY',
      '3_MONTH',
      '6_MONTH',
      'YEARLY',
    ],
    example: 'MONTHLY',
  })
  @Unique('unique_name_range_constraint')
  @Column({
    type: DataType.ENUM(
      'HOURLY',
      'DAILY',
      'WEEKLY',
      'MONTHLY',
      '3_MONTH',
      '6_MONTH',
      'YEARLY',
    ),
    allowNull: false,
  })
  range!:
    | 'HOURLY'
    | 'DAILY'
    | 'WEEKLY'
    | 'MONTHLY'
    | '3_MONTH'
    | '6_MONTH'
    | 'YEARLY';

  @ApiProperty({
    type: String,
  })
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;

  // @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId: string;

  @ApiProperty()
  @Column({
    type: DataType.DOUBLE,
    allowNull: false,
  })
  amount: number;
}
