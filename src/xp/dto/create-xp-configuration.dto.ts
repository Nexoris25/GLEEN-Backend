import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsBoolean } from 'class-validator';

export class CreateXpConfigurationDto {
  @ApiProperty({ description: 'Daily maximum XP limit for lessons' })
  @IsNumber()
  dailyMaxXpLimitForLessons: number;

  @ApiProperty({ description: 'Daily maximum XP limit for quizzes' })
  @IsNumber()
  dailyMaxXpLimitForQuizzes: number;

  @ApiProperty({ description: 'Daily maximum XP limit for mock exams' })
  @IsNumber()
  dailyMaxXpLimitForMockExams: number;

  @ApiProperty({ description: 'Daily maximum XP limit for V1 battles' })
  @IsNumber()
  dailyMaxXpLimitForV1Battles: number;

  @ApiProperty({ description: 'XP value for lesson interaction ≤ 1 hour' })
  @IsNumber()
  xpValueForLessThanOrEqualTo1HourLesson: number;

  @ApiProperty({
    description: 'XP value for lesson interaction > 1 hour and ≤ 4 hours',
  })
  @IsNumber()
  xpValueForGreaterThan1HourLessThanOrEqualTo4HoursLesson: number;

  @ApiProperty({
    description: 'XP value for lesson interaction > 4 hours and ≤ 10 hours',
  })
  @IsNumber()
  xpValueForGreaterThan4HourLessThanOrEqualTo10HoursLesson: number;

  @ApiProperty({
    description: 'XP value for lesson interaction > 10 hours and ≤ 24 hours',
  })
  @IsNumber()
  xpValueForGreaterThan10HourLessThanOrEqualTo24HoursLesson: number;

  @ApiProperty({ description: 'XP value for ≤ 10 quiz questions' })
  @IsNumber()
  xpValueForLessThanOrEqualTo10QuizQuestion: number;

  @ApiProperty({ description: 'XP value for > 10 and ≤ 20 quiz questions' })
  @IsNumber()
  xpValueForGreaterThan10LessThanOrEqualTo20QuizQuestion: number;

  @ApiProperty({ description: 'XP value for > 20 and ≤ 30 quiz questions' })
  @IsNumber()
  xpValueForGreaterThan20LessThanOrEqualTo30QuizQuestion: number;

  @ApiProperty({ description: 'XP value for > 30 quiz questions' })
  @IsNumber()
  xpValueForGreaterThan30QuizQuestion: number;

  @ApiProperty({ description: 'XP value for ≤ 10 mock questions' })
  @IsNumber()
  xpValueForLessThanOrEqualTo10MockQuestion: number;

  @ApiProperty({ description: 'XP value for > 10 and ≤ 20 mock questions' })
  @IsNumber()
  xpValueForGreaterThan10LessThanOrEqualTo20MockQuestion: number;

  @ApiProperty({ description: 'XP value for > 20 and ≤ 30 mock questions' })
  @IsNumber()
  xpValueForGreaterThan20LessThanOrEqualTo30MockQuestion: number;

  @ApiProperty({ description: 'XP value for > 30 mock questions' })
  @IsNumber()
  xpValueForGreaterThan30MockQuestion: number;

  @ApiProperty({ description: 'XP value for mock theory' })
  @IsNumber()
  xpValueForMockTheory: number;

  @ApiProperty({ description: 'XP value for mock objective' })
  @IsNumber()
  xpValueForMockObjective: number;

  @ApiProperty({ description: 'XP value for JAMB' })
  @IsNumber()
  xpValueForJamb: number;

  // @ApiProperty({ description: 'XP value for ≤ 10 mock JAMB questions' })
  // @IsNumber()
  // xpValueForLessThanOrEqualTo10MockJambQuestion: number;

  // @ApiProperty({ description: 'XP value for > 10 and ≤ 20 mock JAMB questions' })
  // @IsNumber()
  // xpValueForGreaterThan10LessThanOrEqualTo20MockJambQuestion: number;

  // @ApiProperty({ description: 'XP value for > 20 and ≤ 30 mock JAMB questions' })
  // @IsNumber()
  // xpValueForGreaterThan20LessThanOrEqualTo30MockJambQuestion: number;

  // @ApiProperty({ description: 'XP value for > 30 mock JAMB questions' })
  // @IsNumber()
  // xpValueForGreaterThan30MockJambQuestion: number;

  // @ApiProperty({ description: 'XP value for ≤ 10 mock NECO questions' })
  // @IsNumber()
  // xpValueForLessThanOrEqualTo10MockNecoQuestion: number;

  // @ApiProperty({ description: 'XP value for > 10 and ≤ 20 mock NECO questions' })
  // @IsNumber()
  // xpValueForGreaterThan10LessThanOrEqualTo20MockNecoQuestion: number;

  // @ApiProperty({ description: 'XP value for > 20 and ≤ 30 mock NECO questions' })
  // @IsNumber()
  // xpValueForGreaterThan20LessThanOrEqualTo30MockNecoQuestion: number;

  // @ApiProperty({ description: 'XP value for > 30 mock NECO questions' })
  // @IsNumber()
  // xpValueForGreaterThan30MockNecoQuestion: number;

  // @ApiProperty({ description: 'XP value for ≤ 10 mock WAEC questions' })
  // @IsNumber()
  // xpValueForLessThanOrEqualTo10MockWaecQuestion: number;

  // @ApiProperty({ description: 'XP value for > 10 and ≤ 20 mock WAEC questions' })
  // @IsNumber()
  // xpValueForGreaterThan10LessThanOrEqualTo20MockWaecQuestion: number;

  // @ApiProperty({ description: 'XP value for > 20 and ≤ 30 mock WAEC questions' })
  // @IsNumber()
  // xpValueForGreaterThan20LessThanOrEqualTo30MockWaecQuestion: number;

  // @ApiProperty({ description: 'XP value for > 30 mock WAEC questions' })
  // @IsNumber()
  // xpValueForGreaterThan30MockWaecQuestion: number;

  @ApiProperty({ description: 'XP value for ≤ 10 V1 battle questions' })
  @IsNumber()
  xpValueForLessThanOrEqualTo10V1BattleQuestion: number;

  @ApiProperty({
    description: 'XP value for > 10 and ≤ 20 V1 battle questions',
  })
  @IsNumber()
  xpValueForGreaterThan10LessThanOrEqualTo20V1BattleQuestion: number;

  @ApiProperty({
    description: 'XP value for > 20 and ≤ 30 V1 battle questions',
  })
  @IsNumber()
  xpValueForGreaterThan20LessThanOrEqualTo30V1BattleQuestion: number;

  @ApiProperty({ description: 'XP value for > 30 V1 battle questions' })
  @IsNumber()
  xpValueForGreaterThan30V1BattleQuestion: number;

  @ApiProperty({ description: 'V1 Battle XP win bonus' })
  @IsNumber()
  v1BattleXpWinBonus: number;

  @ApiProperty({ description: 'v1 Battle XP lose bonus' })
  @IsNumber()
  v1BattleXpLoseBonus: number;

  @ApiProperty({ description: 'v1 Battle XP draw bonus' })
  @IsNumber()
  v1BattleXpDrawBonus: number;

  @ApiProperty({ description: 'XP value per referral' })
  @IsNumber()
  xpValuePerReferral: number;

  @ApiProperty({ description: 'XP value per day login' })
  @IsNumber()
  xpValuePerDayLogin: number;

  @ApiProperty({ description: 'XP use limit per time (% of daily earnings)' })
  @IsNumber()
  xpLimitPerTimePercentage: number;

  @ApiProperty({ description: 'XP use limit per day (% of daily earnings)' })
  @IsNumber()
  xpLimitPerDayPercentage: number;

  @ApiProperty({ description: 'XP value per N of airtime' })
  @IsNumber()
  airtimeXpValuePerNaira: number;

  @ApiProperty({ description: 'Scholar subscription plan (XP Required)' })
  @IsNumber()
  scholarSubscriptionXpRequired: number;

  @ApiProperty({ description: 'Champion subscription plan (XP Required)' })
  @IsNumber()
  championSubscriptionXpRequired: number;

  @ApiProperty({ description: 'Show real names on the leaderboard' })
  @IsBoolean()
  showRealNames: boolean;

  @ApiProperty({ description: 'Anonymize users outside top 10 on the boards' })
  @IsBoolean()
  anonymizeOutsideTop10: boolean;

  @ApiProperty({ description: 'Allow users to opt-out of leaderboards' })
  @IsBoolean()
  allowOptOut: boolean;

  @ApiProperty({ description: 'Show rank movement per day' })
  @IsBoolean()
  showRankMovement: boolean;
}
