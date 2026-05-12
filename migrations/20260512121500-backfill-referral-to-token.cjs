'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE "users" AS u
      SET "referral" = r."personal_referral"
      FROM "users" AS r
      WHERE u."referral" IS NOT NULL
        AND u."referral" <> ''
        AND r."personal_referral" IS NOT NULL
        AND r."personal_referral" <> ''
        AND lower(u."referral") = lower(r."username");
    `);
  },

  async down() {},
};

