/**
 * Add Bank Account Payment Method Example
 *
 * Demonstrates how to add a bank account payment method (Stripe).
 * Note: This requires a Stripe connected account setup.
 */

const { getOakClient, getTestEnvironment } = require('../common/config');
const { Crowdsplit } = require('../../dist/products/crowdsplit');
const logger = require('../common/logger');

async function main() {
  logger.section('Add Bank Account Payment Method Example');

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
        logger.error('No customers found. Create a customer first.');
        process.exit(1);
      }
    }

    logger.step(1, `Adding bank account for customer: ${customerId}`);

    // Bank account data (Stripe test account)
    const bankData = {
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
    };

    logger.info('Bank account data', {
      provider: bankData.provider,
      bank_name: bankData.bank_name,
      account_type: bankData.bank_account_type,
      currency: bankData.currency,
    });

    const result = await paymentMethods.add(customerId, bankData);

    if (!result.ok) {
      logger.warning('Bank account creation may require Stripe connected account setup');
      logger.error('Failed to add bank account', result.error);
      logger.section('Alternative');
      logger.info('Try adding a PIX payment method instead:', 'node payment-methods/add-pix.js');
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
    console.log(`  Currency: ${pm.currency || 'N/A'}`);

  } catch (error) {
    logger.error('Unexpected error', error);
    process.exit(1);
  }
}

main();
