# @oaknetwork/api

## 1.0.0

### Major Changes

### Major Changes

- Updated types of all request response
- updated customer test for US clients, added test for transfer
- Refactor httpClient to return Result<T, OakError> and centralize error handling (breaking change).

### Minor Changes

### Minor Changes

- Add typed environment configuration and @SandboxOnly decorator
- Add integration tests for WebhookService covering CRUD operations, toggle, and notifications endpoints
- Fix httpClient to return ApiError for non-JSON API error responses
- added sync and balance API
- Add Payment Method Service Integration Tests

### Patch Changes

### Patch Changes

- chore: enhance httpClient to include Oak-Version in headers#18
- Add TSDoc documentation to SDK public API

## 1.1.0

### Minor Changes

### Minor Changes

- testing changeset for releases

## 1.0.0

### Major Changes

### Major Changes

- Adopt Result<T, E> responses across API services and auth flows.

## 0.1.0

### Minor Changes

### Minor Changes

- update changeset
- Fix release CI
- Testing NPM integraton

### Patch Changes

### Patch Changes

- project setup
