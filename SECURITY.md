# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions of `@oaknetwork/api`:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | ✅ Active support  |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a vulnerability in the Oak SDK, we ask that you follow responsible disclosure practices and report it privately so we can address it before any public disclosure.

### How to Report

- **Email**: [security@oaknetwork.org](mailto:security@oaknetwork.org)
- **General support**: [support@oaknetwork.org](mailto:support@oaknetwork.org)
- **GitHub Private Advisories**: [Report a vulnerability](https://github.com/oak-network/sdk/security/advisories/new)

When reporting, please include as much detail as possible:

- A clear description of the vulnerability
- Steps to reproduce the issue
- The potential impact and attack surface
- Any proof-of-concept code (if available)
- The SDK version(s) affected

### What to Expect

| Timeline | Action |
| -------- | ------ |
| **Within 48 hours** | Acknowledgment of your report |
| **Within 7 days** | Initial severity assessment and triage |
| **Within 30 days** | A patch or mitigation plan for confirmed vulnerabilities |
| **Within 90 days** | Public disclosure (coordinated with reporter) |

We follow **coordinated vulnerability disclosure (CVD)** principles. We will keep you informed throughout the process and aim to resolve confirmed vulnerabilities within 30 days. For complex issues, we may request an extension and will communicate transparently about the timeline.

## Scope

The following are **in scope** for vulnerability reports:

- Authentication and token management flaws (`OAuth 2.0` client credentials flow)
- Webhook signature verification bypass or timing-attack vulnerabilities
- Credential or secret exposure through SDK APIs
- Dependency vulnerabilities with direct security impact on SDK consumers
- Type-safety issues that could lead to injection or data leakage

The following are **out of scope**:

- Vulnerabilities in the Oak Network backend API itself (please contact Oak Network directly)
- Issues in third-party dependencies without a clear exploit path through this SDK
- Denial-of-service attacks that require significant resources or special access
- Social engineering attacks

## Security Best Practices for SDK Consumers

To use the Oak SDK securely in your applications:

- **Never hardcode credentials** — store `clientId` and `clientSecret` in environment variables
- **Never commit `.env` files** — add them to `.gitignore`
- **Always verify webhook signatures** — use `verifyWebhookSignature()` or `parseWebhookPayload()` before processing any webhook event
- **Use separate credentials** for sandbox and production environments
- **Do not log or expose** `clientSecret` or access tokens in application logs
- **Keep the SDK updated** — subscribe to [GitHub releases](https://github.com/oak-network/sdk/releases) to stay informed about security patches

## Security Features in This SDK

- **OAuth 2.0 client credentials flow** with automatic token caching
- **`clientSecret` is not exposed** on the client config object (as of v0.2)
- **HMAC-SHA256 webhook signature verification** with timing-safe comparison to prevent timing attacks
- **Exponential backoff with jitter** on retries to mitigate thundering herd scenarios
- **Strict TypeScript types** with `unknown` for unvalidated external data

## Disclosure Policy

We are committed to working with security researchers and the community to ensure the safety of our SDK. Once a vulnerability is confirmed and a fix is available, we will:

1. Release a patched version as soon as possible
2. Publish a [GitHub Security Advisory](https://github.com/oak-network/sdk/security/advisories)
3. Update the [CHANGELOG.md](./CHANGELOG.md) with details about the fix
4. Credit the reporter (unless they prefer to remain anonymous)

We ask that reporters allow us up to **90 days** from initial report to public disclosure to give users time to update.

## Contact

For security-related inquiries, reach out to [security@oaknetwork.org](mailto:security@oaknetwork.org).  
For general questions, visit [oaknetwork.org](https://oaknetwork.org) or open a [GitHub Discussion](https://github.com/oak-network/sdk/issues).
