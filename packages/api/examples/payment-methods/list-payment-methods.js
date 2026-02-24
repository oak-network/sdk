/**
 * List Payment Methods Example (Stripe)
 *
 * Lists payment methods for a customer with optional filtering.
 */

const { getOakClient, resolveCustomerId } = require('../common/config');
const { Crowdsplit } = require('../../dist/products/crowdsplit');
const logger = require('../common/logger');

async function main() {
  logger.section('List Payment Methods Example');

  try {
    const client = getOakClient();
    const { paymentMethods, customers } = Crowdsplit(client);

    logger.step(1, 'Resolving customer...');
    const customerId = await resolveCustomerId(customers);

    logger.step(2, `Listing all payment methods for customer: ${customerId}`);
    const allResult = await paymentMethods.list(customerId);

    if (!allResult.ok) {
      logger.error('Failed to list payment methods', allResult.error);
      process.exit(1);
    }

    const list = allResult.value.data;
    logger.success(`Found ${list.length} payment method(s)`);

    if (list.length === 0) {
      logger.warning('No payment methods found for this customer');
      logger.info('Add one: node payment-methods/add-bank-account.js');
    } else {
      list.forEach((pm, index) => {
        console.log(`\n  ${index + 1}. ${pm.type?.toUpperCase() || 'Unknown'}`);
        console.log(`     ID: ${pm.id}`);
        console.log(`     Status: ${pm.status || 'N/A'}`);
        if (pm.provider) console.log(`     Provider: ${pm.provider}`);
        if (pm.bank_name) console.log(`     Bank: ${pm.bank_name}`);
      });
    }

    logger.step(3, 'Filter by type: bank');
    const bankResult = await paymentMethods.list(customerId, { type: 'bank' });
    if (bankResult.ok) {
      logger.success(`Found ${bankResult.value.data.length} bank payment method(s)`);
    }

    logger.step(4, 'Filter by status: active');
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
