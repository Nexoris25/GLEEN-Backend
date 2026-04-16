// rooms/models/room.model.ts
import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { ApiHideProperty } from '@nestjs/swagger';

@Table({ tableName: 'rooms' })
export class Room extends Model<Room> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({ allowNull: false, unique: true })
  name: string;

  @ApiHideProperty()
  @Column({ allowNull: true, unique: true })
  dailyRoomName: string; // immutable Daily ID

  @ApiHideProperty()
  @Column({ allowNull: true })
  roomUrl: string;

  @ApiHideProperty()
  @Column({ allowNull: true })
  provider: string;

  @Column({ type: DataType.STRING, allowNull: true })
  ownerToken: string;

  @Column({ type: DataType.STRING, allowNull: true })
  studentToken: string;
}
