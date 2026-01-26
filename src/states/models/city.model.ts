// user-subject.model.ts
import { Table, Column, Model, ForeignKey, DataType, Default, IsUUID, PrimaryKey } from 'sequelize-typescript';
import { State } from './state.model';
import { ApiProperty } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
@Table({ tableName: 'city', timestamps: false })
export class City extends Model<City> {
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
  title!: string;

  @ForeignKey(() => State)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  stateId: string;
}
