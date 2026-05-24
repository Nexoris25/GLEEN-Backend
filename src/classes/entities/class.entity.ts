// src/classes/entities/class.entity.ts
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { User } from '../../user/models/user.model';
import { Subject } from 'src/subject/models/subject.model';
import { Room } from 'src/rooms/models/room.model';
import { DataTypes } from 'sequelize';
import { ClassEnrollment } from '../models/class-enrollment.model';

@Table({ tableName: 'classes', timestamps: true })
export class ClassEntity extends Model<ClassEntity> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({ allowNull: false, unique: true })
  title: string;

  @Column({ allowNull: true })
  description?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  roomName?: string;

  @Column({
    type: DataTypes.TEXT, // ← changes to TEXT (unlimited length in PostgreSQL)
    allowNull: true,
  })
  roomURL?: string;

  @Column({
    type: DataTypes.TEXT, // ← changes to TEXT (unlimited length in PostgreSQL)
    allowNull: true,
  })
  ownerToken?: string;

  @Column({
    type: DataType.DATE, // ⬅️ IMPORTANT
    allowNull: false,
  })
  startTime: Date;

  @Column({
    type: DataType.DATE, // ⬅️ IMPORTANT
    allowNull: false,
  })
  endTime: Date;

  @Column({ type: DataType.STRING, allowNull: true })
  date?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  time?: string;

  // FK to Subject.id
  @ForeignKey(() => Subject)
  @Column({ type: DataType.UUID, allowNull: true })
  subjectId?: string;

  // FK to Room.id
  @ForeignKey(() => Room)
  @Column({ type: DataType.UUID, allowNull: true })
  roomId?: string;

  // FK to User.id
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  tutorId: string;

  @Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
  enrolledStudents: string[];

  @Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
  attendance: string[];

  // ✅ ASSOCIATION
  @BelongsTo(() => User, { as: 'tutor' })
  tutor: User;

  @BelongsTo(() => Subject, { as: 'subject' })
  subject?: Subject;

  @BelongsTo(() => Room, { as: 'room' })
  room?: Room;

  @HasMany(() => ClassEnrollment, { foreignKey: 'classId', as: 'enrollments' })
  enrollments: ClassEnrollment[];
}
