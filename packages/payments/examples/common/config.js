/**
 * Shared configuration helper for Oak SDK examples
 */

const { createOakClient } = require('../../dist/index.js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

/**
 * Creates and returns a configured Oak client instance
 *
 * @returns {import('../../dist/index.js').OakClient} Configured Oak client
 * @throws {Error} If required environment variables are missing
 */
function getOakClient() {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const environment = process.env.OAK_ENVIRONMENT || 'sandbox';

  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing required environment variables: CLIENT_ID and CLIENT_SECRET\n' +
      'Please copy .env.example to .env and add your credentials.'
    );
  }

  if (environment !== 'sandbox' && environment !== 'production') {
    throw new Error(
      `Invalid OAK_ENVIRONMENT: ${environment}. Must be 'sandbox' or 'production'.`
    );
  }

  const config = {
    environment,
    clientId,
    clientSecret,
    retryOptions: {
      maxNumberOfRetries: 3,
      delay: 1000,
      backoffFactor: 2,
    },
  };

  if (process.env.BASE_URL) {
    config.customUrl = process.env.BASE_URL;
  }

  return createOakClient(config);
}

/**
 * Resolves a customer ID by fetching the first customer from the list.
 *
 * @param {object} customers - CustomerService instance
 * @param {object} [filter] - Optional filter params for customers.list()
 * @returns {Promise<string>} Resolved customer ID
 * @throws {Error} If no customers are found
 */
async function resolveCustomerId(customers, filter = {}) {
  const result = await customers.list({ limit: 1, ...filter });

  if (!result.ok) {
    throw new Error(`Failed to fetch customer list: ${result.error.message}`);
  }

  if (result.value.data.customer_list.length === 0) {
    throw new Error(
      'No customers found. Create one first: node customers/create-customer.js'
    );
  }

  const first = result.value.data.customer_list[0];
  return first.id ?? first.customer_id;
}

/**
 * Resolves a customer ID from list, or creates one with email only (same as integration test).
 *
 * @param {object} customers - CustomerService instance
 * @returns {Promise<{ customerId: string, created: boolean, email?: string }>} Resolved or newly created customer info
 * @throws {Error} If list fails or create fails (e.g. API requires more fields)
 */
async function resolveOrCreateCustomerId(customers) {
  const listResult = await customers.list({ limit: 1 });

  if (!listResult.ok) {
    throw new Error(`Failed to fetch customer list: ${listResult.error.message}`);
  }

  if (listResult.value.data.customer_list.length > 0) {
    const first = listResult.value.data.customer_list[0];
    return {
      customerId: first.id ?? first.customer_id,
      created: false,
    };
  }

  const email = `customer_${Date.now()}@example.com`;
  const createResult = await customers.create({ email });

  if (!createResult.ok) {
    throw new Error(
      `No customers and create failed: ${createResult.error.message}. Create one via dashboard or ensure API accepts email-only create.`
    );
  }

  return {
    customerId: createResult.value.data.id ?? createResult.value.data.customer_id,
    created: true,
    email: createResult.value.data.email,
  };
}

module.exports = { getOakClient, resolveCustomerId, resolveOrCreateCustomerId };
