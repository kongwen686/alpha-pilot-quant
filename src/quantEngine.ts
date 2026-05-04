export type Status = "正常" | "运行中" | "排队中" | "已完成" | "暂停" | "停止" | "告警";
export type Side = "买入" | "卖出";
export type Signal = "强" | "中" | "弱";
export type SignalAction = "买入" | "卖出" | "观望" | "候选";

export interface DataSource {
  id: string;
  name: string;
  category: string;
  endpoint: string;
  status: Status;
  latency: number;
  rows: number;
  quality: number;
  subscribed: boolean;
  latestUpdate: string;
}

export interface DataProviderConfig {
  id: string;
  name: string;
  category: string;
  provider: "Tencent" | "Yahoo" | "AlphaVantage" | "IBKR" | "Exchange" | "Manual";
  endpoint: string;
  frequency: string;
  symbols: string[];
  authMode: "none" | "api-key" | "oauth" | "terminal";
  enabled: boolean;
  status: Status;
  lastSync: string;
  note: string;
}

export interface DataQualityRule {
  id: string;
  name: string;
  target: string;
  dimension: "完整性" | "准确性" | "及时性" | "一致性";
  threshold: string;
  score: number;
  status: Status;
  lastCheck: string;
}

export interface DataSubscription {
  id: string;
  provider: string;
  dataset: string;
  level: "交易所直连" | "券商API" | "专业数据商" | "免费/半免费" | "另类数据";
  frequency: string;
  markets: string[];
  owner: string;
  cost: number;
  status: Status;
  renewalDate: string;
}

export interface DataSyncRun {
  id: string;
  trigger: "手动" | "调度" | "自动交易" | "一键闭环";
  status: Status;
  providers: string[];
  records: number;
  qualityScore: number;
  latency: number;
  summary: string;
  time: string;
}

export interface DataAggregateInsight {
  id: string;
  name: string;
  scope: string;
  value: number;
  unit: string;
  trend: "上升" | "下降" | "稳定";
  status: Status;
  detail: string;
  updatedAt: string;
}

export interface Factor {
  id: string;
  name: string;
  ic: number;
  icir: number;
  winRate: number;
  signal: Signal;
  enabled: boolean;
}

export interface FactorConfig {
  id: string;
  factorName: string;
  formula: string;
  lookback: number;
  weight: number;
  universe: string;
  rebalance: string;
  enabled: boolean;
  status: Status;
  lastRun: string;
}

export interface MiroFishConfig {
  repoUrl: string;
  license: string;
  integrationMode: "适配层" | "外部服务";
  endpoint: string;
  enabled: boolean;
  status: Status;
  dependencies: string[];
  lastCheck: string;
}

export interface MiroFishScenario {
  id: string;
  title: string;
  sourceMaterials: string;
  predictionQuestion: string;
  status: Status;
  agentCount: number;
  rounds: number;
  progress: number;
  sentiment: number;
  confidence: number;
  predictedImpact: number;
  generatedAt: string;
  report: string;
  linkedFactor?: string;
}

export interface Strategy {
  id: string;
  name: string;
  type: string;
  status: Status;
  pnlToday: number;
  pnlYear: number;
  maxDrawdown: number;
  factors: string[];
  capital: number;
  riskLevel: "低" | "中" | "高";
}

export interface StrategyOptimization {
  id: string;
  strategy: string;
  beforeSharpe: number;
  afterSharpe: number;
  suggestedFactors: string[];
  capitalShift: number;
  status: Status;
  summary: string;
  time: string;
}

export interface StockSignal {
  symbol: string;
  name: string;
  price: number;
  pctChange: number;
  score: number;
  signal: Signal;
  action: SignalAction;
  targetWeight: number;
  stopLoss: number;
  takeProfit: number;
  reasons: string[];
  source: string;
  updatedAt: string;
}

export interface AutoTradeRun {
  id: string;
  mode: SystemConfig["tradingMode"];
  status: Status;
  strategy: string;
  generatedSignals: number;
  selected: number;
  buyOrders: number;
  sellOrders: number;
  ordersCreated: number;
  riskBlocked: number;
  executed: number;
  riskNotes: string[];
  summary: string;
  time: string;
}

export interface BacktestTask {
  id: string;
  strategyId: string;
  strategy: string;
  universe: string;
  benchmark: string;
  period: string;
  initialCapital: number;
  progress: number;
  status: Status;
  startTime: string;
  sharpe: number;
  annualReturn: number;
  maxDrawdown: number;
}

export interface BacktestResult {
  id: string;
  taskId: string;
  strategy: string;
  benchmark: string;
  period: string;
  annualReturn: number;
  excessReturn: number;
  sharpe: number;
  volatility: number;
  maxDrawdown: number;
  winRate: number;
  status: Status;
  completedAt: string;
}

export interface Order {
  id: string;
  strategy: string;
  symbol: string;
  side: Side;
  price: number;
  quantity: number;
  status: "待执行" | "部分成交" | "已成交" | "已撤单";
  time: string;
  amount: number;
  reason?: string;
}

export interface Position {
  symbol: string;
  name: string;
  quantity: number;
  cost: number;
  last: number;
  pnl: number;
  weight: number;
}

export interface RiskRule {
  id: string;
  name: string;
  scope: string;
  threshold: string;
  status: Status;
  triggerCount: number;
}

export interface RiskIndicator {
  id: string;
  name: string;
  scope: string;
  value: number;
  unit: string;
  limit: number;
  status: Status;
  trend: "上升" | "下降" | "稳定";
  updatedAt: string;
}

export interface ServiceHealth {
  name: string;
  status: Status;
  detail: string;
  uptime: string;
}

export interface User {
  name: string;
  role: string;
  status: Status;
  lastLogin: string;
}

export interface RolePermission {
  role: string;
  description: string;
  permissions: string[];
  userCount: number;
  status: Status;
}

export interface SystemConfig {
  tradingMode: "模拟" | "实盘";
  riskMode: "宽松" | "标准" | "严格";
  defaultDataSource: string;
  orderThrottleMs: number;
  maxConcurrentBacktests: number;
  autoTradeEnabled: boolean;
  minSignalScore: number;
  maxAutoOrders: number;
  maxPositionWeight: number;
  stopLossPct: number;
  takeProfitPct: number;
  notificationChannel: string;
  auditRetentionDays: number;
  updatedAt: string;
}

export interface OperationLog {
  id: string;
  module: string;
  action: string;
  operator: string;
  time: string;
}

export interface ArchitectureNode {
  layer: string;
  modules: string[];
  status: Status;
}

export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  pctChange: number;
  open: number;
  previousClose: number;
  high: number;
  low: number;
  volume: number;
  amount: number;
  source: string;
  timestamp: string;
}

export interface TradingSessionStatus {
  market: "A股";
  open: boolean;
  reason: string;
  date: string;
  checkedAt: string;
  nextOpenAt: string;
  sessions: string[];
  source: string;
}

export interface DataWarehouseStats {
  rootPath: string;
  storageMode: "local-jsonl";
  actualBytes: number;
  actualRows: number;
  fileCount: number;
  logicalRows: number;
  logicalBytes: number;
  updatedAt: string;
  files: DataWarehouseFile[];
}

export interface DataWarehouseFile {
  path: string;
  dataset: string;
  partition: string;
  bytes: number;
  rows: number;
  updatedAt: string;
}

export interface QuantState {
  dataSources: DataSource[];
  dataProviderConfigs: DataProviderConfig[];
  dataQualityRules: DataQualityRule[];
  dataSubscriptions: DataSubscription[];
  dataSyncRuns: DataSyncRun[];
  dataAggregateInsights: DataAggregateInsight[];
  factors: Factor[];
  factorConfigs: FactorConfig[];
  miroFishConfig: MiroFishConfig;
  miroFishScenarios: MiroFishScenario[];
  strategies: Strategy[];
  strategyOptimizations: StrategyOptimization[];
  stockSignals: StockSignal[];
  autoTradeRuns: AutoTradeRun[];
  backtests: BacktestTask[];
  backtestResults: BacktestResult[];
  orders: Order[];
  positions: Position[];
  riskRules: RiskRule[];
  riskIndicators: RiskIndicator[];
  services: ServiceHealth[];
  users: User[];
  roles: RolePermission[];
  systemConfig: SystemConfig;
  logs: OperationLog[];
  architecture: ArchitectureNode[];
  marketSeries: number[];
  marketLabels: string[];
  marketQuotes: MarketQuote[];
  marketSession: TradingSessionStatus;
  dataWarehouse: DataWarehouseStats;
  cashBalance: number;
  baseTime: Date;
  riskScore: number;
  alerts: number;
}

const names = ["03-01", "03-08", "03-15", "03-22", "03-29", "04-05", "04-12", "04-19", "04-26", "05-03", "05-10", "05-17", "05-24"];
let localIdSequence = 0;

export const marketLabels = names;

export function createInitialState(): QuantState {
  const baseTime = new Date("2024-05-24T14:30:00");
  return {
    baseTime,
    riskScore: 65,
    alerts: 3,
    cashBalance: 1_250_000,
    marketSession: getTradingSessionStatus(baseTime),
    dataWarehouse: {
      rootPath: "data/warehouse",
      storageMode: "local-jsonl",
      actualBytes: 0,
      actualRows: 0,
      fileCount: 0,
      logicalRows: 0,
      logicalBytes: 0,
      updatedAt: "-",
      files: []
    },
    marketSeries: [0, 1.6, 0.4, -0.8, 2.1, 6.2, 10.8, 6.4, 9.8, 12.3, 14.1, 13.2, 15.1],
    marketLabels: names,
    marketQuotes: [
      { symbol: "000001", name: "上证指数", price: 3159.76, change: -14.3, pctChange: -0.45, open: 3172.4, previousClose: 3174.06, high: 3182.1, low: 3149.3, volume: 0, amount: 0, source: "initial", timestamp: "2024-05-24 15:00:00" },
      { symbol: "399001", name: "深证成指", price: 9735.89, change: 79.19, pctChange: 0.82, open: 9658.2, previousClose: 9656.7, high: 9768.2, low: 9612.4, volume: 0, amount: 0, source: "initial", timestamp: "2024-05-24 15:00:00" },
      { symbol: "399006", name: "创业板指", price: 1875.62, change: -23.73, pctChange: -1.25, open: 1896.8, previousClose: 1899.35, high: 1908.1, low: 1862.5, volume: 0, amount: 0, source: "initial", timestamp: "2024-05-24 15:00:00" },
      { symbol: "000300", name: "沪深300", price: 5268.45, change: 34.08, pctChange: 0.65, open: 5238.1, previousClose: 5234.37, high: 5281.2, low: 5210.4, volume: 0, amount: 0, source: "initial", timestamp: "2024-05-24 15:00:00" }
    ],
    architecture: [
      { layer: "数据层", modules: ["行情数据", "深度数据", "另类数据", "基本面数据", "宏观数据", "外部数据源", "数据仓库"], status: "正常" },
      { layer: "数据处理层", modules: ["数据接入", "数据清洗", "特征工程", "数据服务"], status: "正常" },
      { layer: "策略研究层", modules: ["研究环境", "因子研究", "策略开发", "回测系统", "策略评估"], status: "运行中" },
      { layer: "交易执行层", modules: ["策略引擎", "订单管理", "交易执行", "持仓管理", "风控控制"], status: "运行中" },
      { layer: "基础设施层", modules: ["计算资源", "存储资源", "网络资源", "中间件"], status: "正常" }
    ],
    dataSources: [
      { id: "ds-1", name: "股票/期货行情", category: "行情数据", endpoint: "API / WebSocket", status: "正常", latency: 18, rows: 12800000, quality: 99.2, subscribed: true, latestUpdate: "2024-05-24 14:30:00" },
      { id: "ds-2", name: "Level1/Level2 深度", category: "深度数据", endpoint: "交易所行情网关", status: "正常", latency: 12, rows: 8650000, quality: 98.7, subscribed: true, latestUpdate: "2024-05-24 14:29:58" },
      { id: "ds-3", name: "新闻/舆情/卫星", category: "另类数据", endpoint: "第三方数据供应商", status: "运行中", latency: 96, rows: 452000, quality: 94.8, subscribed: false, latestUpdate: "2024-05-24 14:21:10" },
      { id: "ds-4", name: "财务基本面", category: "基本面数据", endpoint: "Wind / 同花顺", status: "正常", latency: 43, rows: 1256000, quality: 99.6, subscribed: true, latestUpdate: "2024-05-24 09:00:00" },
      { id: "ds-5", name: "经济指标/利率", category: "宏观数据", endpoint: "宏观数据库", status: "正常", latency: 61, rows: 82000, quality: 97.9, subscribed: true, latestUpdate: "2024-05-24 10:15:00" }
    ],
    dataProviderConfigs: [
      { id: "provider-tencent", name: "腾讯证券行情", category: "行情数据", provider: "Tencent", endpoint: "qt.gtimg.cn / web.ifzq.gtimg.cn", frequency: "日K/实时快照", symbols: ["sh000001", "sz399001", "sz399006", "sh000300", "sh600519", "sh601318", "sh600036", "sh600276", "sz000858", "sz000333", "sz002594", "sz300059", "sz300750", "sh510300", "sh588000", "sz159915"], authMode: "none", enabled: true, status: "正常", lastSync: "2024-05-24 14:30:00", note: "默认真实行情源，适合 A 股指数/股票/ETF 试用" },
      { id: "provider-yahoo", name: "Yahoo Finance", category: "行情/基本面", provider: "Yahoo", endpoint: "query1.finance.yahoo.com", frequency: "日K/分钟级有限", symbols: ["AAPL", "MSFT", "SPY"], authMode: "none", enabled: false, status: "暂停", lastSync: "-", note: "适合美股历史行情和轻量基本面" },
      { id: "provider-alpha", name: "Alpha Vantage", category: "行情/基本面", provider: "AlphaVantage", endpoint: "www.alphavantage.co", frequency: "分钟/日K/财务", symbols: ["IBM", "MSFT"], authMode: "api-key", enabled: false, status: "暂停", lastSync: "-", note: "需要 ALPHA_VANTAGE_API_KEY" },
      { id: "provider-ibkr", name: "Interactive Brokers", category: "交易执行", provider: "IBKR", endpoint: "IBKR TWS / Gateway API", frequency: "实时/订单/账户", symbols: ["AAPL", "SPY"], authMode: "terminal", enabled: false, status: "暂停", lastSync: "-", note: "需要本机 TWS/Gateway 登录后接入" },
      { id: "provider-exchange", name: "交易所直连", category: "原始行情", provider: "Exchange", endpoint: "NYSE/NASDAQ/SSE/SZSE Feed", frequency: "Level1/Level2/tick", symbols: ["SSE", "SZSE"], authMode: "terminal", enabled: false, status: "暂停", lastSync: "-", note: "生产环境一手数据源，需要授权 feed" }
    ],
    dataQualityRules: [
      { id: "dq-1", name: "行情字段完整性", target: "实时行情", dimension: "完整性", threshold: "缺失率 < 0.5%", score: 99.4, status: "正常", lastCheck: "2024-05-24 14:30:00" },
      { id: "dq-2", name: "交易所时间戳延迟", target: "Level1/Level2", dimension: "及时性", threshold: "延迟 < 50ms", score: 98.8, status: "正常", lastCheck: "2024-05-24 14:29:58" },
      { id: "dq-3", name: "价格跳变异常", target: "tick/分钟线", dimension: "准确性", threshold: "异常率 < 0.1%", score: 96.7, status: "正常", lastCheck: "2024-05-24 14:25:12" },
      { id: "dq-4", name: "复权与财务口径一致性", target: "历史行情/基本面", dimension: "一致性", threshold: "校验通过率 > 99%", score: 97.9, status: "正常", lastCheck: "2024-05-24 09:10:00" }
    ],
    dataSubscriptions: [
      { id: "sub-1", provider: "Shanghai Stock Exchange", dataset: "Level1/Level2/tick", level: "交易所直连", frequency: "实时", markets: ["SSE"], owner: "数据管理员", cost: 180000, status: "暂停", renewalDate: "2026-12-31" },
      { id: "sub-2", provider: "Interactive Brokers", dataset: "行情/订单/账户", level: "券商API", frequency: "实时/订阅制", markets: ["US", "HK"], owner: "交易员", cost: 24000, status: "正常", renewalDate: "2026-09-30" },
      { id: "sub-3", provider: "Wind", dataset: "历史行情/基本面/宏观", level: "专业数据商", frequency: "日频/分钟", markets: ["CN"], owner: "研究员", cost: 120000, status: "正常", renewalDate: "2026-10-15" },
      { id: "sub-4", provider: "Yahoo Finance", dataset: "日K/财务快照", level: "免费/半免费", frequency: "延迟/日频", markets: ["US", "CN"], owner: "研究员", cost: 0, status: "正常", renewalDate: "长期" },
      { id: "sub-5", provider: "X / Reddit / Reuters", dataset: "舆情/新闻/事件", level: "另类数据", frequency: "分钟/事件驱动", markets: ["Global"], owner: "Alpha研究", cost: 36000, status: "运行中", renewalDate: "2026-08-20" }
    ],
    dataSyncRuns: [],
    dataAggregateInsights: [
      { id: "dai-1", name: "行情覆盖率", scope: "实时行情", value: 86, unit: "%", trend: "稳定", status: "正常", detail: "核心指数、A 股龙头和 ETF 已接入", updatedAt: "2024-05-24 14:30:00" },
      { id: "dai-2", name: "订阅活跃度", scope: "数据订阅", value: 80, unit: "%", trend: "稳定", status: "正常", detail: "免费源、券商 API 和专业数据商组合可用", updatedAt: "2024-05-24 14:30:00" },
      { id: "dai-3", name: "聚合质量分", scope: "数据湖", value: 98, unit: "分", trend: "稳定", status: "正常", detail: "清洗、完整性和及时性均通过", updatedAt: "2024-05-24 14:30:00" }
    ],
    factors: [
      { id: "f-1", name: "Momentum_20D", ic: 0.086, icir: 1.23, winRate: 63.2, signal: "强", enabled: true },
      { id: "f-2", name: "Volatility_20D", ic: -0.032, icir: -0.56, winRate: 42.1, signal: "弱", enabled: true },
      { id: "f-3", name: "Turnover_5D", ic: -0.045, icir: -0.78, winRate: 38.6, signal: "弱", enabled: false },
      { id: "f-4", name: "Size_LN", ic: 0.012, icir: 0.21, winRate: 51.2, signal: "中", enabled: true }
    ],
    factorConfigs: [
      { id: "fc-1", factorName: "Momentum_20D", formula: "close / delay(close, 20) - 1", lookback: 20, weight: 0.42, universe: "全A流动性池", rebalance: "日频", enabled: true, status: "正常", lastRun: "2024-05-24 14:30:00" },
      { id: "fc-2", factorName: "Volatility_20D", formula: "stddev(return, 20)", lookback: 20, weight: 0.24, universe: "全A流动性池", rebalance: "日频", enabled: true, status: "正常", lastRun: "2024-05-24 14:30:00" },
      { id: "fc-3", factorName: "Turnover_5D", formula: "mean(turnover, 5)", lookback: 5, weight: 0.18, universe: "沪深300成分股", rebalance: "日频", enabled: false, status: "暂停", lastRun: "-" },
      { id: "fc-4", factorName: "Size_LN", formula: "ln(market_cap)", lookback: 1, weight: 0.16, universe: "全A流动性池", rebalance: "周频", enabled: true, status: "正常", lastRun: "2024-05-24 14:30:00" }
    ],
    miroFishConfig: {
      repoUrl: "https://github.com/666ghj/MiroFish",
      license: "AGPL-3.0",
      integrationMode: "适配层",
      endpoint: "未连接外部 MiroFish 服务",
      enabled: true,
      status: "正常",
      dependencies: ["LLM API", "Zep Cloud", "OASIS", "Python 3.11-3.12"],
      lastCheck: "2026-05-02 22:35:00"
    },
    miroFishScenarios: [
      {
        id: "mf-1",
        title: "宏观政策冲击推演",
        sourceMaterials: "政策新闻、宏观利率、指数行情、舆情摘要",
        predictionQuestion: "若流动性预期变化，未来 5 个交易日成长/价值风格如何切换？",
        status: "已完成",
        agentCount: 120,
        rounds: 36,
        progress: 100,
        sentiment: 0.18,
        confidence: 72,
        predictedImpact: 1.35,
        generatedAt: "2026-05-02 22:35:00",
        report: "群体推演显示风险偏好小幅修复，成长风格短线占优，但高波动资产需要降低杠杆。",
        linkedFactor: "MiroFish_Swarm_Impact"
      },
      {
        id: "mf-2",
        title: "突发舆情对消费板块影响",
        sourceMaterials: "X/Reddit/新闻事件、成交异动、行业 ETF 分钟行情",
        predictionQuestion: "突发舆情扩散后，消费龙头是否出现短期超额收益回撤？",
        status: "运行中",
        agentCount: 80,
        rounds: 24,
        progress: 62,
        sentiment: -0.22,
        confidence: 64,
        predictedImpact: -0.86,
        generatedAt: "2026-05-02 22:35:00",
        report: "负面情绪扩散速度较快，若成交量同步放大，短线应降低相关持仓权重。"
      }
    ],
    strategies: [
      { id: "s-1", name: "CTA_Trend_v2", type: "趋势跟踪", status: "运行中", pnlToday: 1.23, pnlYear: 23.45, maxDrawdown: 8.12, factors: ["Momentum_20D", "Volatility_20D"], capital: 35000000, riskLevel: "中" },
      { id: "s-2", name: "Alpha_Momentum", type: "量化追踪", status: "运行中", pnlToday: 0.98, pnlYear: 18.67, maxDrawdown: 6.23, factors: ["Momentum_20D", "Turnover_5D"], capital: 28000000, riskLevel: "低" },
      { id: "s-3", name: "Stat_Arb_v1", type: "套利策略", status: "运行中", pnlToday: 0.56, pnlYear: 12.34, maxDrawdown: 4.35, factors: ["Size_LN"], capital: 22000000, riskLevel: "低" },
      { id: "s-4", name: "Market_Neutral_v3", type: "市场中性", status: "暂停", pnlToday: -0.12, pnlYear: 5.67, maxDrawdown: 3.21, factors: ["Volatility_20D"], capital: 18000000, riskLevel: "中" },
      { id: "s-5", name: "Event_Driven_v1", type: "事件驱动", status: "停止", pnlToday: 0, pnlYear: -2.34, maxDrawdown: 5.67, factors: ["Turnover_5D"], capital: 15000000, riskLevel: "高" }
    ],
    strategyOptimizations: [],
    backtests: [
      { id: "bt-20240524-001", strategyId: "s-1", strategy: "CTA_Trend_v2", universe: "沪深300期货", benchmark: "沪深300", period: "2021-01-01 至 2024-05-24", initialCapital: 20_000_000, progress: 75, status: "运行中", startTime: "05-24 10:00", sharpe: 1.62, annualReturn: 21.4, maxDrawdown: 8.1 },
      { id: "bt-20240524-002", strategyId: "s-2", strategy: "Alpha_Momentum", universe: "沪深300成分股", benchmark: "沪深300", period: "2021-01-01 至 2024-05-24", initialCapital: 10_000_000, progress: 100, status: "已完成", startTime: "05-24 09:30", sharpe: 1.47, annualReturn: 18.8, maxDrawdown: 6.2 },
      { id: "bt-20240524-003", strategyId: "s-3", strategy: "Stat_Arb_v1", universe: "中证500成分股", benchmark: "中证500", period: "2021-01-01 至 2024-05-24", initialCapital: 12_000_000, progress: 45, status: "运行中", startTime: "05-24 11:00", sharpe: 1.12, annualReturn: 12.9, maxDrawdown: 4.4 },
      { id: "bt-20240524-004", strategyId: "s-4", strategy: "Market_Neutral_v3", universe: "全A流动性池", benchmark: "现金收益", period: "2020-01-01 至 2024-05-24", initialCapital: 15_000_000, progress: 0, status: "排队中", startTime: "05-24 11:30", sharpe: 0.92, annualReturn: 7.3, maxDrawdown: 3.2 }
    ],
    backtestResults: [
      { id: "br-1", taskId: "bt-20240524-002", strategy: "Alpha_Momentum", benchmark: "沪深300", period: "2021-01-01 至 2024-05-24", annualReturn: 18.8, excessReturn: 9.4, sharpe: 1.47, volatility: 13.2, maxDrawdown: 6.2, winRate: 58.6, status: "已完成", completedAt: "2024-05-24 10:18" },
      { id: "br-2", taskId: "bt-20240523-006", strategy: "Stat_Arb_v1", benchmark: "中证500", period: "2021-01-01 至 2024-05-23", annualReturn: 12.9, excessReturn: 5.1, sharpe: 1.12, volatility: 8.7, maxDrawdown: 4.4, winRate: 55.2, status: "已完成", completedAt: "2024-05-23 17:42" },
      { id: "br-3", taskId: "bt-20240522-003", strategy: "Market_Neutral_v3", benchmark: "现金收益", period: "2020-01-01 至 2024-05-22", annualReturn: 7.3, excessReturn: 4.6, sharpe: 0.92, volatility: 5.1, maxDrawdown: 3.2, winRate: 52.8, status: "已完成", completedAt: "2024-05-22 16:05" }
    ],
    orders: [
      { id: "o-1", strategy: "CTA_Trend_v2", symbol: "IF2406", side: "买入", price: 3580.2, quantity: 2, status: "部分成交", time: "14:30:25", amount: 716040 },
      { id: "o-2", strategy: "Alpha_Momentum", symbol: "600519.SH", side: "买入", price: 1762.3, quantity: 100, status: "已成交", time: "14:29:58", amount: 176230 },
      { id: "o-3", strategy: "Stat_Arb_v1", symbol: "000300.SH", side: "卖出", price: 3456.7, quantity: 5, status: "已成交", time: "14:29:31", amount: 864175 },
      { id: "o-4", strategy: "Market_Neutral_v3", symbol: "510300.SH", side: "买入", price: 3.521, quantity: 200000, status: "待执行", time: "14:28:47", amount: 704200 }
    ],
    positions: [
      { symbol: "IF2406", name: "沪深300期指", quantity: 6, cost: 3562.4, last: 3580.2, pnl: 1.25, weight: 18.4 },
      { symbol: "600519.SH", name: "贵州茅台", quantity: 1200, cost: 1721.6, last: 1762.3, pnl: 2.36, weight: 22.8 },
      { symbol: "000300.SH", name: "沪深300", quantity: 15, cost: 3431.2, last: 3456.7, pnl: 0.74, weight: 16.1 },
      { symbol: "510300.SH", name: "沪深300ETF", quantity: 540000, cost: 3.49, last: 3.521, pnl: 0.89, weight: 19.6 }
    ],
    riskRules: [
      { id: "r-1", name: "单策略 VaR 上限", scope: "策略", threshold: "VaR(95%) < 3.5%", status: "正常", triggerCount: 0 },
      { id: "r-2", name: "最大回撤止损", scope: "组合", threshold: "30日回撤 < 10%", status: "告警", triggerCount: 1 },
      { id: "r-3", name: "品种集中度", scope: "标的", threshold: "单品种权重 < 25%", status: "正常", triggerCount: 0 },
      { id: "r-4", name: "订单价格偏离", scope: "订单", threshold: "偏离盘口 < 1.8%", status: "正常", triggerCount: 2 }
    ],
    riskIndicators: [
      { id: "ri-1", name: "VaR(95%)", scope: "组合", value: 2.35, unit: "%", limit: 3.5, status: "正常", trend: "稳定", updatedAt: "2024-05-24 14:30:00" },
      { id: "ri-2", name: "ES", scope: "组合", value: 3.12, unit: "%", limit: 5, status: "正常", trend: "稳定", updatedAt: "2024-05-24 14:30:00" },
      { id: "ri-3", name: "最大回撤", scope: "策略", value: 8.35, unit: "%", limit: 10, status: "告警", trend: "上升", updatedAt: "2024-05-24 14:30:00" },
      { id: "ri-4", name: "杠杆率", scope: "组合", value: 1.85, unit: "x", limit: 2.5, status: "正常", trend: "稳定", updatedAt: "2024-05-24 14:30:00" },
      { id: "ri-5", name: "品种集中度", scope: "标的", value: 32.45, unit: "%", limit: 35, status: "正常", trend: "下降", updatedAt: "2024-05-24 14:30:00" }
    ],
    services: [
      { name: "数据服务", status: "正常", detail: "运行中", uptime: "99.99%" },
      { name: "回测引擎", status: "正常", detail: "运行中", uptime: "99.95%" },
      { name: "交易接口", status: "正常", detail: "连接正常", uptime: "99.97%" },
      { name: "风控服务", status: "正常", detail: "运行中", uptime: "99.98%" },
      { name: "通知服务", status: "正常", detail: "运行中", uptime: "99.91%" },
      { name: "存储服务", status: "正常", detail: "空间充足", uptime: "99.96%" }
    ],
    users: [
      { name: "quant_admin", role: "超级管理员", status: "正常", lastLogin: "2024-05-24 14:03" },
      { name: "researcher_a", role: "策略研究员", status: "正常", lastLogin: "2024-05-24 11:42" },
      { name: "trader_b", role: "交易员", status: "正常", lastLogin: "2024-05-24 09:15" },
      { name: "risk_c", role: "风控管理员", status: "正常", lastLogin: "2024-05-23 18:22" }
    ],
    roles: [
      { role: "超级管理员", description: "系统全局管理和发布权限", permissions: ["用户管理", "角色权限", "系统配置", "策略发布", "操作日志"], userCount: 1, status: "正常" },
      { role: "策略研究员", description: "研究、因子、策略和回测权限", permissions: ["因子研究", "策略开发", "回测任务", "回测结果"], userCount: 1, status: "正常" },
      { role: "交易员", description: "实盘交易执行和持仓管理权限", permissions: ["交易监控", "订单管理", "持仓管理"], userCount: 1, status: "正常" },
      { role: "风控管理员", description: "风险监控、指标、规则和告警权限", permissions: ["风险监控", "风险指标", "风控规则"], userCount: 1, status: "正常" }
    ],
    systemConfig: {
      tradingMode: "模拟",
      riskMode: "标准",
      defaultDataSource: "腾讯证券行情",
      orderThrottleMs: 250,
      maxConcurrentBacktests: 4,
      autoTradeEnabled: true,
      minSignalScore: 68,
      maxAutoOrders: 3,
      maxPositionWeight: 24,
      stopLossPct: 6,
      takeProfitPct: 12,
      notificationChannel: "站内信 / 邮件",
      auditRetentionDays: 180,
      updatedAt: "2024-05-24 14:30:00"
    },
    stockSignals: [],
    autoTradeRuns: [],
    logs: [
      { id: "log-1", module: "交易执行", action: "订单部分成交 IF2406 x2", operator: "system", time: "14:30:25" },
      { id: "log-2", module: "数据处理", action: "行情数据接入完成", operator: "system", time: "14:29:58" },
      { id: "log-3", module: "风险管理", action: "最大回撤规则触发预警", operator: "risk_c", time: "14:26:12" }
    ]
  };
}

export function formatCurrency(value: number) {
  return value.toLocaleString("zh-CN", { maximumFractionDigits: 2 });
}

export function sumCapital(state: QuantState) {
  return state.strategies.reduce((sum, item) => sum + item.capital, 0);
}

export function cloneState(state: QuantState): QuantState {
  return {
    ...state,
    dataSources: state.dataSources.map((item) => ({ ...item })),
    dataProviderConfigs: (state.dataProviderConfigs ?? createInitialState().dataProviderConfigs).map((item) => ({ ...item, symbols: [...item.symbols] })),
    dataQualityRules: (state.dataQualityRules ?? createInitialState().dataQualityRules).map((item) => ({ ...item })),
    dataSubscriptions: (state.dataSubscriptions ?? createInitialState().dataSubscriptions).map((item) => ({ ...item, markets: [...item.markets] })),
    dataSyncRuns: (state.dataSyncRuns ?? createInitialState().dataSyncRuns).map((item) => ({ ...item, providers: [...item.providers] })),
    dataAggregateInsights: (state.dataAggregateInsights ?? createInitialState().dataAggregateInsights).map((item) => ({ ...item })),
    factors: state.factors.map((item) => ({ ...item })),
    factorConfigs: (state.factorConfigs ?? createInitialState().factorConfigs).map((item) => ({ ...item })),
    miroFishConfig: { ...(state.miroFishConfig ?? createInitialState().miroFishConfig), dependencies: [...(state.miroFishConfig?.dependencies ?? createInitialState().miroFishConfig.dependencies)] },
    miroFishScenarios: (state.miroFishScenarios ?? createInitialState().miroFishScenarios).map((item) => ({ ...item })),
    strategies: state.strategies.map((item) => ({ ...item, factors: [...item.factors] })),
    strategyOptimizations: (state.strategyOptimizations ?? createInitialState().strategyOptimizations).map((item) => ({ ...item, suggestedFactors: [...item.suggestedFactors] })),
    stockSignals: (state.stockSignals ?? createInitialState().stockSignals).map((item) => ({ ...item, reasons: [...item.reasons] })),
    autoTradeRuns: (state.autoTradeRuns ?? createInitialState().autoTradeRuns).map((item) => ({ ...item, riskNotes: [...(item.riskNotes ?? [])] })),
    backtests: state.backtests.map((item) => ({ ...item })),
    backtestResults: (state.backtestResults ?? createInitialState().backtestResults).map((item) => ({ ...item })),
    orders: state.orders.map((item) => ({ ...item })),
    positions: state.positions.map((item) => ({ ...item })),
    riskRules: state.riskRules.map((item) => ({ ...item })),
    riskIndicators: (state.riskIndicators ?? createInitialState().riskIndicators).map((item) => ({ ...item })),
    services: state.services.map((item) => ({ ...item })),
    users: state.users.map((item) => ({ ...item })),
    roles: (state.roles ?? createInitialState().roles).map((item) => ({ ...item, permissions: [...item.permissions] })),
    systemConfig: { ...createInitialState().systemConfig, ...(state.systemConfig ?? {}) },
    logs: state.logs.map((item) => ({ ...item })),
    architecture: state.architecture.map((item) => ({ ...item, modules: [...item.modules] })),
    marketSeries: [...state.marketSeries],
    marketLabels: [...(state.marketLabels ?? names)],
    marketQuotes: (state.marketQuotes ?? []).map((item) => ({ ...item })),
    marketSession: { ...(state.marketSession ?? createInitialState().marketSession), sessions: [...(state.marketSession?.sessions ?? createInitialState().marketSession.sessions)] },
    dataWarehouse: { ...(state.dataWarehouse ?? createInitialState().dataWarehouse), files: [...(state.dataWarehouse?.files ?? [])] },
    cashBalance: Number(state.cashBalance ?? createInitialState().cashBalance),
    baseTime: new Date(state.baseTime)
  };
}

function stamp(date: Date) {
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).replace(/\//g, "-");
}

function timeOnly(date: Date) {
  return date.toLocaleTimeString("zh-CN", { hour12: false });
}

const aShareHolidayRanges2026 = [
  { name: "元旦休市", start: "2026-01-01", end: "2026-01-03" },
  { name: "春节休市", start: "2026-02-15", end: "2026-02-23" },
  { name: "清明节休市", start: "2026-04-04", end: "2026-04-06" },
  { name: "劳动节休市", start: "2026-05-01", end: "2026-05-05" },
  { name: "端午节休市", start: "2026-06-19", end: "2026-06-21" },
  { name: "中秋节休市", start: "2026-09-25", end: "2026-09-27" },
  { name: "国庆节休市", start: "2026-10-01", end: "2026-10-07" }
];

const aShareSessions = ["09:30-11:30", "13:00-15:00"];
const aShareCalendarSource = "上海证券交易所 2026 年部分节假日休市安排";

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function minutesOfDay(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function getAShareTradingSession(date: Date) {
  const key = dateKey(date);
  const holiday = aShareHolidayRanges2026.find((item) => key >= item.start && key <= item.end);
  if (holiday) return { open: false, reason: holiday.name };
  const weekday = date.getDay();
  if (weekday === 0 || weekday === 6) return { open: false, reason: "周末休市" };
  const minutes = minutesOfDay(date);
  const inMorning = minutes >= 9 * 60 + 30 && minutes < 11 * 60 + 30;
  const inAfternoon = minutes >= 13 * 60 && minutes < 15 * 60;
  if (!inMorning && !inAfternoon) return { open: false, reason: "非交易时段" };
  return { open: true, reason: "连续竞价时段" };
}

function isAShareTradingDay(date: Date) {
  const key = dateKey(date);
  const weekday = date.getDay();
  return weekday !== 0 && weekday !== 6 && !aShareHolidayRanges2026.some((item) => key >= item.start && key <= item.end);
}

function setTime(date: Date, hour: number, minute: number) {
  const next = new Date(date);
  next.setHours(hour, minute, 0, 0);
  return next;
}

function getNextAShareOpenAt(date: Date) {
  const minutes = minutesOfDay(date);
  const morningOpen = 9 * 60 + 30;
  const morningClose = 11 * 60 + 30;
  const afternoonOpen = 13 * 60;
  const afternoonClose = 15 * 60;

  if (isAShareTradingDay(date)) {
    if (minutes < morningOpen) return stamp(setTime(date, 9, 30));
    if (minutes >= morningClose && minutes < afternoonOpen) return stamp(setTime(date, 13, 0));
    if (minutes < afternoonClose) return stamp(date);
  }

  for (let offset = 1; offset <= 45; offset += 1) {
    const candidate = new Date(date);
    candidate.setDate(date.getDate() + offset);
    if (isAShareTradingDay(candidate)) return stamp(setTime(candidate, 9, 30));
  }
  return "-";
}

export function getTradingSessionStatus(date = new Date()): TradingSessionStatus {
  const session = getAShareTradingSession(date);
  return {
    market: "A股",
    open: session.open,
    reason: session.reason,
    date: dateKey(date),
    checkedAt: stamp(date),
    nextOpenAt: getNextAShareOpenAt(date),
    sessions: aShareSessions,
    source: aShareCalendarSource
  };
}

function appendOrderReason(order: Order, reason: string) {
  return order.reason?.includes(reason) ? order.reason : order.reason ? `${order.reason}；${reason}` : reason;
}

function isContinuousTradingTimeLabel(time: string) {
  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return true;
  const minutes = hour * 60 + minute;
  return (minutes >= 9 * 60 + 30 && minutes < 11 * 60 + 30) || (minutes >= 13 * 60 && minutes < 15 * 60);
}

export function normalizeOrderTradingCalendar(state: QuantState): QuantState {
  const next = cloneState(state);
  const tradingSession = getAShareTradingSession(next.baseTime);
  next.marketSession = getTradingSessionStatus(next.baseTime);
  next.orders = next.orders.map((order) => {
    if (order.status !== "已成交") return order;
    const offSessionTime = order.time ? !isContinuousTradingTimeLabel(order.time) : false;
    const filledOnClosedDay = !tradingSession.open;
    if (!offSessionTime && !filledOnClosedDay) return order;
    const reason = offSessionTime ? "交易日历复核：非交易时段，撤回成交状态" : `交易日历复核：A股${tradingSession.reason}，撤回成交状态`;
    return { ...order, status: "待执行", reason: appendOrderReason(order, reason) };
  });
  return next;
}

function addLog(state: QuantState, module: string, action: string, operator = "system") {
  state.logs.unshift({
    id: `log-${Date.now()}-${localIdSequence++}`,
    module,
    action,
    operator,
    time: timeOnly(state.baseTime)
  });
  state.logs = state.logs.slice(0, 40);
}

function aggregateDataInsights(state: QuantState) {
  const updatedAt = stamp(new Date());
  const activeProviders = state.dataProviderConfigs.filter((item) => item.enabled && item.status !== "停止");
  const activeSubscriptions = state.dataSubscriptions.filter((item) => item.status === "正常" || item.status === "运行中");
  const totalRows = state.dataSources.reduce((sum, source) => sum + source.rows, 0);
  const avgQuality = state.dataSources.reduce((sum, source) => sum + source.quality, 0) / Math.max(1, state.dataSources.length);
  const avgLatency = state.dataSources.reduce((sum, source) => sum + source.latency, 0) / Math.max(1, state.dataSources.length);
  const quoteCoverage = state.marketQuotes.filter((quote) => quote.price > 0).length;
  const subscribedSources = state.dataSources.filter((source) => source.subscribed).length;
  const coverageScore = clamp(Math.round((quoteCoverage / Math.max(8, activeProviders.reduce((sum, item) => sum + item.symbols.length, 0))) * 100), 0, 100);
  const subscriptionScore = clamp(Math.round((activeSubscriptions.length / Math.max(1, state.dataSubscriptions.length)) * 100), 0, 100);
  const lakeScore = clamp(Math.round(avgQuality - Math.max(0, avgLatency - 80) / 12), 0, 100);

  state.dataAggregateInsights = [
    {
      id: "dai-coverage",
      name: "行情覆盖率",
      scope: "实时行情",
      value: coverageScore,
      unit: "%",
      trend: coverageScore >= (state.dataAggregateInsights.find((item) => item.id === "dai-coverage")?.value ?? coverageScore) ? "上升" : "下降",
      status: coverageScore >= 70 ? "正常" : "告警",
      detail: `${quoteCoverage} 个有效行情标的，${activeProviders.length} 个采集接口启用`,
      updatedAt
    },
    {
      id: "dai-subscription",
      name: "订阅活跃度",
      scope: "数据订阅",
      value: subscriptionScore,
      unit: "%",
      trend: activeSubscriptions.length >= 3 ? "稳定" : "下降",
      status: subscriptionScore >= 60 ? "正常" : "运行中",
      detail: `${activeSubscriptions.length}/${state.dataSubscriptions.length} 个订阅活跃，${subscribedSources}/${state.dataSources.length} 个数据源订阅`,
      updatedAt
    },
    {
      id: "dai-quality",
      name: "聚合质量分",
      scope: "数据湖",
      value: lakeScore,
      unit: "分",
      trend: avgQuality >= 97 ? "稳定" : "下降",
      status: lakeScore >= 95 ? "正常" : lakeScore >= 90 ? "运行中" : "告警",
      detail: `累计 ${formatCurrency(totalRows)} 行，平均质量 ${avgQuality.toFixed(1)}%，平均延迟 ${Math.round(avgLatency)}ms`,
      updatedAt
    },
    {
      id: "dai-alpha",
      name: "Alpha 可用度",
      scope: "因子与信号",
      value: clamp(Math.round((state.factors.filter((factor) => factor.enabled).length * 16) + state.stockSignals.filter((signal) => signal.action === "买入" || signal.action === "候选").length * 4), 0, 100),
      unit: "%",
      trend: "稳定",
      status: state.stockSignals.length > 0 ? "正常" : "运行中",
      detail: `${state.factors.filter((factor) => factor.enabled).length} 个启用因子，${state.stockSignals.length} 条信号`,
      updatedAt
    }
  ];
}

function recordDataSyncRun(state: QuantState, trigger: DataSyncRun["trigger"], summary: string) {
  const activeProviders = state.dataProviderConfigs.filter((item) => item.enabled);
  const records = state.marketQuotes.length + state.dataSources.reduce((sum, source) => sum + Math.max(0, Math.round(source.rows / 1_000_000)), 0);
  const qualityScore = Number((state.dataSources.reduce((sum, source) => sum + source.quality, 0) / Math.max(1, state.dataSources.length)).toFixed(1));
  const latency = Math.round(state.dataSources.reduce((sum, source) => sum + source.latency, 0) / Math.max(1, state.dataSources.length));
  const status: Status = qualityScore >= 95 ? "已完成" : "告警";
  state.dataSyncRuns = [
    {
      id: `dsr-${Date.now()}-${localIdSequence++}`,
      trigger,
      status,
      providers: activeProviders.map((item) => item.name),
      records,
      qualityScore,
      latency,
      summary,
      time: stamp(new Date())
    },
    ...state.dataSyncRuns
  ].slice(0, 20);
}

export function finalizeDataSync(state: QuantState, trigger: DataSyncRun["trigger"] = "手动", summary = "数据同步、清洗、聚合分析完成"): QuantState {
  const next = cloneState(state);
  const syncedAt = stamp(new Date());
  next.dataProviderConfigs = next.dataProviderConfigs.map((config) => config.enabled
    ? { ...config, status: "正常", lastSync: syncedAt }
    : { ...config, status: config.status === "停止" ? "停止" : "暂停" });
  next.dataSubscriptions = next.dataSubscriptions.map((subscription) => {
    if (subscription.status === "暂停") return subscription;
    return { ...subscription, status: subscription.cost > 0 ? "正常" : "运行中" };
  });
  aggregateDataInsights(next);
  recordDataSyncRun(next, trigger, summary);
  addLog(next, "数据处理", summary, trigger === "调度" ? "data-scheduler" : "data-pipeline");
  return next;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function safeNumber(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function inferExchange(symbol: string) {
  if (symbol.endsWith(".SH") || symbol.endsWith(".SZ")) return symbol;
  if (/^(5|6|9|11)/.test(symbol)) return `${symbol}.SH`;
  return `${symbol}.SZ`;
}

function isTradableQuote(quote: MarketQuote) {
  const normalized = quote.symbol.replace(/\.(SH|SZ)$/i, "");
  const isIndex = quote.name.includes("指数") || ["000001", "399001", "399006", "000300"].includes(normalized);
  return quote.price > 0 && normalized.length === 6 && !isIndex;
}

function quoteFromPosition(position: Position): MarketQuote {
  return {
    symbol: position.symbol.replace(/\.(SH|SZ)$/i, ""),
    name: position.name,
    price: position.last,
    change: Number((position.last - position.cost).toFixed(3)),
    pctChange: position.pnl,
    open: position.cost,
    previousClose: position.cost,
    high: Math.max(position.cost, position.last),
    low: Math.min(position.cost, position.last),
    volume: Math.max(1, position.quantity),
    amount: Math.max(1, position.quantity * position.last),
    source: "持仓快照",
    timestamp: stamp(new Date())
  };
}

function buildSignalReasons(quote: MarketQuote, score: number, factorBias: number) {
  const reasons: string[] = [];
  if (quote.pctChange >= 0.8) reasons.push("日内动量较强");
  if (quote.pctChange <= -0.8) reasons.push("价格承压需降权");
  if (quote.amount >= 1_000_000_000 || quote.volume >= 1_000_000) reasons.push("流动性满足自动交易");
  if (factorBias > 6) reasons.push("启用因子共振");
  if (score >= 78) reasons.push("综合评分进入强信号区间");
  if (reasons.length === 0) reasons.push("综合评分中性，保持观察");
  return reasons.slice(0, 3);
}

function buildStockSignals(state: QuantState): StockSignal[] {
  const timestamp = stamp(new Date());
  const enabledFactors = state.factors.filter((factor) => factor.enabled);
  const minSignalScore = state.systemConfig.minSignalScore ?? 68;
  const maxPositionWeight = state.systemConfig.maxPositionWeight ?? 24;
  const factorBias = enabledFactors.reduce((sum, factor) => {
    const signalBias = factor.signal === "强" ? 6 : factor.signal === "中" ? 2 : -4;
    return sum + signalBias + factor.ic * 32 + factor.icir * 1.6;
  }, 0) / Math.max(1, enabledFactors.length);
  const quotes = state.marketQuotes.filter(isTradableQuote);
  const tradableQuotes = quotes.length > 0 ? quotes : state.positions.map(quoteFromPosition);
  const existingWeights = new Map(state.positions.map((position) => [position.symbol.replace(/\.(SH|SZ)$/i, ""), position.weight]));

  return tradableQuotes
    .map((quote) => {
      const range = Math.max(0.001, quote.high - quote.low);
      const rangePosition = clamp((quote.price - quote.low) / range, 0, 1);
      const liquidityScore = clamp(Math.log10(Math.max(1, quote.amount || quote.volume * quote.price)) - 7, 0, 1) * 14;
      const momentumScore = clamp(quote.pctChange * 6.5, -22, 22);
      const rangeScore = (rangePosition - 0.45) * 18;
      const holdingPenalty = (existingWeights.get(quote.symbol) ?? 0) > maxPositionWeight * 0.82 ? -8 : 0;
      const score = Math.round(clamp(55 + factorBias + liquidityScore + momentumScore + rangeScore + holdingPenalty, 0, 100));
      const action: SignalAction = score >= 78 ? "买入" : score >= minSignalScore ? "候选" : score <= 42 ? "卖出" : "观望";
      const signal: Signal = score >= 78 ? "强" : score >= 58 ? "中" : "弱";
      const targetWeight = action === "买入" ? clamp(Math.round((score - 60) / 3), 4, 10) : action === "候选" ? clamp(Math.round((score - 58) / 4), 2, 5) : 0;

      return {
        symbol: inferExchange(quote.symbol),
        name: quote.name,
        price: Number(quote.price.toFixed(3)),
        pctChange: Number(quote.pctChange.toFixed(2)),
        score,
        signal,
        action,
        targetWeight,
        stopLoss: Number((quote.price * 0.965).toFixed(3)),
        takeProfit: Number((quote.price * 1.075).toFixed(3)),
        reasons: buildSignalReasons(quote, score, factorBias),
        source: `${quote.source} / 因子信号`,
        updatedAt: timestamp
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}

function getRiskLimit(config: SystemConfig) {
  if (config.riskMode === "严格") return 68;
  if (config.riskMode === "宽松") return 86;
  return 78;
}

function getLotSize(symbol: string) {
  return symbol.startsWith("IF") || symbol.startsWith("IC") || symbol.startsWith("IM") ? 1 : 100;
}

function createOrderFromSignal(state: QuantState, strategy: Strategy, signal: StockSignal, index: number, maxPositionWeight: number): Order | null {
  const lotSize = getLotSize(signal.symbol);
  const marketValue = state.positions.reduce((sum, position) => sum + position.quantity * position.last, 0);
  const portfolioValue = marketValue + Number(state.cashBalance ?? 0);
  const cashAvailable = Number(state.cashBalance ?? 0);
  const currentPosition = state.positions.find((position) => position.symbol === signal.symbol);
  const currentValue = currentPosition ? currentPosition.quantity * currentPosition.last : 0;
  const budgetBase = portfolioValue > 0 ? portfolioValue : strategy.capital;
  const desiredValue = budgetBase * (signal.targetWeight / 100);
  const desiredAmount = Math.max(0, desiredValue - currentValue);
  const strategyCapAmount = strategy.capital * (signal.targetWeight / 100);
  const concentrationRoom = budgetBase > 0 ? Math.max(0, budgetBase * (maxPositionWeight / 100) - currentValue) : strategyCapAmount;
  const targetAmount = Math.min(desiredAmount, strategyCapAmount, concentrationRoom, cashAvailable);
  const quantity = Math.floor(targetAmount / signal.price / lotSize) * lotSize;
  if (quantity <= 0) return null;
  return {
    id: `o-auto-${Date.now()}-${index}`,
    strategy: strategy.name,
    symbol: signal.symbol,
    side: "买入",
    price: signal.price,
    quantity,
    status: "待执行",
    time: timeOnly(state.baseTime),
    amount: Number((signal.price * quantity).toFixed(2)),
    reason: `${signal.signal}信号买入：${signal.reasons.join("、")}`
  };
}

function createReduceOrderFromPosition(
  state: QuantState,
  strategy: Strategy,
  position: Position,
  price: number,
  quantity: number,
  reason: string,
  index: number
): Order | null {
  const lotSize = getLotSize(position.symbol);
  const normalizedQuantity = Math.floor(Math.min(position.quantity, quantity) / lotSize) * lotSize;
  if (normalizedQuantity <= 0) return null;
  return {
    id: `o-auto-sell-${Date.now()}-${index}`,
    strategy: strategy.name,
    symbol: position.symbol,
    side: "卖出",
    price: Number(price.toFixed(3)),
    quantity: normalizedQuantity,
    status: "待执行",
    time: timeOnly(state.baseTime),
    amount: Number((price * normalizedQuantity).toFixed(2)),
    reason
  };
}

function updatePositionWeights(state: QuantState) {
  const marketValue = state.positions.reduce((sum, position) => sum + position.quantity * position.last, 0);
  const totalValue = marketValue + Number(state.cashBalance ?? 0);
  state.positions = state.positions.map((position) => ({
    ...position,
    weight: totalValue > 0 ? Number((((position.quantity * position.last) / totalValue) * 100).toFixed(2)) : position.weight
  }));
}

function buildReduceOrders(
  state: QuantState,
  strategy: Strategy,
  signalsBySymbol: Map<string, StockSignal>,
  pendingSymbols: Set<string>,
  maxOrders: number,
  maxPositionWeight: number
) {
  const marketValue = state.positions.reduce((sum, position) => sum + position.quantity * position.last, 0);
  const portfolioValue = marketValue + Number(state.cashBalance ?? 0);
  const stopLossPct = Number(state.systemConfig.stopLossPct ?? 6);
  const takeProfitPct = Number(state.systemConfig.takeProfitPct ?? 12);

  return state.positions
    .filter((position) => position.quantity > 0 && !pendingSymbols.has(position.symbol))
    .map((position) => {
      const signal = signalsBySymbol.get(position.symbol);
      const price = signal?.price ?? position.last;
      const pnl = position.cost > 0 ? ((price - position.cost) / position.cost) * 100 : position.pnl;
      const value = position.quantity * price;
      const overweightValue = portfolioValue > 0 ? Math.max(0, value - portfolioValue * (maxPositionWeight / 100)) : 0;
      const overweightQuantity = overweightValue > 0 ? overweightValue / price : 0;
      const profitTargetWeight = Math.max(8, signal?.targetWeight ?? 0);
      const profitTrimValue = portfolioValue > 0 ? Math.max(0, value - portfolioValue * (profitTargetWeight / 100)) : 0;
      const hardStop = pnl <= -stopLossPct;
      const weakSignal = signal?.action === "卖出" || (signal?.score ?? 100) <= 42;
      const profitTrim = pnl >= takeProfitPct && (signal?.score ?? 0) < 78 && profitTrimValue > 0;
      const needsTrim = overweightValue > 0 || hardStop || weakSignal || profitTrim;
      if (!needsTrim) return null;

      let quantity = 0;
      const reasons: string[] = [];
      if (hardStop) {
        quantity = position.quantity;
        reasons.push(`触发止损 ${pnl.toFixed(2)}%`);
      } else if (weakSignal) {
        quantity = position.quantity;
        reasons.push(`弱信号减仓 ${signal?.score ?? "无评分"}`);
      } else if (profitTrim) {
        quantity = Math.max(quantity, profitTrimValue / price);
        reasons.push(`达到止盈 ${pnl.toFixed(2)}%，降至 ${profitTargetWeight}%`);
      }
      if (overweightQuantity > 0) {
        quantity = Math.max(quantity, overweightQuantity);
        reasons.push(`超过单标的权重 ${maxPositionWeight}%`);
      }

      return {
        priority: hardStop ? 4 : weakSignal ? 3 : overweightQuantity > 0 ? 2 : 1,
        order: createReduceOrderFromPosition(state, strategy, position, price, quantity, reasons.join("；"), reasons.length)
      };
    })
    .filter((item): item is { priority: number; order: Order } => Boolean(item?.order))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxOrders)
    .map((item, index) => ({ ...item.order, id: `${item.order.id}-${index}` }));
}

export function appendLog(state: QuantState, module: string, action: string, operator = "system"): QuantState {
  const next = cloneState(state);
  addLog(next, module, action, operator);
  return next;
}

export function upsertDataSource(state: QuantState, input: Partial<DataSource> & Pick<DataSource, "name" | "category" | "endpoint">): QuantState {
  const next = cloneState(state);
  const existing = input.id ? next.dataSources.find((source) => source.id === input.id) : undefined;
  if (existing) {
    next.dataSources = next.dataSources.map((source) => source.id === input.id ? { ...source, ...input } : source);
    addLog(next, "数据中心", `更新数据源 ${input.name}`, "quant_admin");
    return next;
  }

  next.dataSources.unshift({
    id: `ds-${Date.now()}`,
    name: input.name,
    category: input.category,
    endpoint: input.endpoint,
    status: "正常",
    latency: Number(input.latency ?? 0),
    rows: Number(input.rows ?? 0),
    quality: Number(input.quality ?? 100),
    subscribed: Boolean(input.subscribed ?? true),
    latestUpdate: input.latestUpdate ?? stamp(new Date())
  });
  addLog(next, "数据中心", `新增数据源 ${input.name}`, "quant_admin");
  return next;
}

export function upsertProviderConfig(state: QuantState, input: Partial<DataProviderConfig> & Pick<DataProviderConfig, "name" | "provider" | "endpoint">): QuantState {
  const next = cloneState(state);
  const id = input.id ?? `provider-${Date.now()}`;
  const config: DataProviderConfig = {
    id,
    name: input.name,
    category: input.category ?? "行情数据",
    provider: input.provider,
    endpoint: input.endpoint,
    frequency: input.frequency ?? "日K/实时快照",
    symbols: input.symbols ?? [],
    authMode: input.authMode ?? "none",
    enabled: Boolean(input.enabled ?? true),
    status: input.enabled === false ? "暂停" : "正常",
    lastSync: input.lastSync ?? "-",
    note: input.note ?? ""
  };
  const exists = next.dataProviderConfigs.some((item) => item.id === id);
  next.dataProviderConfigs = exists ? next.dataProviderConfigs.map((item) => item.id === id ? config : item) : [config, ...next.dataProviderConfigs];
  addLog(next, "数据中心", `${exists ? "更新" : "新增"}采集配置 ${config.name}`, "quant_admin");
  return next;
}

export function toggleProviderConfig(state: QuantState, id: string): QuantState {
  const next = cloneState(state);
  next.dataProviderConfigs = next.dataProviderConfigs.map((item) => {
    if (item.id !== id) return item;
    const enabled = !item.enabled;
    addLog(next, "数据中心", `${enabled ? "启用" : "停用"}采集配置 ${item.name}`, "quant_admin");
    return { ...item, enabled, status: enabled ? "正常" : "暂停" };
  });
  return next;
}

export function runDataQualityCheck(state: QuantState): QuantState {
  const next = cloneState(state);
  const checkedAt = stamp(new Date());
  next.dataQualityRules = next.dataQualityRules.map((rule, index) => {
    const relatedSource = next.dataSources[index % next.dataSources.length];
    const sourceScore = relatedSource?.quality ?? rule.score;
    const score = Math.max(88, Math.min(100, Number(((rule.score * 0.65) + (sourceScore * 0.35) + (index % 2 === 0 ? 0.2 : -0.15)).toFixed(1))));
    return {
      ...rule,
      score,
      status: score >= 97 ? "正常" : score >= 94 ? "运行中" : "告警",
      lastCheck: checkedAt
    };
  });
  next.dataSources = next.dataSources.map((source) => {
    const matchedRules = next.dataQualityRules.filter((rule) => rule.target.includes(source.category) || source.name.includes(rule.target.split("/")[0]));
    const score = matchedRules.length > 0 ? matchedRules.reduce((sum, rule) => sum + rule.score, 0) / matchedRules.length : source.quality;
    return { ...source, quality: Number(Math.min(100, Math.max(88, score)).toFixed(1)) };
  });
  aggregateDataInsights(next);
  addLog(next, "数据中心", "完成数据完整性、准确性、及时性和一致性质量巡检", "quant_admin");
  return next;
}

export function upsertDataSubscription(state: QuantState, input: Partial<DataSubscription> & Pick<DataSubscription, "provider" | "dataset" | "level">): QuantState {
  const next = cloneState(state);
  const id = input.id ?? `sub-${Date.now()}`;
  const subscription: DataSubscription = {
    id,
    provider: input.provider,
    dataset: input.dataset,
    level: input.level,
    frequency: input.frequency ?? "日频",
    markets: input.markets ?? ["CN"],
    owner: input.owner ?? "quant_admin",
    cost: Number(input.cost ?? 0),
    status: input.status ?? "正常",
    renewalDate: input.renewalDate ?? "长期"
  };
  const exists = next.dataSubscriptions.some((item) => item.id === id);
  next.dataSubscriptions = exists ? next.dataSubscriptions.map((item) => item.id === id ? subscription : item) : [subscription, ...next.dataSubscriptions];
  addLog(next, "数据中心", `${exists ? "更新" : "新增"}数据订阅 ${subscription.provider} / ${subscription.dataset}`, "quant_admin");
  return next;
}

export function toggleDataSubscription(state: QuantState, id: string): QuantState {
  const next = cloneState(state);
  next.dataSubscriptions = next.dataSubscriptions.map((subscription) => {
    if (subscription.id !== id) return subscription;
    const status: Status = subscription.status === "正常" || subscription.status === "运行中" ? "暂停" : "正常";
    addLog(next, "数据中心", `${status === "暂停" ? "暂停" : "启用"}数据订阅 ${subscription.provider}`, "quant_admin");
    return { ...subscription, status };
  });
  return next;
}

export function createStrategy(state: QuantState, input: Partial<Strategy> & Pick<Strategy, "name" | "type">): QuantState {
  const next = cloneState(state);
  next.strategies.unshift({
    id: `s-${Date.now()}`,
    name: input.name,
    type: input.type,
    status: input.status ?? "暂停",
    pnlToday: Number(input.pnlToday ?? 0),
    pnlYear: Number(input.pnlYear ?? 0),
    maxDrawdown: Number(input.maxDrawdown ?? 0),
    factors: input.factors ?? next.factors.filter((factor) => factor.enabled).slice(0, 2).map((factor) => factor.name),
    capital: Number(input.capital ?? 10_000_000),
    riskLevel: input.riskLevel ?? "中"
  });
  addLog(next, "策略研究", `新增策略 ${input.name}`, "researcher_a");
  return next;
}

export function toggleFactor(state: QuantState, factorId: string): QuantState {
  const next = cloneState(state);
  next.factors = next.factors.map((factor) => {
    if (factor.id !== factorId) return factor;
    addLog(next, "策略研究", `${factor.enabled ? "停用" : "启用"}因子 ${factor.name}`, "researcher_a");
    return { ...factor, enabled: !factor.enabled };
  });
  return next;
}

export function upsertFactor(state: QuantState, input: Partial<Factor> & Pick<Factor, "name">): QuantState {
  const next = cloneState(state);
  const existingFactor = next.factors.find((item) => item.id === input.id || (!input.id && item.name === input.name));
  const id = existingFactor?.id ?? input.id ?? `f-${Date.now()}`;
  const ic = Number(input.ic ?? existingFactor?.ic ?? 0);
  const factor: Factor = {
    id,
    name: input.name,
    ic,
    icir: Number(input.icir ?? existingFactor?.icir ?? 0),
    winRate: Number(input.winRate ?? existingFactor?.winRate ?? 50),
    signal: input.signal ?? existingFactor?.signal ?? (ic > 0.06 ? "强" : ic > 0 ? "中" : "弱"),
    enabled: Boolean(input.enabled ?? existingFactor?.enabled ?? true)
  };
  const exists = Boolean(existingFactor);
  next.factors = exists ? next.factors.map((item) => item.id === id ? factor : item) : [factor, ...next.factors];
  if (!next.factorConfigs.some((item) => item.factorName === factor.name)) {
    next.factorConfigs = [{
      id: `fc-${Date.now()}`,
      factorName: factor.name,
      formula: "custom_factor(close, volume, sentiment)",
      lookback: 20,
      weight: 0.2,
      universe: "全A流动性池",
      rebalance: "日频",
      enabled: factor.enabled,
      status: factor.enabled ? "正常" : "暂停",
      lastRun: "-"
    }, ...next.factorConfigs];
  }
  addLog(next, "策略研究", `${exists ? "更新" : "新增"}因子 ${factor.name}`, "researcher_a");
  return next;
}

export function upsertFactorConfig(state: QuantState, input: Partial<FactorConfig> & { factorName?: string; name?: string }): QuantState {
  const next = cloneState(state);
  const factorName = input.factorName ?? input.name ?? "Custom_Factor";
  const existingConfig = next.factorConfigs.find((item) => item.id === input.id || (!input.id && item.factorName === factorName));
  const id = existingConfig?.id ?? input.id ?? `fc-${Date.now()}`;
  const config: FactorConfig = {
    id,
    factorName,
    formula: input.formula ?? existingConfig?.formula ?? "custom_factor(close, volume)",
    lookback: Number(input.lookback ?? existingConfig?.lookback ?? 20),
    weight: Number(input.weight ?? existingConfig?.weight ?? 0.2),
    universe: input.universe ?? existingConfig?.universe ?? "全A流动性池",
    rebalance: input.rebalance ?? existingConfig?.rebalance ?? "日频",
    enabled: Boolean(input.enabled ?? existingConfig?.enabled ?? true),
    status: input.enabled === false ? "暂停" : input.status ?? existingConfig?.status ?? "正常",
    lastRun: input.lastRun ?? existingConfig?.lastRun ?? "-"
  };
  const exists = Boolean(existingConfig);
  next.factorConfigs = exists ? next.factorConfigs.map((item) => item.id === id ? config : item) : [config, ...next.factorConfigs];
  if (!next.factors.some((factor) => factor.name === config.factorName)) {
    next.factors = [{
      id: `f-${Date.now()}`,
      name: config.factorName,
      ic: 0,
      icir: 0,
      winRate: 50,
      signal: "中",
      enabled: config.enabled
    }, ...next.factors];
  } else {
    next.factors = next.factors.map((factor) => factor.name === config.factorName ? { ...factor, enabled: config.enabled } : factor);
  }
  addLog(next, "策略研究", `${exists ? "更新" : "新增"}因子配置 ${config.factorName}`, "researcher_a");
  return next;
}

export function toggleFactorConfig(state: QuantState, id: string): QuantState {
  const next = cloneState(state);
  next.factorConfigs = next.factorConfigs.map((config) => {
    if (config.id !== id) return config;
    const enabled = !config.enabled;
    addLog(next, "策略研究", `${enabled ? "启用" : "停用"}因子配置 ${config.factorName}`, "researcher_a");
    return { ...config, enabled, status: enabled ? "正常" : "暂停" };
  });
  const config = next.factorConfigs.find((item) => item.id === id);
  if (config) {
    next.factors = next.factors.map((factor) => factor.name === config.factorName ? { ...factor, enabled: config.enabled } : factor);
  }
  return next;
}

export function upsertMiroFishConfig(state: QuantState, input: Partial<MiroFishConfig>): QuantState {
  const next = cloneState(state);
  next.miroFishConfig = {
    ...next.miroFishConfig,
    ...input,
    dependencies: input.dependencies ?? next.miroFishConfig.dependencies,
    enabled: Boolean(input.enabled ?? next.miroFishConfig.enabled),
    status: input.enabled === false ? "暂停" : input.status ?? "正常",
    lastCheck: stamp(new Date())
  };
  addLog(next, "策略研究", "更新 MiroFish 群体智能推演集成配置", "quant_admin");
  return next;
}

export function createMiroFishScenario(
  state: QuantState,
  input: Partial<MiroFishScenario> & Pick<MiroFishScenario, "title" | "predictionQuestion">
): QuantState {
  const next = cloneState(state);
  const scenario: MiroFishScenario = {
    id: `mf-${Date.now()}`,
    title: input.title,
    sourceMaterials: input.sourceMaterials ?? "行情、新闻、舆情、基本面、策略信号",
    predictionQuestion: input.predictionQuestion,
    status: "排队中",
    agentCount: Number(input.agentCount ?? 96),
    rounds: Number(input.rounds ?? 24),
    progress: 0,
    sentiment: 0,
    confidence: 0,
    predictedImpact: 0,
    generatedAt: stamp(new Date()),
    report: "推演任务已创建，等待群体智能环境准备。"
  };
  next.miroFishScenarios = [scenario, ...next.miroFishScenarios].slice(0, 20);
  addLog(next, "策略研究", `创建 MiroFish 推演任务 ${scenario.title}`, "researcher_a");
  return next;
}

export function advanceMiroFishScenarios(state: QuantState): QuantState {
  const next = cloneState(state);
  next.miroFishScenarios = next.miroFishScenarios.map((scenario, index) => {
    if (scenario.status === "已完成") return scenario;
    const progress = Math.min(100, scenario.progress + 26 + index * 5);
    const sentiment = Number((scenario.sentiment + (index % 2 === 0 ? 0.12 : -0.08)).toFixed(2));
    const predictedImpact = Number((sentiment * 4.8 + scenario.agentCount / 180).toFixed(2));
    const confidence = Math.min(88, Math.max(45, Math.round(48 + progress * 0.32 + Math.abs(sentiment) * 20)));
    return {
      ...scenario,
      status: progress >= 100 ? "已完成" : "运行中",
      progress,
      sentiment,
      confidence,
      predictedImpact,
      report: progress >= 100
        ? `MiroFish 群体推演完成：${scenario.predictionQuestion}。综合情绪 ${sentiment}，预测影响 ${predictedImpact}%，置信度 ${confidence}%。`
        : `群体智能环境运行中，已完成 ${progress}% 轮次，正在聚合智能体立场、事件扩散和情绪演化。`
    };
  });
  addLog(next, "策略研究", "推进 MiroFish 群体智能推演并刷新预测报告", "researcher_a");
  return next;
}

export function publishMiroFishFactor(state: QuantState, scenarioId: string): QuantState {
  const next = cloneState(state);
  const scenario = next.miroFishScenarios.find((item) => item.id === scenarioId);
  if (!scenario) return next;
  const factorName = `MiroFish_${scenario.title.replace(/\s+/g, "_").slice(0, 18)}`;
  const ic = Number((scenario.predictedImpact / 20).toFixed(3));
  const existingFactor = next.factors.find((item) => item.name === factorName);
  const factor: Factor = {
    id: existingFactor?.id ?? `f-mf-${Date.now()}`,
    name: factorName,
    ic,
    icir: Number((ic * 12).toFixed(2)),
    winRate: Math.max(40, Math.min(68, Number((50 + scenario.confidence / 8 + scenario.predictedImpact).toFixed(1)))),
    signal: ic > 0.06 ? "强" : ic > 0 ? "中" : "弱",
    enabled: true
  };
  next.factors = existingFactor ? next.factors.map((item) => item.id === factor.id ? factor : item) : [factor, ...next.factors];
  if (!next.factorConfigs.some((item) => item.factorName === factorName)) {
    next.factorConfigs = [{
      id: `fc-mf-${Date.now()}`,
      factorName,
      formula: "mirofish_impact(sentiment, confidence, event_diffusion)",
      lookback: 5,
      weight: 0.22,
      universe: "全A事件驱动池",
      rebalance: "日频",
      enabled: true,
      status: "正常",
      lastRun: "-"
    }, ...next.factorConfigs];
  }
  next.miroFishScenarios = next.miroFishScenarios.map((item) => item.id === scenarioId ? { ...item, linkedFactor: factorName } : item);
  addLog(next, "策略研究", `将 MiroFish 推演结果发布为因子 ${factorName}`, "researcher_a");
  return next;
}

export function cancelOrder(state: QuantState, orderId: string): QuantState {
  const next = cloneState(state);
  next.orders = next.orders.map((order) => {
    if (order.id !== orderId) return order;
    addLog(next, "交易执行", `撤销订单 ${order.symbol} ${order.quantity}`, "trader_b");
    return { ...order, status: "已撤单" };
  });
  return next;
}

export function rebalancePosition(state: QuantState, symbol: string, weight: number): QuantState {
  const next = cloneState(state);
  next.positions = next.positions.map((position) => position.symbol === symbol ? { ...position, weight: Number(weight.toFixed(2)) } : position);
  addLog(next, "交易执行", `调整持仓 ${symbol} 目标权重至 ${weight.toFixed(2)}%`, "trader_b");
  return refreshRisk(next);
}

export function upsertRiskRule(state: QuantState, input: Partial<RiskRule> & Pick<RiskRule, "name" | "scope" | "threshold">): QuantState {
  const next = cloneState(state);
  const id = input.id ?? `r-${Date.now()}`;
  const rule: RiskRule = {
    id,
    name: input.name,
    scope: input.scope,
    threshold: input.threshold,
    status: input.status ?? "正常",
    triggerCount: Number(input.triggerCount ?? 0)
  };
  const exists = next.riskRules.some((item) => item.id === id);
  next.riskRules = exists ? next.riskRules.map((item) => item.id === id ? rule : item) : [rule, ...next.riskRules];
  addLog(next, "风险管理", `${exists ? "更新" : "新增"}风控规则 ${rule.name}`, "risk_c");
  return next;
}

export function toggleRiskRule(state: QuantState, id: string): QuantState {
  const next = cloneState(state);
  next.riskRules = next.riskRules.map((rule) => {
    if (rule.id !== id) return rule;
    const status: Status = rule.status === "暂停" ? "正常" : "暂停";
    addLog(next, "风险管理", `${status === "暂停" ? "停用" : "启用"}风控规则 ${rule.name}`, "risk_c");
    return { ...rule, status };
  });
  return next;
}

export function upsertUser(state: QuantState, input: Partial<User> & Pick<User, "name" | "role">): QuantState {
  const next = cloneState(state);
  const user: User = {
    name: input.name,
    role: input.role,
    status: input.status ?? "正常",
    lastLogin: input.lastLogin ?? stamp(new Date()).slice(0, 16)
  };
  const exists = next.users.some((item) => item.name === input.name);
  next.users = exists ? next.users.map((item) => item.name === input.name ? user : item) : [user, ...next.users];
  addLog(next, "系统管理", `${exists ? "更新" : "新增"}用户 ${user.name}`, "quant_admin");
  next.roles = next.roles.map((role) => ({ ...role, userCount: next.users.filter((item) => item.role === role.role).length }));
  return next;
}

export function upsertRole(state: QuantState, input: Partial<RolePermission> & Pick<RolePermission, "role" | "permissions">): QuantState {
  const next = cloneState(state);
  const role: RolePermission = {
    role: input.role,
    description: input.description ?? "自定义角色权限",
    permissions: input.permissions,
    userCount: next.users.filter((item) => item.role === input.role).length,
    status: input.status ?? "正常"
  };
  const exists = next.roles.some((item) => item.role === input.role);
  next.roles = exists ? next.roles.map((item) => item.role === input.role ? role : item) : [role, ...next.roles];
  addLog(next, "系统管理", `${exists ? "更新" : "新增"}角色 ${role.role}`, "quant_admin");
  return next;
}

export function updateSystemConfig(state: QuantState, input: Partial<SystemConfig>): QuantState {
  const next = cloneState(state);
  next.systemConfig = {
    ...next.systemConfig,
    ...input,
    orderThrottleMs: Number(input.orderThrottleMs ?? next.systemConfig.orderThrottleMs),
    maxConcurrentBacktests: Number(input.maxConcurrentBacktests ?? next.systemConfig.maxConcurrentBacktests),
    autoTradeEnabled: Boolean(input.autoTradeEnabled ?? next.systemConfig.autoTradeEnabled),
    minSignalScore: Number(input.minSignalScore ?? next.systemConfig.minSignalScore),
    maxAutoOrders: Number(input.maxAutoOrders ?? next.systemConfig.maxAutoOrders),
    maxPositionWeight: Number(input.maxPositionWeight ?? next.systemConfig.maxPositionWeight),
    stopLossPct: Number(input.stopLossPct ?? next.systemConfig.stopLossPct),
    takeProfitPct: Number(input.takeProfitPct ?? next.systemConfig.takeProfitPct),
    auditRetentionDays: Number(input.auditRetentionDays ?? next.systemConfig.auditRetentionDays),
    updatedAt: stamp(new Date())
  };
  addLog(next, "系统管理", "更新交易模式、风控模式、自动交易和审计保留配置", "quant_admin");
  return next;
}

export function clearLogs(state: QuantState): QuantState {
  const next = cloneState(state);
  next.logs = [];
  addLog(next, "系统管理", "清理操作日志", "quant_admin");
  return next;
}

export function runDataPipeline(state: QuantState): QuantState {
  const next = cloneState(state);
  next.baseTime = new Date(next.baseTime.getTime() + 60_000);
  next.dataSources = next.dataSources.map((source, index) => ({
    ...source,
    status: "正常",
    latency: Math.max(8, source.latency + (index % 2 === 0 ? -3 : 4)),
    rows: source.rows + 1200 + index * 430,
    quality: Math.min(99.9, source.quality + 0.08),
    latestUpdate: stamp(next.baseTime)
  }));
  next.marketSeries.push(next.marketSeries[next.marketSeries.length - 1] + 0.6);
  next.marketSeries = next.marketSeries.slice(-13);
  return finalizeDataSync(next, "手动", "完成自动爬取、实时流接入、去重补全、特征入库与数据服务发布");
}

export function computeFactors(state: QuantState): QuantState {
  const next = cloneState(state);
  const enabledConfigs = next.factorConfigs.filter((config) => config.enabled);
  const totalWeight = enabledConfigs.reduce((sum, config) => sum + config.weight, 0) || 1;
  next.factors = next.factors.map((factor, index) => {
    const config = enabledConfigs.find((item) => item.factorName === factor.name);
    const configBias = config ? (config.weight / totalWeight) * 0.014 : -0.003;
    const delta = index % 2 === 0 ? 0.007 + configBias : -0.004 + configBias / 2;
    const ic = Number((factor.ic + delta).toFixed(3));
    return {
      ...factor,
      ic,
      icir: Number((factor.icir + delta * 4).toFixed(2)),
      winRate: Math.max(30, Math.min(72, Number((factor.winRate + delta * 80).toFixed(1)))),
      signal: ic > 0.06 ? "强" : ic > 0 ? "中" : "弱"
    };
  });
  next.factorConfigs = next.factorConfigs.map((config) => ({
    ...config,
    status: config.enabled ? "正常" : "暂停",
    lastRun: config.enabled ? stamp(new Date()) : config.lastRun
  }));
  aggregateDataInsights(next);
  addLog(next, "策略研究", "完成因子计算、特征提取和因子库更新", "researcher_a");
  return next;
}

export function createBacktest(state: QuantState, input: string | { strategyId?: string; universe?: string; benchmark?: string; period?: string; initialCapital?: number | string }): QuantState {
  const next = cloneState(state);
  const strategyId = typeof input === "string" ? input : String(input.strategyId ?? "");
  const strategy = next.strategies.find((item) => item.id === strategyId) ?? next.strategies[0];
  next.backtests.unshift({
    id: `bt-${Date.now().toString().slice(-8)}`,
    strategyId: strategy.id,
    strategy: strategy.name,
    universe: typeof input === "string" ? "全A流动性池" : input.universe ?? "全A流动性池",
    benchmark: typeof input === "string" ? "沪深300" : input.benchmark ?? "沪深300",
    period: typeof input === "string" ? "2021-01-01 至 2026-05-01" : input.period ?? "2021-01-01 至 2026-05-01",
    initialCapital: Number(typeof input === "string" ? 10_000_000 : input.initialCapital ?? 10_000_000),
    progress: 0,
    status: "排队中",
    startTime: `${String(next.baseTime.getMonth() + 1).padStart(2, "0")}-${String(next.baseTime.getDate()).padStart(2, "0")} ${String(next.baseTime.getHours()).padStart(2, "0")}:${String(next.baseTime.getMinutes()).padStart(2, "0")}`,
    sharpe: 0,
    annualReturn: 0,
    maxDrawdown: strategy.maxDrawdown
  });
  addLog(next, "回测分析", `创建回测任务 ${strategy.name}`, "researcher_a");
  return next;
}

export function advanceBacktests(state: QuantState): QuantState {
  const next = cloneState(state);
  next.backtests = next.backtests.map((task, index) => {
    if (task.status === "已完成") return task;
    const progress = Math.min(100, task.progress + 28 + index * 4);
    return {
      ...task,
      status: progress >= 100 ? "已完成" : "运行中",
      progress,
      sharpe: Number((1.02 + progress / 145).toFixed(2)),
      annualReturn: Number((8.5 + progress / 4.7).toFixed(1))
    };
  });
  const existingTaskIds = new Set(next.backtestResults.map((result) => result.taskId));
  const completedResults = next.backtests
    .filter((task) => task.status === "已完成" && !existingTaskIds.has(task.id))
    .map((task): BacktestResult => ({
      id: `br-${Date.now()}-${task.id}`,
      taskId: task.id,
      strategy: task.strategy,
      benchmark: task.benchmark,
      period: task.period,
      annualReturn: task.annualReturn,
      excessReturn: Number((task.annualReturn - 7.8).toFixed(1)),
      sharpe: task.sharpe,
      volatility: Number((Math.max(5, task.maxDrawdown * 1.75)).toFixed(1)),
      maxDrawdown: task.maxDrawdown,
      winRate: Number((52 + task.sharpe * 4.2).toFixed(1)),
      status: "已完成",
      completedAt: stamp(next.baseTime)
    }));
  if (completedResults.length > 0) {
    next.backtestResults = [...completedResults, ...next.backtestResults].slice(0, 30);
  }
  addLog(next, "回测分析", "推进回测任务并刷新风险收益分析");
  return next;
}

export function toggleStrategy(state: QuantState, strategyId: string): QuantState {
  const next = cloneState(state);
  next.strategies = next.strategies.map((strategy) => {
    if (strategy.id !== strategyId) return strategy;
    const status = strategy.status === "运行中" ? "暂停" : "运行中";
    addLog(next, "策略研究", `${status === "运行中" ? "启用" : "暂停"}策略 ${strategy.name}`, "quant_admin");
    return { ...strategy, status };
  });
  return next;
}

export function optimizeStrategies(state: QuantState): QuantState {
  const next = cloneState(state);
  const rankedFactors = next.factors
    .filter((factor) => factor.enabled)
    .sort((a, b) => (b.ic * b.icir + b.winRate / 100) - (a.ic * a.icir + a.winRate / 100))
    .filter((factor, index, factors) => factors.findIndex((item) => item.name === factor.name) === index)
    .slice(0, 3);
  const bestResultByStrategy = new Map<string, BacktestResult>();
  next.backtestResults.forEach((result) => {
    const existing = bestResultByStrategy.get(result.strategy);
    if (!existing || result.sharpe > existing.sharpe) bestResultByStrategy.set(result.strategy, result);
  });

  const records: StrategyOptimization[] = [];
  next.strategies = next.strategies.map((strategy, index) => {
    const result = bestResultByStrategy.get(strategy.name);
    const beforeSharpe = result?.sharpe ?? Number((1 + strategy.pnlYear / 80 - strategy.maxDrawdown / 60).toFixed(2));
    const factorBoost = rankedFactors.reduce((sum, factor) => sum + Math.max(0, factor.ic), 0);
    const afterSharpe = Number((beforeSharpe + 0.08 + factorBoost).toFixed(2));
    const capitalShift = Math.round((afterSharpe - beforeSharpe) * 1_000_000);
    const suggestedFactors = rankedFactors.map((factor) => factor.name);
    records.push({
      id: `so-${Date.now()}-${index}`,
      strategy: strategy.name,
      beforeSharpe,
      afterSharpe,
      suggestedFactors,
      capitalShift,
      status: afterSharpe > beforeSharpe ? "已完成" : "运行中",
      summary: `建议因子 ${suggestedFactors.join(" / ")}，目标夏普 ${afterSharpe}`,
      time: stamp(new Date())
    });
    return {
      ...strategy,
      factors: suggestedFactors.length > 0 ? suggestedFactors : strategy.factors,
      pnlYear: Number((strategy.pnlYear + Math.max(0, afterSharpe - beforeSharpe) * 2.6).toFixed(2)),
      maxDrawdown: Number(Math.max(2.5, strategy.maxDrawdown - Math.max(0, afterSharpe - beforeSharpe) * 0.8).toFixed(2)),
      riskLevel: afterSharpe >= 1.45 ? "低" : strategy.riskLevel
    };
  });
  next.strategyOptimizations = [...records, ...next.strategyOptimizations].slice(0, 20);
  addLog(next, "策略研究", `完成 ${records.length} 个策略库参数和因子组合调优`, "strategy-optimizer");
  return refreshRisk(next);
}

export function runSignalSelection(state: QuantState): QuantState {
  const next = cloneState(state);
  next.stockSignals = buildStockSignals(next);
  const buyCount = next.stockSignals.filter((signal) => signal.action === "买入").length;
  const candidateCount = next.stockSignals.filter((signal) => signal.action === "候选").length;
  addLog(next, "策略研究", `根据信号自动选股完成：买入 ${buyCount} 个，候选 ${candidateCount} 个`, "signal-engine");
  return next;
}

export function runOperationalWorkflow(state: QuantState, input: { strategyId?: string; execute?: boolean } = {}): QuantState {
  const strategyId = input.strategyId ?? state.strategies[0]?.id;
  let next = finalizeDataSync(state, "一键闭环", "一键闭环启动：数据同步与聚合分析完成");
  next = runDataQualityCheck(next);
  next = computeFactors(next);
  next = advanceMiroFishScenarios(next);
  next = optimizeStrategies(next);
  next = createBacktest(next, strategyId ?? "");
  next = advanceBacktests(next);
  next = runSignalSelection(next);
  next = runAutoTrading(next, { strategyId, execute: input.execute ?? true });
  next = refreshRisk(next);
  addLog(next, "系统管理", "一键闭环完成：数据、因子、推演、调优、回测、选股、交易与风险刷新已执行", "workflow");
  return next;
}

export function runAutoTrading(
  state: QuantState,
  input: { strategyId?: string; execute?: boolean; minScore?: number; maxOrders?: number } = {}
): QuantState {
  let next = cloneState(state);
  next.stockSignals = buildStockSignals(next);
  const strategy = next.strategies.find((item) => item.id === input.strategyId) ?? next.strategies.find((item) => item.status === "运行中") ?? next.strategies[0];
  const enabled = next.systemConfig.autoTradeEnabled || input.execute === true;
  const minScore = Number(input.minScore ?? next.systemConfig.minSignalScore ?? 68);
  const maxOrders = Math.max(1, Number(input.maxOrders ?? next.systemConfig.maxAutoOrders ?? 3));
  const maxPositionWeight = Number(next.systemConfig.maxPositionWeight ?? 24);
  const riskLimit = getRiskLimit(next.systemConfig);
  const tradingSession = getAShareTradingSession(next.baseTime);
  const pendingSymbols = new Set(next.orders.filter((order) => order.status === "待执行" || order.status === "部分成交").map((order) => order.symbol));
  const signalsBySymbol = new Map(next.stockSignals.map((signal) => [signal.symbol, signal]));
  const holdingWeights = new Map(next.positions.map((position) => [position.symbol, position.weight]));
  const buyCandidates = next.stockSignals.filter((signal) => signal.score >= minScore && (signal.action === "买入" || signal.action === "候选"));
  const riskNotes: string[] = [];
  if (!enabled) riskNotes.push("自动交易未启用");
  if (!strategy) riskNotes.push("未找到可用策略");
  if (next.riskScore >= riskLimit) riskNotes.push(`风险评分 ${next.riskScore} 超过 ${riskLimit}，阻断新增买入`);
  if (input.execute && !tradingSession.open) riskNotes.push(`当前 A 股${tradingSession.reason}，委托保留待执行，不进行撮合成交`);

  const sellOrders = enabled && strategy
    ? buildReduceOrders(next, strategy, signalsBySymbol, pendingSymbols, maxOrders, maxPositionWeight)
    : [];
  const blockedSymbols = new Set([...pendingSymbols, ...sellOrders.map((order) => order.symbol)]);
  const buyBlocked = !enabled || next.riskScore >= riskLimit || !strategy;
  const selectedBuys = buyBlocked
    ? []
    : buyCandidates.filter((signal) => !blockedSymbols.has(signal.symbol) && (holdingWeights.get(signal.symbol) ?? 0) < maxPositionWeight).slice(0, maxOrders);
  const buyOrders = selectedBuys
    .map((signal, index) => strategy ? createOrderFromSignal(next, strategy, signal, index, maxPositionWeight) : null)
    .filter((order): order is Order => Boolean(order));
  const orders = [...sellOrders, ...buyOrders];

  if (!buyBlocked && buyCandidates.length > buyOrders.length) {
    riskNotes.push(`${buyCandidates.length - buyOrders.length} 个买入候选因重复委托、仓位上限或资金空间不足跳过`);
  }

  if (orders.length > 0) {
    next.orders = [...orders, ...next.orders].slice(0, 80);
  }

  let executed = 0;
  if (input.execute && next.systemConfig.tradingMode === "模拟" && tradingSession.open && orders.length > 0) {
    const autoOrderIds = new Set(orders.map((order) => order.id));
    next = executePendingOrders(next);
    executed = next.orders.filter((order) => autoOrderIds.has(order.id) && order.status === "已成交").length;
  }

  const riskBlocked = buyBlocked
    ? buyCandidates.length
    : Math.max(0, buyCandidates.length - buyOrders.length);
  const closedExecutionSummary = input.execute && !tradingSession.open ? `；当前 A 股${tradingSession.reason}，未撮合成交` : "";
  const summary = !enabled
    ? "自动交易未启用，仅完成信号扫描"
    : next.riskScore >= riskLimit
      ? `减仓 ${sellOrders.length} 笔，新增买入因风险评分 ${next.riskScore} 被阻断${closedExecutionSummary}`
    : input.execute && !tradingSession.open
      ? `自动生成减仓 ${sellOrders.length} 笔、买入 ${buyOrders.length} 笔；当前 A 股${tradingSession.reason}，未撮合成交`
    : next.systemConfig.tradingMode === "实盘" && input.execute
      ? `实盘模式已生成减仓 ${sellOrders.length} 笔、买入 ${buyOrders.length} 笔委托，需接入券商网关后执行`
      : `自动生成减仓 ${sellOrders.length} 笔、买入 ${buyOrders.length} 笔${executed > 0 ? "并完成模拟撮合" : ""}`;
  const hasHardBlock = !enabled || !strategy || next.riskScore >= riskLimit;
  const runStatus: Status = hasHardBlock && orders.length === 0 ? "告警" : "已完成";

  next.autoTradeRuns = [
    {
      id: `atr-${Date.now()}`,
      mode: next.systemConfig.tradingMode,
      status: runStatus,
      strategy: strategy?.name ?? "未配置策略",
      generatedSignals: next.stockSignals.length,
      selected: sellOrders.length + selectedBuys.length,
      buyOrders: buyOrders.length,
      sellOrders: sellOrders.length,
      ordersCreated: orders.length,
      riskBlocked,
      executed,
      riskNotes,
      summary,
      time: stamp(new Date())
    },
    ...next.autoTradeRuns
  ].slice(0, 20);
  addLog(next, "交易执行", summary, "auto-trader");
  return refreshRisk(next);
}

export function generateOrder(state: QuantState, strategyId: string): QuantState {
  const next = cloneState(state);
  const strategy = next.strategies.find((item) => item.id === strategyId) ?? next.strategies[0];
  const symbols = ["IF2406", "IC2406", "600519.SH", "510300.SH"];
  const symbol = symbols[next.orders.length % symbols.length];
  const price = symbol.includes("510") ? 3.528 : symbol.includes("600") ? 1764.8 : 3582.6;
  const quantity = symbol.includes("510") ? 100000 : symbol.includes("600") ? 100 : 1;
  const side: Side = next.orders.length % 3 === 0 ? "卖出" : "买入";
  next.orders.unshift({
    id: `o-${Date.now()}`,
    strategy: strategy.name,
    symbol,
    side,
    price,
    quantity,
    status: "待执行",
    time: timeOnly(next.baseTime),
    amount: price * quantity * (symbol.startsWith("I") ? 100 : 1)
  });
  addLog(next, "交易执行", `策略 ${strategy.name} 生成 ${symbol} ${side} 委托`);
  return next;
}

export function executePendingOrders(state: QuantState): QuantState {
  const next = cloneState(state);
  const filledOrders = next.orders.filter((order) => order.status === "待执行" || order.status === "部分成交");
  const tradingSession = getAShareTradingSession(next.baseTime);
  if (!tradingSession.open) {
    if (filledOrders.length > 0) {
      const reason = `A股${tradingSession.reason}，未撮合成交`;
      next.orders = next.orders.map((order) => filledOrders.some((item) => item.id === order.id)
        ? { ...order, status: "待执行", reason: appendOrderReason(order, reason) }
        : order);
      addLog(next, "交易执行", `${reason}，${filledOrders.length} 笔委托保留待执行`, "trade-calendar");
    }
    return next;
  }
  const quoteName = new Map(next.marketQuotes.map((quote) => [inferExchange(quote.symbol), quote.name]));
  const filledQuantities = new Map<string, number>();
  const rejectedOrders = new Set<string>();
  let cashBalance = Number(next.cashBalance ?? 0);

  filledOrders.forEach((order) => {
    const existing = next.positions.find((position) => position.symbol === order.symbol);
    const lotSize = getLotSize(order.symbol);
    let executedQuantity = order.quantity;

    if (order.side === "买入") {
      const affordableQuantity = Math.floor(cashBalance / order.price / lotSize) * lotSize;
      executedQuantity = Math.min(order.quantity, affordableQuantity);
      if (executedQuantity <= 0) {
        rejectedOrders.add(order.id);
        return;
      }
      cashBalance = Math.max(0, cashBalance - order.price * executedQuantity);
    }

    if (existing) {
      if (order.side === "买入") {
        const nextQuantity = existing.quantity + executedQuantity;
        const nextCost = nextQuantity > 0 ? ((existing.cost * existing.quantity) + (order.price * executedQuantity)) / nextQuantity : order.price;
        existing.quantity = nextQuantity;
        existing.cost = Number(nextCost.toFixed(3));
        existing.last = order.price;
      } else {
        executedQuantity = Math.min(existing.quantity, order.quantity);
        if (executedQuantity <= 0) {
          rejectedOrders.add(order.id);
          return;
        }
        existing.quantity = Math.max(0, existing.quantity - executedQuantity);
        existing.last = order.price;
        cashBalance += order.price * executedQuantity;
      }
      existing.pnl = existing.cost > 0 ? Number((((existing.last - existing.cost) / existing.cost) * 100).toFixed(2)) : existing.pnl;
      filledQuantities.set(order.id, executedQuantity);
      return;
    }

    if (order.side === "买入") {
      next.positions.push({
        symbol: order.symbol,
        name: quoteName.get(order.symbol) ?? order.symbol,
        quantity: executedQuantity,
        cost: order.price,
        last: order.price,
        pnl: 0,
        weight: 0
      });
      filledQuantities.set(order.id, executedQuantity);
    } else {
      rejectedOrders.add(order.id);
    }
  });

  next.positions = next.positions
    .filter((position) => position.quantity > 0)
    .map((position, index) => ({
      ...position,
      last: Number((position.last * (1 + (index % 2 === 0 ? 0.002 : -0.001))).toFixed(3))
    }));

  next.positions = next.positions.map((position) => ({
    ...position,
    pnl: position.cost > 0 ? Number((((position.last - position.cost) / position.cost) * 100).toFixed(2)) : position.pnl
  }));
  next.cashBalance = Number(cashBalance.toFixed(2));
  updatePositionWeights(next);

  next.orders = next.orders.map((order) => {
    if (rejectedOrders.has(order.id)) return { ...order, status: "已撤单", reason: order.reason ? `${order.reason}；现金或持仓不足` : "现金或持仓不足" };
    const quantity = filledQuantities.get(order.id);
    if (!quantity) return order;
    return { ...order, quantity, amount: Number((order.price * quantity).toFixed(2)), status: "已成交" };
  });
  addLog(next, "交易执行", `撮合成交 ${filledQuantities.size} 笔订单并回报持仓，现金余额 ${formatCurrency(next.cashBalance)}`);
  return next;
}

export function refreshRisk(state: QuantState): QuantState {
  const next = cloneState(state);
  updatePositionWeights(next);
  const maxDrawdown = Math.max(0, ...next.strategies.map((item) => item.maxDrawdown));
  next.riskScore = Math.max(28, Math.min(92, Math.round(45 + maxDrawdown * 2.4 + next.orders.filter((item) => item.status === "待执行").length * 3)));
  next.alerts = next.riskRules.filter((rule) => rule.status === "告警").length + (next.riskScore > 70 ? 1 : 0);
  next.riskRules = next.riskRules.map((rule) => ({
    ...rule,
    status: rule.id === "r-2" && next.riskScore > 62 ? "告警" : "正常",
    triggerCount: rule.id === "r-2" && next.riskScore > 62 ? rule.triggerCount + 1 : rule.triggerCount
  }));
  const concentration = Math.max(0, ...next.positions.map((position) => position.weight));
  const pendingOrders = next.orders.filter((item) => item.status === "待执行" || item.status === "部分成交").length;
  const marketValue = next.positions.reduce((sum, position) => sum + position.quantity * position.last, 0);
  const totalValue = marketValue + Number(next.cashBalance ?? 0);
  const updatedAt = stamp(new Date());
  const values: Record<string, number> = {
    "VaR(95%)": Number((1.2 + next.riskScore / 55).toFixed(2)),
    ES: Number((1.8 + next.riskScore / 48).toFixed(2)),
    最大回撤: Number(maxDrawdown.toFixed(2)),
    杠杆率: Number(((totalValue > 0 ? marketValue / totalValue : 0) + pendingOrders * 0.03).toFixed(2)),
    品种集中度: Number(concentration.toFixed(2))
  };
  next.riskIndicators = next.riskIndicators.map((indicator) => {
    const value = values[indicator.name] ?? indicator.value;
    const status = value > indicator.limit ? "告警" : value > indicator.limit * 0.85 ? "运行中" : "正常";
    const trend = value > indicator.value ? "上升" : value < indicator.value ? "下降" : "稳定";
    return { ...indicator, value, status, trend, updatedAt };
  });
  addLog(next, "风险管理", "刷新 VaR、ES、集中度与压力测试报告", "risk_c");
  return next;
}

export function toggleService(state: QuantState, name: string): QuantState {
  const next = cloneState(state);
  next.services = next.services.map((service) => {
    if (service.name !== name) return service;
    const status = service.status === "正常" ? "暂停" : "正常";
    addLog(next, "系统管理", `${status === "正常" ? "恢复" : "暂停"}${service.name}`, "quant_admin");
    return { ...service, status, detail: status === "正常" ? "运行中" : "维护中" };
  });
  return next;
}

export function subscribeSource(state: QuantState, id: string): QuantState {
  const next = cloneState(state);
  next.dataSources = next.dataSources.map((source) => {
    if (source.id !== id) return source;
    addLog(next, "数据中心", `${source.subscribed ? "取消订阅" : "订阅"}${source.name}`, "quant_admin");
    return { ...source, subscribed: !source.subscribed };
  });
  return next;
}
