/**
 * Webhook Signature Verification Example
 *
 * Demonstrates how to verify webhook signatures to ensure
 * the payload is authentic and hasn't been tampered with.
 */

const { verifyWebhookSignature, parseWebhookPayload } = require('../../dist/utils/webhookVerification');
const logger = require('../common/logger');
const crypto = require('crypto');

async function main() {
  logger.section('Webhook Signature Verification Example');

  // Example webhook data (simulating what Oak API would send)
  const webhookSecret = 'your_webhook_secret_here';
  const payload = JSON.stringify({
    event: 'payment.completed',
    data: {
      payment_id: 'pay_123456',
      amount: 100.00,
      currency: 'USD',
      customer_id: 'cus_789',
      status: 'completed',
      timestamp: new Date().toISOString(),
    },
  });

  // Generate a valid signature (Oak API would send this in the header)
  const validSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  logger.step(1, 'Testing valid webhook signature...');
  logger.info('Payload', JSON.parse(payload));
  logger.info('Signature (first 20 chars)', validSignature.substring(0, 20) + '...');

  const isValid = verifyWebhookSignature(payload, validSignature, webhookSecret);

  if (isValid) {
    logger.success('✓ Signature is valid - webhook is authentic');
  } else {
    logger.error('✗ Signature is invalid - webhook may be forged');
  }

  // Example 2: Invalid signature
  logger.step(2, 'Testing invalid webhook signature...');
  const invalidSignature = 'invalid_signature_12345';

  const isInvalid = verifyWebhookSignature(payload, invalidSignature, webhookSecret);

  if (!isInvalid) {
    logger.success('✓ Correctly rejected invalid signature');
  } else {
    logger.error('✗ Incorrectly accepted invalid signature');
  }

  // Example 3: Parse and verify in one step
  logger.step(3, 'Using parseWebhookPayload (verify + parse)...');

  const parseResult = parseWebhookPayload(payload, validSignature, webhookSecret);

  if (parseResult.ok) {
    logger.success('Webhook payload verified and parsed successfully');
    logger.info('Parsed event', parseResult.value);
  } else {
    logger.error('Failed to verify/parse webhook', parseResult.error);
  }

  // Example 4: Real-world Express.js webhook endpoint
  logger.section('Example: Express.js Webhook Endpoint');

  console.log(`
const express = require('express');
const { parseWebhookPayload } = require('@oaknetwork/api');

const app = express();

app.post('/webhooks/oak', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-oak-signature']; // Check actual header name
  const payload = req.body.toString();
  const secret = process.env.WEBHOOK_SECRET;

  const result = parseWebhookPayload(payload, signature, secret);

  if (!result.ok) {
    console.error('Invalid webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Handle the event
  const event = result.value;
  console.log('Received event:', event.event);

  switch (event.event) {
    case 'payment.completed':
      // Handle payment completion
      break;
    case 'payment.failed':
      // Handle payment failure
      break;
    default:
      console.log('Unhandled event type:', event.event);
  }

  res.json({ received: true });
});

app.listen(3000);
  `);

  logger.section('Security Best Practices');
  console.log('  ✓ Always verify signatures before processing webhooks');
  console.log('  ✓ Use timing-safe comparison (built into verifyWebhookSignature)');
  console.log('  ✓ Store webhook secrets in environment variables');
  console.log('  ✓ Use HTTPS for webhook endpoints in production');
  console.log('  ✓ Validate payload structure before using data');
  console.log('  ✓ Implement idempotency using event IDs');

}

main();
