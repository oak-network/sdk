/**
 * Delete Payment Method Example
 *
 * Demonstrates how to delete a payment method.
 * Usage: node delete-payment-method.js [payment_method_id]
 */

const { getOakClient, getTestEnvironment } = require('../common/config');
const { Crowdsplit } = require('../../dist/products/crowdsplit');
const logger = require('../common/logger');

async function main() {
  logger.section('Delete Payment Method Example');

  try {
    const client = getOakClient();
    const { paymentMethods, customers } = Crowdsplit(client);
    const testEnv = getTestEnvironment();

    // Get customer ID
    let customerId = testEnv.paymentCustomerId;

    if (!customerId) {
      const listResult = await customers.list({ limit: 1 });
      if (listResult.ok && listResult.value.data.customer_list.length > 0) {
        customerId = listResult.value.data.customer_list[0].id;
      } else {
        logger.error('No customers found.');
        process.exit(1);
      }
    }

    // Get payment method ID from command line or use the first available
    let paymentMethodId = process.argv[2];

    if (!paymentMethodId) {
      logger.step(1, 'No payment method ID provided, fetching from list...');
      const listResult = await paymentMethods.list(customerId);

      if (!listResult.ok || listResult.value.data.length === 0) {
        logger.error('No payment methods found for this customer');
        logger.info('Add a payment method first:', 'node payment-methods/add-pix.js');
        process.exit(1);
      }

      paymentMethodId = listResult.value.data[0].id;
      logger.info('Using first payment method', {
        id: paymentMethodId,
        type: listResult.value.data[0].type,
      });
    }

    // Confirm deletion
    logger.step(2, `Deleting payment method: ${paymentMethodId}`);
    logger.warning('This action cannot be undone!');

    const result = await paymentMethods.delete(customerId, paymentMethodId);

    if (!result.ok) {
      logger.error('Failed to delete payment method', result.error);
      process.exit(1);
    }

    logger.success('Payment method deleted successfully!');
    logger.info('Response', result.value.msg);

    // Verify deletion
    logger.step(3, 'Verifying deletion...');
    const verifyResult = await paymentMethods.get(customerId, paymentMethodId);

    if (!verifyResult.ok) {
      logger.success('Confirmed: Payment method no longer exists');
    } else {
      logger.warning('Payment method still exists (may take time to propagate)');
    }

  } catch (error) {
    logger.error('Unexpected error', error);
    process.exit(1);
  }
}

main();
