'use strict';

/**
 * A quiz record's `endedAt` should only be set when the attempt is completed.
 * It was NOT NULL, which forced it to be populated at creation and broke the
 * XP-on-completion guard in QuizRecordService.updateCompleted (which only
 * awards XP when `endedAt` is null). Make it nullable.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('quiz_records', 'endedAt', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('quiz_records', 'endedAt', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
