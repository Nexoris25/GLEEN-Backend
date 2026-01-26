// user-goal.model.ts
import { Table, Column, Model, ForeignKey, DataType, Unique, BelongsTo } from 'sequelize-typescript';
import { Goal } from './goal.model';
import { User } from 'src/user/models/user.model';

@Table({ tableName: 'users_goals', timestamps: false })
export class UserGoal extends Model<UserGoal> {
  @ForeignKey(() => User)
  @Unique('user_goal_unique')
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  userId: string;

  @ForeignKey(() => Goal)
  @Unique('user_goal_unique')
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  goalId: string;
}
