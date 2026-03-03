# Oak Payments SDK

TypeScript SDK for the Oak payments API.
Build secure payment applications with type-safe interfaces, `Result<T, OakError>`-based error handling, automatic OAuth 2.0 authentication, and retry support.

> Full documentation: [oaknetwork.org/docs/sdk/api-sdk/overview](https://www.oaknetwork.org/docs/sdk/api-sdk/overview)

## Install

```bash
pnpm add @oaknetwork/api
```

## Quick start

```typescript
import "dotenv/config";
import { createOakClient, createCustomerService } from "@oaknetwork/api";

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

- Package: `@oaknetwork/api`
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
