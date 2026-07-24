'use strict';

/**
 * A mock exam record's `endedAt` should only be set when the attempt is
 * completed. It was NOT NULL, which forced it to be populated at creation and
 * broke the XP-on-completion guard in MockExamRecordService.updateCompleted
 * (which only awards XP when `endedAt` is null). Make it nullable.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('mock_exam_records', 'endedAt', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('mock_exam_records', 'endedAt', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
