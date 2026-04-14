'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('xp_configuration', 'xpMultiplierKey', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('xp_configuration', 'xpMultiplierValue', {
      type: Sequelize.DOUBLE,
      allowNull: false,
      defaultValue: 1,
    });

    await queryInterface.addColumn('xp_configuration', 'xpMultiplierDays', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('xp_configuration', 'xpMultiplierStartAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('xp_configuration', 'xpMultiplierName', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('xp_configuration', 'xpMultiplierDetails', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('xp_configuration', 'xpMultiplierEnabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('xp_configuration', 'xpMultiplierEnabled');
    await queryInterface.removeColumn('xp_configuration', 'xpMultiplierDetails');
    await queryInterface.removeColumn('xp_configuration', 'xpMultiplierName');
    await queryInterface.removeColumn('xp_configuration', 'xpMultiplierStartAt');
    await queryInterface.removeColumn('xp_configuration', 'xpMultiplierDays');
    await queryInterface.removeColumn('xp_configuration', 'xpMultiplierValue');
    await queryInterface.removeColumn('xp_configuration', 'xpMultiplierKey');
  },
};

