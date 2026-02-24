/**
 * List Customers Example
 *
 * Demonstrates how to list customers with pagination and filtering options.
 */

const { getOakClient } = require('../common/config');
const { Crowdsplit } = require('../../dist/products/crowdsplit');
const logger = require('../common/logger');

async function main() {
  logger.section('List Customers Example');

  try {
    const client = getOakClient();
    const customers = Crowdsplit(client).customers;

    // Example 1: List first 5 customers
    logger.step(1, 'Listing first 5 customers...');
    const listResult = await customers.list({ limit: 5 });

    if (!listResult.ok) {
      logger.error('Failed to list customers', listResult.error);
      process.exit(1);
    }

    logger.success(`Found ${listResult.value.data.customer_list.length} customers`);
    logger.info('Total count', listResult.value.data.count);

    listResult.value.data.customer_list.forEach((customer, index) => {
      console.log(`\n  ${index + 1}. ${customer.first_name} ${customer.last_name}`);
      console.log(`     ID: ${customer.id}`);
      console.log(`     Email: ${customer.email}`);
      console.log(`     Country: ${customer.country_code || 'N/A'}`);
    });

    // Example 2: Filter by email (if you know one)
    if (listResult.value.data.customer_list.length > 0) {
      const firstCustomer = listResult.value.data.customer_list[0];

      logger.step(2, `Searching for customer by email: ${firstCustomer.email}`);
      const searchResult = await customers.list({
        email: firstCustomer.email,
        limit: 1,
      });

      if (searchResult.ok && searchResult.value.data.customer_list.length > 0) {
        logger.success('Customer found by email');
        logger.info('Customer', {
          id: searchResult.value.data.customer_list[0].id,
          email: searchResult.value.data.customer_list[0].email,
        });
      }
    }

    // Example 3: Pagination
    logger.step(3, 'Demonstrating pagination (offset: 2, limit: 3)...');
    const paginatedResult = await customers.list({
      offset: 2,
      limit: 3,
    });

    if (paginatedResult.ok) {
      logger.success(`Retrieved ${paginatedResult.value.data.customer_list.length} customers (page 2)`);
    }

  } catch (error) {
    logger.error('Unexpected error', error);
    process.exit(1);
  }
}

main();
