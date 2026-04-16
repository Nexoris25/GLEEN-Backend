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
  tableName: 'xp_logs',
  timestamps: true,
})
export class XpLog extends Model {
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
  xpValue: number;

  @ApiProperty()
  @Column(DataType.STRING)
  xpType: string;

  @ApiProperty()
  @Column(DataType.STRING)
  detail: string;

  @ApiProperty({ type: () => User })
  @BelongsTo(() => User, 'userId')
  user: User;
}
