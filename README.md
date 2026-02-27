# Oak Network SDK

[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/oak-network/sdk/badge)](https://scorecard.dev/viewer/?uri=github.com/oak-network/sdk) [![Codecov](https://codecov.io/github/oak-network/sdk/graph/badge.svg)](https://app.codecov.io/github/oak-network/sdk) [![CodeQL](https://img.shields.io/github/actions/workflow/status/oak-network/sdk/codeql.yml?label=CodeQL&logo=github)](https://github.com/oak-network/sdk/actions/workflows/codeql.yml)

TypeScript SDK for the [Oak Network](https://www.oaknetwork.org/) payment API. Build secure payment applications with type-safe interfaces, a `Result<T, OakError>` error handling pattern, automatic OAuth 2.0 authentication, and built-in retries.

> **Full documentation** — [oaknetwork.org/docs/sdk/api-sdk/overview](https://www.oaknetwork.org/docs/sdk/api-sdk/overview)

---

## Getting credentials

To use the SDK you need a **Client ID** and **Client Secret**. Contact **[support@oaknetwork.org](mailto:support@oaknetwork.org)** to get your sandbox credentials.

Create a `.env` file in your project root:

```bash
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
```

Install `dotenv` to load these automatically: `pnpm add dotenv`, then add `import 'dotenv/config'` at the top of your entry file.

| Variable | Required | Description |
|---|---|---|
| `CLIENT_ID` | Yes | Your merchant client ID |
| `CLIENT_SECRET` | Yes | Your merchant client secret |

> Use different credentials for sandbox and production. Never commit `.env` files or log secrets.

---

## Quick start

### Installation

```bash
pnpm add @oaknetwork/api
# or
npm install @oaknetwork/api
# or
yarn add @oaknetwork/api
```

**Requirements:** Node.js 18+, TypeScript 5.x recommended.

### Basic usage

```typescript
import 'dotenv/config';
import { createOakClient, createCustomerService } from '@oaknetwork/api';

const client = createOakClient({
  environment: 'sandbox',
  clientId: process.env.CLIENT_ID!,
  clientSecret: process.env.CLIENT_SECRET!,
});

const customers = createCustomerService(client);

const result = await customers.list();

if (result.ok) {
  console.log(result.value.data);
} else {
  console.error(result.error.message);
}
```

> See the full [Quickstart guide](https://www.oaknetwork.org/docs/sdk/api-sdk/quickstart) for a step-by-step walkthrough.

---

## Services

The SDK ships 10 service modules. Import the factory function for each service you need.

| Service | Factory | What it does |
|---|---|---|
| [Customers](https://www.oaknetwork.org/docs/sdk/api-sdk/customers) | `createCustomerService(client)` | Create, get, list, update, sync, and check balances |
| [Payments](https://www.oaknetwork.org/docs/sdk/api-sdk/payments) | `createPaymentService(client)` | Create, confirm, cancel payments |
| [Payment Methods](https://www.oaknetwork.org/docs/sdk/api-sdk/payment-methods) | `createPaymentMethodService(client)` | Add, list, get, delete payment methods |
| [Webhooks](https://www.oaknetwork.org/docs/sdk/api-sdk/webhooks) | `createWebhookService(client)` | Register, manage, and monitor webhooks |
| [Transactions](https://www.oaknetwork.org/docs/sdk/api-sdk/transactions) | `createTransactionService(client)` | List, get, and settle transactions |
| [Transfers](https://www.oaknetwork.org/docs/sdk/api-sdk/transfers) | `createTransferService(client)` | Create provider transfers (Stripe, PagarMe, BRLA) |
| [Plans](https://www.oaknetwork.org/docs/sdk/api-sdk/plans) | `createPlanService(client)` | CRUD subscription plans |
| [Refunds](https://www.oaknetwork.org/docs/sdk/api-sdk/refunds) | `createRefundService(client)` | Refund a payment (full or partial) |
| [Buy](https://www.oaknetwork.org/docs/sdk/api-sdk/buy-and-sell) | `createBuyService(client)` | Crypto on-ramp via Bridge |
| [Sell](https://www.oaknetwork.org/docs/sdk/api-sdk/buy-and-sell) | `createSellService(client)` | Crypto off-ramp via Avenia |

---

## Usage examples

### Customers

```typescript
import { createCustomerService } from '@oaknetwork/api';

const customers = createCustomerService(client);

// Create
const result = await customers.create({
  email: 'user@example.com',
  first_name: 'John',
  last_name: 'Doe',
  country_code: 'US',
});

// List
await customers.list({ limit: 10, offset: 0 });

// Get
await customers.get('customer_id');

// Update
await customers.update('customer_id', { email: 'new@example.com' });
```

### Providers

```typescript
import { createProviderService } from '@oaknetwork/api';

const providers = createProviderService(client);

// Register as Stripe customer (buyer)
await providers.submitRegistration(customerId, {
  provider: 'stripe',
  target_role: 'customer',
});

// Register as Stripe connected account (seller)
await providers.submitRegistration(customerId, {
  provider: 'stripe',
  target_role: 'connected_account',
  provider_data: {
    account_type: 'express',
    transfers_requested: true,
    card_payments_requested: true,
    tax_reporting_us_1099_k_requested: false,
    payouts_debit_negative_balances: false,
    external_account_collection_requested: false,
  },
});

// Check registration status
const status = await providers.getRegistrationStatus(customerId);
```

### Payments

```typescript
import { createPaymentService } from '@oaknetwork/api';

const payments = createPaymentService(client);

// Create and capture a payment
const result = await payments.create({
  provider: 'stripe',
  source: {
    amount: 5000,
    currency: 'usd',
    customer: { id: customerId },
    payment_method: { type: 'card', id: paymentMethodId },
    capture_method: 'automatic',
  },
  confirm: true,
});

// Confirm / cancel
await payments.confirm('payment_id');
await payments.cancel('payment_id');
```

### Payment methods

```typescript
import { createPaymentMethodService } from '@oaknetwork/api';

const paymentMethods = createPaymentMethodService(client);

// Add a card
await paymentMethods.add(customerId, {
  type: 'card',
  provider: 'stripe',
});

// Add a bank account
await paymentMethods.add(customerId, {
  type: 'bank',
  provider: 'stripe',
  currency: 'usd',
  bank_name: 'Chase',
  bank_account_number: '000123456789',
  bank_routing_number: '021000021',
  bank_account_type: 'checking',
  bank_account_name: 'John Doe',
});

// List / get / delete
await paymentMethods.list(customerId);
await paymentMethods.get(customerId, 'pm_id');
await paymentMethods.delete(customerId, 'pm_id');
```

### Transfers

```typescript
import { createTransferService } from '@oaknetwork/api';

const transfers = createTransferService(client);

await transfers.create({
  provider: 'stripe',
  source: {
    amount: 1000,
    currency: 'usd',
    customer: { id: customerId },
  },
  destination: {
    customer: { id: customerId },
    payment_method: { type: 'bank', id: bankPmId },
  },
});
```

### Refunds

```typescript
import { createRefundService } from '@oaknetwork/api';

const refunds = createRefundService(client);

// Full refund
await refunds.create(paymentId, {});

// Partial refund
await refunds.create(paymentId, { amount: 500 });
```

### Plans

```typescript
import { createPlanService } from '@oaknetwork/api';

const plans = createPlanService(client);

await plans.create({
  name: 'Pro Plan',
  amount: 2999,
  currency: 'USD',
  interval: 'monthly',
});

await plans.list();
await plans.get('plan_id');
```

### Transactions

```typescript
import { createTransactionService } from '@oaknetwork/api';

const transactions = createTransactionService(client);

await transactions.list({ limit: 20 });
await transactions.get('txn_id');
```

---

## Webhooks

Register endpoints to receive real-time event notifications, and verify incoming payloads with HMAC-SHA256 signature verification.

```typescript
import {
  createWebhookService,
  verifyWebhookSignature,
  parseWebhookPayload,
} from '@oaknetwork/api';

const webhooks = createWebhookService(client);

// Register
const wh = await webhooks.register({
  url: 'https://your-server.com/webhooks/oak',
  description: 'Payment events',
});

if (wh.ok) {
  console.log('Secret:', wh.value.data.secret); // store securely
}

// List / update / delete
await webhooks.list();
await webhooks.update('webhook_id', { url: 'https://new-url.com/webhooks' });
await webhooks.toggleStatus('webhook_id', 'inactive');
await webhooks.delete('webhook_id');
```

### Verify and parse incoming events

```typescript
import { parseWebhookPayload } from '@oaknetwork/api';
import express from 'express';

const app = express();

app.post('/webhooks/oak', express.raw({ type: 'application/json' }), (req, res) => {
  const result = parseWebhookPayload(
    req.body.toString(),
    req.headers['x-oak-signature'] as string,
    process.env.WEBHOOK_SECRET!,
  );

  if (!result.ok) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  switch (result.value.event) {
    case 'payment.succeeded':
      break;
    case 'payment.failed':
      break;
    case 'provider_registration.approved':
      break;
  }

  res.json({ received: true });
});
```

> Full webhook reference — [oaknetwork.org/docs/sdk/api-sdk/webhooks](https://www.oaknetwork.org/docs/sdk/api-sdk/webhooks)

---

## Error handling

Every method returns `Result<T, OakError>` — no uncaught exceptions. Check `result.ok` to branch on success or failure.

```typescript
const result = await customers.create({ email: 'user@example.com', first_name: 'John' });

if (result.ok) {
  const customer = result.value.data;
  console.log('Created:', customer.id);
} else {
  console.error('Failed:', result.error.message);
  console.error('Status:', result.error.statusCode);
  console.error('Code:', result.error.code);
}
```

| Error type | Description |
|---|---|
| `ApiError` | HTTP errors from the API (4xx, 5xx) |
| `NetworkError` | Network failures, timeouts |
| `ParseError` | Invalid JSON responses |
| `AbortError` | Request aborted |
| `EnvironmentViolationError` | Sandbox-only method called in production |

> Full error handling guide — [oaknetwork.org/docs/sdk/api-sdk/error-handling](https://www.oaknetwork.org/docs/sdk/api-sdk/error-handling)

---

## Configuration

### Environments

| Environment | API Base URL | Description |
|---|---|---|
| `sandbox` | `https://api-stage.usecrowdpay.xyz` | Testing — all operations allowed |
| `production` | `https://app.usecrowdpay.xyz` | Live — test operations blocked |

```typescript
const client = createOakClient({
  environment: 'sandbox',
  clientId: process.env.CLIENT_ID!,
  clientSecret: process.env.CLIENT_SECRET!,

  // Optional: point to a custom API server
  customUrl: 'https://my-dev-server.example.com',
});
```

### Retry configuration

The SDK automatically retries failed requests with exponential backoff and jitter.

```typescript
const client = createOakClient({
  environment: 'sandbox',
  clientId: process.env.CLIENT_ID!,
  clientSecret: process.env.CLIENT_SECRET!,
  retryOptions: {
    maxNumberOfRetries: 3,
    delay: 1000,
    backoffFactor: 2,
    maxDelay: 30000,
  },
});
```

Retried status codes: `408`, `429`, `500`, `502`, `503`, `504`.

---

## TypeScript support

The SDK ships full type declarations. All service methods, request payloads, and responses are typed.

```typescript
import type { Result } from '@oaknetwork/api';
```

---

## Development

### Package manager

This project uses **pnpm** exclusively:

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm test             # Run tests
pnpm lint             # Lint code
```

**Do not** use npm or yarn. The repository enforces pnpm >= 10.0.0.

### Running tests

```bash
pnpm test:unit          # Unit tests
pnpm test:integration   # Integration tests (requires credentials)
pnpm test:all           # All tests with coverage
pnpm test:watch         # Watch mode
```

### Changesets workflow

We use Changesets to manage versions and changelogs:

1. After making changes, run `pnpm changeset`
2. Select impact (Major / Minor / Patch) for affected packages
3. Commit the generated file in `.changeset/`
4. CI automatically calculates versions, generates changelogs, and creates a release PR

### Code coverage

Coverage is reported to [Codecov](https://about.codecov.io) after each successful CI run.

### Development guidelines

See [CLAUDE.md](./CLAUDE.md) for coding standards including architecture principles, security rules, testing requirements, and anti-patterns.

### Code review checklist

- [ ] `pnpm build` succeeds
- [ ] `pnpm test` passes with >90% coverage
- [ ] `pnpm lint` has no errors
- [ ] Changeset created with `pnpm changeset`
- [ ] Documentation updated if needed

---

## Documentation

- **Full docs** — [oaknetwork.org/docs/sdk/api-sdk/overview](https://www.oaknetwork.org/docs/sdk/api-sdk/overview)
- **Quickstart** — [oaknetwork.org/docs/sdk/api-sdk/quickstart](https://www.oaknetwork.org/docs/sdk/api-sdk/quickstart)
- **API package README** — [packages/api/README.md](./packages/api/README.md)
- **Changelog** — [CHANGELOG.md](./CHANGELOG.md)
---

## License

[MIT](LICENSE)

## Security

[Security Policy](SECURITY.md)

## Links

- [Oak Network](https://www.oaknetwork.org/)
- [Documentation](https://www.oaknetwork.org/docs/sdk/api-sdk/overview)
- [GitHub](https://github.com/oak-network/sdk)
- [Issues](https://github.com/oak-network/sdk/issues)
- [npm](https://www.npmjs.com/package/@oaknetwork/api)

---

**Questions?** Open an issue or contact [support@oaknetwork.org](mailto:support@oaknetwork.org)
