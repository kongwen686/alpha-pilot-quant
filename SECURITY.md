# Security Policy

## Supported Versions

The current `main` branch receives security fixes.

## Reporting a Vulnerability

Please report security issues privately to the project maintainers. Do not publish exploit details in public issues.

Include:

- A concise description of the issue.
- Steps to reproduce.
- Impact and affected files or endpoints.
- Suggested mitigation, if known.

## Sensitive Data

Never commit:

- Broker credentials.
- API keys.
- Account identifiers.
- Private market data subscriptions.
- Production trading logs.

The default app uses simulated execution. Live trading integrations should include explicit credential isolation, audit logging, rate limits, and manual enablement.
