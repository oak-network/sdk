# Oak Network SDKs

[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/oak-network/sdk/badge)](https://scorecard.dev/viewer/?uri=github.com/oak-network/sdk)
[![Codecov](https://codecov.io/github/oak-network/sdk/graph/badge.svg)](https://app.codecov.io/github/oak-network/sdk)
[![CodeQL](https://github.com/oak-network/sdk/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/oak-network/sdk/actions/workflows/github-code-scanning/codeql)

This repository contains Oak Network's TypeScript SDKs for payments and smart contracts.
Oak Network helps teams build global payment products with secure APIs, typed developer tooling, and blockchain-integrated financial infrastructure.

## SDK packages

### Payment SDK

Primary SDK for Oak payment APIs (customers, payments, webhooks, transfers, refunds, and more).

- Package: `@oaknetwork/api`
- Folder: [`packages/payment-sdk`](./packages/payment-sdk)
- Public folder link: [github.com/oak-network/sdk/tree/main/packages/payment-sdk](https://github.com/oak-network/sdk/tree/main/packages/payment-sdk)
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
