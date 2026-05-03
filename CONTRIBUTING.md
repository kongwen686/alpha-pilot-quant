# Contributing

Thanks for your interest in AlphaPilot Quant.

## Development Setup

```bash
npm install
npm run dev
```

Run a production build before submitting changes:

```bash
npm run build
```

## Guidelines

- Keep changes focused and easy to review.
- Prefer existing React, TypeScript, and state-management patterns in the repo.
- Keep trading features safe by default: simulated execution first, explicit live-trading integration only.
- Do not commit credentials, broker tokens, API keys, or private data.
- Treat `data/state.json` as runtime state. It is ignored by git.

## Pull Request Checklist

- The app builds with `npm run build`.
- UI changes have been checked in a browser.
- API changes include README updates if they affect public endpoints.
- Trading or risk logic changes explain assumptions and failure modes.

## Financial Safety

This project is for research and prototyping. Contributions that imply guaranteed returns, live trading readiness, or hidden broker execution paths will not be accepted.
