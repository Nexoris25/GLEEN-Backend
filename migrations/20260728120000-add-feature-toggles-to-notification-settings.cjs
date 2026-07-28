'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('notification_settings', 'newMessages', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addColumn('notification_settings', 'crewUpdates', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addColumn('notification_settings', 'appUpdates', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addColumn('notification_settings', 'parentsReporting', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('notification_settings', 'parentsReporting');
    await queryInterface.removeColumn('notification_settings', 'appUpdates');
    await queryInterface.removeColumn('notification_settings', 'crewUpdates');
    await queryInterface.removeColumn('notification_settings', 'newMessages');
  },
};
