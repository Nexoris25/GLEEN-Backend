// user-subject.model.ts
import { Table, Column, Model, ForeignKey, DataType, Unique, BelongsToMany, BelongsTo } from 'sequelize-typescript';
import { Subject } from './subject.model';
import { User } from 'src/user/models/user.model';

@Table({ tableName: 'users_subjects', timestamps: false })
export class UserSubject extends Model<UserSubject> {
  @ForeignKey(() => User)
  @Unique('user_subject_unique')
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  userId: String;

  @ForeignKey(() => Subject)
  @Unique('user_subject_unique')
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  subjectId: String;


  @BelongsTo(() => User, { foreignKey: 'userId' })
  user: User;

  @BelongsTo(() => Subject, { foreignKey: 'subjectId' })
  subject: Subject;

}
