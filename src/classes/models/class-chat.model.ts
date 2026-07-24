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
import { v4 as uuidv4 } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';

@Table({ tableName: 'class_chats', timestamps: true })
export class ClassChat extends Model<ClassChat> {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  // Plain UUID (no FK) so the chat is decoupled from the class table lifecycle.
  @ApiProperty()
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  classId: string;

  @ApiProperty()
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

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
  static async setUserId(instance: ClassChat, options: { [key: string]: any }) {
    const authUserId = options.userId;
    if (!authUserId) {
      throw new Error('Authenticated user ID is not available');
    }
    instance.userId = authUserId;
  }
}
