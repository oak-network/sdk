/**
 * Register Webhook Example
 *
 * Demonstrates how to register a webhook endpoint to receive
 * real-time notifications about events.
 */

const { getOakClient } = require('../common/config');
const { Crowdsplit } = require('../../dist/products/crowdsplit');
const logger = require('../common/logger');

async function main() {
  logger.section('Register Webhook Example');

  try {
    const client = getOakClient();
    const webhooks = Crowdsplit(client).webhooks;

    // Webhook configuration
    const webhookData = {
      url: `https://your-app.example.com/webhooks/oak-${Date.now()}`,
      events: [
        'payment.completed',
        'payment.failed',
        'customer.created',
        'transfer.completed',
      ],
      secret: `webhook_secret_${Date.now()}`, // Store this securely!
      active: true,
      metadata: {
        description: 'Main webhook endpoint',
        environment: 'production',
        created_by: 'oak-sdk-example',
      },
    };

    logger.step(1, 'Registering webhook endpoint...');
    logger.info('Webhook configuration', {
      url: webhookData.url,
      events: webhookData.events,
      active: webhookData.active,
    });

    logger.warning('Note: The URL must be publicly accessible and use HTTPS in production');

    const result = await webhooks.register(webhookData);

    if (!result.ok) {
      logger.error('Failed to register webhook', result.error);
      process.exit(1);
    }

    logger.success('Webhook registered successfully!');
    logger.section('Webhook Details');

    const webhook = result.value.data;
    console.log(`  ID: ${webhook.id}`);
    console.log(`  URL: ${webhook.url}`);
    console.log(`  Active: ${webhook.active}`);
    console.log(`  Events: ${webhook.events?.join(', ')}`);

    logger.section('Important: Save Your Webhook Secret');
    logger.warning('Store this secret securely - you\'ll need it to verify webhook signatures:');
    console.log(`  Secret: ${webhookData.secret}`);

    logger.section('Next Steps');
    logger.info('Webhook ID (save for later):', webhook.id);
    logger.info('Test signature verification:', 'node webhooks/verify-signature.js');
    logger.info('Manage webhooks:', 'node webhooks/manage-webhooks.js');

  } catch (error) {
    logger.error('Unexpected error', error);
    process.exit(1);
  }
}

main();
