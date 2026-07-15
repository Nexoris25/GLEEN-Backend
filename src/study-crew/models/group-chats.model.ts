// user-goal.model.ts
import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
  Default,
  IsUUID,
  PrimaryKey,
  BeforeCreate,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from 'src/user/models/user.model';
import { Group } from './group.model';
import { v4 as uuidv4 } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';
@Table({ tableName: 'group_chats', timestamps: true })
export class GroupChat extends Model<GroupChat> {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @ApiProperty()
  @ForeignKey(() => Group)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  groupId: string;

  @ApiProperty({ enum: ['READ', 'UNREAD'] })
  @Default('UNREAD')
  @Column({
    type: DataType.ENUM('READ', 'UNREAD'),
  })
  status: string;

  @ApiProperty()
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  readCount: number;

  @ApiProperty({ type: DataType.TEXT })
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  message: string;

  @ApiProperty({ type: () => User })
  @BelongsTo(() => User, 'userId')
  user: User;

  @BeforeCreate
  static async setUserId(instance: GroupChat, options: { [key: string]: any }) {
    // Retrieve the authenticated user ID
    const authUserId = options.userId;
    if (!authUserId) {
      throw new Error('Authenticated user ID is not available');
    }
    instance.userId = authUserId;
  }
}
