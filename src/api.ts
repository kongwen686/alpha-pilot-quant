import type { QuantState } from "./quantEngine";

async function requestState(path: string, options: RequestInit = {}): Promise<QuantState> {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API request failed: ${response.status}`);
  }

  return response.json() as Promise<QuantState>;
}

function post(path: string, body?: unknown) {
  return requestState(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

function patch(path: string, body?: unknown) {
  return requestState(path, {
    method: "PATCH",
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

export function getState() {
  return requestState("/api/state");
}

export function runDataPipeline() {
  return post("/api/data/pipeline");
}

export function runDataQualityCheck() {
  return post("/api/data/quality-check");
}

export function refreshWarehouseStats() {
  return post("/api/data-warehouse/refresh");
}

export function compactWarehouse() {
  return post("/api/data-warehouse/compact");
}

export function saveDataSource(source: unknown) {
  return post("/api/data-sources", source);
}

export function saveDataSubscription(subscription: unknown) {
  return post("/api/data-subscriptions", subscription);
}

export function toggleDataSubscription(id: string) {
  return patch(`/api/data-subscriptions/${encodeURIComponent(id)}/toggle`);
}

export function saveProviderConfig(config: unknown) {
  return post("/api/data-provider-configs", config);
}

export function toggleProviderConfig(id: string) {
  return patch(`/api/data-provider-configs/${encodeURIComponent(id)}/toggle`);
}

export function computeFactors() {
  return post("/api/factors/compute");
}

export function saveFactor(factor: unknown) {
  return post("/api/factors", factor);
}

export function toggleFactor(id: string) {
  return patch(`/api/factors/${encodeURIComponent(id)}/toggle`);
}

export function saveFactorConfig(config: unknown) {
  return post("/api/factor-configs", config);
}

export function toggleFactorConfig(id: string) {
  return patch(`/api/factor-configs/${encodeURIComponent(id)}/toggle`);
}

export function saveMiroFishConfig(config: unknown) {
  return post("/api/mirofish/config", config);
}

export function createMiroFishScenario(scenario: unknown) {
  return post("/api/mirofish/scenarios", scenario);
}

export function advanceMiroFishScenarios() {
  return post("/api/mirofish/advance");
}

export function publishMiroFishFactor(id: string) {
  return post(`/api/mirofish/scenarios/${encodeURIComponent(id)}/publish-factor`);
}

export function createStrategy(strategy: unknown) {
  return post("/api/strategies", strategy);
}

export function createBacktest(input: string | unknown) {
  return post("/api/backtests", typeof input === "string" ? { strategyId: input } : input);
}

export function advanceBacktests() {
  return post("/api/backtests/advance");
}

export function toggleStrategy(strategyId: string) {
  return patch(`/api/strategies/${encodeURIComponent(strategyId)}/toggle`);
}

export function optimizeStrategies() {
  return post("/api/strategies/optimize");
}

export function generateOrder(strategyId: string) {
  return post("/api/orders", { strategyId });
}

export function runSignalSelection() {
  return post("/api/signals/select");
}

export function runTradingAgents(input?: { strategyId?: string }) {
  return post("/api/trading-agents/deliberate", input ?? {});
}

export function runAutoTrading(input?: { strategyId?: string; execute?: boolean; minScore?: number; maxOrders?: number }) {
  return post("/api/trading/auto", input ?? {});
}

export function runWorkflow(input?: { strategyId?: string; execute?: boolean }) {
  return post("/api/workflow/run", input ?? {});
}

export function executePendingOrders() {
  return post("/api/orders/execute");
}

export function cancelOrder(orderId: string) {
  return patch(`/api/orders/${encodeURIComponent(orderId)}/cancel`);
}

export function rebalancePosition(symbol: string, weight: number) {
  return patch(`/api/positions/${encodeURIComponent(symbol)}/rebalance`, { weight });
}

export function refreshRisk() {
  return post("/api/risk/refresh");
}

export function saveRiskRule(rule: unknown) {
  return post("/api/risk-rules", rule);
}

export function toggleRiskRule(id: string) {
  return patch(`/api/risk-rules/${encodeURIComponent(id)}/toggle`);
}

export function toggleService(name: string) {
  return patch(`/api/services/${encodeURIComponent(name)}/toggle`);
}

export function subscribeSource(id: string) {
  return patch(`/api/data-sources/${encodeURIComponent(id)}/subscription`);
}

export function saveUser(user: unknown) {
  return post("/api/users", user);
}

export function saveRole(role: unknown) {
  return post("/api/roles", role);
}

export function saveSystemConfig(config: unknown) {
  return post("/api/system-config", config);
}

export function clearLogs() {
  return post("/api/logs/clear");
}
