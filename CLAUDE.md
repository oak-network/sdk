# Oak SDK - AI Development Guidelines

**Last Updated:** February 2026
**Status:** Pre-launch SDK (March 2026)

This document provides strict rules and standards for AI assistants (Claude Code, Cursor, etc.) working on the Oak SDK codebase. Following these guidelines is **mandatory** to maintain code quality, security, and architectural consistency.

---

## Table of Contents

1. [Architecture Principles](#architecture-principles)
2. [Code Standards](#code-standards)
3. [Security Rules](#security-rules)
4. [Testing Requirements](#testing-requirements)
5. [Anti-Patterns](#anti-patterns)
6. [Refactoring Guidelines](#refactoring-guidelines)
7. [Git Workflow](#git-workflow)
8. [Performance](#performance)
9. [Type System Rules](#type-system-rules)
10. [Documentation](#documentation)

---

## Architecture Principles

### Core Patterns (DO NOT BREAK)

#### 1. Result Type Pattern

**ALWAYS** use the `Result<T, E>` type for operations that can fail.

```typescript
// ✅ CORRECT
async function getCustomer(id: string): Promise<Result<Customer.Response>> {
  return withAuth(client, (token) =>
    httpClient.get<Customer.Response>(url, config),
  );
}

// ❌ WRONG - Never throw errors from service methods
async function getCustomer(id: string): Promise<Customer.Response> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(); // NO!
  return response.json();
}
```

#### 2. Factory Pattern for Services

All services use factory functions, not classes:

```typescript
// ✅ CORRECT
export const createCustomerService = (client: OakClient): CustomerService => ({
  create: (data) => {
    /* ... */
  },
  get: (id) => {
    /* ... */
  },
});

// ❌ WRONG - Don't use classes for services
export class CustomerService {
  constructor(private client: OakClient) {}
}
```

#### 3. Clean Separation of Concerns

- **Services** (`src/services/`): Business logic, API calls
- **HTTP Client** (`src/utils/httpClient.ts`): Low-level HTTP operations
- **Auth Manager** (`src/authManager.ts`): Token management, OAuth flow
- **Types** (`src/types/`): Type definitions only, no logic
- **Utils** (`src/utils/`): Pure helper functions

**NEVER** mix concerns (e.g., don't put HTTP logic in services, don't put business logic in HTTP client).

---

## Code Standards

### TypeScript Strict Mode

- **ALWAYS** use TypeScript strict mode
- **NEVER** use `any` type - use `unknown` instead
- **ALWAYS** provide explicit return types for exported functions
- **ALWAYS** use named interfaces instead of `ReturnType<typeof>`

```typescript
// ✅ CORRECT
function processData(data: unknown): Result<ProcessedData> {
  // Type guard to narrow unknown
  if (!isValidData(data)) {
    return err(new ValidationError());
  }
  return ok(transformData(data));
}

// ❌ WRONG
function processData(data: any): any {
  return transformData(data);
}
```

### Type System Best Practices

1. **Use `unknown` over `any`**:

   ```typescript
   // ✅ CORRECT
   catch (error: unknown) {
     const status = (error as { status?: number })?.status;
   }

   // ❌ WRONG
   catch (error: any) {
     const status = error.status;
   }
   ```

2. **Named Interfaces over Intersection Types**:

   ```typescript
   // ✅ CORRECT
   export interface Transaction {
     provider: string;
     source: Source;
     id: string;
     status: string;
     created_at: string;
   }

   // ❌ WRONG
   export type Transaction = Request & {
     id: string;
     status: string;
   };
   ```

3. **Direct Interface Imports over ReturnType**:

   ```typescript
   // ✅ CORRECT
   export interface CrowdsplitProduct {
     customers: CustomerService;
     payments: PaymentService;
   }

   // ❌ WRONG
   export interface CrowdsplitProduct {
     customers: ReturnType<typeof createCustomerService>;
   }
   ```

### JSDoc Requirements

- **ALWAYS** add JSDoc to exported functions and types
- **ALWAYS** document parameters with `@param`
- **ALWAYS** document return types with `@returns`
- **ALWAYS** provide usage examples for complex utilities

````typescript
/**
 * Creates a new customer in the system.
 *
 * @param customer - Customer data to create
 * @returns Result containing created customer or error
 *
 * @example
 * ```typescript
 * const result = await customerService.create({
 *   email: "user@example.com",
 *   first_name: "John",
 * });
 * if (result.ok) {
 *   console.log(result.value.customer_id);
 * }
 * ```
 */
create(customer: Customer.Request): Promise<Result<Customer.Response>>;
````

---

## Security Rules

### Critical Security Requirements

1. **NEVER expose secrets in public API**:

   ```typescript
   // ✅ CORRECT - clientSecret only in private config
   export interface PublicOakClientConfig {
     environment: OakEnvironment;
     clientId: string;
     baseUrl: string;
     // NO clientSecret here
   }

   // ❌ WRONG - Exposes secret through logging
   export interface OakClient {
     config: { clientSecret: string }; // Dangerous!
   }
   ```

2. **ALWAYS validate inputs at boundaries**:

   ```typescript
   // ✅ CORRECT
   if (!isValidEmail(customer.email)) {
     return err(new ValidationError("Invalid email"));
   }
   ```

3. **ALWAYS use timing-safe comparisons for secrets**:

   ```typescript
   import { timingSafeEqual } from "crypto";

   // ✅ CORRECT
   return timingSafeEqual(
     Buffer.from(signature),
     Buffer.from(expectedSignature),
   );

   // ❌ WRONG - Vulnerable to timing attacks
   return signature === expectedSignature;
   ```

4. **NEVER log sensitive data**:

   - No passwords, tokens, or API keys in logs
   - Sanitize error messages before logging
   - Use structured logging with sensitive field filtering

5. **ALWAYS handle token expiration correctly**:

   ```typescript
   // ✅ CORRECT - OAuth expires_in is in SECONDS
   this.tokenExpiration = Date.now() + response.value.expires_in * 1000;

   // ❌ WRONG - Date.now() is milliseconds, expires_in is seconds
   this.tokenExpiration = Date.now() + response.value.expires_in;
   ```

---

## Testing Requirements

### Unit Tests

**ALWAYS** write unit tests for:

- New utility functions
- Complex business logic
- Error handling paths
- Type guards and validators

```typescript
describe("withAuth", () => {
  it("should execute operation with valid token", async () => {
    // Arrange
    const mockClient = createTestClient();
    jest.spyOn(mockClient, "getAccessToken").mockResolvedValue(ok("token"));

    // Act
    const result = await withAuth(mockClient, (token) =>
      ok({ data: "success" }),
    );

    // Assert
    expect(result.ok).toBe(true);
  });
});
```

### Integration Tests

- **NEVER** use silent test skips
- **ALWAYS** throw explicit errors when prerequisites are missing

```typescript
// ✅ CORRECT
it("should get customer", async () => {
  if (!customerId) {
    throw new Error("customerId not available - prerequisite test failed");
  }
  const result = await customerService.get(customerId);
  expect(result.ok).toBe(true);
});

// ❌ WRONG - Test passes silently even when skipped
it("should get customer", async () => {
  if (!customerId) {
    console.warn("Skipping test");
    return; // Test shows as passed!
  }
});
```

### Test Coverage

- Maintain **>90% code coverage**
- **100% coverage** for critical paths (auth, payment processing)
- Test both success and error paths

---

## Anti-Patterns

### What NOT to Do

#### 1. Token Fetch Duplication ❌

**BEFORE (Bad)**:

```typescript
async create(data: Request): Promise<Result<Response>> {
  const token = await client.getAccessToken();
  if (!token.ok) {
    return err(token.error);
  }
  return httpClient.post(url, data, {
    headers: { Authorization: `Bearer ${token.value}` },
  });
}
```

**AFTER (Good)**:

```typescript
async create(data: Request): Promise<Result<Response>> {
  return withAuth(client, (token) =>
    httpClient.post(url, data, {
      headers: { Authorization: `Bearer ${token}` },
    })
  );
}
```

#### 2. Hardcoded URLs ❌

**BEFORE (Bad)**:

```typescript
const url = `${client.config.baseUrl}/api/v1/customers/${id}`;
```

**AFTER (Good)**:

```typescript
const url = buildUrl(client.config.baseUrl, "api/v1/customers", id);
```

#### 3. Dead Code ❌

- **NEVER** keep unused functions
- **ALWAYS** delete commented-out code
- **ALWAYS** remove unused imports and types

#### 4. Production Dependencies on Test Tools ❌

```json
// ❌ WRONG - Test tools in dependencies
{
  "dependencies": {
    "nock": "^14.0.0",
    "dotenv": "^17.0.0"
  }
}

// ✅ CORRECT - Test tools in devDependencies
{
  "devDependencies": {
    "nock": "^14.0.0",
    "dotenv": "^17.0.0"
  }
}
```

#### 5. Zero-Value Wrappers ❌

Don't create wrapper functions that add no value:

```typescript
// ❌ WRONG - Useless wrapper
export const createAuthService = (client: OakClient) => ({
  getAccessToken: () => client.getAccessToken(),
  grantToken: () => client.grantToken(),
});

// ✅ CORRECT - Use client directly
await client.getAccessToken();
```

---

## Refactoring Guidelines

### When to Create Helper Functions

Create a helper when:

1. **Code is duplicated 3+ times** across files
2. **Logic is complex** and deserves a name
3. **Concerns can be separated** (e.g., auth from business logic)

**Example**: The `withAuth` helper was created because token-fetching appeared 35+ times across services.

### How to Structure Refactors

1. **Read before modifying**: Always read existing code first
2. **Create utilities first**: Build helpers before refactoring services
3. **Test helpers**: Unit test utilities before using them
4. **Refactor incrementally**: Update services one at a time
5. **Verify after each change**: Run tests after each file update

### Breaking Changes

Since this is **pre-launch** (March 2026), breaking changes are acceptable:

- Document all breaking changes in CHANGELOG
- Add migration guide for developers
- Update version per semver (0.1.0 → 0.2.0 for breaking)

---

## Git Workflow

### Commit Messages

Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code change without behavior change
- `docs`: Documentation only
- `test`: Adding or updating tests
- `chore`: Build, deps, or config changes

Example:

```
fix(auth): correct token expiration calculation

OAuth expires_in is in seconds, but Date.now() returns milliseconds.
Multiply by 1000 to convert seconds to milliseconds.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Changesets

**ALWAYS** create a changeset for user-facing changes:

```bash
pnpm changeset
```

Choose:

- **patch**: Bug fixes, internal improvements
- **minor**: New features, non-breaking additions
- **major**: Breaking changes (rare in pre-launch)

### Pull Requests

1. **NEVER** push directly to `main`
2. **ALWAYS** create feature branch
3. **ALWAYS** run full test suite before PR
4. **ALWAYS** update README for new features

---

## Performance

### Caching Strategies

1. **Token Caching**: AuthManager caches tokens with 60s buffer before expiry

   ```typescript
   // Check if token is valid (with 60s buffer)
   if (currentTime >= this.tokenExpiration - 60000) {
     await this.grantToken();
   }
   ```

2. **HTTP Client**: Uses retry with exponential backoff
   ```typescript
   {
     maxNumberOfRetries: 3,
     delay: 1000,
     backoffFactor: 2,
     maxDelay: 30000,
   }
   ```

### Retry Logic

**ALWAYS** retry on:

- 408 (Timeout)
- 429 (Rate Limited)
- 500, 502, 503, 504 (Server Errors)

**NEVER** retry on:

- 4xx client errors (except 408, 429)
- 401 (Unauthorized)

```typescript
retryOnStatus: [408, 429, 500, 502, 503, 504];
```

### Exponential Backoff

```typescript
waitTime = Math.min(waitTime * backoffFactor, maxDelay);
waitTime = waitTime * (0.8 + Math.random() * 0.4); // Add jitter
```

**Jitter prevents thundering herd** when multiple clients retry simultaneously.

---

## Type System Rules

### 1. Use `unknown` over `any`

```typescript
// ✅ CORRECT
async function post<T>(url: string, data: unknown): Promise<Result<T>> {
  return request(url, { body: JSON.stringify(data) });
}

// ❌ WRONG
async function post<T>(url: string, data: any): Promise<Result<T>> {
  return request(url, { body: JSON.stringify(data) });
}
```

### 2. Named Interfaces over `ReturnType`

```typescript
// ✅ CORRECT
import { CustomerService } from "../../services";
export interface Product {
  customers: CustomerService;
}

// ❌ WRONG
export interface Product {
  customers: ReturnType<typeof createCustomerService>;
}
```

### 3. Standalone Interfaces over Intersections

```typescript
// ✅ CORRECT
export interface Transaction {
  provider: string;
  source: Source;
  id: string;
  status: string;
  type: "payment";
  created_at: string;
  updated_at: string;
}

// ❌ WRONG
export type Transaction = Request & {
  id: string;
  status: string;
  type: "payment";
};
```

### 4. Type Guards for `unknown`

```typescript
function isCustomerData(data: unknown): data is Customer.Data {
  return (
    typeof data === "object" &&
    data !== null &&
    "email" in data &&
    typeof (data as Customer.Data).email === "string"
  );
}
```

---

## Documentation

### README Requirements

**ALWAYS** include:

1. Installation instructions
2. Quick start example
3. Authentication setup
4. API reference links
5. Error handling examples
6. Webhook verification examples (if applicable)

### Migration Guides

When introducing breaking changes:

```markdown
## Breaking Changes in v0.2.0

### Security Improvements

- `client.config.clientSecret` is no longer accessible
- Store credentials separately, pass to `createOakClient()` only

### Migration Steps

1. Remove references to `client.config.clientSecret`
2. Store secret in environment variables
3. Update to latest `@oaknetwork/api` version
```

### TSDoc Examples

````typescript
/**
 * Verifies a webhook signature using HMAC-SHA256.
 * Uses timing-safe comparison to prevent timing attacks.
 *
 * @param payload - Raw webhook payload string
 * @param signature - Signature from webhook headers
 * @param secret - Your webhook secret from Oak dashboard
 * @returns True if signature is valid, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = verifyWebhookSignature(
 *   JSON.stringify(req.body),
 *   req.headers["x-oak-signature"],
 *   process.env.WEBHOOK_SECRET
 * );
 * if (!isValid) {
 *   return res.status(401).send("Invalid signature");
 * }
 * ```
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  // Implementation...
}
````

---

## Package Management

### Use pnpm Only

- **NEVER** use npm or yarn
- **ALWAYS** use `pnpm` for all operations
- Engine requirement: `pnpm >= 10.0.0`

```json
{
  "packageManager": "pnpm@10.17.1",
  "engines": {
    "pnpm": ">=10.0.0"
  }
}
```

### Lockfiles

- `package-lock.json` is **forbidden** (gitignored)
- Only `pnpm-lock.yaml` should exist

---

## CI/CD Requirements

### CI Workflow

1. **Build**: `pnpm build` must pass
2. **Lint**: `pnpm lint` must pass (no `continue-on-error`)
3. **Tests**: `pnpm test` must pass with >80% coverage
4. **Type Check**: `tsc --noEmit` must pass

### Release Workflow

1. Changesets gather changes
2. Version bump via `pnpm changeset:version`
3. Build packages: `pnpm --filter=!@oaknetwork/contracts build`
4. Publish to npm with provenance
5. Create GitHub releases

---

## Common Mistakes to Avoid

1. ❌ Using `any` instead of `unknown`
2. ❌ Not multiplying OAuth `expires_in` by 1000
3. ❌ Silent test skips with `console.warn` + `return`
4. ❌ Exposing `clientSecret` in public config
5. ❌ Hardcoding URLs instead of using `buildUrl`
6. ❌ Duplicating token-fetch logic instead of using `withAuth`
7. ❌ Putting test tools in `dependencies` instead of `devDependencies`
8. ❌ Creating zero-value wrapper functions
9. ❌ Using `ReturnType<typeof>` instead of named interfaces
10. ❌ Not handling both success and error paths in tests

---

## Questions?

If you're an AI assistant and unsure about something:

1. Check this document first
2. Look at existing code patterns in the same directory
3. Read the comprehensive plan at the repository root
4. When in doubt, choose the **more type-safe** option
5. When in doubt, choose the **more explicit** option

**Remember**: This is a financial API SDK. Security, correctness, and type safety are paramount.

---

**End of Guidelines**
