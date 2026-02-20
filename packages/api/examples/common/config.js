/**
 * Shared configuration helper for Oak SDK examples
 *
 * This module provides a consistent way to configure the Oak client
 * across all examples using environment variables.
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

  // Add custom URL if provided in environment
  if (process.env.BASE_URL) {
    config.customUrl = process.env.BASE_URL;
  }

  return createOakClient(config);
}

/**
 * Gets environment-specific test data
 *
 * @returns {Object} Test environment configuration
 */
function getTestEnvironment() {
  return {
    paymentCustomerId: process.env.PAYMENT_CUSTOMER_ID,
    environment: process.env.OAK_ENVIRONMENT || 'sandbox',
  };
}

module.exports = {
  getOakClient,
  getTestEnvironment,
};
