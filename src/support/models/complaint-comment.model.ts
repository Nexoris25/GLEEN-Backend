import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeCreate,
  BelongsTo,
  Column,
  DataType,
  Default,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { Complaint } from './complaint.model';

@Table({
  tableName: 'complaint_comments',
  timestamps: true,
})
export class ComplaintComment extends Model<ComplaintComment> {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @Column({ type: DataType.UUID, allowNull: false })
  complaintId: string;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: false })
  userId: string;

  @ApiProperty()
  @Column({ type: DataType.TEXT, allowNull: false })
  comment: string;

  @ApiProperty()
  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: Date;

  @ApiProperty()
  @Column({ type: DataType.DATE, allowNull: true })
  updatedAt: Date;

  // @ApiProperty()
  @BelongsTo(() => Complaint, 'complaintId')
  complaint: Complaint;

  @BeforeCreate
  static async setUserId(
    instance: ComplaintComment,
    options: { [key: string]: any },
  ) {
    // Retrieve the authenticated user ID
    const authUserId = options.userId;
    if (!authUserId) {
      throw new Error('Authenticated user ID is not available');
    }
    instance.userId = authUserId;
  }
}
