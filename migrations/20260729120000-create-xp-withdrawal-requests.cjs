'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('xp_withdrawal_requests', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      xpAmount: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      airtimeAmount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      xpValuePerNaira: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      network: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'PENDING',
      },
      declineReason: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      processedByUserId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      processedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('xp_withdrawal_requests', ['userId']);
    await queryInterface.addIndex('xp_withdrawal_requests', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('xp_withdrawal_requests');
  },
};
