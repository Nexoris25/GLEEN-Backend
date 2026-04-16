import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeCreate,
  BelongsToMany,
  Column,
  DataType,
  Default,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/user/models/user.model';
import { v4 as uuidv4 } from 'uuid';
import { UserGroup } from './user-group.model';

@Table({
  tableName: 'groups',
  timestamps: true,
})
export class Group extends Model {
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
  })
  name!: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  description?: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  uniqueID?: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  avatar: string;

  @ApiProperty()
  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  openToPublic: boolean;

  @ApiProperty()
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  restrictMessaging: boolean;

  @ApiProperty()
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  onlyOwnerAddMembers: boolean;

  @ApiProperty()
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  userId?: string;

  @ApiProperty({ isArray: true })
  @BelongsToMany(() => User, () => UserGroup, 'groupId', 'userId')
  users: User[];

  // Optionally, you can add a scope or a getter to filter users where status is 'accepted'
  get acceptedUsers(): User[] {
    // This assumes UserGroup has a 'status' field and users are loaded with the join table
    return (
      this.users?.filter(
        (user: any) => user.UserGroup?.status === 'ACCEPTED',
      ) ?? []
    );
  }

  get pendingUsers(): User[] {
    // This assumes UserGroup has a 'status' field and users are loaded with the join table
    return (
      this.users?.filter((user: any) => user.UserGroup?.status === 'PENDING') ??
      []
    );
  }

  get rejectedUsers(): User[] {
    // This assumes UserGroup has a 'status' field and users are loaded with the join table
    return (
      this.users?.filter(
        (user: any) => user.UserGroup?.status === 'REJECTED',
      ) ?? []
    );
  }

  @BeforeCreate
  static async setUserId(instance: Group, options: { [key: string]: any }) {
    // Retrieve the authenticated user ID
    const authUserId = options.userId;
    if (!authUserId) {
      throw new Error('Authenticated user ID is not available');
    }
    instance.userId = authUserId;
  }

  @BeforeCreate
  static async setUniqueID(instance: Group) {
    let uniqueID: string;
    let exists = true;
    const maxAttempts = 10;
    let attempts = 0;

    const timestamp = Date.now();
    do {
      //all chars should be 10 chars long at most
      uniqueID = `GROUP-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${attempts}-${timestamp.toString().substr(-4)}`;
      // Check if uniqueID already exists in the DB
      exists = (await Group.findOne({ where: { uniqueID } })) !== null;
      attempts++;
      if (attempts > maxAttempts) {
        throw new Error(
          'Failed to generate a unique group ID after multiple attempts',
        );
      }
    } while (exists);

    instance.uniqueID = uniqueID;
  }
}
