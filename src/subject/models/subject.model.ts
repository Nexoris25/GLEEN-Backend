import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/user/models/user.model';
import { UserSubject } from './user-subject.model';
import { v4 as uuidv4 } from 'uuid';

@Table({
  tableName: 'subjects',
  timestamps: true,
  paranoid: true,
})
export class Subject extends Model {
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
    unique: true,
  })
  title!: string;

  @ApiProperty()
  @Column(DataType.STRING)
  description?: string;

  @ApiProperty()
  @Column(DataType.STRING)
  avatar: string;

  // creator
  @ApiProperty()
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  // tutor
  @ApiPropertyOptional()
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  tutorId?: string;

  // tutor relation
  @BelongsTo(() => User, {
    foreignKey: 'tutorId',
    as: 'tutor',
  })
  tutor?: User;

  // MANY-TO-MANY (assigned users)
  @BelongsToMany(() => User, {
    through: () => UserSubject,
    foreignKey: 'subjectId',
    otherKey: 'userId',
  })
  users?: User[];
}
