import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BelongsTo,
  BelongsToMany,
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

@Table({
  tableName: 'xp_records',
  timestamps: true,
})
export class XpRecords extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  // @ApiProperty()
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId: string;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  previousXpValue: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  currentXpValue: number;

  @ApiProperty()
  @Column(DataType.STRING)
  lastRecordDetail: string;

  @ApiProperty()
  @Column(DataType.DATE)
  lastUpdatedAt: Date;

  @ApiProperty({ type: () => User })
  @BelongsTo(() => User, 'userId')
  user: User;
}
