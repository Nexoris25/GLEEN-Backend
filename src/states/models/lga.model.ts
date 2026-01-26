import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { State } from 'src/states/models/state.model';

@Table({
  tableName: 'lgas',
  timestamps: true,
   indexes: [
    {
      unique: true,
      fields: ['stateId', 'title'],
    },
  ],
})
export class Lga extends Model<Lga> {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  // 🔑 FK → states.id
  @ForeignKey(() => State)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  stateId: string;

  @BelongsTo(() => State)
  state: State;
}
