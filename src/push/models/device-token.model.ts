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
  Unique,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/user/models/user.model';

/** A single device's FCM registration token, owned by a user. */
@Table({ tableName: 'device_tokens', timestamps: true })
export class DeviceToken extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @ApiProperty({ description: 'FCM registration token (unique per device)' })
  @Unique
  @Column({ type: DataType.STRING, allowNull: false })
  token: string;

  @ApiProperty({ description: 'ios | android | web', required: false })
  @Column({ type: DataType.STRING, allowNull: true })
  platform: string | null;

  @BelongsTo(() => User, 'userId')
  user: User;
}
