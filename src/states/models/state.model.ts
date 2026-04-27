import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  BeforeCreate,
  HasMany,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { Lga } from 'src/states/models/lga.model';

@Table({ tableName: 'states', timestamps: true })
export class State extends Model<State> {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @Column({ type: DataType.STRING, allowNull: true })
  country: string;

  @Column({ type: DataType.UUID, allowNull: true })
  userId: string;

  // 🔗 One State → Many LGAs
  @HasMany(() => Lga)
  lgas: Lga[];

  @BeforeCreate
  static setUserId(instance: State) {
    if (instance.userId) {
      return; // skip if already provided (e.g. seeding)
    }
  }
}
