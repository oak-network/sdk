/**
 * Update Customer Example
 *
 * Demonstrates how to update customer information.
 */

const { getOakClient, getTestEnvironment } = require('../common/config');
const { Crowdsplit } = require('../../dist/products/crowdsplit');
const logger = require('../common/logger');

async function main() {
  logger.section('Update Customer Example');

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
      } else {
        logger.error('No customers found. Please create a customer first.');
        process.exit(1);
      }
    }

    // Get current customer data
    logger.step(1, 'Fetching current customer data...');
    const currentResult = await customers.get(customerId);

    if (!currentResult.ok) {
      logger.error('Failed to get customer', currentResult.error);
      process.exit(1);
    }

    logger.info('Current customer', {
      name: `${currentResult.value.data.first_name} ${currentResult.value.data.last_name}`,
      email: currentResult.value.data.email,
    });

    // Update customer
    logger.step(2, 'Updating customer...');
    const updateData = {
      first_name: 'Jane',
      last_name: 'Smith',
      phone_country_code: '+1',
      phone_area_code: '555',
      phone_number: '9876543',
    };

    const updateResult = await customers.update(customerId, updateData);

    if (!updateResult.ok) {
      logger.error('Failed to update customer', updateResult.error);
      process.exit(1);
    }

    logger.success('Customer updated successfully!');
    logger.info('Updated customer', {
      name: `${updateResult.value.data.first_name} ${updateResult.value.data.last_name}`,
      email: updateResult.value.data.email,
      phone: `${updateResult.value.data.phone_country_code} ${updateResult.value.data.phone_area_code} ${updateResult.value.data.phone_number}`,
    });

    // Restore original data (optional cleanup)
    logger.step(3, 'Restoring original data...');
    const restoreResult = await customers.update(customerId, {
      first_name: currentResult.value.data.first_name,
      last_name: currentResult.value.data.last_name,
    });

    if (restoreResult.ok) {
      logger.success('Customer restored to original state');
    }

  } catch (error) {
    logger.error('Unexpected error', error);
    process.exit(1);
  }
}

main();
