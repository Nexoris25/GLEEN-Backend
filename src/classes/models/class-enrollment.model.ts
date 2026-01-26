import { Table, Column, Model, DataType, ForeignKey, Default, BelongsTo } from 'sequelize-typescript';
import { ClassEntity } from '../entities/class.entity';

@Table({ tableName: 'class_enrollments', timestamps: true })
export class ClassEnrollment extends Model<ClassEnrollment> {
  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => ClassEntity)
  @Column({ type: DataType.UUID, allowNull: false })
  classId: string;

  @Column({ type: DataType.UUID, allowNull: false })
  studentId: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  attended: boolean;

  @BelongsTo(() => ClassEntity)
  class: ClassEntity; // Sequelize can now populate the related class
}
