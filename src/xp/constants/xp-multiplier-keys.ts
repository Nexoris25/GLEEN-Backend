export const XP_MULTIPLIER_ITEMS = [
  {
    key: 'DAILY_MAX_XP',
    fields: [
      'dailyMaxXpLimitForLessons',
      'dailyMaxXpLimitForQuizzes',
      'dailyMaxXpLimitForMockExams',
      'dailyMaxXpLimitForV1Battles',
    ],
    label: 'Daily Max XP',
  },
  {
    key: 'LESSON_XP',
    fields: [
      'xpValueForLessThanOrEqualTo1HourLesson',
      'xpValueForGreaterThan1HourLessThanOrEqualTo4HoursLesson',
      'xpValueForGreaterThan4HourLessThanOrEqualTo10HoursLesson',
      'xpValueForGreaterThan10HourLessThanOrEqualTo24HoursLesson',
    ],
    label: 'Lesson XP',
  },
  {
    key: 'QUIZ_XP',
    fields: [
      'xpValueForLessThanOrEqualTo10QuizQuestion',
      'xpValueForGreaterThan10LessThanOrEqualTo20QuizQuestion',
      'xpValueForGreaterThan20LessThanOrEqualTo30QuizQuestion',
      'xpValueForGreaterThan30QuizQuestion',
    ],
    label: 'Quiz XP',
  },
  {
    key: 'MOCK_EXAM_XP',
    fields: [
      'xpValueForLessThanOrEqualTo10MockQuestion',
      'xpValueForGreaterThan10LessThanOrEqualTo20MockQuestion',
      'xpValueForGreaterThan20LessThanOrEqualTo30MockQuestion',
      'xpValueForGreaterThan30MockQuestion',
      'xpValueForJamb',
      'xpValueForMockObjective',
      'xpValueForMockTheory',
    ],
    label: 'Mock Exam XP',
  },
  {
    key: 'V1_BATTLE_XP',
    fields: [
      'xpValueForLessThanOrEqualTo10V1BattleQuestion',
      'xpValueForGreaterThan10LessThanOrEqualTo20V1BattleQuestion',
      'xpValueForGreaterThan20LessThanOrEqualTo30V1BattleQuestion',
      'xpValueForGreaterThan30V1BattleQuestion',
      'v1BattleXpWinBonus',
      'v1BattleXpLoseBonus',
      'v1BattleXpDrawBonus',
    ],
    label: '1v1 Battle XP',
  },
  {
    key: 'REFERRAL_XP',
    fields: ['xpValuePerReferral'],
    label: 'Referral XP',
  },
  {
    key: 'DAILY_LOGIN_XP',
    fields: ['xpValuePerDayLogin'],
    label: 'Daily Login XP',
  },
] as const;

export type XpMultiplierKey = (typeof XP_MULTIPLIER_ITEMS)[number]['key'];

export const XP_MULTIPLIER_KEYS = XP_MULTIPLIER_ITEMS.map((i) => i.key);

export const getMultiplierItemForKey = (key: string) =>
  XP_MULTIPLIER_ITEMS.find((i) => i.key === key);

export const getMultiplierFieldsForKey = (key: string) =>
  getMultiplierItemForKey(key)?.fields;
