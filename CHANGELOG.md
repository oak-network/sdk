# Changelog

All notable changes to the Oak SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Webhook Verification Utilities**: New `verifyWebhookSignature()` and `parseWebhookPayload()` functions for secure webhook handling using HMAC-SHA256 with timing-safe comparison
- **RefundService**: Added to Crowdsplit product facade, exposing refund functionality that was previously available but not exposed
- **Helper Utilities**:
  - `withAuth()`: Higher-order function for wrapping HTTP operations with authentication (eliminates 35+ duplications)
  - `buildUrl()`: Centralized URL construction with consistent trailing slash handling (standardizes 36+ URL constructions)
- **Comprehensive Unit Tests**: Added test coverage for all new utility functions
- **AI Development Guidelines**: Created `CLAUDE.md` with comprehensive coding standards and best practices

### Fixed

- **Critical Token Expiration Bug**: Fixed OAuth token expiration calculation - `expires_in` is in seconds but `Date.now()` returns milliseconds. Now correctly multiplies by 1000
- **Integration Test Silent Skips**: Replaced 20+ silent test skips (console.warn + return) with explicit error throws for accurate test reporting
- **Payment URL Inconsistency**: Removed inconsistent trailing slash from payment service URL construction

### Changed

- **BREAKING**: `client.config.clientSecret` is no longer accessible for security reasons. Store credentials separately and only pass to `createOakClient()`
- **BREAKING**: Removed `createAuthService()` wrapper - use `client.getAccessToken()` and `client.grantToken()` directly
- **Type System Improvements**:
  - Replaced `any` with `unknown` in httpClient methods (`post`, `put`, `patch`) and retryHandler for better type safety
  - Converted `ReturnType<typeof>` to direct interface imports in Crowdsplit facade
  - Converted intersection types to standalone interfaces in Payment and Transfer types
  - Added JSDoc to clarify `customer.id` (legacy) vs `customer.customer_id` (preferred)
- **Dependency Updates**:
  - Moved `nock` and `dotenv` from dependencies to devDependencies (reduces production bundle size)
  - Updated `ts-jest` from `^29.4.1` to `^29.4.6`
  - Engine requirement updated: `pnpm >= 10.0.0` (was `>= 8.0.0`)
- **CI/CD Improvements**:
  - Removed `continue-on-error` from lint step - lint failures now block PRs
  - Excluded `@oaknetwork/contracts` placeholder package from CI builds
  - Pinned npm version in release workflow to `10.9.2` for deterministic builds
  - Added `package-lock.json` to .gitignore (enforces pnpm as canonical package manager)

### Removed

- **Dead Code**: Deleted unused `getErrorBodyMessage()` function (14 lines)
- **Unused Types**: Deleted unused `SDKConfig` type and `src/types/config.ts`
- **Scratch Files**: Deleted `test-sdk.ts` (200+ lines with hardcoded UUIDs) and added to .gitignore
- **Lockfiles**: Removed npm lockfiles from root and api package

### Internal

- **Service Refactoring**: All 11 service files refactored to use new `withAuth` and `buildUrl` helpers
  - Net reduction: 75 lines of code
  - Eliminated ~300 lines of duplicated token-fetch code
  - Standardized URL construction across all services
- **TypeScript Config**: Added comment explaining `experimentalDecorators` requirement for `@SandboxOnly` decorator

## Migration Guide

### Breaking Changes in v0.2.0

#### 1. `clientSecret` No Longer Accessible

**Before:**
```typescript
const client = createOakClient({
  environment: "sandbox",
  clientId: "your-client-id",
  clientSecret: "your-client-secret",
});

// This no longer works:
console.log(client.config.clientSecret); // ❌ undefined
```

**After:**
```typescript
// Store secret separately if needed for logging/debugging
const clientSecret = process.env.CLIENT_SECRET;

const client = createOakClient({
  environment: "sandbox",
  clientId: process.env.CLIENT_ID,
  clientSecret, // Pass it in, but don't access it later
});

// Secret is NOT exposed on client.config for security
```

**Why**: Prevents accidental secret exposure through logging, serialization, or error messages.

#### 2. `createAuthService()` Removed

**Before:**
```typescript
import { createAuthService } from "@oaknetwork/api";

const auth = createAuthService(client);
const token = await auth.getAccessToken();
```

**After:**
```typescript
// Use client methods directly
const token = await client.getAccessToken();
const tokenResponse = await client.grantToken();
```

**Why**: Zero-value wrapper that added no functionality.

#### 3. Stricter Type Checking

**Before:**
```typescript
// Any type accepted
httpClient.post(url, anyData, config);
```

**After:**
```typescript
// Unknown type requires explicit typing
httpClient.post<ResponseType>(url, requestData as RequestType, config);
```

**Why**: Better type safety prevents runtime errors.

### New Features

#### Webhook Verification

```typescript
import { verifyWebhookSignature, parseWebhookPayload } from "@oaknetwork/api";

// Option 1: Verify signature only
app.post("/webhook", (req, res) => {
  const isValid = verifyWebhookSignature(
    JSON.stringify(req.body),
    req.headers["x-oak-signature"] as string,
    process.env.WEBHOOK_SECRET
  );

  if (!isValid) {
    return res.status(401).send("Invalid signature");
  }

  // Process webhook...
});

// Option 2: Verify and parse in one step
app.post("/webhook", (req, res) => {
  const result = parseWebhookPayload<PaymentEvent>(
    JSON.stringify(req.body),
    req.headers["x-oak-signature"] as string,
    process.env.WEBHOOK_SECRET
  );

  if (!result.ok) {
    return res.status(401).send(result.error.message);
  }

  const event = result.value;
  // Handle event...
});
```

#### RefundService Now Available

```typescript
import { Crowdsplit } from "@oaknetwork/api/products/crowdsplit";

const crowdsplit = Crowdsplit(client);

// Refund service is now exposed
const result = await crowdsplit.refunds.create({
  transaction_id: "txn_123",
  amount: 1000,
});
```

### Upgrade Steps

1. **Update Package**:
   ```bash
   pnpm update @oaknetwork/api@latest
   ```

2. **Remove `clientSecret` Access**:
   - Search codebase for `client.config.clientSecret`
   - Store separately if needed for non-SDK purposes
   - Update to use environment variables

3. **Replace `createAuthService()`**:
   - Search for `createAuthService`
   - Replace with direct `client.getAccessToken()` or `client.grantToken()` calls
   - Remove import

4. **Add Type Assertions** (if needed):
   - TypeScript may require type assertions for HTTP client methods
   - Add `as RequestType` where compiler indicates `unknown` cannot be assigned

5. **Test Thoroughly**:
   - Run full test suite
   - Verify authentication still works
   - Check webhook handling if applicable

## [0.1.0] - 2026-02-XX

### Added

- Initial release of Oak SDK
- Support for Crowdsplit API
- Customer, Payment, PaymentMethod, Transaction services
- Transfer, Webhook, Plan, Buy, Sell services
- OAuth 2.0 client credentials flow
- TypeScript type definitions
- Comprehensive test suite
- Result type pattern for error handling

---

For more details, see the [GitHub Releases](https://github.com/oak-network/sdk/releases) page.
