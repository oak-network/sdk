# @oaknetwork/payments-sdk

## 1.2.0

### Minor Changes

### Minor Changes

- Update payment sdk with the recent changes from Crowdsplit

## 1.1.0

### Minor Changes

### Minor Changes

- change the name of the SDK folder to payments-sdk
- Remove Crowdsplit product facade and rename CrowdSplit types to Oak

  ### WHAT

  - Removed the `Crowdsplit` product facade (`@oaknetwork/payments-sdk/products/crowdsplit`)
  - Removed the `./products/crowdsplit` export path from package.json
  - Renamed payment method types:
    - `CrowdSplitBankAccount` → `OakBankAccount`
    - `CrowdSplitCustomerWallet` → `OakCustomerWallet`
    - `CrowdSplitPix` → `OakPix`

  ### WHY

  - Align the SDK codebase with public documentation which uses direct service imports
  - Remove legacy "Crowdsplit" branding in favor of "Oak Network"
  - Simplify the API surface by having one canonical way to use services

  ### HOW to migrate

  Replace the Crowdsplit facade with direct service imports:

  ```typescript
  // Before
  import { Crowdsplit } from "@oaknetwork/payments-sdk/products/crowdsplit";
  const { customers, payments } = Crowdsplit(client);

  // After
  import {
    createCustomerService,
    createPaymentService,
  } from "@oaknetwork/payments-sdk";
  const customers = createCustomerService(client);
  const payments = createPaymentService(client);
  ```

  Update type references:

  ```typescript
  // Before
  const bankAccount: CrowdSplitBankAccount = { ... };

  // After
  const bankAccount: OakBankAccount = { ... };
  ```

## 1.0.1

### Patch Changes

### Patch Changes

- Initial release of SDK v1.0.1.

## 1.0.0

### Major Changes

- Initial release of Oak SDK

## 0.1.0

### Minor Changes

### Minor Changes

- update changeset
- Fix release CI
- Testing NPM integraton

### Patch Changes

### Patch Changes

- project setup
