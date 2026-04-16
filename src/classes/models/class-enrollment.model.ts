import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  Default,
  BelongsTo,
} from 'sequelize-typescript';
import { ClassEntity } from '../entities/class.entity';
import { DataTypes } from 'sequelize';

// only stores the student token

@Table({
  tableName: 'class_enrollments',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'classId'],
      name: 'unique_user_class_enrollment',
    },
  ],
})
export class ClassEnrollment extends Model<ClassEnrollment> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => ClassEntity)
  @Column({ type: DataType.UUID, allowNull: false })
  classId: string;

  @Column({
    type: DataTypes.TEXT,
    allowNull: false,
  })
  dailyRoomName?: string;

  @Column({
    type: DataTypes.TEXT,
    allowNull: false,
  })
  dailyToken?: string;

  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @BelongsTo(() => ClassEntity)
  class: ClassEntity; // Sequelize can now populate the related class
}
