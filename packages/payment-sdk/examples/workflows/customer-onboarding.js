/**
 * Customer Onboarding Workflow (Stripe)
 *
 * Resolves a customer from list or creates one with email only (same as integration test).
 * 1. Resolve or create customer
 * 2. Verify the setup
 */

const { getOakClient, resolveOrCreateCustomerId } = require('../common/config');
const { Crowdsplit } = require('../../dist/products/crowdsplit');
const logger = require('../common/logger');

async function main() {
  logger.section('Customer Onboarding Workflow');

  try {
    const client = getOakClient();
    const { customers, paymentMethods } = Crowdsplit(client);

    logger.step(1, 'Resolving or creating customer...');
    const { customerId, created, email: createdEmail } = await resolveOrCreateCustomerId(customers);
    if (created) {
      logger.success(`Created new customer (email only): ${customerId}`);
      logger.info('Email', createdEmail);
    } else {
      logger.success(`Using existing customer: ${customerId}`);
    }

    logger.step(2, 'Verifying setup...');

    const verifyCustomer = await customers.get(customerId);
    if (!verifyCustomer.ok) {
      logger.error('Failed to verify customer', verifyCustomer.error);
      process.exit(1);
    }

    const verifyPM = await paymentMethods.list(customerId);
    if (!verifyPM.ok) {
      logger.error('Failed to list payment methods', verifyPM.error);
      process.exit(1);
    }

    logger.success('Customer setup verified!');

    logger.section('Onboarding Complete');
    console.log('\n  Customer:');
    console.log(`    ID: ${customerId}`);
    console.log(`    Email: ${verifyCustomer.value.data.email}`);
    console.log('\n  Payment methods:', verifyPM.value.data.length);
    console.log('\n  Next: add a Stripe bank account (add-bank-account.js), set up webhooks.');
  } catch (error) {
    logger.error('Unexpected error during onboarding', error);
    process.exit(1);
  }
}

main();
