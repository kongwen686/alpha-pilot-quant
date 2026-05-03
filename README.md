# AlphaPilot Quant

AlphaPilot Quant is an open-source AI quant trading workbench. It combines market data ingestion, factor research, signal-based stock selection, simulated auto trading, portfolio rebalancing, and risk monitoring in a local React + TypeScript application.

The project is built for research, demos, education, and prototype validation. It defaults to simulated trading and does not connect to a live broker gateway.

## Features

- Data center: Tencent Securities quote crawling, scheduled data sync, data source registry, provider configs, subscriptions, quality checks, and aggregation insights.
- Research workspace: configurable factor formulas, factor calculation, strategy library, strategy toggles, strategy optimization, and MiroFish-style market scenario simulation adapter.
- Signal selection: ranks tradable A-share and ETF quotes with factor bias, momentum, liquidity, and position constraints.
- Auto trading loop: generates simulated buy/sell orders from signals, handles stop-loss, take-profit, overweight trimming, cash balance, and mock fills.
- Backtesting and analytics: task creation, execution progress simulation, result analysis, attribution, and stress scenarios.
- Risk management: VaR, ES, drawdown, leverage, concentration, rule toggles, and audit logs.
- One-click workflow: runs data sync, quality checks, factor calculation, MiroFish simulation, strategy optimization, backtesting, signal selection, auto trading, and risk refresh.
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
- `AUTO_DATA_SYNC_INTERVAL_MS`: interval for scheduled data crawling and sync. Default: `0`, disabled.
- `AUTO_TRADER_SYNC_MARKET`: set to `false` to skip market sync in scheduled runs.

Example:

```bash
AUTO_TRADER_INTERVAL_MS=60000 npm run api
```

## API Overview

Read endpoints:

- `GET /api/state`
- `GET /api/data-sources`
- `GET /api/data-provider-configs`
- `GET /api/data-subscriptions`
- `GET /api/data-sync-runs`
- `GET /api/data-aggregate-insights`
- `GET /api/factors`
- `GET /api/factor-configs`
- `GET /api/mirofish/config`
- `GET /api/mirofish/scenarios`
- `GET /api/strategies`
- `GET /api/strategy-optimizations`
- `GET /api/backtests`
- `GET /api/backtest-results`
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
- `POST /api/data-provider-configs`
- `PATCH /api/data-provider-configs/:id/toggle`
- `POST /api/data-subscriptions`
- `PATCH /api/data-subscriptions/:id/toggle`
- `PATCH /api/data-sources/:id/subscription`
- `POST /api/factors/compute`
- `POST /api/factors`
- `PATCH /api/factors/:id/toggle`
- `POST /api/factor-configs`
- `PATCH /api/factor-configs/:id/toggle`
- `POST /api/mirofish/config`
- `POST /api/mirofish/scenarios`
- `POST /api/mirofish/advance`
- `POST /api/mirofish/scenarios/:id/publish-factor`
- `POST /api/strategies`
- `PATCH /api/strategies/:id/toggle`
- `POST /api/strategies/optimize`
- `POST /api/backtests`
- `POST /api/backtests/advance`
- `POST /api/signals/select`
- `POST /api/trading/auto`
- `POST /api/orders`
- `POST /api/orders/execute`
- `PATCH /api/orders/:id/cancel`
- `PATCH /api/positions/:id/rebalance`
- `POST /api/risk/refresh`
- `POST /api/risk-rules`
- `PATCH /api/risk-rules/:id/toggle`
- `POST /api/workflow/run`
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
