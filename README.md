# Oak SDK Monorepo

> **Status**: Pre-launch development (Expected launch: March 2026)

TypeScript SDK for the Oak Network Crowdsplit API. Build secure payment applications with type-safe interfaces, comprehensive error handling, and OAuth 2.0 authentication.

---

## 📦 Packages

- **[@oaknetwork/api](./packages/api)** - Core SDK for Crowdsplit API
- **@oaknetwork/contracts** - Smart contracts (placeholder, not in active development)

---

## 🚀 Quick Start

### Installation

```bash
pnpm add @oaknetwork/api
# or
npm install @oaknetwork/api
# or
yarn add @oaknetwork/api
```

### Basic Usage

```typescript
import { createOakClient } from "@oaknetwork/api";
import { Crowdsplit } from "@oaknetwork/api/products/crowdsplit";

// Create client
const client = createOakClient({
  environment: "sandbox", // or "production"
  clientId: process.env.OAK_CLIENT_ID,
  clientSecret: process.env.OAK_CLIENT_SECRET,
});

// Initialize Crowdsplit product
const crowdsplit = Crowdsplit(client);

// Create a customer
const customerResult = await crowdsplit.customers.create({
  email: "user@example.com",
  first_name: "John",
  last_name: "Doe",
});

if (customerResult.ok) {
  console.log("Customer created:", customerResult.value.data.customer_id);
} else {
  console.error("Error:", customerResult.error.message);
}
```

---

## 🔐 Authentication

The SDK uses OAuth 2.0 client credentials flow with automatic token management.

```typescript
// Tokens are automatically fetched and cached
const result = await crowdsplit.customers.list();

// Manual token operations (rarely needed)
const tokenResult = await client.getAccessToken();
if (tokenResult.ok) {
  console.log("Token:", tokenResult.value);
}
```

**Security Best Practices:**

- ✅ Store credentials in environment variables
- ✅ Never commit `.env` files
- ✅ Use different credentials for sandbox and production
- ❌ Never log `clientSecret` or access tokens

---

## 📡 Available Services

### Customers

```typescript
// Create customer
await crowdsplit.customers.create({
  email: "user@example.com",
  first_name: "John",
  document_type: "personal_tax_id",
  document_number: "123456789",
});

// Get customer
await crowdsplit.customers.get("customer_id");

// List customers
await crowdsplit.customers.list({ limit: 10, offset: 0 });

// Update customer
await crowdsplit.customers.update("customer_id", {
  email: "newemail@example.com",
});
```

### Payments

```typescript
// Create payment
await crowdsplit.payments.create({
  provider: "stripe",
  source: {
    amount: 1000, // Amount in cents
    currency: "usd",
    customer: { id: "customer_id" },
    payment_method: { type: "card", id: "pm_123" },
    capture_method: "automatic",
  },
  confirm: true,
});

// Confirm payment
await crowdsplit.payments.confirm("payment_id");

// Cancel payment
await crowdsplit.payments.cancel("payment_id");
```

### Payment Methods

```typescript
// Create payment method
await crowdsplit.paymentMethods.create("customer_id", {
  type: "card",
  provider: "stripe",
  provider_data: {
    token: "tok_visa",
  },
});

// List customer payment methods
await crowdsplit.paymentMethods.list("customer_id");

// Delete payment method
await crowdsplit.paymentMethods.delete("customer_id", "pm_id");
```

### Refunds

```typescript
// Create refund
await crowdsplit.refunds.create({
  transaction_id: "txn_123",
  amount: 500, // Partial refund
  reason: "customer_request",
});
```

### Transfers

```typescript
// Create transfer
await crowdsplit.transfers.create({
  provider: "stripe",
  source: {
    amount: 1000,
    currency: "usd",
    customer: { id: "customer_id" },
  },
  destination: {
    customer: { id: "customer_id" },
    payment_method: { id: "pm_123", type: "bank" },
  },
});
```

### Webhooks

```typescript
// Register webhook
await crowdsplit.webhooks.register({
  url: "https://your-app.com/webhooks/oak",
  events: ["payment.created", "payment.succeeded"],
});

// List webhooks
await crowdsplit.webhooks.list();

// Update webhook
await crowdsplit.webhooks.update("webhook_id", {
  url: "https://your-app.com/webhooks/oak-v2",
});

// Toggle webhook status
await crowdsplit.webhooks.toggleStatus("webhook_id", "inactive");

// Delete webhook
await crowdsplit.webhooks.delete("webhook_id");
```

### Providers

```typescript
// List available providers
await crowdsplit.providers.list();

// Get provider details
await crowdsplit.providers.get("stripe");
```

### Plans

```typescript
// List plans
await crowdsplit.plans.list();

// Get plan details
await crowdsplit.plans.get("plan_id");
```

### Transactions

```typescript
// List transactions
await crowdsplit.transactions.list({
  limit: 20,
  offset: 0,
});

// Get transaction details
await crowdsplit.transactions.get("txn_id");
```

---

## 🔔 Webhook Verification

**New in v0.2.0**: Secure webhook signature verification using HMAC-SHA256 with timing-safe comparison.

### Express.js Example

```typescript
import express from "express";
import { verifyWebhookSignature, parseWebhookPayload } from "@oaknetwork/api";

const app = express();
app.use(express.json());

app.post("/webhooks/oak", async (req, res) => {
  const signature = req.headers["x-oak-signature"] as string;
  const payload = JSON.stringify(req.body);

  // Option 1: Verify signature only
  const isValid = verifyWebhookSignature(
    payload,
    signature,
    process.env.WEBHOOK_SECRET!,
  );

  if (!isValid) {
    return res.status(401).send("Invalid signature");
  }

  const event = req.body;
  console.log("Webhook event:", event.type);

  // Option 2: Verify and parse in one step (preferred)
  const result = parseWebhookPayload<{
    type: string;
    data: unknown;
  }>(payload, signature, process.env.WEBHOOK_SECRET!);

  if (!result.ok) {
    console.error("Webhook verification failed:", result.error.message);
    return res.status(401).send(result.error.message);
  }

  // Handle verified event
  const verifiedEvent = result.value;
  switch (verifiedEvent.type) {
    case "payment.created":
      // Handle payment created
      break;
    case "payment.succeeded":
      // Handle payment succeeded
      break;
    default:
      console.log("Unhandled event:", verifiedEvent.type);
  }

  res.sendStatus(200);
});
```

### Next.js API Route Example

```typescript
import type { NextApiRequest, NextApiResponse } from "next";
import { parseWebhookPayload } from "@oaknetwork/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const signature = req.headers["x-oak-signature"] as string;
  const payload = JSON.stringify(req.body);

  const result = parseWebhookPayload(
    payload,
    signature,
    process.env.WEBHOOK_SECRET!,
  );

  if (!result.ok) {
    return res.status(401).json({ error: result.error.message });
  }

  // Process verified webhook
  const event = result.value;
  console.log("Received:", event);

  res.status(200).json({ received: true });
}
```

**Security Notes:**

- Always verify signatures before processing webhooks
- Use timing-safe comparison (built into SDK)
- Store webhook secret securely (environment variables)
- Never expose webhook endpoints without verification

---

## 🎯 Error Handling

The SDK uses a `Result` type pattern for predictable error handling:

```typescript
const result = await crowdsplit.customers.create(customerData);

if (result.ok) {
  // Success - result.value contains the response
  const customer = result.value.data;
  console.log("Created:", customer.customer_id);
} else {
  // Error - result.error contains the OakError
  console.error("Failed:", result.error.message);
  console.error("Status:", result.error.statusCode);
  console.error("Code:", result.error.code);
}
```

### Error Types

- `ApiError` - HTTP errors from the API (4xx, 5xx)
- `NetworkError` - Network failures, timeouts
- `ParseError` - Invalid JSON responses
- `AbortError` - Request aborted
- `OakError` - Base error class

---

## ⚙️ Configuration

### Environment Options

```typescript
type OakEnvironment = "sandbox" | "production" | "custom";

createOakClient({
  environment: "sandbox", // Use sandbox for testing
  clientId: "your_client_id",
  clientSecret: "your_client_secret",

  // Optional: Custom URL for development
  customUrl: "http://localhost:3000",

  // Optional: Retry configuration
  retryOptions: {
    maxNumberOfRetries: 3,
    delay: 1000,
    backoffFactor: 2,
    maxDelay: 30000,
  },
});
```

### Retry Configuration

The SDK automatically retries failed requests with exponential backoff:

- **Retry on**: 408, 429, 500, 502, 503, 504
- **Max retries**: 3 (configurable)
- **Backoff**: Exponential with jitter to prevent thundering herd

```typescript
retryOptions: {
  maxNumberOfRetries: 3,     // Number of retry attempts
  delay: 1000,                // Initial delay in ms
  backoffFactor: 2,           // Multiplier for each retry
  maxDelay: 30000,            // Maximum delay cap
  retryOnStatus: [408, 429, 500, 502, 503, 504],
  retryOnError: (error) => error.isNetworkError,
}
```

---

## 📝 TypeScript Support

The SDK is written in TypeScript with full type definitions:

```typescript
import type {
  Customer,
  Payment,
  PaymentMethod,
  Transaction,
  Transfer,
  Result,
} from "@oaknetwork/api";

// Type-safe customer creation
const customerData: Customer.Request = {
  email: "user@example.com",
  first_name: "John",
};

// Type-safe result handling
const result: Result<Customer.Response> = await crowdsplit.customers.create(
  customerData,
);

if (result.ok) {
  const customer: Customer.Data = result.value.data;
}
```

---

## 🔄 Migration Guide (v0.1 → v0.2)

### Breaking Changes

#### 1. `clientSecret` No Longer Exposed

**Before (v0.1):**

```typescript
console.log(client.config.clientSecret); // ✅ Works in v0.1
```

**After (v0.2):**

```typescript
console.log(client.config.clientSecret); // ❌ undefined in v0.2
// Store separately if needed:
const secret = process.env.CLIENT_SECRET;
```

#### 2. `createAuthService()` Removed

**Before (v0.1):**

```typescript
import { createAuthService } from "@oaknetwork/api";
const auth = createAuthService(client);
await auth.getAccessToken();
```

**After (v0.2):**

```typescript
// Use client directly
await client.getAccessToken();
```

See [CHANGELOG.md](./CHANGELOG.md) for full migration guide.

---

## 🛠️ Development

### Package Manager

This project uses **pnpm** exclusively:

```bash
pnpm install          # Install dependencies
pnpm build           # Build all packages
pnpm test            # Run tests
pnpm lint            # Lint code
```

**DO NOT** use npm or yarn. The repository enforces pnpm >= 10.0.0.

### Changesets Workflow

We use Changesets to manage versions and changelogs:

1. **After making changes**, run:

   ```bash
   pnpm changeset
   ```

2. **Select impact** (Major/Minor/Patch) for affected packages

3. **Commit** the generated file in `.changeset/`

4. **CI automatically**:
   - Calculates next versions
   - Generates changelogs
   - Creates release PR

### Running Tests

```bash
# Unit tests
pnpm test:unit

# Integration tests (requires credentials)
pnpm test:integration

# All tests with coverage
pnpm test:all

# Watch mode
pnpm test:watch
```

### Environment Variables for Testing

Create `.env` file in `packages/api`:

```env
CLIENT_ID=your_sandbox_client_id
CLIENT_SECRET=your_sandbox_client_secret
OAK_ENVIRONMENT=sandbox
```

---

## 📖 Documentation

- **API Reference**: See [packages/api/README.md](./packages/api/README.md)
- **Type Definitions**: Included with package, supports IDE autocomplete
- **Examples**: See [examples/](./examples/) directory (coming soon)
- **Changelog**: See [CHANGELOG.md](./CHANGELOG.md)

---

### Development Guidelines

See [CLAUDE.md](./CLAUDE.md) for comprehensive coding standards including:

- Architecture principles (Result types, factory pattern)
- Security rules (never expose secrets, timing-safe comparisons)
- Testing requirements (no silent skips, >90% coverage)
- Type system rules (use `unknown`, named interfaces)
- Anti-patterns to avoid

### Code Review Checklist

Before submitting PR:

- [ ] Run `pnpm build` successfully
- [ ] Run `pnpm test` with >90% coverage
- [ ] Run `pnpm lint` without errors
- [ ] Create changeset with `pnpm changeset`
- [ ] Update documentation if needed
- [ ] Follow patterns in [CLAUDE.md](./CLAUDE.md)

---

## 📄 License

MIT

---

## 🔗 Links

- [Oak Network Website](https://oaknetwork.org)
- [API Documentation](https://www.oaknetwork.org/docs/intro)
- [GitHub Repository](https://github.com/oak-network/sdk)
- [Issue Tracker](https://github.com/oak-network/sdk/issues)
- [npm Package](https://www.npmjs.com/package/@oaknetwork/api)

---

## 🎯 Roadmap

**Pre-Launch (Current → March 2026)**

- ✅ Core API services implemented
- ✅ Comprehensive type safety
- ✅ Webhook verification utilities
- ✅ Full test coverage
- ⏳ Production hardening
- ⏳ Performance optimization
- ⏳ Example applications

**Post-Launch**

- Advanced retry strategies
- Request/response middleware
- CLI tools
- TBD (Being evaluated based on user feedback)

---

**Questions?** Open an issue or contact support@oaknetwork.org
