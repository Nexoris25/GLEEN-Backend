import { ApiProperty } from '@nestjs/swagger';
import { BeforeCreate, Column, DataType, Default, HasMany, IsUUID, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { ComplaintComment } from './complaint-comment.model';
@Table({
    tableName: 'complaints',
    timestamps: true,
})
export class Complaint extends Model<Complaint> {
    @ApiProperty()
    @Default(() => uuidv4())
    @IsUUID(4)
    @PrimaryKey
    @Column(DataType.UUID)
    id: string;

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: false })
    userId: string;

    @ApiProperty()
    @Column({ type: DataType.STRING, allowNull: false })
    title: string;

    @ApiProperty()
    @Column({ type: DataType.TEXT, allowNull: false })
    description: string;

    @ApiProperty()
    @Default('open')
    @Column({ type: DataType.ENUM('open', 'in_progress', 'resolved'), allowNull: false })
    status: string;

    @ApiProperty()
    @Column({ type: DataType.DATE, allowNull: false })
    createdAt: Date;

    @ApiProperty()
    @Column({ type: DataType.DATE, allowNull: true })
    updatedAt: Date;

    @ApiProperty()
    @Default(null)
    @Column({ type: DataType.DATE, allowNull: true })
    resolvedAt: Date;

    @ApiProperty()
    @HasMany(() => ComplaintComment, 'complaintId')
    comments: ComplaintComment[];

    @BeforeCreate
    static async setUserId(instance: Complaint, options: { [key: string]: any }) {

        // Retrieve the authenticated user ID
        const authUserId = options.userId || instance.userId;
        if (!authUserId) {
            throw new Error('Authenticated user ID is not available');
        }
        instance.userId = authUserId;
    }
}