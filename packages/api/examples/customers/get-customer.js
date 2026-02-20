/**
 * Get Customer Example
 *
 * Demonstrates how to retrieve a specific customer by ID.
 */

const { getOakClient, getTestEnvironment } = require('../common/config');
const { Crowdsplit } = require('../../dist/products/crowdsplit');
const logger = require('../common/logger');

async function main() {
  logger.section('Get Customer Example');

  try {
    const client = getOakClient();
    const customers = Crowdsplit(client).customers;
    const testEnv = getTestEnvironment();

    let customerId = testEnv.paymentCustomerId;

    // If no customer ID in env, get one from the list
    if (!customerId) {
      logger.warning('No PAYMENT_CUSTOMER_ID in .env, fetching from list...');
      const listResult = await customers.list({ limit: 1 });

      if (listResult.ok && listResult.value.data.customer_list.length > 0) {
        customerId = listResult.value.data.customer_list[0].id;
        logger.info('Using customer from list', customerId);
      } else {
        logger.error('No customers found. Please create a customer first.');
        logger.info('Run:', 'node customers/create-customer.js');
        process.exit(1);
      }
    }

    logger.step(1, `Fetching customer: ${customerId}`);
    const result = await customers.get(customerId);

    if (!result.ok) {
      logger.error('Failed to get customer', result.error);
      process.exit(1);
    }

    logger.success('Customer retrieved successfully!');
    logger.section('Customer Details');

    const customer = result.value.data;
    console.log(`  ID: ${customer.id}`);
    console.log(`  Email: ${customer.email}`);
    console.log(`  Name: ${customer.first_name} ${customer.last_name}`);
    console.log(`  Document: ${customer.document_type} - ${customer.document_number || 'N/A'}`);
    console.log(`  Country: ${customer.country_code || 'N/A'}`);
    console.log(`  Phone: ${customer.phone_country_code || ''} ${customer.phone_area_code || ''} ${customer.phone_number || ''}`);

    if (customer.customer_wallet) {
      console.log(`  Wallet: ${customer.customer_wallet}`);
    }

  } catch (error) {
    logger.error('Unexpected error', error);
    process.exit(1);
  }
}

main();
