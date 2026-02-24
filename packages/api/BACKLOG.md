# packages/api — Fix Backlog

Based on code review (Feb 2026). Ordered by priority.

---

## P0 — Critical / Security

- [ ] **Fix duplicate properties in `Provider.RegistrationStatus`**
  - `provider_response`, `rejection_reason`, `readiness` are each declared twice in `src/types/provider.ts` (lines 59-64)
  - Delete the three duplicate lines (62-64)

- [ ] **Replace all `any` with `unknown`** (~28 occurrences)
  - `src/types/paymentMethod.ts` — 11× `Record<string, any>` in metadata fields
  - `src/types/transfer.ts` — 4× `Record<string, any>` in metadata/provider_data fields
  - `src/types/refund.ts` — 1× `Record<string, any>` in metadata
  - `src/types/provider.ts` — `provider_response: any | null`, `readiness: any | null` (×2 each)
  - `src/types/webhook.ts` — `Notification.data: any`
  - `src/types/buy.ts` — `ProviderResponse.[key]: any`, `Metadata.[key]: any`
  - `src/utils/defaultRetryConfig.ts` — `retryOnError?: (error: any)`, `onRetry?: (attempt: number, error: any)`

- [ ] **Export `ApiResponse` from the types barrel**
  - `src/types/common.ts` is used by every response type but never re-exported in `src/types/index.ts`
  - Add `export * from "./common"` to `src/types/index.ts`

- [ ] **Fix token refresh race condition in `AuthManager`**
  - `getAccessToken()` has no concurrency guard — N parallel calls on an expired token fire N redundant `grantToken()` requests
  - Add a promise-based in-flight coalescing: store the pending `grantToken()` promise and reuse it until resolved

---

## P1 — Architecture / Correctness

- [ ] **Fix `PaymentMethod.ResponseData` intersection-with-union type**
  - `ResponseData = Request & { id, status, ... }` where `Request` is a union of 11 types
  - Replace with a standalone interface that reflects the actual API response shape
  - Located in `src/types/paymentMethod.ts`

- [ ] **Strengthen `PaymentMethod.DeleteResponse`**
  - Currently `{ [key: string]: string }` — meaningless
  - Define the actual response shape from the API

- [ ] **Add a default request timeout**
  - `HttpClientConfig` supports `AbortSignal` but no default timeout is applied
  - Add a `timeoutMs` field to `HttpClientConfig` (suggest 60 000ms default) and wire up `AbortSignal` internally in `httpClient.ts`

- [ ] **Encode path segments in `buildUrl`**
  - `buildUrl` joins segments with `/` but does not call `encodeURIComponent` on each segment
  - An ID containing `/`, `?`, or `#` will silently produce a broken URL
  - Apply `encodeURIComponent` to all segments except the base URL

- [ ] **Change default `maxNumberOfRetries` from 0 to 2-3**
  - Located in `src/utils/defaultRetryConfig.ts`
  - The entire retry infrastructure is disabled out of the box

- [ ] **Remove default `console.warn` from retry config**
  - SDK libraries must not write to stdout/stderr by default
  - Change default `onRetry` to `undefined`; let consumers provide their own logger

---

## P2 — Code Quality

- [ ] **Remove dead `@SandboxOnly` decorator**
  - `src/decorators/sandboxOnly.ts` and `src/decorators/index.ts` export `SandboxOnly` and `sandboxOnlyFn`
  - Neither is used anywhere in the codebase (all services are factory functions, not classes)
  - Also remove `experimentalDecorators` and `emitDecoratorMetadata` from `tsconfig.json` after deletion

- [ ] **Remove dead types from `payment.ts`**
  - `Payment.ListMethodsQuery` and `Payment.DeleteMethodResponse` are defined but referenced by no service
  - Delete them from `src/types/payment.ts`

- [ ] **Fix inconsistent query string construction in `providerService`**
  - `providerService.ts` builds `?provider=...` manually via template literal
  - All other services use `buildQueryString()` from `services/helpers.ts`
  - Refactor `getSchema` to use `buildQueryString`

- [ ] **Reduce per-method config boilerplate in services**
  - The `{ headers: { Authorization: \`Bearer ${token}\` }, retryOptions: client.retryOptions }` object is copy-pasted ~25 times across all services
  - Create a helper (e.g. `makeRequestConfig(token, client)`) in `services/helpers.ts`

- [ ] **Add input validation at service boundaries**
  - Services pass parameters straight to the HTTP layer with no validation
  - At minimum: guard against empty-string IDs (will silently hit wrong endpoints), negative amounts
  - Consider returning `err(new ValidationError(...))` for invalid inputs

- [ ] **Add ESLint with strict TypeScript rules**
  - No linter config currently exists in the package or monorepo root
  - Minimum rules: `@typescript-eslint/no-explicit-any`, `@typescript-eslint/consistent-type-imports`, `no-unused-vars`

---

## P3 — Housekeeping

- [ ] **Enforce `import type` consistently across all service files**
  - `providerService.ts` and `refundService.ts` use value imports for type-only symbols
  - All other services use `import type` — make it uniform
