/**
 * Update Customer Example
 *
 * Demonstrates how to update customer information (email only).
 */

const { getOakClient, resolveCustomerId } = require('../common/config');
const { Crowdsplit } = require('../../dist/products/crowdsplit');
const logger = require('../common/logger');

async function main() {
  logger.section('Update Customer Example');

  try {
    const client = getOakClient();
    const customers = Crowdsplit(client).customers;

    logger.step(1, 'Resolving customer...');
    const customerId = await resolveCustomerId(customers);

    logger.step(2, 'Fetching current customer data...');
    const currentResult = await customers.get(customerId);

    if (!currentResult.ok) {
      logger.error('Failed to get customer', currentResult.error);
      process.exit(1);
    }

    logger.info('Current customer', { email: currentResult.value.data.email });

    logger.step(3, 'Updating customer email...');
    const updatedEmail = `updated_${Date.now()}@example.com`;

    const updateResult = await customers.update(customerId, { email: updatedEmail });

    if (!updateResult.ok) {
      logger.error('Failed to update customer', updateResult.error);
      process.exit(1);
    }

    logger.success('Customer updated successfully!');
    logger.info('Updated customer', { email: updateResult.value.data.email });
  } catch (error) {
    logger.error('Unexpected error', error);
    process.exit(1);
  }
}

main();
