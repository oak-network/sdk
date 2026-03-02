/**
 * Delete Payment Method Example
 *
 * Deletes a payment method for a customer.
 * Usage: node delete-payment-method.js [payment_method_id]
 */

const { getOakClient, resolveCustomerId } = require('../common/config');
const { Crowdsplit } = require('../../dist/products/crowdsplit');
const logger = require('../common/logger');

async function main() {
  logger.section('Delete Payment Method Example');

  try {
    const client = getOakClient();
    const { paymentMethods, customers } = Crowdsplit(client);

    logger.step(1, 'Resolving customer...');
    const customerId = await resolveCustomerId(customers);

    let paymentMethodId = process.argv[2];

    if (!paymentMethodId) {
      logger.step(2, 'No payment method ID provided, fetching from list...');
      const listResult = await paymentMethods.list(customerId);

      if (!listResult.ok || listResult.value.data.length === 0) {
        logger.error('No payment methods found for this customer');
        logger.info('Add one first: node payment-methods/add-bank-account.js');
        process.exit(1);
      }

      paymentMethodId = listResult.value.data[0].id;
      logger.info('Using first payment method', {
        id: paymentMethodId,
        type: listResult.value.data[0].type,
      });
    }

    logger.step(3, `Deleting payment method: ${paymentMethodId}`);
    logger.warning('This action cannot be undone!');

    const result = await paymentMethods.delete(customerId, paymentMethodId);

    if (!result.ok) {
      logger.error('Failed to delete payment method', result.error);
      process.exit(1);
    }

    logger.success('Payment method deleted successfully!');
    logger.info('Response', result.value.msg);

    logger.step(4, 'Verifying deletion...');
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
