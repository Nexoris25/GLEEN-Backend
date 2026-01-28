// src/classes/entities/class.entity.ts
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from '../../user/models/user.model';


@Table({ tableName: 'classes', timestamps: true })
export class ClassEntity extends Model<ClassEntity> {
  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
  id: string;

  @Column({ allowNull: false, unique: true })
  title: string;

  @Column({ allowNull: true })
  description?: string;

  @Column({ allowNull: true })
  roomName?: string;


  @Column({ allowNull: true })
  roomURL?: string;

    @Column({ allowNull: true })
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



   // FK to User.id
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  tutorId: string;

 

  @Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
  enrolledStudents: string[];

  @Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
  attendance: string[];
}
