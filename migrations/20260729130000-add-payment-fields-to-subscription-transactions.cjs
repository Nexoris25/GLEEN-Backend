'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('subscription_transactions', 'provider', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'PAYSTACK',
    });

    await queryInterface.addColumn(
      'subscription_transactions',
      'paymentMethod',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );

    await queryInterface.addColumn(
      'subscription_transactions',
      'idempotencyKey',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );

    await queryInterface.addColumn(
      'subscription_transactions',
      'authorizationUrl',
      {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    );

    await queryInterface.addColumn('subscription_transactions', 'metadata', {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    // Hard idempotency guarantee: a given (user, idempotencyKey) can map to at
    // most one transaction. Partial index so the many legacy/null keys don't
    // collide with each other.
    await queryInterface.addIndex('subscription_transactions', {
      fields: ['userId', 'idempotencyKey'],
      unique: true,
      name: 'uniq_txn_user_idempotency',
      where: { idempotencyKey: { [Sequelize.Op.ne]: null } },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'subscription_transactions',
      'uniq_txn_user_idempotency',
    );
    await queryInterface.removeColumn('subscription_transactions', 'metadata');
    await queryInterface.removeColumn(
      'subscription_transactions',
      'authorizationUrl',
    );
    await queryInterface.removeColumn(
      'subscription_transactions',
      'idempotencyKey',
    );
    await queryInterface.removeColumn(
      'subscription_transactions',
      'paymentMethod',
    );
    await queryInterface.removeColumn('subscription_transactions', 'provider');
  },
};
