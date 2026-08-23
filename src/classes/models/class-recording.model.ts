import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  Default,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Subject } from 'src/subject/models/subject.model';

@Table({
  tableName: 'class_recordings',
  timestamps: true,
})
export class ClassRecording extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ApiProperty({ description: 'The title of the recording' })
  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @ApiProperty({ description: 'Detailed description of the recording content' })
  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @ApiProperty({ description: 'The full URL to the recording file' })
  @Column({ type: DataType.TEXT, allowNull: false })
  videoUrl: string;

  @ApiProperty({ description: 'Foreign key to the Subject' })
  @ForeignKey(() => Subject)
  @Column({ type: DataType.UUID, allowNull: true })
  subjectId: string | null;

  @BelongsTo(() => Subject)
  subject: Subject;
}
