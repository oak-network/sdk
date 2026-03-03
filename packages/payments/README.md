# Oak Payments SDK

A fully-typed TypeScript SDK for the Oak Network Payments API. Drop-in authentication, automatic retries, and zero boilerplate, production-ready from day one.

> Full documentation: [oaknetwork.org/docs/sdk/overview](https://www.oaknetwork.org/docs/sdk/overview)

## Install

```bash
pnpm add @oaknetwork/payments-sdk
```

## Quick start

```typescript
import "dotenv/config";
import {
  createOakClient,
  createCustomerService,
} from "@oaknetwork/payments-sdk";

const client = createOakClient({
  environment: "sandbox",
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

## Resources

- Package: `@oaknetwork/payments-sdk`
- Public folder link: [github.com/oak-network/sdk/tree/main/packages/payments](https://github.com/oak-network/sdk/tree/main/packages/payments)
- Examples: [`./examples`](./examples)
- Security policy: [`../../SECURITY.md`](../../SECURITY.md)
- Root monorepo README: [`../../README.md`](../../README.md)

## Credentials

Request sandbox credentials at [support@oaknetwork.org](mailto:support@oaknetwork.org) and configure:

```bash
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
```
