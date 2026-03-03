# Oak Network SDKs

[![Codecov](https://codecov.io/github/oak-network/sdk/graph/badge.svg)](https://app.codecov.io/github/oak-network/sdk)
[![CodeQL](https://github.com/oak-network/sdk/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/oak-network/sdk/actions/workflows/github-code-scanning/codeql)

This repository contains Oak Network's TypeScript SDKs for payments and smart contracts.
Oak Network helps teams build global payment products with secure APIs, typed developer tooling, and blockchain-integrated financial infrastructure.

## SDK packages

### Payments SDK

Primary SDK for Oak payments APIs (customers, payments, webhooks, transfers, refunds, and more).

- Package: `@oaknetwork/api`
- Folder: [`packages/payments`](./packages/payments)
- Public folder link: [github.com/oak-network/sdk/tree/main/packages/payments](https://github.com/oak-network/sdk/tree/main/packages/payments)
- Documentation: [oaknetwork.org/docs/sdk/api-sdk/overview](https://www.oaknetwork.org/docs/sdk/api-sdk/overview)
- npm: [npmjs.com/package/@oaknetwork/api](https://www.npmjs.com/package/@oaknetwork/api)

### Contracts SDK

TypeScript SDK for Oak smart contracts and contract integrations.

- Package: `@oaknetwork/contracts`
- Folder: [`packages/contracts`](./packages/contracts)
- Documentation: [oaknetwork.org](https://www.oaknetwork.org/)

## Monorepo quick start

```bash
pnpm install
pnpm build
pnpm test
```

## Development standards

- This repository uses `pnpm` only.
- Follow engineering and security standards in [`CLAUDE.md`](./CLAUDE.md).

## Support

- Website: [oaknetwork.org](https://www.oaknetwork.org/)
- Issues: [github.com/oak-network/sdk/issues](https://github.com/oak-network/sdk/issues)
- Email: [support@oaknetwork.org](mailto:support@oaknetwork.org)

## License

[MIT](./LICENSE)
