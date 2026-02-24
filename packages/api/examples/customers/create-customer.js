/**
 * Create Customer Example (Stripe)
 *
 * Creates a customer with email only (same as integration test).
 */

const { getOakClient } = require('../common/config');
const { Crowdsplit } = require('../../dist/products/crowdsplit');
const logger = require('../common/logger');

async function main() {
  logger.section('Create Customer Example');

  try {
    const client = getOakClient();
    const customers = Crowdsplit(client).customers;

    const email = `customer_${Date.now()}@example.com`;
    logger.step(1, 'Creating customer (email only)...');
    logger.info('Customer data', { email });

    const result = await customers.create({ email });

    if (!result.ok) {
      logger.error('Failed to create customer', result.error);
      process.exit(1);
    }

    const customerId = result.value.data.id ?? result.value.data.customer_id;
    logger.success('Customer created successfully!');
    logger.info('Customer details', { id: customerId, email: result.value.data.email });

    logger.section('Next Steps');
    logger.info('Customer ID', customerId);
    logger.info('Other examples can resolve the customer from the list.');
  } catch (error) {
    logger.error('Unexpected error', error);
    process.exit(1);
  }
}

main();
