import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class UpdateXpConfigurationDto {
  @ApiPropertyOptional({ description: 'Daily maximum XP limit for lessons' })
  @IsNumber()
  @IsOptional()
  dailyMaxXpLimitForLessons?: number;

  @ApiPropertyOptional({ description: 'Daily maximum XP limit for quizzes' })
  @IsNumber()
  @IsOptional()
  dailyMaxXpLimitForQuizzes?: number;

  @ApiPropertyOptional({ description: 'Daily maximum XP limit for mock exams' })
  @IsNumber()
  @IsOptional()
  dailyMaxXpLimitForMockExams?: number;

  @ApiPropertyOptional({ description: 'Daily maximum XP limit for V1 battles' })
  @IsNumber()
  @IsOptional()
  dailyMaxXpLimitForV1Battles?: number;

  @ApiPropertyOptional({
    description: 'XP value for lesson interaction ≤ 1 hour',
  })
  @IsNumber()
  @IsOptional()
  xpValueForLessThanOrEqualTo1HourLessonInteraction?: number;

  @ApiPropertyOptional({
    description: 'XP value for lesson interaction > 1 hour and ≤ 4 hours',
  })
  @IsNumber()
  @IsOptional()
  xpValueForGreaterThan1HourLessThanOrEqualTo4HoursLessonInteraction?: number;

  @ApiPropertyOptional({
    description: 'XP value for lesson interaction > 4 hours and ≤ 10 hours',
  })
  @IsNumber()
  @IsOptional()
  xpValueForGreaterThan4HourLessThanOrEqualTo10HoursLessonInteraction?: number;

  @ApiPropertyOptional({
    description: 'XP value for lesson interaction > 10 hours and ≤ 24 hours',
  })
  @IsNumber()
  @IsOptional()
  xpValueForGreaterThan10HourLessThanOrEqualTo24HoursLessonInteraction?: number;

  @ApiPropertyOptional({ description: 'XP value for ≤ 10 quiz questions' })
  @IsNumber()
  @IsOptional()
  xpValueForLessThanOrEqualTo10QuizQuestion?: number;

  @ApiPropertyOptional({
    description: 'XP value for > 10 and ≤ 20 quiz questions',
  })
  @IsNumber()
  @IsOptional()
  xpValueForGreaterThan10LessThanOrEqualTo20QuizQuestion?: number;

  @ApiPropertyOptional({
    description: 'XP value for > 20 and ≤ 30 quiz questions',
  })
  @IsNumber()
  @IsOptional()
  xpValueForGreaterThan20LessThanOrEqualTo30QuizQuestion?: number;

  @ApiPropertyOptional({ description: 'XP value for > 30 quiz questions' })
  @IsNumber()
  @IsOptional()
  xpValueForGreaterThan30QuizQuestion?: number;

  @ApiPropertyOptional({ description: 'XP value for ≤ 10 mock questions' })
  @IsNumber()
  @IsOptional()
  xpValueForLessThanOrEqualTo10MockQuestion?: number;

  @ApiPropertyOptional({
    description: 'XP value for > 10 and ≤ 20 mock questions',
  })
  @IsNumber()
  @IsOptional()
  xpValueForGreaterThan10LessThanOrEqualTo20MockQuestion?: number;

  @ApiPropertyOptional({
    description: 'XP value for > 20 and ≤ 30 mock questions',
  })
  @IsNumber()
  @IsOptional()
  xpValueForGreaterThan20LessThanOrEqualTo30MockQuestion?: number;

  @ApiPropertyOptional({ description: 'XP value for > 30 mock questions' })
  @IsNumber()
  @IsOptional()
  xpValueForGreaterThan30MockQuestion?: number;

  //  @ApiPropertyOptional({ description: 'XP value for ≤ 10 mock JAMB questions' })
  // @IsNumber()
  // @IsOptional()
  // xpValueForLessThanOrEqualTo10MockJambQuestion?: number;

  // @ApiPropertyOptional({ description: 'XP value for > 10 and ≤ 20 mock JAMB questions' })
  // @IsNumber()
  // @IsOptional()
  // xpValueForGreaterThan10LessThanOrEqualTo20MockJambQuestion?: number;

  // @ApiPropertyOptional({ description: 'XP value for > 20 and ≤ 30 mock JAMB questions' })
  // @IsNumber()
  // @IsOptional()
  // xpValueForGreaterThan20LessThanOrEqualTo30MockJambQuestion?: number;

  // @ApiPropertyOptional({ description: 'XP value for > 30 mock JAMB questions' })
  // @IsNumber()
  // @IsOptional()
  // xpValueForGreaterThan30MockJambQuestion?: number;

  // @ApiPropertyOptional({ description: 'XP value for ≤ 10 mock NECO questions' })
  // @IsNumber()
  // @IsOptional()
  // xpValueForLessThanOrEqualTo10MockNecoQuestion?: number;

  // @ApiPropertyOptional({ description: 'XP value for > 10 and ≤ 20 mock NECO questions' })
  // @IsNumber()
  // @IsOptional()
  // xpValueForGreaterThan10LessThanOrEqualTo20MockNecoQuestion?: number;

  // @ApiPropertyOptional({ description: 'XP value for > 20 and ≤ 30 mock NECO questions' })
  // @IsNumber()
  // @IsOptional()
  // xpValueForGreaterThan20LessThanOrEqualTo30MockNecoQuestion?: number;

  // @ApiPropertyOptional({ description: 'XP value for > 30 mock NECO questions' })
  // @IsNumber()
  // @IsOptional()
  // xpValueForGreaterThan30MockNecoQuestion?: number;

  // @ApiPropertyOptional({ description: 'XP value for ≤ 10 mock WAEC questions' })
  // @IsNumber()
  // @IsOptional()
  // xpValueForLessThanOrEqualTo10MockWaecQuestion?: number;

  // @ApiPropertyOptional({ description: 'XP value for > 10 and ≤ 20 mock WAEC questions' })
  // @IsNumber()
  // @IsOptional()
  // xpValueForGreaterThan10LessThanOrEqualTo20MockWaecQuestion?: number;

  // @ApiPropertyOptional({ description: 'XP value for > 20 and ≤ 30 mock WAEC questions' })
  // @IsNumber()
  // @IsOptional()
  // xpValueForGreaterThan20LessThanOrEqualTo30MockWaecQuestion?: number;

  // @ApiPropertyOptional({ description: 'XP value for > 30 mock WAEC questions' })
  // @IsNumber()
  // @IsOptional()
  // xpValueForGreaterThan30MockWaecQuestion?: number;

  @ApiPropertyOptional({ description: 'XP value for ≤ 10 V1 battle questions' })
  @IsNumber()
  @IsOptional()
  xpValueForLessThanOrEqualTo10V1BattleQuestion?: number;

  @ApiPropertyOptional({
    description: 'XP value for > 10 and ≤ 20 V1 battle questions',
  })
  @IsNumber()
  @IsOptional()
  xpValueForGreaterThan10LessThanOrEqualTo20V1BattleQuestion?: number;

  @ApiPropertyOptional({
    description: 'XP value for > 20 and ≤ 30 V1 battle questions',
  })
  @IsNumber()
  @IsOptional()
  xpValueForGreaterThan20LessThanOrEqualTo30V1BattleQuestion?: number;

  @ApiPropertyOptional({ description: 'XP value for > 30 V1 battle questions' })
  @IsNumber()
  @IsOptional()
  xpValueForGreaterThan30V1BattleQuestion?: number;

  @ApiPropertyOptional({ description: 'V1 Battle XP win bonus' })
  @IsNumber()
  @IsOptional()
  v1BattleXpWinBonus?: number;

  @ApiPropertyOptional({ description: 'v1 Battle XP lose bonus' })
  @IsNumber()
  @IsOptional()
  v1BattleXpLoseBonus?: number;

  @ApiPropertyOptional({ description: 'v1 Battle XP draw bonus' })
  @IsNumber()
  @IsOptional()
  v1BattleXpDrawBonus?: number;

  @ApiPropertyOptional({ description: 'XP value per referral' })
  @IsNumber()
  @IsOptional()
  xpValuePerReferral?: number;

  @ApiPropertyOptional({ description: 'XP value per day login' })
  @IsNumber()
  @IsOptional()
  xpValuePerDayLogin?: number;

  @ApiPropertyOptional({
    description: 'XP use limit per time (% of daily earnings)',
  })
  @IsNumber()
  @IsOptional()
  xpLimitPerTimePercentage?: number;

  @ApiPropertyOptional({
    description: 'XP use limit per day (% of daily earnings)',
  })
  @IsNumber()
  @IsOptional()
  xpLimitPerDayPercentage?: number;

  @ApiPropertyOptional({ description: 'XP value per N of airtime' })
  @IsNumber()
  @IsOptional()
  airtimeXpValuePerNaira?: number;

  @ApiPropertyOptional({
    description: 'Scholar subscription plan (XP Required)',
  })
  @IsNumber()
  @IsOptional()
  scholarSubscriptionXpRequired?: number;

  @ApiPropertyOptional({
    description: 'Champion subscription plan (XP Required)',
  })
  @IsNumber()
  @IsOptional()
  championSubscriptionXpRequired?: number;

  @ApiPropertyOptional({ description: 'Show real names on the leaderboard' })
  @IsBoolean()
  @IsOptional()
  showRealNames?: boolean;

  @ApiPropertyOptional({
    description: 'Anonymize users outside top 10 on the boards',
  })
  @IsBoolean()
  @IsOptional()
  anonymizeOutsideTop10?: boolean;

  @ApiPropertyOptional({
    description: 'Allow users to opt-out of leaderboards',
  })
  @IsBoolean()
  @IsOptional()
  allowOptOut?: boolean;

  @ApiPropertyOptional({ description: 'Show rank movement per day' })
  @IsBoolean()
  @IsOptional()
  showRankMovement?: boolean;
}
