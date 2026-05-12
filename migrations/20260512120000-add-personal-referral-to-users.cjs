'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'personal_referral', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE "users"
      SET "personal_referral" = upper(substr(replace("id"::text, '-', ''), 1, 16))
      WHERE "personal_referral" IS NULL OR "personal_referral" = '';
    `);

    await queryInterface.addIndex('users', ['personal_referral'], {
      unique: true,
      name: 'users_personal_referral_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('users', 'users_personal_referral_unique');
    await queryInterface.removeColumn('users', 'personal_referral');
  },
};

