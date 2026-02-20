/**
 * Create Customer Example
 *
 * Demonstrates how to create a new customer with all required fields
 * and proper error handling.
 */

const { getOakClient } = require('../common/config');
const { Crowdsplit } = require('../../dist/products/crowdsplit');
const logger = require('../common/logger');

async function main() {
  logger.section('Create Customer Example');

  try {
    const client = getOakClient();
    const customers = Crowdsplit(client).customers;

    // Generate unique identifiers
    const timestamp = Date.now();
    const email = `customer_${timestamp}@example.com`;
    const documentNumber = `${timestamp}`.padStart(11, '0').substring(0, 11);

    // Customer data
    const customerData = {
      email,
      first_name: 'John',
      last_name: 'Doe',
      document_type: 'personal_tax_id',
      document_number: documentNumber,
      phone_country_code: '+1',
      phone_area_code: '555',
      phone_number: '0123456',
      country_code: 'US',
    };

    logger.step(1, 'Creating customer...');
    logger.info('Customer data', {
      email: customerData.email,
      name: `${customerData.first_name} ${customerData.last_name}`,
      document: customerData.document_number,
    });

    const result = await customers.create(customerData);

    if (!result.ok) {
      logger.error('Failed to create customer', result.error);
      process.exit(1);
    }

    logger.success('Customer created successfully!');
    logger.info('Customer details', {
      id: result.value.data.id,
      email: result.value.data.email,
      name: `${result.value.data.first_name} ${result.value.data.last_name}`,
      country: result.value.data.country_code,
    });

    // Store the customer ID for use in other examples
    logger.section('Next Steps');
    logger.info(
      'Save this customer ID for other examples:',
      result.value.data.id
    );
    logger.info(
      'Add to .env file:',
      `PAYMENT_CUSTOMER_ID=${result.value.data.id}`
    );

  } catch (error) {
    logger.error('Unexpected error', error);
    process.exit(1);
  }
}

main();
