// user-goal.model.ts
import { Table, Column, Model, ForeignKey, DataType, Unique, BelongsTo, Default, IsUUID, PrimaryKey } from 'sequelize-typescript';
import { User } from 'src/user/models/user.model';
import { Group } from './group.model';
import { v4 as uuidv4 } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';
@Table({ tableName: 'users_groups', timestamps: true })
export class UserGroup extends Model<UserGroup> {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @ForeignKey(() => User)
  @Unique('user_group_unique')
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  userId: string;

  @ApiProperty()
  @ForeignKey(() => Group)
  @Unique('user_group_unique')
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  groupId: string;

  @ApiProperty({ enum: ['ACCEPTED', 'DECLINED', 'PENDING'] })
  @Default('PENDING')
  @Column({
    type: DataType.ENUM('ACCEPTED', 'DECLINED', 'PENDING')
  })
  status: string;

  @BelongsTo(() => User, 'userId')
  user: User;

  @BelongsTo(() => Group, 'groupId')
  group: Group;

}
