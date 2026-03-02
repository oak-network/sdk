/**
 * Manage Webhooks Example
 *
 * Demonstrates complete webhook lifecycle: list, get, update, toggle, and delete.
 */

const { getOakClient } = require('../common/config');
const { Crowdsplit } = require('../../dist/products/crowdsplit');
const logger = require('../common/logger');

async function main() {
  logger.section('Webhook Management Example');

  try {
    const client = getOakClient();
    const webhooks = Crowdsplit(client).webhooks;

    // Step 1: List all webhooks
    logger.step(1, 'Listing all webhooks...');
    const listResult = await webhooks.list();

    if (!listResult.ok) {
      logger.error('Failed to list webhooks', listResult.error);
      process.exit(1);
    }

    logger.success(`Found ${listResult.value.data.length} webhook(s)`);

    if (listResult.value.data.length === 0) {
      logger.warning('No webhooks found');
      logger.info('Register a webhook first:', 'node webhooks/register-webhook.js');
      process.exit(0);
    }

    // Display webhooks
    listResult.value.data.forEach((webhook, index) => {
      console.log(`\n  ${index + 1}. ${webhook.url}`);
      console.log(`     ID: ${webhook.id}`);
      console.log(`     Active: ${webhook.active ? '✓' : '✗'}`);
      console.log(`     Events: ${webhook.events?.join(', ') || 'N/A'}`);
    });

    const firstWebhook = listResult.value.data[0];
    const webhookId = firstWebhook.id;

    // Step 2: Get specific webhook
    logger.step(2, `Getting webhook details: ${webhookId}`);
    const getResult = await webhooks.get(webhookId);

    if (getResult.ok) {
      logger.success('Webhook retrieved successfully');
      logger.info('Details', {
        id: getResult.value.data.id,
        url: getResult.value.data.url,
        active: getResult.value.data.active,
      });
    }

    // Step 3: Update webhook
    logger.step(3, 'Updating webhook events...');
    const updateResult = await webhooks.update(webhookId, {
      events: ['payment.completed', 'customer.created'],
      metadata: {
        updated_at: new Date().toISOString(),
        updated_by: 'oak-sdk-example',
      },
    });

    if (updateResult.ok) {
      logger.success('Webhook updated successfully');
      logger.info('New events', updateResult.value.data.events);
    }

    // Step 4: Toggle webhook status
    logger.step(4, 'Toggling webhook status...');
    const currentStatus = updateResult.ok ? updateResult.value.data.active : firstWebhook.active;

    const toggleResult = await webhooks.toggle(webhookId);

    if (toggleResult.ok) {
      logger.success(`Webhook ${currentStatus ? 'disabled' : 'enabled'}`);
      logger.info('New status', toggleResult.value.data.active ? 'Active' : 'Inactive');
    }

    // Toggle back to original state
    logger.step(5, 'Restoring original webhook status...');
    const restoreResult = await webhooks.toggle(webhookId);

    if (restoreResult.ok) {
      logger.success('Webhook status restored');
    }

    // Step 6: Delete webhook (optional - commented out by default)
    logger.step(6, 'Webhook deletion (skipped)');
    logger.info('To delete a webhook, uncomment the code below');

    /*
    logger.warning('Deleting webhook (this cannot be undone)...');
    const deleteResult = await webhooks.delete(webhookId);

    if (deleteResult.ok) {
      logger.success('Webhook deleted successfully');
      logger.info('Response', deleteResult.value.msg);
    }
    */

    logger.section('Webhook Management Complete');
    logger.info('All operations completed successfully');

  } catch (error) {
    logger.error('Unexpected error', error);
    process.exit(1);
  }
}

main();
