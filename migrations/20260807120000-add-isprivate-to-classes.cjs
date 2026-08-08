'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('classes', 'isPrivate', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    // Backfill: previously created private lessons are only identifiable by
    // their generated title prefix (see requestPrivateLesson).
    await queryInterface.sequelize.query(`
      UPDATE "classes"
      SET "isPrivate" = true
      WHERE "title" LIKE 'Private lesson %';
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('classes', 'isPrivate');
  },
};
