/**
 * Get Customer Example
 *
 * Demonstrates how to retrieve a customer by ID.
 */

const { getOakClient, resolveCustomerId } = require('../common/config');
const { Crowdsplit } = require('../../dist/products/crowdsplit');
const logger = require('../common/logger');

async function main() {
  logger.section('Get Customer Example');

  try {
    const client = getOakClient();
    const customers = Crowdsplit(client).customers;

    logger.step(1, 'Resolving customer...');
    const customerId = await resolveCustomerId(customers);
    logger.info('Using customer', customerId);

    logger.step(2, `Fetching customer: ${customerId}`);
    const result = await customers.get(customerId);

    if (!result.ok) {
      logger.error('Failed to get customer', result.error);
      process.exit(1);
    }

    logger.success('Customer retrieved successfully!');
    logger.section('Customer Details');

    const customer = result.value.data;
    console.log(`  ID: ${customer.id ?? customer.customer_id}`);
    console.log(`  Email: ${customer.email}`);
  } catch (error) {
    logger.error('Unexpected error', error);
    process.exit(1);
  }
}

main();
