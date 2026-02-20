/**
 * Add PIX Payment Method Example
 *
 * Demonstrates how to add a PIX payment method to a customer.
 */

const { getOakClient, getTestEnvironment } = require('../common/config');
const { Crowdsplit } = require('../../dist/products/crowdsplit');
const logger = require('../common/logger');

async function main() {
  logger.section('Add PIX Payment Method Example');

  try {
    const client = getOakClient();
    const { paymentMethods, customers } = Crowdsplit(client);
    const testEnv = getTestEnvironment();

    // Get customer ID
    let customerId = testEnv.paymentCustomerId;

    if (!customerId) {
      logger.warning('No PAYMENT_CUSTOMER_ID in .env, fetching from list...');
      const listResult = await customers.list({ limit: 1 });

      if (listResult.ok && listResult.value.data.customer_list.length > 0) {
        customerId = listResult.value.data.customer_list[0].id;
      } else {
        logger.error('No customers found. Create a customer first:');
        logger.info('Run:', 'node customers/create-customer.js');
        process.exit(1);
      }
    }

    logger.step(1, `Adding PIX payment method for customer: ${customerId}`);

    // PIX payment method data
    const pixData = {
      type: 'pix',
      pix_string: `pix_${Date.now()}@example.com`,
      metadata: {
        description: 'Example PIX payment method',
        created_by: 'oak-sdk-example',
        timestamp: new Date().toISOString(),
      },
    };

    logger.info('PIX data', {
      type: pixData.type,
      pix_string: pixData.pix_string,
    });

    const result = await paymentMethods.add(customerId, pixData);

    if (!result.ok) {
      logger.error('Failed to add PIX payment method', result.error);
      process.exit(1);
    }

    logger.success('PIX payment method added successfully!');
    logger.section('Payment Method Details');

    const pm = result.value.data;
    console.log(`  ID: ${pm.id}`);
    console.log(`  Type: ${pm.type}`);
    console.log(`  Status: ${pm.status || 'N/A'}`);
    console.log(`  PIX Key: ${pm.pix_string || 'N/A'}`);

    logger.section('Next Steps');
    logger.info('Payment method ID (save for later use):', pm.id);
    logger.info('List all payment methods:', 'node payment-methods/list-payment-methods.js');
    logger.info('Delete this payment method:', `node payment-methods/delete-payment-method.js ${pm.id}`);

  } catch (error) {
    logger.error('Unexpected error', error);
    process.exit(1);
  }
}

main();
