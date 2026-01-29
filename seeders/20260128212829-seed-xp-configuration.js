import { XpConfiguration } from '../models/xp-configuration.model';
import { v4 as uuidv4 } from 'uuid';

module.exports = {
  async up(queryInterface, Sequelize) {
    await XpConfiguration.create({
      id: uuidv4(),
      dailyMaxXpLimitForLessons: 0,
      xpValueForMockTheory: 0,
      xpValueForMockObjective: 0,
      xpValueForJamb: 0,
      dailyMaxXpLimitForQuizzes: 0,
      dailyMaxXpLimitForMockExams: 0,
      dailyMaxXpLimitForV1Battles: 0,
      xpValueForLessThanOrEqualTo1HourLesson: 0,
      xpValueForGreaterThan1HourLessThanOrEqualTo4HoursLesson: 0,
      xpValueForGreaterThan4HourLessThanOrEqualTo10HoursLesson: 0,
      xpValueForGreaterThan10HourLessThanOrEqualTo24HoursLesson: 0,
      xpValueForLessThanOrEqualTo10QuizQuestion: 0,
      xpValueForGreaterThan10LessThanOrEqualTo20QuizQuestion: 0,
      xpValueForGreaterThan20LessThanOrEqualTo30QuizQuestion: 0,
      xpValueForGreaterThan30QuizQuestion: 0,
      xpValueForLessThanOrEqualTo10MockQuestion: 0,
      xpValueForGreaterThan10LessThanOrEqualTo20MockQuestion: 0,
      xpValueForGreaterThan20LessThanOrEqualTo30MockQuestion: 0,
      xpValueForGreaterThan30MockQuestion: 0,
      xpValueForLessThanOrEqualTo10V1BattleQuestion: 0,
      xpValueForGreaterThan10LessThanOrEqualTo20V1BattleQuestion: 0,
      xpValueForGreaterThan20LessThanOrEqualTo30V1BattleQuestion: 0,
      xpValueForGreaterThan30V1BattleQuestion: 0,
      v1BattleXpWinBonus: 0,
      v1BattleXpLoseBonus: 0,
      v1BattleXpDrawBonus: 0,
      xpValuePerReferral: 0,
      xpValuePerDayLogin: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await XpConfiguration.destroy({ where: {} });
  },
};
