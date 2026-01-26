import { Table, Column, Model, DataType, PrimaryKey, Default, IsUUID } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

@Table({ tableName: 'faqs', timestamps: true })
export class Faq extends Model<Faq> {
  @ApiProperty({ description: 'Unique identifier for the FAQ', type: String, format: 'uuid' })
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty({ description: 'FAQ question', type: String })
  @Column({ type: DataType.STRING, allowNull: false })
  question: string;

  @ApiProperty({ description: 'FAQ answer', type: String })
  @Column({ type: DataType.TEXT, allowNull: false })
  answer: string;
}