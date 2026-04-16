import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeCreate,
  BelongsToMany,
  Column,
  DataType,
  Default,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/user/models/user.model';
import { v4 as uuidv4 } from 'uuid';
import { UserGoal } from './user-goal.model';

@Table({
  tableName: 'goals',
  timestamps: true,
})
export class Goal extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  description?: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  avatar: string;

  @ApiProperty()
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  userId?: string;

  @ApiProperty()
  @BelongsToMany(() => User, () => UserGoal, 'goalId', 'userId')
  users: User[];

  @BeforeCreate
  static async setUserId(instance: Goal, options: { [key: string]: any }) {
    // Retrieve the authenticated user ID
    const authUserId = options.userId;
    if (!authUserId) {
      throw new Error('Authenticated user ID is not available');
    }
    instance.userId = authUserId;
  }
}
