import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  advanceBacktests,
  appendLog,
  cancelOrder,
  computeFactors,
  createStrategy,
  createBacktest,
  createInitialState,
  clearLogs,
  advanceMiroFishScenarios,
  createMiroFishScenario,
  executePendingOrders,
  finalizeDataSync,
  generateOrder,
  normalizeOrderTradingCalendar,
  optimizeStrategies,
  publishMiroFishFactor,
  runOperationalWorkflow,
  runAutoTrading,
  refreshRisk,
  runSignalSelection,
  runTradingAgentDeliberation,
  runDataQualityCheck,
  rebalancePosition,
  subscribeSource,
  toggleDataSubscription,
  toggleFactor,
  toggleFactorConfig,
  toggleProviderConfig,
  toggleRiskRule,
  toggleService,
  toggleStrategy,
  upsertDataSource,
  upsertDataSubscription,
  upsertFactor,
  upsertFactorConfig,
  upsertMiroFishConfig,
  upsertProviderConfig,
  upsertRole,
  upsertRiskRule,
  upsertUser,
  updateSystemConfig,
  type QuantState
} from "../src/quantEngine";
import { ingestRealMarketData } from "./marketData";
import { compactWarehouseFiles, getWarehouseStats } from "./warehouse";

const PORT = Number(process.env.API_PORT ?? 8787);
const AUTO_TRADER_INTERVAL_MS = Number(process.env.AUTO_TRADER_INTERVAL_MS ?? 0);
const AUTO_DATA_SYNC_INTERVAL_MS = Number(process.env.AUTO_DATA_SYNC_INTERVAL_MS ?? 0);
const stateFile = resolve(process.cwd(), "data/state.json");

type Handler = (state: QuantState, body: unknown, req: IncomingMessage) => Promise<QuantState> | QuantState;

function normalizeState(raw: QuantState): QuantState {
  const initial = createInitialState();
  const state = {
    ...initial,
    ...raw,
    dataProviderConfigs: raw.dataProviderConfigs ?? initial.dataProviderConfigs,
    dataQualityRules: raw.dataQualityRules ?? initial.dataQualityRules,
    dataSubscriptions: raw.dataSubscriptions ?? initial.dataSubscriptions,
    dataSyncRuns: raw.dataSyncRuns ?? initial.dataSyncRuns,
    dataAggregateInsights: raw.dataAggregateInsights ?? initial.dataAggregateInsights,
    factorConfigs: raw.factorConfigs ?? initial.factorConfigs,
    miroFishConfig: raw.miroFishConfig ?? initial.miroFishConfig,
    miroFishScenarios: raw.miroFishScenarios ?? initial.miroFishScenarios,
    backtestResults: raw.backtestResults ?? initial.backtestResults,
    stockSignals: raw.stockSignals ?? initial.stockSignals,
    autoTradeRuns: raw.autoTradeRuns ?? initial.autoTradeRuns,
    tradingAgentDecisions: raw.tradingAgentDecisions ?? initial.tradingAgentDecisions,
    strategyOptimizations: raw.strategyOptimizations ?? initial.strategyOptimizations,
    riskIndicators: raw.riskIndicators ?? initial.riskIndicators,
    roles: raw.roles ?? initial.roles,
    systemConfig: { ...initial.systemConfig, ...(raw.systemConfig ?? {}) },
    marketLabels: raw.marketLabels ?? initial.marketLabels,
    marketQuotes: raw.marketQuotes ?? initial.marketQuotes,
    marketSession: raw.marketSession ?? initial.marketSession,
    dataWarehouse: raw.dataWarehouse ?? initial.dataWarehouse,
    cashBalance: raw.cashBalance ?? initial.cashBalance,
    baseTime: new Date(raw.baseTime)
  };
  return normalizeOrderTradingCalendar({
    ...state,
    backtests: state.backtests.map((task) => ({
      ...task,
      strategyId: task.strategyId ?? state.strategies.find((strategy) => strategy.name === task.strategy)?.id ?? initial.strategies[0]?.id ?? "",
      universe: task.universe ?? "全A流动性池",
      benchmark: task.benchmark ?? "沪深300",
      period: task.period ?? "2021-01-01 至 2026-05-01",
      initialCapital: task.initialCapital ?? 10_000_000
    }))
  });
}

async function attachWarehouseStats(state: QuantState): Promise<QuantState> {
  const logicalRows = state.dataSources.reduce((sum, source) => sum + source.rows, 0);
  return {
    ...state,
    dataWarehouse: await getWarehouseStats(logicalRows, state.dataWarehouse?.lastMaintenance)
  };
}

async function ensureStateFile() {
  await mkdir(dirname(stateFile), { recursive: true });
  try {
    await readFile(stateFile, "utf8");
  } catch {
    await saveState(createInitialState());
  }
}

async function loadState() {
  await ensureStateFile();
  const raw = JSON.parse(await readFile(stateFile, "utf8")) as QuantState;
  return attachWarehouseStats(normalizeState(raw));
}

async function saveState(state: QuantState) {
  await mkdir(dirname(stateFile), { recursive: true });
  await writeFile(stateFile, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

async function readBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS"
  });
  res.end(JSON.stringify(payload));
}

function sendText(res: ServerResponse, status: number, payload: string) {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS"
  });
  res.end(payload);
}

function getParam(pathname: string, pattern: RegExp) {
  const match = pathname.match(pattern);
  return match?.[1] ? decodeURIComponent(match[1]) : "";
}

const mutationRoutes: Array<{ method: string; pattern: RegExp; handler: Handler }> = [
  { method: "POST", pattern: /^\/api\/data\/pipeline$/, handler: async (state) => finalizeDataSync(await ingestRealMarketData(state), "手动", "自动爬取并同步真实行情，完成清洗、聚合分析和数据服务发布") },
  { method: "POST", pattern: /^\/api\/data\/quality-check$/, handler: (state) => runDataQualityCheck(state) },
  { method: "POST", pattern: /^\/api\/data-sources$/, handler: (state, body) => upsertDataSource(state, body as Parameters<typeof upsertDataSource>[1]) },
  { method: "POST", pattern: /^\/api\/data-subscriptions$/, handler: (state, body) => upsertDataSubscription(state, body as Parameters<typeof upsertDataSubscription>[1]) },
  {
    method: "PATCH",
    pattern: /^\/api\/data-subscriptions\/([^/]+)\/toggle$/,
    handler: (state, _body, req) => toggleDataSubscription(state, getParam(new URL(req.url ?? "/", "http://local").pathname, /^\/api\/data-subscriptions\/([^/]+)\/toggle$/))
  },
  { method: "POST", pattern: /^\/api\/data-provider-configs$/, handler: (state, body) => upsertProviderConfig(state, body as Parameters<typeof upsertProviderConfig>[1]) },
  {
    method: "PATCH",
    pattern: /^\/api\/data-provider-configs\/([^/]+)\/toggle$/,
    handler: (state, _body, req) => toggleProviderConfig(state, getParam(new URL(req.url ?? "/", "http://local").pathname, /^\/api\/data-provider-configs\/([^/]+)\/toggle$/))
  },
  { method: "POST", pattern: /^\/api\/factors\/compute$/, handler: (state) => computeFactors(state) },
  { method: "POST", pattern: /^\/api\/factors$/, handler: (state, body) => upsertFactor(state, body as Parameters<typeof upsertFactor>[1]) },
  { method: "POST", pattern: /^\/api\/factor-configs$/, handler: (state, body) => upsertFactorConfig(state, body as Parameters<typeof upsertFactorConfig>[1]) },
  {
    method: "PATCH",
    pattern: /^\/api\/factor-configs\/([^/]+)\/toggle$/,
    handler: (state, _body, req) => toggleFactorConfig(state, getParam(new URL(req.url ?? "/", "http://local").pathname, /^\/api\/factor-configs\/([^/]+)\/toggle$/))
  },
  { method: "POST", pattern: /^\/api\/mirofish\/config$/, handler: (state, body) => upsertMiroFishConfig(state, body as Parameters<typeof upsertMiroFishConfig>[1]) },
  { method: "POST", pattern: /^\/api\/mirofish\/scenarios$/, handler: (state, body) => createMiroFishScenario(state, body as Parameters<typeof createMiroFishScenario>[1]) },
  { method: "POST", pattern: /^\/api\/mirofish\/advance$/, handler: (state) => advanceMiroFishScenarios(state) },
  {
    method: "POST",
    pattern: /^\/api\/mirofish\/scenarios\/([^/]+)\/publish-factor$/,
    handler: (state, _body, req) => publishMiroFishFactor(state, getParam(new URL(req.url ?? "/", "http://local").pathname, /^\/api\/mirofish\/scenarios\/([^/]+)\/publish-factor$/))
  },
  {
    method: "PATCH",
    pattern: /^\/api\/factors\/([^/]+)\/toggle$/,
    handler: (state, _body, req) => toggleFactor(state, getParam(new URL(req.url ?? "/", "http://local").pathname, /^\/api\/factors\/([^/]+)\/toggle$/))
  },
  { method: "POST", pattern: /^\/api\/strategies$/, handler: (state, body) => createStrategy(state, body as Parameters<typeof createStrategy>[1]) },
  {
    method: "POST",
    pattern: /^\/api\/backtests$/,
    handler: (state, body) => createBacktest(state, body as Parameters<typeof createBacktest>[1])
  },
  { method: "POST", pattern: /^\/api\/backtests\/advance$/, handler: (state) => advanceBacktests(state) },
  {
    method: "PATCH",
    pattern: /^\/api\/strategies\/([^/]+)\/toggle$/,
    handler: (state, _body, req) => toggleStrategy(state, getParam(new URL(req.url ?? "/", "http://local").pathname, /^\/api\/strategies\/([^/]+)\/toggle$/))
  },
  { method: "POST", pattern: /^\/api\/strategies\/optimize$/, handler: (state) => optimizeStrategies(state) },
  {
    method: "POST",
    pattern: /^\/api\/orders$/,
    handler: (state, body) => generateOrder(state, String((body as { strategyId?: string }).strategyId ?? state.strategies[0]?.id ?? ""))
  },
  { method: "POST", pattern: /^\/api\/signals\/select$/, handler: (state) => runSignalSelection(state) },
  { method: "POST", pattern: /^\/api\/trading-agents\/deliberate$/, handler: (state, body) => runTradingAgentDeliberation(state, body as Parameters<typeof runTradingAgentDeliberation>[1]) },
  {
    method: "POST",
    pattern: /^\/api\/trading\/auto$/,
    handler: (state, body) => runAutoTrading(state, body as Parameters<typeof runAutoTrading>[1])
  },
  {
    method: "POST",
    pattern: /^\/api\/workflow\/run$/,
    handler: async (state, body) => runOperationalWorkflow(
      finalizeDataSync(await ingestRealMarketData(state), "一键闭环", "一键闭环自动爬取并同步真实行情"),
      body as Parameters<typeof runOperationalWorkflow>[1]
    )
  },
  { method: "POST", pattern: /^\/api\/orders\/execute$/, handler: (state) => executePendingOrders(state) },
  {
    method: "PATCH",
    pattern: /^\/api\/orders\/([^/]+)\/cancel$/,
    handler: (state, _body, req) => cancelOrder(state, getParam(new URL(req.url ?? "/", "http://local").pathname, /^\/api\/orders\/([^/]+)\/cancel$/))
  },
  {
    method: "PATCH",
    pattern: /^\/api\/positions\/([^/]+)\/rebalance$/,
    handler: (state, body, req) => rebalancePosition(
      state,
      getParam(new URL(req.url ?? "/", "http://local").pathname, /^\/api\/positions\/([^/]+)\/rebalance$/),
      Number((body as { weight?: number }).weight ?? 0)
    )
  },
  { method: "POST", pattern: /^\/api\/risk\/refresh$/, handler: (state) => refreshRisk(state) },
  { method: "POST", pattern: /^\/api\/risk-rules$/, handler: (state, body) => upsertRiskRule(state, body as Parameters<typeof upsertRiskRule>[1]) },
  {
    method: "PATCH",
    pattern: /^\/api\/risk-rules\/([^/]+)\/toggle$/,
    handler: (state, _body, req) => toggleRiskRule(state, getParam(new URL(req.url ?? "/", "http://local").pathname, /^\/api\/risk-rules\/([^/]+)\/toggle$/))
  },
  { method: "POST", pattern: /^\/api\/users$/, handler: (state, body) => upsertUser(state, body as Parameters<typeof upsertUser>[1]) },
  { method: "POST", pattern: /^\/api\/roles$/, handler: (state, body) => upsertRole(state, body as Parameters<typeof upsertRole>[1]) },
  { method: "POST", pattern: /^\/api\/system-config$/, handler: (state, body) => updateSystemConfig(state, body as Parameters<typeof updateSystemConfig>[1]) },
  { method: "POST", pattern: /^\/api\/logs$/, handler: (state, body) => appendLog(state, String((body as { module?: string }).module ?? "系统管理"), String((body as { action?: string }).action ?? "记录操作"), String((body as { operator?: string }).operator ?? "quant_admin")) },
  { method: "POST", pattern: /^\/api\/logs\/clear$/, handler: (state) => clearLogs(state) },
  {
    method: "PATCH",
    pattern: /^\/api\/services\/([^/]+)\/toggle$/,
    handler: (state, _body, req) => toggleService(state, getParam(new URL(req.url ?? "/", "http://local").pathname, /^\/api\/services\/([^/]+)\/toggle$/))
  },
  {
    method: "PATCH",
    pattern: /^\/api\/data-sources\/([^/]+)\/subscription$/,
    handler: (state, _body, req) => subscribeSource(state, getParam(new URL(req.url ?? "/", "http://local").pathname, /^\/api\/data-sources\/([^/]+)\/subscription$/))
  },
  {
    method: "POST",
    pattern: /^\/api\/data-warehouse\/refresh$/,
    handler: (state) => appendLog(state, "数据中心", "刷新本地数仓文件统计", "warehouse-monitor")
  },
  {
    method: "POST",
    pattern: /^\/api\/data-warehouse\/compact$/,
    handler: async (state) => {
      const maintenance = await compactWarehouseFiles();
      const next = appendLog(state, "数据中心", maintenance.summary, "warehouse-maintainer");
      return { ...next, dataWarehouse: { ...next.dataWarehouse, lastMaintenance: maintenance } };
    }
  }
];

const readRoutes: Record<string, (state: QuantState) => unknown> = {
  "/api/state": (state) => state,
  "/api/data-sources": (state) => state.dataSources,
  "/api/data-provider-configs": (state) => state.dataProviderConfigs,
  "/api/data-quality-rules": (state) => state.dataQualityRules,
  "/api/data-subscriptions": (state) => state.dataSubscriptions,
  "/api/data-sync-runs": (state) => state.dataSyncRuns,
  "/api/data-aggregate-insights": (state) => state.dataAggregateInsights,
  "/api/factors": (state) => state.factors,
  "/api/factor-configs": (state) => state.factorConfigs,
  "/api/mirofish/config": (state) => state.miroFishConfig,
  "/api/mirofish/scenarios": (state) => state.miroFishScenarios,
  "/api/strategies": (state) => state.strategies,
  "/api/strategy-optimizations": (state) => state.strategyOptimizations,
  "/api/backtests": (state) => state.backtests,
  "/api/backtest-results": (state) => state.backtestResults,
  "/api/stock-signals": (state) => state.stockSignals,
  "/api/trading-agent-decisions": (state) => state.tradingAgentDecisions,
  "/api/auto-trade-runs": (state) => state.autoTradeRuns,
  "/api/orders": (state) => state.orders,
  "/api/positions": (state) => state.positions,
  "/api/risk-rules": (state) => state.riskRules,
  "/api/risk-indicators": (state) => state.riskIndicators,
  "/api/services": (state) => state.services,
  "/api/users": (state) => state.users,
  "/api/roles": (state) => state.roles,
  "/api/system-config": (state) => state.systemConfig,
  "/api/logs": (state) => state.logs,
  "/api/architecture": (state) => state.architecture,
  "/api/market-quotes": (state) => state.marketQuotes,
  "/api/trading/session": (state) => state.marketSession,
  "/api/data-warehouse": (state) => state.dataWarehouse
};

const server = createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      sendText(res, 204, "");
      return;
    }

    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    const state = await loadState();

    if (req.method === "GET" && readRoutes[url.pathname]) {
      sendJson(res, 200, readRoutes[url.pathname](state));
      return;
    }

    const route = mutationRoutes.find((item) => item.method === req.method && item.pattern.test(url.pathname));
    if (!route) {
      sendText(res, 404, `Unknown endpoint: ${req.method} ${url.pathname}`);
      return;
    }

    const body = await readBody(req);
    const nextState = await attachWarehouseStats(normalizeState(await route.handler(state, body, req)));
    await saveState(nextState);
    sendJson(res, 200, nextState);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    sendText(res, 500, message);
  }
});

server.listen(PORT, () => {
  console.log(`Quant trading API listening on http://localhost:${PORT}`);
});

async function runScheduledAutoTrader() {
  try {
    const state = await loadState();
    const withMarketData = process.env.AUTO_TRADER_SYNC_MARKET === "false" ? state : finalizeDataSync(await ingestRealMarketData(state), "自动交易", "自动交易前置数据同步完成");
    const nextState = await attachWarehouseStats(runAutoTrading(withMarketData, { execute: true }));
    await saveState(nextState);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    const state = await loadState();
    await saveState(appendLog(state, "交易执行", `自动交易调度失败：${message}`, "auto-trader"));
  }
}

async function runScheduledDataSync() {
  try {
    const state = await loadState();
    const nextState = await attachWarehouseStats(finalizeDataSync(await ingestRealMarketData(state), "调度", "调度任务完成自动爬取、同步和聚合分析"));
    await saveState(nextState);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    const state = await loadState();
    await saveState(appendLog(state, "数据处理", `数据同步调度失败：${message}`, "data-scheduler"));
  }
}

if (AUTO_TRADER_INTERVAL_MS > 0) {
  setInterval(runScheduledAutoTrader, AUTO_TRADER_INTERVAL_MS);
  console.log(`Scheduled auto trader enabled every ${AUTO_TRADER_INTERVAL_MS}ms`);
}

if (AUTO_DATA_SYNC_INTERVAL_MS > 0) {
  setInterval(runScheduledDataSync, AUTO_DATA_SYNC_INTERVAL_MS);
  console.log(`Scheduled data sync enabled every ${AUTO_DATA_SYNC_INTERVAL_MS}ms`);
}
