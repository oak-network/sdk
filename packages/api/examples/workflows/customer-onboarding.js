/**
 * Complete Customer Onboarding Workflow
 *
 * Demonstrates an end-to-end customer onboarding process:
 * 1. Create a new customer
 * 2. Add a payment method (PIX)
 * 3. Verify the setup
 *
 * This workflow shows how to combine multiple SDK operations
 * in a real-world scenario.
 */

const { getOakClient } = require('../common/config');
const { Crowdsplit } = require('../../dist/products/crowdsplit');
const logger = require('../common/logger');

async function main() {
  logger.section('Customer Onboarding Workflow');

  try {
    const client = getOakClient();
    const { customers, paymentMethods } = Crowdsplit(client);

    // Generate unique identifiers
    const timestamp = Date.now();
    const email = `customer_${timestamp}@example.com`;
    const documentNumber = `${timestamp}`.padStart(11, '0').substring(0, 11);

    // STEP 1: Create Customer
    logger.step(1, 'Creating new customer account...');

    const customerData = {
      email,
      first_name: 'Alice',
      last_name: 'Johnson',
      document_type: 'personal_tax_id',
      document_number: documentNumber,
      phone_country_code: '+55',
      phone_area_code: '11',
      phone_number: '987654321',
      country_code: 'BR',
    };

    logger.info('Customer info', {
      name: `${customerData.first_name} ${customerData.last_name}`,
      email: customerData.email,
      country: customerData.country_code,
    });

    const createCustomerResult = await customers.create(customerData);

    if (!createCustomerResult.ok) {
      logger.error('Failed to create customer', createCustomerResult.error);
      process.exit(1);
    }

    const customerId = createCustomerResult.value.data.id;
    logger.success(`Customer created successfully! ID: ${customerId}`);

    // STEP 2: Add Payment Method
    logger.step(2, 'Adding PIX payment method...');

    const pixData = {
      type: 'pix',
      pix_string: `${email}`,
      metadata: {
        onboarding_flow: true,
        created_at: new Date().toISOString(),
      },
    };

    const addPaymentResult = await paymentMethods.add(customerId, pixData);

    if (!addPaymentResult.ok) {
      logger.error('Failed to add payment method', addPaymentResult.error);
      logger.warning('Customer created but payment method setup incomplete');
      logger.info('Customer ID to retry:', customerId);
      process.exit(1);
    }

    const paymentMethodId = addPaymentResult.value.data.id;
    logger.success(`Payment method added! ID: ${paymentMethodId}`);

    // STEP 3: Verify Setup
    logger.step(3, 'Verifying customer setup...');

    // Verify customer
    const verifyCustomerResult = await customers.get(customerId);
    if (!verifyCustomerResult.ok) {
      logger.error('Failed to verify customer', verifyCustomerResult.error);
      process.exit(1);
    }

    // Verify payment methods
    const verifyPaymentResult = await paymentMethods.list(customerId);
    if (!verifyPaymentResult.ok) {
      logger.error('Failed to verify payment methods', verifyPaymentResult.error);
      process.exit(1);
    }

    const paymentMethodCount = verifyPaymentResult.value.data.length;
    logger.success('Customer setup verified successfully!');

    // STEP 4: Summary
    logger.section('Onboarding Complete! 🎉');

    console.log('\n  Customer Details:');
    console.log(`    ID: ${customerId}`);
    console.log(`    Name: ${verifyCustomerResult.value.data.first_name} ${verifyCustomerResult.value.data.last_name}`);
    console.log(`    Email: ${verifyCustomerResult.value.data.email}`);
    console.log(`    Country: ${verifyCustomerResult.value.data.country_code}`);

    console.log('\n  Payment Methods:');
    console.log(`    Count: ${paymentMethodCount}`);
    verifyPaymentResult.value.data.forEach((pm, index) => {
      console.log(`    ${index + 1}. ${pm.type?.toUpperCase()} (${pm.id})`);
    });

    console.log('\n  Next Steps:');
    console.log(`    - Customer can now make payments`);
    console.log(`    - Set up webhooks to receive payment notifications`);
    console.log(`    - Add additional payment methods if needed`);

    logger.section('Workflow Summary');
    logger.success('All onboarding steps completed successfully');
    logger.info('Total operations', '3 (create, add payment method, verify)');
    logger.info('Customer ID', customerId);

  } catch (error) {
    logger.error('Unexpected error during onboarding', error);
    process.exit(1);
  }
}

main();
