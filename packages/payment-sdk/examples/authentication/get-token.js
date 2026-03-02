/**
 * Authentication Example
 *
 * Demonstrates how to authenticate with the Oak API using OAuth 2.0
 * client credentials flow. Shows token generation and automatic caching.
 */

const { getOakClient } = require('../common/config');
const logger = require('../common/logger');

async function main() {
  logger.section('OAuth Authentication Example');

  try {
    // Create Oak client (authentication is handled automatically)
    logger.step(1, 'Creating Oak client...');
    const client = getOakClient();
    logger.success('Client created successfully');

    // Get access token (will be cached for subsequent requests)
    logger.step(2, 'Requesting access token...');
    const tokenResult = await client.getAccessToken();

    if (!tokenResult.ok) {
      logger.error('Failed to get access token', tokenResult.error);
      process.exit(1);
    }

    logger.success('Access token obtained successfully');
    logger.info('Token (first 20 chars)', tokenResult.value.substring(0, 20) + '...');

    // Second call will use cached token
    logger.step(3, 'Requesting access token again (should use cache)...');
    const cachedTokenResult = await client.getAccessToken();

    if (cachedTokenResult.ok) {
      logger.success('Token retrieved from cache');
      logger.info('Tokens match', tokenResult.value === cachedTokenResult.value);
    }

    // Display client configuration (without sensitive data)
    logger.section('Client Configuration');
    logger.info('Environment', client.config.environment);
    logger.info('Client ID', client.config.clientId.substring(0, 10) + '...');
    logger.info('Base URL', client.config.baseUrl);

  } catch (error) {
    logger.error('Unexpected error during authentication', error);
    process.exit(1);
  }
}

// Run the example
main();
