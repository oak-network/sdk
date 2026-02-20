/**
 * Complete Payment Flow Workflow
 *
 * Demonstrates a complete payment setup workflow:
 * 1. Find or create a customer
 * 2. List existing payment methods
 * 3. Add a new payment method if needed
 * 4. Set up webhook notifications
 *
 * This simulates a real-world payment integration scenario.
 */

const { getOakClient, getTestEnvironment } = require('../common/config');
const { Crowdsplit } = require('../../dist/products/crowdsplit');
const logger = require('../common/logger');

async function main() {
  logger.section('Complete Payment Flow Workflow');

  try {
    const client = getOakClient();
    const { customers, paymentMethods, webhooks } = Crowdsplit(client);
    const testEnv = getTestEnvironment();

    let customerId;

    // STEP 1: Get or Create Customer
    logger.step(1, 'Setting up customer...');

    if (testEnv.paymentCustomerId) {
      customerId = testEnv.paymentCustomerId;
      logger.info('Using existing customer from .env', customerId);

      const verifyResult = await customers.get(customerId);
      if (!verifyResult.ok) {
        logger.error('Customer from .env not found', verifyResult.error);
        process.exit(1);
      }
      logger.success('Customer verified');
    } else {
      logger.info('Creating new customer...');
      const timestamp = Date.now();

      const createResult = await customers.create({
        email: `payment_flow_${timestamp}@example.com`,
        first_name: 'Payment',
        last_name: 'User',
        document_type: 'personal_tax_id',
        document_number: `${timestamp}`.padStart(11, '0').substring(0, 11),
        country_code: 'BR',
      });

      if (!createResult.ok) {
        logger.error('Failed to create customer', createResult.error);
        process.exit(1);
      }

      customerId = createResult.value.data.id;
      logger.success('New customer created', customerId);
    }

    // STEP 2: Check Existing Payment Methods
    logger.step(2, 'Checking existing payment methods...');

    const listPMResult = await paymentMethods.list(customerId);

    if (!listPMResult.ok) {
      logger.error('Failed to list payment methods', listPMResult.error);
      process.exit(1);
    }

    const existingPaymentMethods = listPMResult.value.data;
    logger.info('Existing payment methods', existingPaymentMethods.length);

    if (existingPaymentMethods.length > 0) {
      existingPaymentMethods.forEach((pm, index) => {
        console.log(`  ${index + 1}. ${pm.type?.toUpperCase()} - ${pm.id}`);
      });
    }

    // STEP 3: Add New Payment Method
    logger.step(3, 'Adding new PIX payment method...');

    const addPMResult = await paymentMethods.add(customerId, {
      type: 'pix',
      pix_string: `pix_payment_flow_${Date.now()}@example.com`,
      metadata: {
        workflow: 'complete_payment_flow',
        timestamp: new Date().toISOString(),
      },
    });

    if (!addPMResult.ok) {
      logger.error('Failed to add payment method', addPMResult.error);
    } else {
      logger.success('Payment method added', addPMResult.value.data.id);
    }

    // STEP 4: Check Webhook Configuration
    logger.step(4, 'Checking webhook configuration...');

    const listWebhooksResult = await webhooks.list();

    if (!listWebhooksResult.ok) {
      logger.warning('Unable to check webhooks', listWebhooksResult.error);
    } else {
      const activeWebhooks = listWebhooksResult.value.data.filter(w => w.active);
      logger.info('Active webhooks', activeWebhooks.length);

      if (activeWebhooks.length === 0) {
        logger.warning('No active webhooks configured');
        logger.info('Register a webhook:', 'node webhooks/register-webhook.js');
      } else {
        logger.success('Webhook notifications configured');
        activeWebhooks.forEach((wh, index) => {
          console.log(`  ${index + 1}. ${wh.url}`);
          console.log(`     Events: ${wh.events?.join(', ')}`);
        });
      }
    }

    // STEP 5: Final Summary
    logger.section('Payment Flow Summary');

    console.log('\n  ✓ Customer Setup:');
    console.log(`    ID: ${customerId}`);

    console.log('\n  ✓ Payment Methods:');
    const finalPMList = await paymentMethods.list(customerId);
    if (finalPMList.ok) {
      console.log(`    Total: ${finalPMList.value.data.length}`);
      finalPMList.value.data.forEach((pm, index) => {
        console.log(`    ${index + 1}. ${pm.type?.toUpperCase()} - ${pm.status || 'unknown'}`);
      });
    }

    console.log('\n  ✓ Ready for:');
    console.log('    - Processing payments');
    console.log('    - Receiving webhook notifications');
    console.log('    - Managing customer payment methods');

    logger.section('Workflow Complete! 🚀');
    logger.success('Payment infrastructure is ready');

  } catch (error) {
    logger.error('Unexpected error in payment flow', error);
    process.exit(1);
  }
}

main();
