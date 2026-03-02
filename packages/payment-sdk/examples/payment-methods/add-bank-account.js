/**
 * Add Bank Account Payment Method Example (Stripe)
 *
 * Adds a Stripe bank account to a customer.
 * Requires a Stripe connected account setup.
 */

const { getOakClient, resolveCustomerId } = require('../common/config');
const { Crowdsplit } = require('../../dist/products/crowdsplit');
const logger = require('../common/logger');

async function main() {
  logger.section('Add Bank Account Payment Method Example');

  try {
    const client = getOakClient();
    const { paymentMethods, customers } = Crowdsplit(client);

    logger.step(1, 'Resolving customer...');
    const customerId = await resolveCustomerId(customers);

    logger.step(2, `Adding bank account for customer: ${customerId}`);

    const result = await paymentMethods.add(customerId, {
      type: 'bank',
      provider: 'stripe',
      currency: 'usd',
      bank_name: 'Test Bank',
      bank_account_number: '000123456789',
      bank_routing_number: '110000000',
      bank_account_type: 'CHECKING',
      bank_account_name: 'Example Account',
      metadata: {
        description: 'Example bank account',
        created_by: 'oak-sdk-example',
      },
    });

    if (!result.ok) {
      logger.error('Failed to add bank account', result.error);
      logger.info('Stripe connected account setup may be required.');
      process.exit(1);
    }

    logger.success('Bank account added successfully!');
    logger.section('Payment Method Details');

    const pm = result.value.data;
    console.log(`  ID: ${pm.id}`);
    console.log(`  Type: ${pm.type}`);
    console.log(`  Provider: ${pm.provider || 'N/A'}`);
    console.log(`  Status: ${pm.status || 'N/A'}`);
    console.log(`  Bank: ${pm.bank_name || 'N/A'}`);
  } catch (error) {
    logger.error('Unexpected error', error);
    process.exit(1);
  }
}

main();
