import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  DataType,
  Default,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({
  tableName: 'xp_configuration',
  timestamps: true,
})
export class XpConfiguration extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  dailyMaxXpLimitForLessons: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  xpValueForMockTheory: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  xpValueForMockObjective: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  xpValueForJamb: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  dailyMaxXpLimitForQuizzes: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  dailyMaxXpLimitForMockExams: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  dailyMaxXpLimitForV1Battles: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  xpValueForLessThanOrEqualTo1HourLesson: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  xpValueForGreaterThan1HourLessThanOrEqualTo4HoursLesson: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  xpValueForGreaterThan4HourLessThanOrEqualTo10HoursLesson: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  xpValueForGreaterThan10HourLessThanOrEqualTo24HoursLesson: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  xpValueForLessThanOrEqualTo10QuizQuestion: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  xpValueForGreaterThan10LessThanOrEqualTo20QuizQuestion: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  xpValueForGreaterThan20LessThanOrEqualTo30QuizQuestion: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  xpValueForGreaterThan30QuizQuestion: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  xpValueForLessThanOrEqualTo10MockQuestion: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  xpValueForGreaterThan10LessThanOrEqualTo20MockQuestion: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  xpValueForGreaterThan20LessThanOrEqualTo30MockQuestion: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  xpValueForGreaterThan30MockQuestion: number;

  // @ApiProperty()
  // @Column(DataType.DOUBLE)
  // xpValueForLessThanOrEqualTo10MockJambQuestion: number;

  // @ApiProperty()
  // @Column(DataType.DOUBLE)
  // xpValueForGreaterThan10LessThanOrEqualTo20MockJambQuestion: number;

  // @ApiProperty()
  // @Column(DataType.DOUBLE)
  // xpValueForGreaterThan20LessThanOrEqualTo30MockJambQuestion: number;

  // @ApiProperty()
  // @Column(DataType.DOUBLE)
  // xpValueForGreaterThan30MockJambQuestion: number;

  // @ApiProperty()
  // @Column(DataType.DOUBLE)
  // xpValueForLessThanOrEqualTo10MockNecoQuestion: number;

  // @ApiProperty()
  // @Column(DataType.DOUBLE)
  // xpValueForGreaterThan10LessThanOrEqualTo20MockNecoQuestion: number;

  // @ApiProperty()
  // @Column(DataType.DOUBLE)
  // xpValueForGreaterThan20LessThanOrEqualTo30MockNecoQuestion: number;

  // @ApiProperty()
  // @Column(DataType.DOUBLE)
  // xpValueForGreaterThan30MockNecoQuestion: number;

  // @ApiProperty()
  // @Column(DataType.DOUBLE)
  // xpValueForLessThanOrEqualTo10MockWaecQuestion: number;

  // @ApiProperty()
  // @Column(DataType.DOUBLE)
  // xpValueForGreaterThan10LessThanOrEqualTo20MockWaecQuestion: number;

  // @ApiProperty()
  // @Column(DataType.DOUBLE)
  // xpValueForGreaterThan20LessThanOrEqualTo30MockWaecQuestion: number;

  // @ApiProperty()
  // @Column(DataType.DOUBLE)
  // xpValueForGreaterThan30MockWaecQuestion: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  xpValueForLessThanOrEqualTo10V1BattleQuestion: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  xpValueForGreaterThan10LessThanOrEqualTo20V1BattleQuestion: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  xpValueForGreaterThan20LessThanOrEqualTo30V1BattleQuestion: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  xpValueForGreaterThan30V1BattleQuestion: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  v1BattleXpWinBonus: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  v1BattleXpLoseBonus: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  v1BattleXpDrawBonus: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  xpValuePerReferral: number;

  @ApiProperty()
  @Column(DataType.DOUBLE)
  xpValuePerDayLogin: number;

  @ApiProperty({ description: 'XP use limit per time (% of daily earnings)' })
  @Column(DataType.DOUBLE)
  xpLimitPerTimePercentage: number;

  @ApiProperty({ description: 'XP use limit per day (% of daily earnings)' })
  @Column(DataType.DOUBLE)
  xpLimitPerDayPercentage: number;

  @ApiProperty({ description: 'XP value per N of airtime' })
  @Column(DataType.DOUBLE)
  airtimeXpValuePerNaira: number;

  @ApiProperty({ description: 'Scholar subscription plan (XP Required)' })
  @Column(DataType.DOUBLE)
  scholarSubscriptionXpRequired: number;

  @ApiProperty({ description: 'Champion subscription plan (XP Required)' })
  @Column(DataType.DOUBLE)
  championSubscriptionXpRequired: number;

  @ApiProperty({ description: 'Show real names on the leaderboard' })
  @Default(false)
  @Column(DataType.BOOLEAN)
  showRealNames: boolean;

  @ApiProperty({ description: 'Anonymize users outside top 10 on the boards' })
  @Default(true)
  @Column(DataType.BOOLEAN)
  anonymizeOutsideTop10: boolean;

  @ApiProperty({ description: 'Allow users to opt-out of leaderboards' })
  @Default(true)
  @Column(DataType.BOOLEAN)
  allowOptOut: boolean;

  @ApiProperty({ description: 'Show rank movement per day' })
  @Default(true)
  @Column(DataType.BOOLEAN)
  showRankMovement: boolean;
}
