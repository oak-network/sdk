/**
 * List Payment Methods Example
 *
 * Demonstrates how to list all payment methods for a customer with filtering.
 */

const { getOakClient, getTestEnvironment } = require('../common/config');
const { Crowdsplit } = require('../../dist/products/crowdsplit');
const logger = require('../common/logger');

async function main() {
  logger.section('List Payment Methods Example');

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
        logger.error('No customers found.');
        process.exit(1);
      }
    }

    // Example 1: List all payment methods
    logger.step(1, `Listing all payment methods for customer: ${customerId}`);
    const allResult = await paymentMethods.list(customerId);

    if (!allResult.ok) {
      logger.error('Failed to list payment methods', allResult.error);
      process.exit(1);
    }

    logger.success(`Found ${allResult.value.data.length} payment method(s)`);

    if (allResult.value.data.length === 0) {
      logger.warning('No payment methods found for this customer');
      logger.info('Add a payment method first:', 'node payment-methods/add-pix.js');
    } else {
      allResult.value.data.forEach((pm, index) => {
        console.log(`\n  ${index + 1}. ${pm.type?.toUpperCase() || 'Unknown'}`);
        console.log(`     ID: ${pm.id}`);
        console.log(`     Status: ${pm.status || 'N/A'}`);
        if (pm.provider) console.log(`     Provider: ${pm.provider}`);
        if (pm.pix_string) console.log(`     PIX: ${pm.pix_string}`);
        if (pm.bank_name) console.log(`     Bank: ${pm.bank_name}`);
      });
    }

    // Example 2: Filter by type (PIX)
    logger.step(2, 'Filtering payment methods by type: PIX');
    const pixResult = await paymentMethods.list(customerId, { type: 'pix' });

    if (pixResult.ok) {
      logger.success(`Found ${pixResult.value.data.length} PIX payment method(s)`);
    }

    // Example 3: Filter by status (active)
    logger.step(3, 'Filtering payment methods by status: active');
    const activeResult = await paymentMethods.list(customerId, { status: 'active' });

    if (activeResult.ok) {
      logger.success(`Found ${activeResult.value.data.length} active payment method(s)`);
    }

  } catch (error) {
    logger.error('Unexpected error', error);
    process.exit(1);
  }
}

main();
