# Oak SDK Examples

This directory contains comprehensive, modular examples demonstrating how to use the Oak SDK in real-world scenarios.

## 📋 Prerequisites

- Node.js 18+ or compatible runtime
- Oak API credentials (Client ID and Secret)
- Access to Oak sandbox or production environment

## 🚀 Quick Start

### 1. Install Dependencies

From the `packages/payments` directory:

```bash
npm install
npm run build
```

### 2. Configure Environment

Copy the example environment file and add your credentials:

```bash
cd examples
cp .env.example .env
# Edit .env with your CLIENT_ID and CLIENT_SECRET
```

### 3. Run Examples

```bash
# Authentication example
node authentication/get-token.js

# Customer management
node customers/create-customer.js
node customers/list-customers.js

# Payment methods (Stripe bank account)
node payment-methods/add-bank-account.js

# Webhooks
node webhooks/register-webhook.js

# Complete workflows
node workflows/customer-onboarding.js
```

## 📁 Directory Structure

```
examples/
├── common/              # Shared utilities
│   ├── config.js       # SDK configuration helper
│   └── logger.js       # Simple console logger
│
├── authentication/      # OAuth examples
│   └── get-token.js    # Token generation and caching
│
├── customers/          # Customer management
│   ├── create-customer.js
│   ├── list-customers.js
│   ├── get-customer.js
│   └── update-customer.js
│
├── payment-methods/    # Payment method examples (Stripe)
│   ├── add-bank-account.js
│   ├── list-payment-methods.js
│   └── delete-payment-method.js
│
├── webhooks/           # Webhook integration
│   ├── register-webhook.js
│   ├── verify-signature.js
│   └── manage-webhooks.js
│
└── workflows/          # End-to-end scenarios
    ├── complete-payment-flow.js
    └── customer-onboarding.js
```

## 🎯 Example Categories

### Authentication
Learn how to authenticate with the Oak API using OAuth 2.0 client credentials flow.

### Customers
Create, read, update, and list customers with proper error handling.

### Payment Methods
Add and manage Stripe payment methods (e.g. bank accounts) for customers.

### Webhooks
Set up webhook endpoints, verify signatures, and handle webhook events securely.

### Workflows
Complete end-to-end scenarios combining multiple API operations.

## 💡 Best Practices Demonstrated

- ✅ Proper error handling using Result types
- ✅ Environment variable configuration
- ✅ Token caching and reuse
- ✅ Retry logic for transient failures
- ✅ Webhook signature verification
- ✅ Unique identifiers for idempotency
- ✅ Structured logging
- ✅ Type safety with TypeScript-generated types

## 🔒 Security Notes

- **Never commit `.env` files** - Use `.env.example` as a template
- **Keep credentials secure** - Use environment variables, not hardcoded values
- **Verify webhook signatures** - Always validate webhook payloads
- **Use HTTPS in production** - Webhook URLs must use secure connections

## 📚 Additional Resources

- [Oak SDK Documentation](../../README.md)
- [API Reference](https://docs.oak.network/api)
- [Integration Test Examples](../__tests__/integration/)

## 🐛 Troubleshooting

### "Missing required environment variables"
Make sure you've created a `.env` file with `CLIENT_ID` and `CLIENT_SECRET`.

### "Authentication failed"
Verify your credentials are correct and you're using the right environment (sandbox/production).

### "Customer already exists"
Some examples use timestamp-based unique identifiers. If running multiple times rapidly, you may encounter duplicates.

## 🤝 Contributing

Found an issue or want to add a new example? Please open an issue or pull request!
