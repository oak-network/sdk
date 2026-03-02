/**
 * Complete Payment Flow Workflow (Stripe)
 *
 * 1. Find or create a customer (email only)
 * 2. List payment methods
 * 3. Add a Stripe bank account (if connected account is set up)
 * 4. Check webhook configuration
 */

const { getOakClient, resolveCustomerId } = require('../common/config');
const { Crowdsplit } = require('../../dist/products/crowdsplit');
const logger = require('../common/logger');

async function main() {
  logger.section('Complete Payment Flow Workflow');

  try {
    const client = getOakClient();
    const { customers, paymentMethods, webhooks } = Crowdsplit(client);

    let customerId;

    logger.step(1, 'Setting up customer...');
    try {
      customerId = await resolveCustomerId(customers);
      logger.success(`Using existing customer: ${customerId}`);
    } catch {
      logger.info('No customers found, creating one...');
      const createResult = await customers.create({
        email: `payment_flow_${Date.now()}@example.com`,
      });

      if (!createResult.ok) {
        logger.error('Failed to create customer', createResult.error);
        process.exit(1);
      }

      customerId = createResult.value.data.id ?? createResult.value.data.customer_id;
      logger.success(`New customer created: ${customerId}`);
    }

    logger.step(2, 'Checking existing payment methods...');
    const listPMResult = await paymentMethods.list(customerId);

    if (!listPMResult.ok) {
      logger.error('Failed to list payment methods', listPMResult.error);
      process.exit(1);
    }

    const existingPMs = listPMResult.value.data;
    logger.info(`Found ${existingPMs.length} payment method(s)`);
    existingPMs.forEach((pm, index) => {
      console.log(`  ${index + 1}. ${pm.type?.toUpperCase()} - ${pm.id}`);
    });

    logger.step(3, 'Adding Stripe bank account...');
    const addPMResult = await paymentMethods.add(customerId, {
      type: 'bank',
      provider: 'stripe',
      currency: 'usd',
      bank_name: 'Test Bank',
      bank_account_number: '000123456789',
      bank_routing_number: '110000000',
      bank_account_type: 'CHECKING',
      bank_account_name: 'Example Account',
      metadata: {
        workflow: 'complete_payment_flow',
        timestamp: new Date().toISOString(),
      },
    });

    if (!addPMResult.ok) {
      logger.warning('Bank add failed (Stripe connected account may be required)');
    } else {
      logger.success(`Payment method added: ${addPMResult.value.data.id}`);
    }

    logger.step(4, 'Checking webhook configuration...');
    const listWebhooksResult = await webhooks.list();

    if (!listWebhooksResult.ok) {
      logger.warning('Unable to check webhooks', listWebhooksResult.error);
    } else {
      const activeWebhooks = listWebhooksResult.value.data.filter((w) => w.is_active);
      logger.info(`Active webhooks: ${activeWebhooks.length}`);

      if (activeWebhooks.length === 0) {
        logger.warning('No active webhooks configured');
        logger.info('Register a webhook: node webhooks/register-webhook.js');
      } else {
        logger.success('Webhook notifications configured');
        activeWebhooks.forEach((wh, index) => {
          console.log(`  ${index + 1}. ${wh.url}`);
        });
      }
    }

    logger.section('Payment Flow Summary');
    console.log('\n  Customer ID:', customerId);
    const finalPMList = await paymentMethods.list(customerId);
    if (finalPMList.ok) {
      console.log('  Payment methods:', finalPMList.value.data.length);
    }
    console.log('\n  Ready for: payments, webhooks, managing payment methods');

    logger.section('Workflow Complete');
    logger.success('Payment infrastructure is ready');
  } catch (error) {
    logger.error('Unexpected error in payment flow', error);
    process.exit(1);
  }
}

main();
