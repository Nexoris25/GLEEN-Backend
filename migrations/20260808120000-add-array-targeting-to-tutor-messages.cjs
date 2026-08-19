'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Move tutor message targeting from single ids to arrays so one message
    // can target multiple states / subjects / classes / individual students.
    await queryInterface.addColumn('tutor_messages', 'stateIds', {
      type: Sequelize.ARRAY(Sequelize.UUID),
      allowNull: true,
    });
    await queryInterface.addColumn('tutor_messages', 'subjectIds', {
      type: Sequelize.ARRAY(Sequelize.UUID),
      allowNull: true,
    });
    await queryInterface.addColumn('tutor_messages', 'studentIds', {
      type: Sequelize.ARRAY(Sequelize.UUID),
      allowNull: true,
    });

    // Backfill the new array columns from the legacy single-id columns when
    // those columns still exist (they may not on a freshly synced database).
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'tutor_messages' AND column_name = 'stateId'
        ) THEN
          UPDATE "tutor_messages"
          SET "stateIds" = ARRAY["stateId"]
          WHERE "stateId" IS NOT NULL;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'tutor_messages' AND column_name = 'subjectId'
        ) THEN
          UPDATE "tutor_messages"
          SET "subjectIds" = ARRAY["subjectId"]
          WHERE "subjectId" IS NOT NULL;
        END IF;
      END $$;
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tutor_messages', 'stateIds');
    await queryInterface.removeColumn('tutor_messages', 'subjectIds');
    await queryInterface.removeColumn('tutor_messages', 'studentIds');
  },
};
