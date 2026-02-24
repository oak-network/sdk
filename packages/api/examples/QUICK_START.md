# Quick Start Guide - Oak SDK Examples

## Setup (One-time)

1. **Build the SDK** (from `packages/api` directory):
   ```bash
   npm run build
   ```

2. **Configure your environment**:
   ```bash
   cd examples
   cp .env.example .env
   # Edit .env and add your CLIENT_ID and CLIENT_SECRET
   ```

## Running Examples

All commands should be run from the `examples/` directory:

```bash
cd examples
```

### Authentication
```bash
# Test OAuth authentication
node authentication/get-token.js
```

### Customer Management
```bash
# Create a new customer
node customers/create-customer.js

# List all customers
node customers/list-customers.js

# Get specific customer details
node customers/get-customer.js

# Update customer information
node customers/update-customer.js
```

### Payment Methods (Stripe)
```bash
# Add Stripe bank account (requires Stripe connected account setup)
node payment-methods/add-bank-account.js

# List all payment methods for a customer
node payment-methods/list-payment-methods.js

# Delete a payment method
node payment-methods/delete-payment-method.js [payment_method_id]
```

### Webhooks
```bash
# Register a webhook endpoint
node webhooks/register-webhook.js

# Test webhook signature verification
node webhooks/verify-signature.js

# Manage webhooks (list, update, toggle, delete)
node webhooks/manage-webhooks.js
```

### Complete Workflows
```bash
# Complete customer onboarding flow
node workflows/customer-onboarding.js

# Complete payment setup flow
node workflows/complete-payment-flow.js
```

## Tips for Manual Testing

### Using Environment Variables

Set `PAYMENT_CUSTOMER_ID` in your `.env` file to reuse the same customer across tests:

```bash
# After creating a customer, add the ID to .env:
PAYMENT_CUSTOMER_ID=your-customer-id-here
```

This prevents creating duplicate customers when testing payment methods.

### Command-Line Arguments

Some examples accept arguments:

```bash
# Delete specific payment method
node payment-methods/delete-payment-method.js pm_abc123
```

### Cleanup

To avoid cluttering your sandbox environment:

1. **Delete test payment methods** after experimenting
2. **Deactivate test webhooks** instead of deleting (can be reactivated)
3. **Use consistent naming** with timestamps for easy identification

## Example Output

When running examples, you'll see color-coded output:

- 🟢 **Green (✓)**: Success messages
- 🔴 **Red (✗)**: Error messages
- 🔵 **Blue (ℹ)**: Informational messages
- 🟡 **Yellow (⚠)**: Warning messages

## Troubleshooting

### "Missing required environment variables"
- Make sure you've created `.env` file in the `examples/` directory
- Verify `CLIENT_ID` and `CLIENT_SECRET` are set

### "Authentication failed" or "HTTP error 404"
- Check that `BASE_URL` doesn't have a trailing slash
- Verify your credentials are correct
- Ensure you're using the right environment (sandbox/production)

### "Customer not found"
- Update `PAYMENT_CUSTOMER_ID` in `.env` with a valid customer ID
- Run `node customers/list-customers.js` to get valid IDs

### "Payment method creation failed"
- Bank accounts require Stripe connected account setup
- Ensure Stripe connected account is set up for bank account payment methods

## Next Steps

After running the examples:

1. Integrate the patterns into your application
2. Read the [full SDK documentation](../README.md)
3. Check the [integration tests](../__tests__/integration/) for more examples
4. Review [CLAUDE.md](../CLAUDE.md) for development best practices
