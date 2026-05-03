# AlphaPilot Quant

AlphaPilot Quant is an open-source AI quant trading workbench. It combines market data ingestion, factor research, signal-based stock selection, simulated auto trading, portfolio rebalancing, and risk monitoring in a local React + TypeScript application.

The project is built for research, demos, education, and prototype validation. It defaults to simulated trading and does not connect to a live broker gateway.

## Features

- Data center: Tencent Securities quote ingestion, data source registry, provider configs, subscriptions, and quality checks.
- Research workspace: factor calculation, strategy library, strategy toggles, and MiroFish-style market scenario simulation adapter.
- Signal selection: ranks tradable A-share and ETF quotes with factor bias, momentum, liquidity, and position constraints.
- Auto trading loop: generates simulated buy/sell orders from signals, handles stop-loss, take-profit, overweight trimming, cash balance, and mock fills.
- Backtesting and analytics: task creation, progress simulation, result library, attribution, and stress scenarios.
- Risk management: VaR, ES, drawdown, leverage, concentration, rule toggles, and audit logs.
- Local REST API: all UI actions go through `/api/*` and persist state to `data/state.json`.

## Tech Stack

- React 18
- TypeScript
- Vite
- Node HTTP server
- Local JSON persistence
- lucide-react icons

## Quick Start

```bash
npm install
npm run dev
```

Default URLs:

- Web app: `http://localhost:5173/`
- API: `http://localhost:8787/`

Build:

```bash
npm run build
```

## Environment

Copy `.env.example` if you want to customize ports or scheduled auto trading:

```bash
cp .env.example .env
```

Useful variables:

- `API_PORT`: API server port. Default: `8787`.
- `AUTO_TRADER_INTERVAL_MS`: interval for scheduled auto trading. Default: `0`, disabled.
- `AUTO_TRADER_SYNC_MARKET`: set to `false` to skip market sync in scheduled runs.

Example:

```bash
AUTO_TRADER_INTERVAL_MS=60000 npm run api
```

## API Overview

Read endpoints:

- `GET /api/state`
- `GET /api/market-quotes`
- `GET /api/stock-signals`
- `GET /api/auto-trade-runs`
- `GET /api/orders`
- `GET /api/positions`
- `GET /api/risk-indicators`
- `GET /api/logs`

Action endpoints:

- `POST /api/data/pipeline`
- `POST /api/data/quality-check`
- `POST /api/factors/compute`
- `POST /api/signals/select`
- `POST /api/trading/auto`
- `POST /api/orders/execute`
- `POST /api/risk/refresh`
- `POST /api/system-config`

Auto trading request example:

```json
{
  "strategyId": "s-1",
  "execute": true,
  "minScore": 68,
  "maxOrders": 3
}
```

## Project Structure

```text
server/            Local REST API and market data ingestion
src/               React app and quant engine
data/state.json    Local runtime state, ignored by git
dist/              Production build output, ignored by git
```

## MiroFish Adapter

AlphaPilot Quant includes an adapter-style workflow inspired by MiroFish market scenario simulation. It does not copy or vendor MiroFish source code. If you connect a full external MiroFish service, review its AGPL-3.0 license obligations separately.

## Safety Notice

This project is not investment advice and is not production trading infrastructure. Market data can be delayed, unavailable, or inaccurate. The auto trading workflow is simulated by default; live trading requires a separately reviewed broker gateway, credentials management, audit controls, and compliance checks.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow.

## Security

Please do not open public issues for sensitive security reports. See [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).
