import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  Brain,
  CheckCircle2,
  ChevronDown,
  Cpu,
  Database,
  Eye,
  FileText,
  FlaskConical,
  GitBranch,
  HardDrive,
  Home,
  Layers,
  LineChart,
  ListChecks,
  LockKeyhole,
  Mail,
  Menu,
  Network,
  Pause,
  Play,
  Radio,
  RefreshCw,
  Search,
  Send,
  Server,
  Settings,
  Shield,
  SlidersHorizontal,
  Table2,
  User,
  Users,
  Wallet,
  XCircle,
  Zap,
  type LucideIcon
} from "lucide-react";
import {
  formatCurrency,
  marketLabels,
  type BacktestTask,
  type BacktestResult,
  type DataAggregateInsight,
  type DataProviderConfig,
  type DataQualityRule,
  type DataSource,
  type DataSubscription,
  type DataSyncRun,
  type Factor,
  type FactorConfig,
  type MiroFishScenario,
  type Order,
  type Position,
  type QuantState,
  type RiskIndicator,
  type RiskRule,
  type RolePermission,
  type ServiceHealth,
  type Status,
  type StockSignal,
  type Strategy,
  type StrategyOptimization,
  type TradingSessionStatus,
  type SystemConfig,
  type AutoTradeRun,
  type User as QuantUser
} from "./quantEngine";
import * as api from "./api";

let initialMarketSyncStarted = false;

type ViewId =
  | "dashboard"
  | "data-overview"
  | "data-sources"
  | "data-quality"
  | "data-subscribe"
  | "factor-research"
  | "mirofish-simulation"
  | "strategy-dev"
  | "strategy-library"
  | "backtest-tasks"
  | "backtest-results"
  | "risk-analysis"
  | "signal-selection"
  | "trade-monitor"
  | "auto-trading"
  | "orders"
  | "positions"
  | "risk-monitor"
  | "risk-indicators"
  | "risk-rules"
  | "users"
  | "roles"
  | "system-config"
  | "operation-logs";

type ApiAction = () => Promise<QuantState>;
type ActionOptions = { label?: string; success?: string; view?: ViewId };
type ApplyAction = (request: ApiAction, options?: ActionOptions) => void;
type ActionNotice = { kind: "success" | "error"; message: string } | null;

interface MenuGroup {
  title: string;
  icon: LucideIcon;
  items: { id: ViewId; label: string }[];
}

const menuGroups: MenuGroup[] = [
  { title: "工作台", icon: Home, items: [{ id: "dashboard", label: "工作台" }] },
  {
    title: "数据中心",
    icon: Database,
    items: [
      { id: "data-overview", label: "数据概览" },
      { id: "data-sources", label: "数据源管理" },
      { id: "data-quality", label: "数据质量" },
      { id: "data-subscribe", label: "数据订阅" }
    ]
  },
  {
    title: "策略研究",
    icon: Brain,
    items: [
      { id: "factor-research", label: "因子研究" },
      { id: "mirofish-simulation", label: "MiroFish推演" },
      { id: "strategy-dev", label: "策略开发" },
      { id: "strategy-library", label: "策略库" }
    ]
  },
  {
    title: "回测分析",
    icon: BarChart3,
    items: [
      { id: "backtest-tasks", label: "回测任务" },
      { id: "backtest-results", label: "回测结果" },
      { id: "risk-analysis", label: "风险分析" }
    ]
  },
  {
    title: "交易执行",
    icon: Send,
    items: [
      { id: "signal-selection", label: "信号选股" },
      { id: "trade-monitor", label: "交易监控" },
      { id: "auto-trading", label: "自动交易" },
      { id: "orders", label: "订单管理" },
      { id: "positions", label: "持仓管理" }
    ]
  },
  {
    title: "风险管理",
    icon: Shield,
    items: [
      { id: "risk-monitor", label: "风险监控" },
      { id: "risk-indicators", label: "风险指标" },
      { id: "risk-rules", label: "风控规则" }
    ]
  },
  {
    title: "系统管理",
    icon: Settings,
    items: [
      { id: "users", label: "用户管理" },
      { id: "roles", label: "角色权限" },
      { id: "system-config", label: "系统配置" },
      { id: "operation-logs", label: "操作日志" }
    ]
  }
];

const topNav = [
  ["dashboard", Home, "工作台"],
  ["strategy-library", Brain, "策略研究"],
  ["backtest-results", LineChart, "回测分析"],
  ["trade-monitor", Send, "交易执行"],
  ["risk-monitor", Shield, "风险管理"],
  ["data-overview", Database, "数据中心"],
  ["system-config", Settings, "系统管理"]
] as const;

function App() {
  const [state, setState] = useState<QuantState | null>(null);
  const [view, setView] = useState<ViewId>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [notice, setNotice] = useState<ActionNotice>(null);

  useEffect(() => {
    let active = true;
    if (initialMarketSyncStarted) {
      api.getState().then((nextState) => {
        if (active) setState(nextState);
      }).catch((err: Error) => {
        if (active) setError(err.message);
      });
      return () => {
        active = false;
      };
    }
    initialMarketSyncStarted = true;
    api.runDataPipeline()
      .then((nextState) => {
        if (active) setState(nextState);
      })
      .catch((err: Error) => {
        api.getState()
          .then((nextState) => {
            if (!active) return;
            setState(nextState);
            setError(`真实行情接口同步失败，已加载最近一次接口状态：${err.message}`);
          })
          .catch((fallbackErr: Error) => {
            if (active) setError(fallbackErr.message);
          });
      });
    return () => {
      active = false;
    };
  }, []);

  const title = useMemo(() => {
    for (const group of menuGroups) {
      const item = group.items.find((entry) => entry.id === view);
      if (item) return item.label;
    }
    return "工作台";
  }, [view]);

  if (!state) {
    return (
      <div className="loading-screen">
        <Shield size={30} />
        <strong>AlphaPilot Quant</strong>
        <span>{error || "正在连接交易系统接口..."}</span>
      </div>
    );
  }

  const selectedStrategy = state.strategies[0]?.id ?? "";

  const apply: ApplyAction = (request, options = {}) => {
    if (busyAction) return;
    const label = options.label ?? "操作";
    setBusyAction(label);
    setError("");
    setNotice(null);
    request()
      .then((nextState) => {
        setState(nextState);
        if (options.view) setView(options.view);
        setNotice({ kind: "success", message: options.success ?? `${label}已完成` });
      })
      .catch((err: Error) => {
        const message = err.message || `${label}失败`;
        setError(message);
        setNotice({ kind: "error", message: `${label}失败：${message}` });
      })
      .finally(() => setBusyAction(""));
  };

  const commands: Array<{ id: string; label: string; icon: LucideIcon; action: ApiAction; success: string; view: ViewId }> = [
    { id: "sync", label: "数据同步", icon: RefreshCw, action: api.runDataPipeline, success: "数据同步已完成，聚合分析已刷新", view: "data-overview" },
    { id: "factors", label: "因子计算", icon: Zap, action: api.computeFactors, success: "因子计算已完成，因子库已更新", view: "factor-research" },
    { id: "signals", label: "信号选股", icon: ListChecks, action: api.runSignalSelection, success: "信号选股已完成，候选股票已刷新", view: "signal-selection" },
    { id: "auto-trade", label: "自动交易", icon: Send, action: () => api.runAutoTrading({ strategyId: selectedStrategy, execute: true }), success: "自动交易流程已执行，休市时委托保留待执行", view: "auto-trading" },
    { id: "backtest", label: "新建回测", icon: Play, action: () => api.createBacktest(selectedStrategy), success: "回测任务已创建", view: "backtest-tasks" },
    { id: "risk", label: "风险刷新", icon: Shield, action: api.refreshRisk, success: "风险指标已刷新", view: "risk-monitor" },
    { id: "workflow", label: "一键闭环", icon: GitBranch, action: () => api.runWorkflow({ strategyId: selectedStrategy, execute: true }), success: "一键闭环已完成，数据、因子、回测、选股、交易和风控均已执行", view: "dashboard" }
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Shield size={22} /></div>
          {!collapsed && (
            <div>
              <strong>AlphaPilot Quant</strong>
              <span>AI Signal Trading Workbench</span>
            </div>
          )}
        </div>
        <nav className="side-nav">
          {menuGroups.map((group) => (
            <div className="menu-group" key={group.title}>
              <button
                className={`group-head ${group.items.some((item) => item.id === view) ? "active" : ""}`}
                onClick={() => setView(group.items[0].id)}
                title={group.title}
              >
                <group.icon size={16} />
                {!collapsed && <span>{group.title}</span>}
                {!collapsed && group.items.length > 1 && <ChevronDown size={14} />}
              </button>
              {!collapsed && group.items.length > 1 && (
                <div className="sub-menu">
                  {group.items.map((item) => (
                    <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <button className="collapse-button" onClick={() => setCollapsed((value) => !value)}>
          <Menu size={16} />
          {!collapsed && "收起菜单"}
        </button>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="top-tabs">
            {topNav.map(([id, Icon, label]) => (
              <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id as ViewId)}>
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
          <div className="top-actions">
            <button aria-label="搜索"><Search size={18} /></button>
            <button aria-label="通知"><Bell size={18} /></button>
            <button aria-label="邮件"><Mail size={18} /></button>
            <div className="profile">
              <div className="avatar"><User size={18} /></div>
              <div>
                <strong>quant_admin</strong>
                <span>超级管理员</span>
              </div>
              <ChevronDown size={14} />
            </div>
          </div>
        </header>

        <section className="workspace">
          <div className="page-head">
            <div>
              <p>系统总览</p>
              <h1>{title}</h1>
            </div>
            <div className="command-bar">
              {commands.map(({ id, label, icon: Icon, action, success, view: nextView }) => {
                const loading = busyAction === label;
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={Boolean(busyAction)}
                    aria-busy={loading}
                    onClick={() => apply(action, { label, success, view: nextView })}
                  >
                    {loading ? <RefreshCw className="spin" size={15} /> : <Icon size={15} />}
                    {loading ? `${label}中` : label}
                  </button>
                );
              })}
            </div>
          </div>
          {notice && (
            <div className={`action-feedback ${notice.kind}`} role={notice.kind === "error" ? "alert" : "status"}>
              {notice.kind === "error" ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
              {notice.message}
            </div>
          )}
          {error && <div className="api-error">{error}</div>}
          <ViewRenderer view={view} state={state} apply={apply} setView={setView} />
        </section>

        <footer className="ticker">
          <strong>市场行情</strong>
          {state.marketQuotes.slice(0, 6).map((quote) => (
            <span key={quote.symbol}>
              {quote.name} <b className={quote.pctChange >= 0 ? "up" : "down"}>{formatCurrency(quote.price)} {quote.pctChange >= 0 ? "+" : ""}{quote.pctChange.toFixed(2)}%</b>
            </span>
          ))}
          <Settings size={14} />
        </footer>
      </main>
    </div>
  );
}

function ViewRenderer({
  view,
  state,
  apply,
  setView
}: {
  view: ViewId;
  state: QuantState;
  apply: ApplyAction;
  setView: (view: ViewId) => void;
}) {
  if (view === "dashboard") return <Dashboard state={state} apply={apply} setView={setView} />;
  if (view.startsWith("data-")) return <DataCenter view={view} state={state} apply={apply} />;
  if (view.startsWith("factor") || view.startsWith("strategy") || view === "mirofish-simulation") return <Research view={view} state={state} apply={apply} />;
  if (view.startsWith("backtest") || view === "risk-analysis") return <Backtest view={view} state={state} apply={apply} />;
  if (view === "signal-selection" || view === "trade-monitor" || view === "auto-trading" || view === "orders" || view === "positions") return <Execution view={view} state={state} apply={apply} />;
  if (view.startsWith("risk-")) return <RiskManagement view={view} state={state} apply={apply} />;
  return <SystemManagement view={view} state={state} apply={apply} />;
}

function Dashboard({ state, apply, setView }: { state: QuantState; apply: ApplyAction; setView: (view: ViewId) => void }) {
  const running = state.strategies.filter((item) => item.status === "运行中").length;
  const runningBacktests = state.backtests.filter((item) => item.status === "运行中").length;
  const liveStrategies = state.strategies.filter((item) => item.status !== "停止").length;
  const positionMarketValue = getPositionMarketValue(state);
  const accountValue = getAccountValue(state);
  const dayPnl = getPositionPnl(state);
  const dayPnlPct = accountValue > 0 ? (dayPnl / accountValue) * 100 : 0;
  const maxDrawdown = getRiskIndicator(state, "最大回撤")?.value ?? Math.max(0, ...state.strategies.map((item) => item.maxDrawdown));
  const riskAlerts = state.riskIndicators.filter((item) => item.status === "告警").length + state.riskRules.filter((item) => item.status === "告警").length;
  const latestSync = state.dataSyncRuns[0]?.time ?? state.marketQuotes[0]?.timestamp ?? "-";
  return (
    <>
      <TradingSessionPanel session={state.marketSession} />
      <div className="metric-grid">
        <Metric title="策略总数" value={state.strategies.length} delta={`运行中 ${running}`} icon={Brain} />
        <Metric title="回测任务" value={state.backtests.length} delta={`${runningBacktests} 运行中`} icon={LineChart} />
        <Metric title="交易策略" value={liveStrategies} delta={`${state.systemConfig.tradingMode}模式`} icon={Activity} />
        <Metric title="总资产（接口）" value={formatCurrency(accountValue)} delta={`持仓 ${formatCurrency(positionMarketValue)}`} icon={Wallet} />
        <Metric title="当日收益" value={formatSignedCurrency(dayPnl)} delta={formatSignedPercent(dayPnlPct)} icon={BarChart3} tone={dayPnl >= 0 ? "green" : "red"} />
        <Metric title="最大回撤" value={`${maxDrawdown.toFixed(2)}%`} delta={latestSync} icon={AlertTriangle} tone={maxDrawdown > 10 ? "red" : undefined} />
        <Metric title="风险预警" value={riskAlerts} delta={`风险评分 ${state.riskScore}`} icon={Shield} tone={riskAlerts > 0 ? "red" : "green"} />
      </div>
      <div className="dashboard-layout">
        <Panel title="资产曲线（接口）" action={<button onClick={() => setView("backtest-results")}>近3月</button>}>
          <LineChartCard values={state.marketSeries} labels={state.marketLabels ?? marketLabels} />
        </Panel>
        <Panel title="策略分布（按类型）">
          <Donut strategies={state.strategies} />
        </Panel>
        <Panel title="风险监控（实时）" action={<button onClick={() => setView("risk-monitor")}>更多</button>}>
          <Gauge state={state} />
        </Panel>
        <Panel title="策略运行状态">
          <StrategyTable strategies={state.strategies} apply={apply} compact />
        </Panel>
        <Panel title="实时交易监控">
          <TradeSummary state={state} apply={apply} />
        </Panel>
        <Panel title="信号选股" action={<button onClick={() => setView("signal-selection")}>更多</button>}>
          <SignalTable signals={state.stockSignals} apply={apply} compact />
        </Panel>
        <Panel title="系统健康度" action={<button onClick={() => setView("system-config")}>更多</button>}>
          <ServiceList services={state.services} apply={apply} />
        </Panel>
        <Panel title="回测任务">
          <BacktestTable tasks={state.backtests} apply={apply} compact />
        </Panel>
        <Panel title="因子表现（近30日）">
          <FactorTable factors={state.factors} apply={apply} compact />
        </Panel>
        <Panel title="数据概览" action={<button onClick={() => setView("data-overview")}>更多</button>}>
          <DataSnapshot state={state} />
        </Panel>
      </div>
    </>
  );
}

function DataCenter({ view, state, apply }: { view: ViewId; state: QuantState; apply: ApplyAction }) {
  if (view === "data-overview") {
    return (
      <div className="content-grid two">
        <Panel title="数据架构流向" action={<button onClick={() => apply(api.runDataPipeline)}>执行接入清洗</button>}>
          <Architecture state={state} />
        </Panel>
        <Panel title="数据仓库指标">
          <DataSnapshot state={state} expanded />
        </Panel>
        <Panel title="本地仓储明细" action={<><button onClick={() => apply(api.refreshWarehouseStats, { label: "刷新统计", success: "仓储统计已刷新" })}><HardDrive size={14} />刷新统计</button><button onClick={() => apply(api.compactWarehouse, { label: "压缩去重", success: "仓储压缩去重已完成" })}><RefreshCw size={14} />压缩去重</button></>}>
          <WarehouseFileTable state={state} />
        </Panel>
        <Panel title="数据源聚合分析">
          <DataAggregatePanel insights={state.dataAggregateInsights} />
        </Panel>
        <Panel title="自动同步记录">
          <DataSyncRunTable runs={state.dataSyncRuns} />
        </Panel>
        <Panel title="数据源状态">
          <DataSourceTable data={state.dataSources} apply={apply} />
        </Panel>
        <Panel title="数据质量规则" action={<button onClick={() => apply(api.runDataQualityCheck)}><CheckCircle2 size={14} />质量巡检</button>}>
          <DataQualityTable rules={state.dataQualityRules} />
        </Panel>
        <Panel title="采集接口配置">
          <ProviderConfigTable configs={state.dataProviderConfigs} apply={apply} />
        </Panel>
        <Panel title="最近数据操作">
          <LogList logs={state.logs.filter((log) => log.module.includes("数据"))} />
        </Panel>
      </div>
    );
  }
  if (view === "data-sources") {
    return (
      <div className="content-grid two">
        <Panel title="数据源管理" action={<button onClick={() => apply(api.runDataPipeline)}><RefreshCw size={14} />同步全部</button>}>
          <DataSourceTable data={state.dataSources} apply={apply} detail />
        </Panel>
        <Panel title="数据源采集配置">
          <DataSourceForm apply={apply} />
          <ProviderConfigForm apply={apply} />
          <ProviderConfigTable configs={state.dataProviderConfigs} apply={apply} />
        </Panel>
        <Panel title="同步运行记录">
          <DataSyncRunTable runs={state.dataSyncRuns} />
        </Panel>
      </div>
    );
  }
  if (view === "data-quality") {
    return (
      <div className="content-grid two">
        <Panel title="质量巡检" action={<button onClick={() => apply(api.runDataQualityCheck)}><CheckCircle2 size={14} />执行巡检</button>}>
          <DataQualityTable rules={state.dataQualityRules} />
        </Panel>
        {state.dataSources.map((source) => (
          <QualityCard key={source.id} source={source} apply={apply} />
        ))}
      </div>
    );
  }
  return (
    <div className="content-grid two">
      <Panel title="数据订阅台账" action={<button onClick={() => apply(api.runDataPipeline)}>同步订阅源</button>}>
        <SubscriptionTable subscriptions={state.dataSubscriptions} apply={apply} />
      </Panel>
      <Panel title="订阅聚合分析">
        <DataAggregatePanel insights={state.dataAggregateInsights} />
      </Panel>
      <Panel title="新增订阅">
        <SubscriptionForm apply={apply} />
        <ProviderConfigTable configs={state.dataProviderConfigs} apply={apply} />
      </Panel>
    </div>
  );
}

function Research({ view, state, apply }: { view: ViewId; state: QuantState; apply: ApplyAction }) {
  if (view === "factor-research") {
    return (
      <div className="content-grid two">
        <Panel title="因子研究环境" action={<button onClick={() => apply(api.computeFactors)}><Zap size={14} />重新计算</button>}>
          <FactorTable factors={state.factors} apply={apply} />
        </Panel>
        <Panel title="新增因子">
          <FactorForm apply={apply} />
        </Panel>
        <Panel title="因子配置">
          <FactorConfigTable configs={state.factorConfigs} apply={apply} />
          <FactorConfigForm apply={apply} />
        </Panel>
        <Panel title="研究流水线">
          <Pipeline steps={["JupyterLab", "因子挖掘", "因子检验", "因子库", "特征存储"]} />
        </Panel>
      </div>
    );
  }
  if (view === "mirofish-simulation") {
    return (
      <div className="content-grid two">
        <Panel title="MiroFish 群体智能推演" action={<button onClick={() => apply(api.advanceMiroFishScenarios)}><Play size={14} />推进推演</button>}>
          <MiroFishScenarioTable scenarios={state.miroFishScenarios} apply={apply} />
        </Panel>
        <Panel title="新建推演任务">
          <MiroFishScenarioForm apply={apply} />
        </Panel>
        <Panel title="集成配置">
          <MiroFishConfigPanel state={state} apply={apply} />
        </Panel>
        <Panel title="推演到 Alpha 流程">
          <Pipeline steps={["种子材料", "群体智能体", "事件扩散", "预测报告", "另类因子"]} />
          <RiskMetrics state={state} />
        </Panel>
      </div>
    );
  }
  if (view === "strategy-dev") {
    return (
      <div className="content-grid two">
        <Panel title="策略开发" action={<button onClick={() => apply(() => api.createBacktest(state.strategies[0].id))}>参数回测</button>}>
          <StrategyBuilder state={state} />
          <StrategyCreateForm apply={apply} />
        </Panel>
        <Panel title="策略评估">
          <BacktestTable tasks={state.backtests} apply={apply} />
        </Panel>
      </div>
    );
  }
  return (
    <div className="content-grid two">
      <Panel title="策略库" action={<button onClick={() => apply(api.optimizeStrategies)}><SlidersHorizontal size={14} />策略调优</button>}>
        <StrategyTable strategies={state.strategies} apply={apply} />
      </Panel>
      <Panel title="调优记录">
        <StrategyOptimizationTable records={state.strategyOptimizations} />
      </Panel>
    </div>
  );
}

function Backtest({ view, state, apply }: { view: ViewId; state: QuantState; apply: ApplyAction }) {
  if (view === "backtest-tasks") {
    return (
      <div className="content-grid two">
        <Panel title="回测任务" action={<button onClick={() => apply(api.advanceBacktests)}><Play size={14} />推进任务</button>}>
          <BacktestTable tasks={state.backtests} apply={apply} />
        </Panel>
        <Panel title="新建回测任务">
          <BacktestCreateForm state={state} apply={apply} />
        </Panel>
      </div>
    );
  }
  if (view === "backtest-results") {
    return (
      <div className="content-grid two">
        <Panel title="回测收益曲线">
          <LineChartCard values={state.marketSeries.map((v, i) => v - i * 0.28)} labels={state.marketLabels ?? marketLabels} />
        </Panel>
        <Panel title="回测结果库">
          <BacktestResultTable results={state.backtestResults} />
        </Panel>
        <Panel title="结果归因分析">
          <ResultAttribution results={state.backtestResults} tasks={state.backtests} />
        </Panel>
      </div>
    );
  }
  return (
    <div className="content-grid two">
      <Panel title="风险收益分析">
        <RiskMetrics state={state} />
      </Panel>
      <Panel title="过拟合与稳健性检验">
        <StressTable state={state} />
      </Panel>
    </div>
  );
}

function Execution({ view, state, apply }: { view: ViewId; state: QuantState; apply: ApplyAction }) {
  if (view === "signal-selection") {
    return (
      <>
        <TradingSessionPanel session={state.marketSession} />
        <div className="content-grid two">
          <Panel title="自动选股信号" action={<button onClick={() => apply(api.runSignalSelection)}><ListChecks size={14} />刷新信号</button>}>
            <SignalTable signals={state.stockSignals} apply={apply} />
          </Panel>
          <Panel title="信号交易控制">
            <AutoTradeControl state={state} apply={apply} />
          </Panel>
        </div>
      </>
    );
  }
  if (view === "trade-monitor") {
    return (
      <>
        <TradingSessionPanel session={state.marketSession} />
        <div className="content-grid two">
          <Panel title="实时交易监控" action={<button onClick={() => apply(api.executePendingOrders)}><CheckCircle2 size={14} />撮合成交</button>}>
            <TradeSummary state={state} apply={apply} expanded />
          </Panel>
          <Panel title="自动选股信号" action={<button onClick={() => apply(api.runSignalSelection)}><ListChecks size={14} />刷新</button>}>
            <SignalTable signals={state.stockSignals} apply={apply} compact />
          </Panel>
          <Panel title="策略引擎">
            <StrategyTable strategies={state.strategies} apply={apply} compact />
          </Panel>
          <Panel title="自动交易记录">
            <AutoTradeRunTable runs={state.autoTradeRuns} />
          </Panel>
        </div>
      </>
    );
  }
  if (view === "auto-trading") {
    return (
      <>
        <TradingSessionPanel session={state.marketSession} />
        <div className="content-grid two">
          <Panel title="自动交易控制">
            <AutoTradeControl state={state} apply={apply} />
          </Panel>
          <Panel title="运行记录">
            <AutoTradeRunTable runs={state.autoTradeRuns} />
          </Panel>
          <Panel title="候选信号">
            <SignalTable signals={state.stockSignals} apply={apply} compact />
          </Panel>
          <Panel title="待处理订单" action={<button onClick={() => apply(api.executePendingOrders)}><CheckCircle2 size={14} />撮合成交</button>}>
            <OrderTable orders={state.orders.filter((order) => order.status === "待执行" || order.status === "部分成交").slice(0, 8)} apply={apply} />
          </Panel>
        </div>
      </>
    );
  }
  if (view === "orders") {
    return (
      <>
        <TradingSessionPanel session={state.marketSession} />
        <Panel title="订单管理" action={<button onClick={() => apply(() => api.runAutoTrading({ strategyId: state.strategies[0].id, execute: false }))}><Send size={14} />按信号生成</button>}>
          <OrderTable orders={state.orders} apply={apply} />
        </Panel>
      </>
    );
  }
  return (
    <>
      <TradingSessionPanel session={state.marketSession} />
      <Panel title="持仓管理" action={<button onClick={() => apply(api.refreshRisk)}>头寸调整</button>}>
        <PositionTable positions={state.positions} apply={apply} />
      </Panel>
    </>
  );
}

function RiskManagement({ view, state, apply }: { view: ViewId; state: QuantState; apply: ApplyAction }) {
  if (view === "risk-monitor") {
    return (
      <div className="content-grid two">
        <Panel title="风险监控" action={<button onClick={() => apply(api.refreshRisk)}>实时风控</button>}>
          <Gauge state={state} detailed />
        </Panel>
        <Panel title="交易风险指标">
          <RiskIndicatorTable indicators={state.riskIndicators} />
        </Panel>
        <Panel title="风控规则触发">
          <RiskRuleTable rules={state.riskRules} apply={apply} />
        </Panel>
      </div>
    );
  }
  if (view === "risk-indicators") {
    return (
      <div className="content-grid two">
        <Panel title="风险指标计算" action={<button onClick={() => apply(api.refreshRisk)}>刷新指标</button>}>
          <RiskMetrics state={state} />
        </Panel>
        <Panel title="指标台账">
          <RiskIndicatorTable indicators={state.riskIndicators} />
        </Panel>
      </div>
    );
  }
  return (
    <div className="content-grid two">
      <Panel title="风控规则" action={<button onClick={() => apply(api.refreshRisk)}>压力测试</button>}>
        <RiskRuleTable rules={state.riskRules} apply={apply} />
      </Panel>
      <Panel title="新增风控规则">
        <RiskRuleForm apply={apply} />
      </Panel>
    </div>
  );
}

function SystemManagement({ view, state, apply }: { view: ViewId; state: QuantState; apply: ApplyAction }) {
  if (view === "users") {
    return (
      <div className="content-grid two">
        <Panel title="用户管理">
          <UserTable users={state.users} />
        </Panel>
        <Panel title="新增用户">
          <UserForm apply={apply} />
        </Panel>
      </div>
    );
  }
  if (view === "roles") {
    return (
      <div className="content-grid two">
        <Panel title="角色权限">
          <RolePermissionTable roles={state.roles} />
        </Panel>
        <Panel title="新增角色">
          <RoleForm apply={apply} />
        </Panel>
      </div>
    );
  }
  if (view === "system-config") {
    return (
      <div className="content-grid two">
        <Panel title="系统配置">
          <SystemConfigForm config={state.systemConfig} apply={apply} />
        </Panel>
        <Panel title="系统运维">
          <ServiceList services={state.services} apply={apply} />
        </Panel>
        <Panel title="基础设施资源">
          <InfraGrid />
        </Panel>
      </div>
    );
  }
  return (
    <Panel title="操作日志" action={<button onClick={() => apply(api.clearLogs)}>清理日志</button>}>
      <LogList logs={state.logs} />
    </Panel>
  );
}

function getRiskIndicator(state: QuantState, name: string) {
  return state.riskIndicators.find((item) => item.name === name);
}

function formatIndicator(state: QuantState, name: string) {
  const indicator = getRiskIndicator(state, name);
  return indicator ? `${indicator.value}${indicator.unit}` : "-";
}

function getPositionMarketValue(state: QuantState) {
  return state.positions.reduce((sum, position) => sum + position.quantity * position.last, 0);
}

function getAccountValue(state: QuantState) {
  return getPositionMarketValue(state) + Number(state.cashBalance ?? 0);
}

function getPositionPnl(state: QuantState) {
  return state.positions.reduce((sum, position) => sum + (position.last - position.cost) * position.quantity, 0);
}

function formatSignedCurrency(value: number) {
  return `${value >= 0 ? "+" : ""}${formatCurrency(value)}`;
}

function formatSignedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = Math.max(0, bytes);
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

function Metric({ title, value, delta, icon: Icon, tone }: { title: string; value: string | number; delta: string; icon: LucideIcon; tone?: "green" | "red" }) {
  return (
    <div className="metric-card">
      <div className="metric-label"><Icon size={15} />{title}</div>
      <strong className={tone}>{value}</strong>
      <span>{delta}</span>
    </div>
  );
}

const fallbackTradingSession: TradingSessionStatus = {
  market: "A股",
  open: false,
  reason: "交易状态待同步",
  date: "-",
  checkedAt: "-",
  nextOpenAt: "-",
  sessions: ["09:30-11:30", "13:00-15:00"],
  source: "交易日历接口未返回"
};

function TradingSessionPanel({ session }: { session?: TradingSessionStatus }) {
  const current = session ?? fallbackTradingSession;
  const label = current.open ? "连续竞价" : "休市/不可撮合";
  return (
    <section className={`session-panel ${current.open ? "open" : "closed"}`}>
      <div className="session-title">
        <div>
          <Radio size={16} />
          <strong>{current.market}交易状态</strong>
          <span>{current.checkedAt} 复核</span>
        </div>
        <Badge status={current.open ? "正常" : "告警"} label={label} />
      </div>
      <div className="session-grid">
        <div><span>当前状态</span><b>{current.reason}</b></div>
        <div><span>下一开市</span><b>{current.open ? "当前可撮合" : current.nextOpenAt}</b></div>
        <div><span>交易时段</span><b>{current.sessions.join(" / ")}</b></div>
        <div><span>日历来源</span><b>{current.source}</b></div>
      </div>
    </section>
  );
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function LineChartCard({ values, labels }: { values: number[]; labels: string[] }) {
  const series = values.length > 1 ? values : [0, ...(values.length ? values : [0])];
  const min = Math.min(...series, -10);
  const max = Math.max(...series, 20);
  const points = series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * 100;
      const y = 88 - ((value - min) / (max - min)) * 76;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <div className="chart-wrap">
      <div className="legend"><span className="dot dot-blue" />接口收益序列</div>
      <svg viewBox="0 0 100 100" role="img" aria-label="收益曲线">
        {[20, 40, 60, 80].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} className="grid-line" />)}
        <polyline points={points} fill="none" className="chart-line" />
      </svg>
      <div className="axis">{labels.filter((_, i) => i % 2 === 0).map((label) => <span key={label}>{label}</span>)}</div>
    </div>
  );
}

function Donut({ strategies }: { strategies: Strategy[] }) {
  const total = strategies.length || 1;
  const totalCapital = strategies.reduce((sum, strategy) => sum + strategy.capital, 0) || 1;
  const groups = Array.from(strategies.reduce((map, strategy) => {
    const current = map.get(strategy.type) ?? { type: strategy.type, count: 0, capital: 0 };
    current.count += 1;
    current.capital += strategy.capital;
    map.set(strategy.type, current);
    return map;
  }, new Map<string, { type: string; count: number; capital: number }>()).values());
  return (
    <div className="donut-wrap">
      <div className="donut"><strong>{total}</strong><span>总数</span></div>
      <div className="distribution">
        {groups.map((group, index) => (
          <p key={group.type}><span className={`swatch c${index}`} />{group.type}<b>{group.count} / {formatCurrency(group.capital)} ({((group.capital / totalCapital) * 100).toFixed(2)}%)</b></p>
        ))}
      </div>
    </div>
  );
}

function Gauge({ state, detailed }: { state: QuantState; detailed?: boolean }) {
  const score = state.riskScore;
  const leverage = getRiskIndicator(state, "杠杆率");
  const concentration = getRiskIndicator(state, "品种集中度");
  const var95 = getRiskIndicator(state, "VaR(95%)");
  const drawdown = getRiskIndicator(state, "最大回撤");
  const warningCount = state.riskIndicators.filter((item) => item.status === "告警").length + state.riskRules.filter((item) => item.status === "告警").length;
  return (
    <div className="gauge-wrap">
      <div className="gauge" style={{ "--score": `${score * 1.8}deg` } as React.CSSProperties}>
        <div className="needle" />
        <strong>{score}</strong>
      </div>
      <div className="risk-list">
        <p><span>VaR(95%)</span><b>{var95 ? `${var95.value}${var95.unit}` : "-"}</b></p>
        <p><span>最大回撤</span><b>{drawdown ? `${drawdown.value}${drawdown.unit}` : "-"}</b></p>
        <p><span>杠杆率</span><b>{leverage ? `${leverage.value}${leverage.unit}` : "-"}</b></p>
        <p><span>集中度</span><b>{concentration ? `${concentration.value}${concentration.unit}` : "-"}</b></p>
        <p><span>预警数量</span><b className={warningCount > 0 ? "down" : "up"}>{warningCount}</b></p>
        <p><span>风控状态</span><b className={score > 70 ? "down" : "up"}>{score > 70 ? "告警" : "正常"}</b></p>
      </div>
      {detailed && <Pipeline steps={["风险指标计算", "风险限额管理", "压力测试", "风险报告", "告警通知"]} />}
    </div>
  );
}

function StrategyTable({ strategies, apply, compact }: { strategies: Strategy[]; apply: ApplyAction; compact?: boolean }) {
  return (
    <div className="table">
      <div className="thead six"><span>策略名称</span><span>类型</span><span>状态</span><span>当日收益</span><span>近1年收益</span><span>操作</span></div>
      {strategies.slice(0, compact ? 5 : strategies.length).map((strategy) => (
        <div className="trow six" key={strategy.id}>
          <span>{strategy.name}</span>
          <span>{strategy.type}</span>
          <Badge status={strategy.status} />
          <span className={strategy.pnlToday >= 0 ? "up" : "down"}>{strategy.pnlToday > 0 ? "+" : ""}{strategy.pnlToday}%</span>
          <span className={strategy.pnlYear >= 0 ? "up" : "down"}>{strategy.pnlYear > 0 ? "+" : ""}{strategy.pnlYear}%</span>
          <span className="row-actions">
            <button onClick={() => apply(() => api.toggleStrategy(strategy.id))}>{strategy.status === "运行中" ? <Pause size={14} /> : <Play size={14} />}</button>
            <button onClick={() => apply(() => api.generateOrder(strategy.id))}><Send size={14} /></button>
          </span>
        </div>
      ))}
    </div>
  );
}

function StrategyOptimizationTable({ records }: { records: StrategyOptimization[] }) {
  if (records.length === 0) return <p className="empty">暂无调优记录</p>;
  return (
    <div className="table">
      <div className="thead six"><span>时间</span><span>策略</span><span>夏普变化</span><span>资金调整</span><span>建议因子</span><span>状态</span></div>
      {records.slice(0, 8).map((record) => (
        <div className="trow six" key={record.id}>
          <span>{record.time}</span><span>{record.strategy}</span>
          <span className={record.afterSharpe >= record.beforeSharpe ? "up" : "down"}>{record.beforeSharpe} → {record.afterSharpe}</span>
          <span>{formatCurrency(record.capitalShift)}</span>
          <span>{record.suggestedFactors.join(" / ")}<small>{record.summary}</small></span>
          <Badge status={record.status} />
        </div>
      ))}
    </div>
  );
}

function TradeSummary({ state, apply, expanded }: { state: QuantState; apply: ApplyAction; expanded?: boolean }) {
  const pending = state.orders.filter((item) => item.status === "待执行").length;
  const filled = state.orders.filter((item) => item.status === "已成交").length;
  const filledAmount = state.orders.filter((item) => item.status === "已成交").reduce((sum, order) => sum + order.amount, 0);
  const canceled = state.orders.filter((item) => item.status === "已撤单").length;
  const partial = state.orders.filter((item) => item.status === "部分成交").length;
  return (
    <div className="trade-box">
      <div className="trade-metrics">
        <Metric title="委托数量" value={state.orders.length} delta={`待执行 ${pending}`} icon={ListChecks} />
        <Metric title="成交数量" value={filled} delta={`部分成交 ${partial}`} icon={CheckCircle2} />
        <Metric title="成交金额" value={formatCurrency(filledAmount)} delta={`现金 ${formatCurrency(state.cashBalance)}`} icon={Wallet} />
        <Metric title="撤单数量" value={canceled} delta={`已撤单 ${canceled}`} icon={XCircle} />
      </div>
      <div className="panel-actions">
        <button onClick={() => apply(() => api.generateOrder(state.strategies[0].id))}><Send size={14} />生成订单</button>
        <button onClick={() => apply(api.executePendingOrders)}><CheckCircle2 size={14} />撮合成交</button>
      </div>
      <OrderTable orders={state.orders.slice(0, expanded ? state.orders.length : 4)} apply={apply} />
    </div>
  );
}

function BacktestTable({ tasks, apply, compact }: { tasks: BacktestTask[]; apply: ApplyAction; compact?: boolean }) {
  return (
    <div className="table">
      <div className="thead six"><span>任务名称</span><span>策略名称</span><span>进度</span><span>状态</span><span>开始时间</span><span>操作</span></div>
      {tasks.slice(0, compact ? 4 : tasks.length).map((task) => (
        <div className="trow six" key={task.id}>
          <span>{task.id}</span><span>{task.strategy}<small>{task.universe ?? "全A流动性池"} / {task.benchmark ?? "沪深300"}</small></span>
          <span><Progress value={task.progress} /></span><Badge status={task.status} /><span>{task.startTime}</span>
          <span className="row-actions"><button onClick={() => apply(api.advanceBacktests)}><Play size={14} /></button><button><Eye size={14} /></button></span>
        </div>
      ))}
    </div>
  );
}

function BacktestCreateForm({ state, apply }: { state: QuantState; apply: ApplyAction }) {
  const [form, setForm] = useState({
    strategyId: state.strategies[0]?.id ?? "",
    universe: "沪深300成分股",
    benchmark: "沪深300",
    period: "2021-01-01 至 2026-05-01",
    initialCapital: "10000000"
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    apply(() => api.createBacktest({ ...form, initialCapital: Number(form.initialCapital) }));
  };
  return (
    <form className="inline-form" onSubmit={submit}>
      <label>策略<select value={form.strategyId} onChange={(event) => setForm({ ...form, strategyId: event.target.value })}>{state.strategies.map((strategy) => <option key={strategy.id} value={strategy.id}>{strategy.name}</option>)}</select></label>
      <label>股票池<input value={form.universe} onChange={(event) => setForm({ ...form, universe: event.target.value })} /></label>
      <label>基准<input value={form.benchmark} onChange={(event) => setForm({ ...form, benchmark: event.target.value })} /></label>
      <label>区间<input value={form.period} onChange={(event) => setForm({ ...form, period: event.target.value })} /></label>
      <label>初始资金<input value={form.initialCapital} onChange={(event) => setForm({ ...form, initialCapital: event.target.value })} /></label>
      <button type="submit"><Play size={14} />创建任务</button>
    </form>
  );
}

function FactorTable({ factors, apply, compact }: { factors: Factor[]; apply: ApplyAction; compact?: boolean }) {
  return (
    <div className="table">
      <div className="thead six"><span>因子名称</span><span>IC均值</span><span>ICIR</span><span>胜率</span><span>信号强度</span><span>操作</span></div>
      {factors.slice(0, compact ? 4 : factors.length).map((factor) => (
        <div className="trow six" key={factor.id}>
          <span>{factor.name}</span><span>{factor.ic}</span><span>{factor.icir}</span><span>{factor.winRate}%</span>
          <span className={factor.signal === "强" ? "up" : factor.signal === "弱" ? "down" : "warn"}>{factor.signal}</span>
          <span className="row-actions">
            <button onClick={() => apply(api.computeFactors)}><Zap size={14} /></button>
            <button onClick={() => apply(() => api.toggleFactor(factor.id))}>{factor.enabled ? "停用" : "启用"}</button>
          </span>
        </div>
      ))}
    </div>
  );
}

function FactorForm({ apply }: { apply: ApplyAction }) {
  const [form, setForm] = useState({ name: "Sentiment_News_1D", ic: "0.035", icir: "0.62", winRate: "54.5", signal: "中" });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    apply(() => api.saveFactor({
      name: form.name,
      ic: Number(form.ic),
      icir: Number(form.icir),
      winRate: Number(form.winRate),
      signal: form.signal,
      enabled: true
    }));
  };
  return (
    <form className="inline-form" onSubmit={submit}>
      <label>因子名称<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
      <label>IC<input value={form.ic} onChange={(event) => setForm({ ...form, ic: event.target.value })} /></label>
      <label>ICIR<input value={form.icir} onChange={(event) => setForm({ ...form, icir: event.target.value })} /></label>
      <label>胜率<input value={form.winRate} onChange={(event) => setForm({ ...form, winRate: event.target.value })} /></label>
      <label>信号<select value={form.signal} onChange={(event) => setForm({ ...form, signal: event.target.value })}><option>强</option><option>中</option><option>弱</option></select></label>
      <button type="submit"><FlaskConical size={14} />保存因子</button>
    </form>
  );
}

function FactorConfigTable({ configs, apply }: { configs: FactorConfig[]; apply: ApplyAction }) {
  return (
    <div className="table">
      <div className="thead six"><span>因子</span><span>公式</span><span>窗口</span><span>权重</span><span>范围/频率</span><span>操作</span></div>
      {configs.map((config) => (
        <div className="trow six" key={config.id}>
          <span>{config.factorName}<small>{config.lastRun}</small></span>
          <span>{config.formula}</span><span>{config.lookback}D</span><span>{config.weight}</span>
          <span>{config.universe}<small>{config.rebalance}</small></span>
          <span className="row-actions">
            <Badge status={config.status} />
            <button onClick={() => apply(() => api.toggleFactorConfig(config.id))}>{config.enabled ? "停用" : "启用"}</button>
          </span>
        </div>
      ))}
    </div>
  );
}

function FactorConfigForm({ apply }: { apply: ApplyAction }) {
  const [form, setForm] = useState({ factorName: "Liquidity_Shock_10D", formula: "zscore(amount, 10) * -return_1d", lookback: "10", weight: "0.2", universe: "全A流动性池", rebalance: "日频" });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    apply(() => api.saveFactorConfig({
      ...form,
      lookback: Number(form.lookback),
      weight: Number(form.weight),
      enabled: true
    }));
  };
  return (
    <form className="inline-form" onSubmit={submit}>
      <label>因子名称<input value={form.factorName} onChange={(event) => setForm({ ...form, factorName: event.target.value })} /></label>
      <label>窗口<input value={form.lookback} onChange={(event) => setForm({ ...form, lookback: event.target.value })} /></label>
      <label>权重<input value={form.weight} onChange={(event) => setForm({ ...form, weight: event.target.value })} /></label>
      <label>调仓<input value={form.rebalance} onChange={(event) => setForm({ ...form, rebalance: event.target.value })} /></label>
      <label>股票池<input value={form.universe} onChange={(event) => setForm({ ...form, universe: event.target.value })} /></label>
      <label className="wide-field">公式<input value={form.formula} onChange={(event) => setForm({ ...form, formula: event.target.value })} /></label>
      <button type="submit"><FlaskConical size={14} />保存配置</button>
    </form>
  );
}

function MiroFishScenarioTable({ scenarios, apply }: { scenarios: MiroFishScenario[]; apply: ApplyAction }) {
  return (
    <div className="table">
      <div className="thead six"><span>推演主题</span><span>智能体/轮次</span><span>进度</span><span>预测影响</span><span>置信度</span><span>操作</span></div>
      {scenarios.map((scenario) => (
        <div className="trow six" key={scenario.id}>
          <span>{scenario.title}<small>{scenario.predictionQuestion}</small></span>
          <span>{scenario.agentCount} / {scenario.rounds}</span>
          <span><Progress value={scenario.progress} /></span>
          <span className={scenario.predictedImpact >= 0 ? "up" : "down"}>{scenario.predictedImpact}%</span>
          <span>{scenario.confidence}%</span>
          <span className="row-actions">
            <Badge status={scenario.status} />
            <button onClick={() => apply(() => api.publishMiroFishFactor(scenario.id))}>{scenario.linkedFactor ? "已入库" : "转因子"}</button>
          </span>
        </div>
      ))}
    </div>
  );
}

function MiroFishScenarioForm({ apply }: { apply: ApplyAction }) {
  const [form, setForm] = useState({
    title: "美股科技财报舆情推演",
    sourceMaterials: "财报电话会、新闻、X/Reddit 舆情、纳指分钟行情",
    predictionQuestion: "大型科技股财报后 3 个交易日是否会带动纳指继续上行？",
    agentCount: "96",
    rounds: "24"
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    apply(() => api.createMiroFishScenario({
      ...form,
      agentCount: Number(form.agentCount),
      rounds: Number(form.rounds)
    }));
  };
  return (
    <form className="inline-form" onSubmit={submit}>
      <label>主题<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
      <label>智能体数量<input value={form.agentCount} onChange={(event) => setForm({ ...form, agentCount: event.target.value })} /></label>
      <label>推演轮次<input value={form.rounds} onChange={(event) => setForm({ ...form, rounds: event.target.value })} /></label>
      <label>种子材料<input value={form.sourceMaterials} onChange={(event) => setForm({ ...form, sourceMaterials: event.target.value })} /></label>
      <label className="wide-field">预测问题<input value={form.predictionQuestion} onChange={(event) => setForm({ ...form, predictionQuestion: event.target.value })} /></label>
      <button type="submit"><Brain size={14} />创建推演</button>
    </form>
  );
}

function MiroFishConfigPanel({ state, apply }: { state: QuantState; apply: ApplyAction }) {
  const config = state.miroFishConfig;
  const [form, setForm] = useState({
    integrationMode: config.integrationMode,
    endpoint: config.endpoint,
    enabled: config.enabled
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    apply(() => api.saveMiroFishConfig(form));
  };
  return (
    <div className="mirofish-config">
      <div className="provider-card">
        <div><strong>MiroFish</strong><Badge status={config.status} label={config.integrationMode} /></div>
        <p>{config.repoUrl}</p>
        <small>许可证：{config.license} · 依赖：{config.dependencies.join(" / ")}</small>
      </div>
      <form className="inline-form" onSubmit={submit}>
        <label>模式<select value={form.integrationMode} onChange={(event) => setForm({ ...form, integrationMode: event.target.value as typeof form.integrationMode })}><option>适配层</option><option>外部服务</option></select></label>
        <label>服务端点<input value={form.endpoint} onChange={(event) => setForm({ ...form, endpoint: event.target.value })} /></label>
        <label>启用<select value={String(form.enabled)} onChange={(event) => setForm({ ...form, enabled: event.target.value === "true" })}><option value="true">启用</option><option value="false">停用</option></select></label>
        <button type="submit"><GitBranch size={14} />保存集成</button>
      </form>
    </div>
  );
}

function DataSnapshot({ state, expanded }: { state: QuantState; expanded?: boolean }) {
  const totalRows = state.dataSources.reduce((sum, item) => sum + item.rows, 0);
  const normal = state.dataSources.filter((item) => item.status === "正常").length;
  const lastSync = state.dataSyncRuns[0]?.time ?? state.dataSources[0]?.latestUpdate ?? "-";
  const enabledProviders = state.dataProviderConfigs.filter((item) => item.enabled).length;
  const activeSubscriptions = state.dataSubscriptions.filter((item) => item.status !== "暂停").length;
  const warehouse = state.dataWarehouse;
  const actualBytes = warehouse?.actualBytes ?? 0;
  const logicalRows = warehouse?.logicalRows ?? totalRows;
  const logicalBytes = warehouse?.logicalBytes ?? totalRows * 320;
  return (
    <div className={`snapshot ${expanded ? "expanded" : ""}`}>
      <Metric title="数据源" value={state.dataSources.length} delta={`正常 ${normal} 异常 ${state.dataSources.length - normal}`} icon={Database} />
      <Metric title="采集接口" value={enabledProviders} delta={`${activeSubscriptions} 个订阅活跃`} icon={Table2} />
      <Metric title="实际存储" value={formatBytes(actualBytes)} delta={`${warehouse?.fileCount ?? 0} 文件 / ${formatCurrency(warehouse?.actualRows ?? 0)} 落盘行`} icon={HardDrive} />
      <Metric title="估算容量" value={formatBytes(logicalBytes)} delta={`${formatCurrency(logicalRows)} 逻辑行`} icon={Boxes} />
      <Metric title="数据更新" value={lastSync} delta="最新同步" icon={RefreshCw} />
    </div>
  );
}

function WarehouseFileTable({ state }: { state: QuantState }) {
  const warehouse = state.dataWarehouse;
  const files = warehouse?.files ?? [];
  if (files.length === 0) {
    return (
      <div className="empty-action">
        <HardDrive size={22} />
        <span>暂无本地仓储文件，同步数据后会写入 data/warehouse</span>
      </div>
    );
  }
  return (
    <div className="warehouse-detail">
      <div className="warehouse-path">
        <span>根目录</span>
        <b>{warehouse.rootPath}</b>
      </div>
      {warehouse.lastMaintenance && (
        <div className="warehouse-maintenance">
          <span>最近维护</span>
          <b>{warehouse.lastMaintenance.summary}</b>
          <small>{warehouse.lastMaintenance.updatedAt} / {formatCurrency(warehouse.lastMaintenance.rowsBefore)} 行 {"->"} {formatCurrency(warehouse.lastMaintenance.rowsAfter)} 行 / 节省 {formatBytes(warehouse.lastMaintenance.bytesSaved)}</small>
        </div>
      )}
      <div className="table warehouse-table">
        <div className="thead five"><span>数据集</span><span>分区</span><span>大小/行数</span><span>更新时间</span><span>路径</span></div>
        {files.slice(0, 8).map((file) => (
          <div className="trow five" key={file.path}>
            <span>{file.dataset}</span>
            <span>{file.partition}</span>
            <span>{formatBytes(file.bytes)}<small>{formatCurrency(file.rows)} 行</small></span>
            <span>{file.updatedAt}</span>
            <span><small>{file.path}</small></span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DataAggregatePanel({ insights }: { insights: DataAggregateInsight[] }) {
  return (
    <div className="insight-grid">
      {insights.map((insight) => (
        <div className="insight-card" key={insight.id}>
          <div><strong>{insight.name}</strong><Badge status={insight.status} /></div>
          <b className={insight.trend === "下降" ? "down" : "up"}>{insight.value}{insight.unit}</b>
          <span>{insight.scope} · {insight.trend}</span>
          <small>{insight.detail}</small>
        </div>
      ))}
    </div>
  );
}

function DataSyncRunTable({ runs }: { runs: DataSyncRun[] }) {
  if (runs.length === 0) return <p className="empty">暂无同步记录</p>;
  return (
    <div className="table data-sync-table">
      <div className="thead six"><span>时间</span><span>触发</span><span>状态</span><span>接口/记录</span><span>质量/延迟</span><span>摘要</span></div>
      {runs.slice(0, 6).map((run) => (
        <div className="trow six" key={run.id}>
          <span>{run.time}</span><span>{run.trigger}</span><Badge status={run.status} />
          <span>{run.providers.length} / {run.records}<small>{run.providers.slice(0, 2).join("、") || "无启用接口"}</small></span>
          <span>{run.qualityScore}% / {run.latency}ms</span><span>{run.summary}</span>
        </div>
      ))}
    </div>
  );
}

function DataSourceTable({ data, apply, detail, subscriptions }: { data: DataSource[]; apply: ApplyAction; detail?: boolean; subscriptions?: boolean }) {
  return (
    <div className="table data-source-table">
      <div className="thead six"><span>数据源</span><span>类别</span><span>接口</span><span>质量</span><span>状态</span><span>操作</span></div>
      {data.map((source) => (
        <div className="trow six" key={source.id}>
          <span>{source.name}</span><span>{source.category}</span><span>{detail ? source.endpoint : `${source.latency}ms`}</span><span>{source.quality.toFixed(1)}%</span><Badge status={source.status} />
          <span className="row-actions">
            <button onClick={() => apply(() => api.subscribeSource(source.id))}>{subscriptions || !source.subscribed ? "订阅" : "取消"}</button>
            <button onClick={() => apply(api.runDataPipeline)}><RefreshCw size={14} /></button>
          </span>
        </div>
      ))}
    </div>
  );
}

function DataQualityTable({ rules }: { rules: DataQualityRule[] }) {
  return (
    <div className="table data-quality-table">
      <div className="thead six"><span>规则</span><span>对象</span><span>维度</span><span>阈值</span><span>评分</span><span>状态</span></div>
      {rules.map((rule) => (
        <div className="trow six" key={rule.id}>
          <span>{rule.name}</span><span>{rule.target}</span><span>{rule.dimension}</span><span>{rule.threshold}</span>
          <span><Progress value={rule.score} /></span><span className="row-actions"><Badge status={rule.status} /><small>{rule.lastCheck}</small></span>
        </div>
      ))}
    </div>
  );
}

function SubscriptionTable({ subscriptions, apply }: { subscriptions: DataSubscription[]; apply: ApplyAction }) {
  return (
    <div className="table subscription-table">
      <div className="thead six"><span>供应商</span><span>数据集</span><span>真实性等级</span><span>频率/市场</span><span>费用</span><span>状态</span></div>
      {subscriptions.map((subscription) => (
        <div className="trow six" key={subscription.id}>
          <span>{subscription.provider}</span><span>{subscription.dataset}</span><span>{subscription.level}</span>
          <span>{subscription.frequency} / {subscription.markets.join(",")}</span>
          <span>{subscription.cost > 0 ? `¥${formatCurrency(subscription.cost)}` : "免费"}</span>
          <span className="row-actions">
            <Badge status={subscription.status} />
            <button onClick={() => apply(() => api.toggleDataSubscription(subscription.id))}>{subscription.status === "暂停" ? "启用" : "暂停"}</button>
          </span>
        </div>
      ))}
    </div>
  );
}

function SubscriptionForm({ apply }: { apply: ApplyAction }) {
  const [form, setForm] = useState({
    provider: "Interactive Brokers",
    dataset: "行情/订单/账户",
    level: "券商API",
    frequency: "实时",
    markets: "US,HK",
    owner: "trader_b",
    cost: "24000",
    renewalDate: "2026-12-31"
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    apply(() => api.saveDataSubscription({
      ...form,
      markets: form.markets.split(",").map((item) => item.trim()).filter(Boolean),
      cost: Number(form.cost)
    }));
  };
  return (
    <form className="inline-form" onSubmit={submit}>
      <label>供应商<input value={form.provider} onChange={(event) => setForm({ ...form, provider: event.target.value })} /></label>
      <label>数据集<input value={form.dataset} onChange={(event) => setForm({ ...form, dataset: event.target.value })} /></label>
      <label>等级<select value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })}><option>交易所直连</option><option>券商API</option><option>专业数据商</option><option>免费/半免费</option><option>另类数据</option></select></label>
      <label>频率<input value={form.frequency} onChange={(event) => setForm({ ...form, frequency: event.target.value })} /></label>
      <label>市场<input value={form.markets} onChange={(event) => setForm({ ...form, markets: event.target.value })} /></label>
      <label>费用<input value={form.cost} onChange={(event) => setForm({ ...form, cost: event.target.value })} /></label>
      <button type="submit"><Radio size={14} />保存订阅</button>
    </form>
  );
}

function DataSourceForm({ apply }: { apply: ApplyAction }) {
  const [form, setForm] = useState({ name: "Yahoo Finance", category: "行情/基本面", endpoint: "query1.finance.yahoo.com" });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    apply(() => api.saveDataSource({ ...form, subscribed: true, quality: 100 }));
  };
  return (
    <form className="inline-form" onSubmit={submit}>
      <label>名称<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
      <label>类型<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label>
      <label>接口<input value={form.endpoint} onChange={(event) => setForm({ ...form, endpoint: event.target.value })} /></label>
      <button type="submit"><Database size={14} />保存数据源</button>
    </form>
  );
}

function ProviderConfigTable({ configs, apply }: { configs: DataProviderConfig[]; apply: ApplyAction }) {
  return (
    <div className="provider-list">
      {configs.map((config) => (
        <div className="provider-card" key={config.id}>
          <div>
            <strong>{config.name}</strong>
            <span>{config.provider} · {config.frequency}</span>
          </div>
          <Badge status={config.status} label={config.enabled ? "启用" : "停用"} />
          <p>{config.endpoint}</p>
          <small>{config.symbols.join(", ") || config.note}</small>
          <div className="row-actions">
            <button onClick={() => apply(() => api.toggleProviderConfig(config.id))}>{config.enabled ? "停用" : "启用"}</button>
            <button onClick={() => apply(() => api.saveProviderConfig({ ...config, lastSync: new Date().toLocaleString("zh-CN", { hour12: false }) }))}>保存</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProviderConfigForm({ apply }: { apply: ApplyAction }) {
  const [form, setForm] = useState({
    name: "Bloomberg Terminal",
    category: "专业数据商",
    provider: "Manual",
    endpoint: "Bloomberg Terminal / B-PIPE",
    frequency: "实时/历史",
    symbols: "SPX,NDX,HSI",
    authMode: "terminal",
    note: "机构级分析数据源"
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    apply(() => api.saveProviderConfig({
      ...form,
      symbols: form.symbols.split(",").map((item) => item.trim()).filter(Boolean),
      enabled: true
    }));
  };
  return (
    <form className="inline-form" onSubmit={submit}>
      <label>接口名称<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
      <label>分类<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label>
      <label>供应商<select value={form.provider} onChange={(event) => setForm({ ...form, provider: event.target.value })}><option>Tencent</option><option>Yahoo</option><option>AlphaVantage</option><option>IBKR</option><option>Exchange</option><option>Manual</option></select></label>
      <label>鉴权<select value={form.authMode} onChange={(event) => setForm({ ...form, authMode: event.target.value })}><option>none</option><option>api-key</option><option>oauth</option><option>terminal</option></select></label>
      <label>端点<input value={form.endpoint} onChange={(event) => setForm({ ...form, endpoint: event.target.value })} /></label>
      <label>频率<input value={form.frequency} onChange={(event) => setForm({ ...form, frequency: event.target.value })} /></label>
      <label>标的<input value={form.symbols} onChange={(event) => setForm({ ...form, symbols: event.target.value })} /></label>
      <label>说明<input value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} /></label>
      <button type="submit"><Server size={14} />保存接口</button>
    </form>
  );
}

function QualityCard({ source, apply }: { source: DataSource; apply: ApplyAction }) {
  return (
    <Panel title={source.name} action={<button onClick={() => apply(api.runDataPipeline)}>清洗</button>}>
      <div className="quality">
        <Progress value={source.quality} />
        <p><span>去重/补全/异常值处理</span><b>{source.quality > 98 ? "通过" : "需复核"}</b></p>
        <p><span>延迟</span><b>{source.latency}ms</b></p>
        <p><span>记录数</span><b>{formatCurrency(source.rows)}</b></p>
      </div>
    </Panel>
  );
}

function Architecture({ state }: { state: QuantState }) {
  return (
    <div className="architecture">
      {state.architecture.map((layer, index) => (
        <div className="arch-layer" key={layer.layer}>
          <div className="arch-title"><span>{index + 1}. {layer.layer}</span><Badge status={layer.status} /></div>
          <div className="arch-modules">{layer.modules.map((module) => <span key={module}>{module}</span>)}</div>
        </div>
      ))}
    </div>
  );
}

function StrategyBuilder({ state }: { state: QuantState }) {
  return (
    <div className="builder">
      <Pipeline steps={["策略逻辑", "参数配置", "策略组合", "风险收益分析", "过拟合检验"]} />
      <div className="config-grid">
        <label>策略模板<select defaultValue={state.strategies[0].name}>{state.strategies.map((strategy) => <option key={strategy.id}>{strategy.name}</option>)}</select></label>
        <label>调仓频率<select defaultValue="日频"><option>分钟</option><option>日频</option><option>周频</option></select></label>
        <label>滑点模型<input defaultValue="成交额 0.03%" /></label>
        <label>手续费<input defaultValue="万分之三" /></label>
      </div>
    </div>
  );
}

function StrategyCreateForm({ apply }: { apply: ApplyAction }) {
  const [form, setForm] = useState({ name: "Mean_Reversion_v1", type: "均值回归", capital: "10000000", maxDrawdown: "5.5", riskLevel: "中" });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    apply(() => api.createStrategy({
      name: form.name,
      type: form.type,
      capital: Number(form.capital),
      maxDrawdown: Number(form.maxDrawdown),
      riskLevel: form.riskLevel
    }));
  };
  return (
    <form className="inline-form" onSubmit={submit}>
      <label>策略名称<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
      <label>类型<input value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} /></label>
      <label>资金<input value={form.capital} onChange={(event) => setForm({ ...form, capital: event.target.value })} /></label>
      <label>回撤阈值<input value={form.maxDrawdown} onChange={(event) => setForm({ ...form, maxDrawdown: event.target.value })} /></label>
      <label>风险<select value={form.riskLevel} onChange={(event) => setForm({ ...form, riskLevel: event.target.value })}><option>低</option><option>中</option><option>高</option></select></label>
      <button type="submit"><Brain size={14} />保存策略</button>
    </form>
  );
}

function BacktestResultTable({ results }: { results: BacktestResult[] }) {
  return (
    <div className="table">
      <div className="thead six"><span>策略</span><span>区间</span><span>年化/超额</span><span>夏普</span><span>回撤</span><span>状态</span></div>
      {results.map((result) => (
        <div className="trow six" key={result.id}>
          <span>{result.strategy}</span><span>{result.period}</span>
          <span className={result.annualReturn >= 0 ? "up" : "down"}>{result.annualReturn}% / {result.excessReturn}%</span>
          <span>{result.sharpe}</span><span className="down">{result.maxDrawdown}%</span>
          <span className="row-actions"><Badge status={result.status} /><small>{result.completedAt}</small></span>
        </div>
      ))}
    </div>
  );
}

function ResultAttribution({ results, tasks }: { results: BacktestResult[]; tasks: BacktestTask[] }) {
  const rows = results.length > 0
    ? results.slice(0, 4).map((result) => ({ id: result.id, strategy: result.strategy, value: result.excessReturn, label: `${result.excessReturn}%` }))
    : tasks.slice(0, 4).map((task) => ({ id: task.id, strategy: task.strategy, value: task.annualReturn, label: `${task.annualReturn}%` }));
  return (
    <div className="attribution">
      {rows.map((row) => (
        <div key={row.id}><span>{row.strategy}</span><Progress value={Math.min(100, Math.abs(row.value) * 5)} /><b>{row.label}</b></div>
      ))}
    </div>
  );
}

function RiskMetrics({ state }: { state: QuantState }) {
  const maxDrawdown = Math.max(0, ...state.strategies.map((item) => item.maxDrawdown));
  const sharpe = state.backtestResults.length > 0
    ? Math.max(...state.backtestResults.map((item) => item.sharpe))
    : Math.max(0, ...state.backtests.map((item) => item.sharpe));
  return (
    <div className="risk-metrics">
      <Metric title="VaR(95%)" value={formatIndicator(state, "VaR(95%)")} delta="接口风险指标" icon={Shield} />
      <Metric title="ES" value={formatIndicator(state, "ES")} delta="接口风险指标" icon={AlertTriangle} />
      <Metric title="最大回撤" value={`${maxDrawdown.toFixed(2)}%`} delta="近30日" icon={LineChart} />
      <Metric title="夏普比率" value={sharpe.toFixed(2)} delta={`${state.backtestResults.length} 条回测结果`} icon={BarChart3} />
      <Metric title="品种集中度" value={formatIndicator(state, "品种集中度")} delta={`${state.positions.length} 个持仓`} icon={Boxes} />
      <Metric title="风险评分" value={state.riskScore} delta={state.riskScore > 70 ? "需要处置" : "正常"} icon={Activity} tone={state.riskScore > 70 ? "red" : "green"} />
    </div>
  );
}

function RiskIndicatorTable({ indicators }: { indicators: RiskIndicator[] }) {
  return (
    <div className="table">
      <div className="thead six"><span>指标</span><span>范围</span><span>当前值</span><span>阈值</span><span>趋势</span><span>状态</span></div>
      {indicators.map((indicator) => (
        <div className="trow six" key={indicator.id}>
          <span>{indicator.name}</span><span>{indicator.scope}</span>
          <span>{indicator.value}{indicator.unit}</span><span>{indicator.limit}{indicator.unit}</span>
          <span className={indicator.trend === "上升" ? "warn" : indicator.trend === "下降" ? "up" : ""}>{indicator.trend}</span>
          <span className="row-actions"><Badge status={indicator.status} /><small>{indicator.updatedAt}</small></span>
        </div>
      ))}
    </div>
  );
}

function StressTable({ state }: { state: QuantState }) {
  const rows = [
    ["指数下跌 5%", "-1.82%", "低"],
    ["成交量萎缩 30%", "-0.96%", "低"],
    ["利率上行 50bp", "-0.42%", "低"],
    ["极端波动扩散", `-${(state.riskScore / 18).toFixed(2)}%`, state.riskScore > 70 ? "中" : "低"]
  ];
  return (
    <div className="table">
      <div className="thead three"><span>情景</span><span>组合影响</span><span>压力等级</span></div>
      {rows.map((row) => <div className="trow three" key={row[0]}><span>{row[0]}</span><span className="down">{row[1]}</span><span>{row[2]}</span></div>)}
    </div>
  );
}

function SignalTable({ signals, apply, compact }: { signals: StockSignal[]; apply: ApplyAction; compact?: boolean }) {
  const rows = signals.slice(0, compact ? 5 : signals.length);
  if (rows.length === 0) {
    return (
      <div className="empty-action">
        <span>暂无选股信号</span>
        <button onClick={() => apply(api.runSignalSelection)}><ListChecks size={14} />生成信号</button>
      </div>
    );
  }
  return (
    <div className="table signal-table">
      <div className="thead six"><span>标的</span><span>价格/涨跌</span><span>评分</span><span>信号</span><span>目标/风控</span><span>依据</span></div>
      {rows.map((signal) => (
        <div className="trow six" key={signal.symbol}>
          <span>{signal.name}<small>{signal.symbol}</small></span>
          <span>{signal.price}<small className={signal.pctChange >= 0 ? "up" : "down"}>{signal.pctChange >= 0 ? "+" : ""}{signal.pctChange}%</small></span>
          <span><Progress value={signal.score} /></span>
          <span className="row-actions">
            <Badge status={signal.action === "买入" ? "正常" : signal.action === "卖出" ? "告警" : "运行中"} label={`${signal.signal}/${signal.action}`} />
          </span>
          <span>{signal.targetWeight}%<small>止损 {signal.stopLoss} / 止盈 {signal.takeProfit}</small></span>
          <span className="signal-reasons">{signal.reasons.join("、")}</span>
        </div>
      ))}
    </div>
  );
}

function AutoTradeControl({ state, apply }: { state: QuantState; apply: ApplyAction }) {
  const [form, setForm] = useState({
    strategyId: state.strategies.find((strategy) => strategy.status === "运行中")?.id ?? state.strategies[0]?.id ?? "",
    execute: "true",
    minScore: String(state.systemConfig.minSignalScore),
    maxOrders: String(state.systemConfig.maxAutoOrders)
  });
  const lastRun = state.autoTradeRuns[0];
  const marketSession = state.marketSession ?? fallbackTradingSession;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    apply(() => api.runAutoTrading({
      strategyId: form.strategyId,
      execute: form.execute === "true",
      minScore: Number(form.minScore),
      maxOrders: Number(form.maxOrders)
    }));
  };
  return (
    <div className="auto-trade">
      <div className="automation-status">
        <Metric title="自动交易" value={state.systemConfig.autoTradeEnabled ? "启用" : "停用"} delta={`${state.systemConfig.tradingMode} / ${state.systemConfig.riskMode}`} icon={Send} tone={state.systemConfig.autoTradeEnabled ? "green" : "red"} />
        <Metric title="交易状态" value={marketSession.open ? "可撮合" : "休市"} delta={marketSession.open ? marketSession.reason : marketSession.nextOpenAt} icon={Radio} tone={marketSession.open ? "green" : "red"} />
        <Metric title="信号阈值" value={state.systemConfig.minSignalScore} delta={`单次最多 ${state.systemConfig.maxAutoOrders} 笔`} icon={Zap} />
        <Metric title="风险评分" value={state.riskScore} delta={state.riskScore >= 78 ? "接近阻断" : "可交易"} icon={Shield} tone={state.riskScore >= 78 ? "red" : "green"} />
        <Metric title="止损/止盈" value={`${state.systemConfig.stopLossPct}% / ${state.systemConfig.takeProfitPct}%`} delta={lastRun?.summary ?? "暂无记录"} icon={Activity} />
      </div>
      <form className="inline-form" onSubmit={submit}>
        <label>策略<select value={form.strategyId} onChange={(event) => setForm({ ...form, strategyId: event.target.value })}>{state.strategies.map((strategy) => <option key={strategy.id} value={strategy.id}>{strategy.name}</option>)}</select></label>
        <label>执行<select value={form.execute} onChange={(event) => setForm({ ...form, execute: event.target.value })}><option value="true">生成并撮合</option><option value="false">仅生成订单</option></select></label>
        <label>最低评分<input value={form.minScore} onChange={(event) => setForm({ ...form, minScore: event.target.value })} /></label>
        <label>最多订单<input value={form.maxOrders} onChange={(event) => setForm({ ...form, maxOrders: event.target.value })} /></label>
        <button type="button" onClick={() => apply(api.runSignalSelection)}><ListChecks size={14} />刷新信号</button>
        <button type="submit"><Send size={14} />运行自动交易</button>
      </form>
    </div>
  );
}

function AutoTradeRunTable({ runs }: { runs: AutoTradeRun[] }) {
  if (runs.length === 0) return <p className="empty">暂无自动交易记录</p>;
  return (
    <div className="table auto-run-table">
      <div className="thead six"><span>时间</span><span>模式</span><span>策略</span><span>信号/入选</span><span>买卖/成交</span><span>结果</span></div>
      {runs.map((run) => (
        <div className="trow six" key={run.id}>
          <span>{run.time}</span><span>{run.mode}</span><span>{run.strategy}</span>
          <span>{run.generatedSignals} / {run.selected}<small>风控阻断 {run.riskBlocked}</small></span>
          <span>{run.buyOrders ?? 0} 买 / {run.sellOrders ?? 0} 卖<small>成交 {run.executed}</small></span>
          <span className="row-actions"><Badge status={run.status} /><small>{run.summary}{run.riskNotes?.length ? `；${run.riskNotes.join("；")}` : ""}</small></span>
        </div>
      ))}
    </div>
  );
}

function OrderTable({ orders, apply }: { orders: Order[]; apply: ApplyAction }) {
  return (
    <div className="table order-table">
      <div className="thead six"><span>时间</span><span>策略</span><span>标的</span><span>方向</span><span>价格/数量</span><span>状态</span></div>
      {orders.map((order) => (
        <div className="trow six" key={order.id}>
          <span>{order.time}</span><span>{order.strategy}</span><span>{order.symbol}<small>{order.reason ?? ""}</small></span>
          <span className={order.side === "买入" ? "down" : "up"}>{order.side}</span>
          <span>{order.price} / {order.quantity}</span>
          <span className="row-actions">
            <Badge status={order.status === "已成交" ? "正常" : order.status === "已撤单" ? "停止" : "运行中"} label={order.status} />
            {order.status !== "已成交" && order.status !== "已撤单" && <button onClick={() => apply(() => api.cancelOrder(order.id))}>撤单</button>}
          </span>
        </div>
      ))}
    </div>
  );
}

function PositionTable({ positions, apply }: { positions: Position[]; apply: ApplyAction }) {
  return (
    <div className="table">
      <div className="thead six"><span>标的</span><span>名称</span><span>数量</span><span>成本/现价</span><span>盈亏</span><span>权重</span></div>
      {positions.map((position) => (
        <div className="trow six" key={position.symbol}>
          <span>{position.symbol}</span><span>{position.name}</span><span>{formatCurrency(position.quantity)}</span>
          <span>{position.cost} / {position.last}</span><span className={position.pnl >= 0 ? "up" : "down"}>{position.pnl}%</span>
          <span className="row-actions">{position.weight}% <button onClick={() => apply(() => api.rebalancePosition(position.symbol, Math.max(1, position.weight - 2)))}>-</button><button onClick={() => apply(() => api.rebalancePosition(position.symbol, position.weight + 2))}>+</button></span>
        </div>
      ))}
    </div>
  );
}

function RiskRuleTable({ rules, apply }: { rules: RiskRule[]; apply?: ApplyAction }) {
  return (
    <div className="table">
      <div className="thead six"><span>规则</span><span>范围</span><span>阈值</span><span>状态</span><span>触发次数</span><span>操作</span></div>
      {rules.map((rule) => (
        <div className="trow six" key={rule.id}>
          <span>{rule.name}</span><span>{rule.scope}</span><span>{rule.threshold}</span><Badge status={rule.status} /><span>{rule.triggerCount}</span>
          <span className="row-actions">{apply && <button onClick={() => apply(() => api.toggleRiskRule(rule.id))}>{rule.status === "暂停" ? "启用" : "停用"}</button>}</span>
        </div>
      ))}
    </div>
  );
}

function RiskRuleForm({ apply }: { apply: ApplyAction }) {
  const [form, setForm] = useState({ name: "单日亏损限制", scope: "组合", threshold: "日亏损 < 2%" });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    apply(() => api.saveRiskRule(form));
  };
  return (
    <form className="inline-form" onSubmit={submit}>
      <label>规则名称<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
      <label>范围<input value={form.scope} onChange={(event) => setForm({ ...form, scope: event.target.value })} /></label>
      <label>阈值<input value={form.threshold} onChange={(event) => setForm({ ...form, threshold: event.target.value })} /></label>
      <button type="submit"><Shield size={14} />保存规则</button>
    </form>
  );
}

function ServiceList({ services, apply }: { services: ServiceHealth[]; apply: ApplyAction }) {
  return (
    <div className="service-list">
      {services.map((service) => (
        <button key={service.name} onClick={() => apply(() => api.toggleService(service.name))}>
          <Server size={15} /><span>{service.name}</span><Badge status={service.status} /><b>{service.detail}</b><small>{service.uptime}</small>
        </button>
      ))}
    </div>
  );
}

function UserTable({ users }: { users: QuantUser[] }) {
  return (
    <div className="table">
      <div className="thead four"><span>用户</span><span>角色</span><span>状态</span><span>最近登录</span></div>
      {users.map((user) => (
        <div className="trow four" key={user.name}>
          <span>{user.name}</span><span>{user.role}</span><Badge status={user.status} /><span>{user.lastLogin}</span>
        </div>
      ))}
    </div>
  );
}

function UserForm({ apply }: { apply: ApplyAction }) {
  const [form, setForm] = useState({ name: "ops_d", role: "运营审计", status: "正常" });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    apply(() => api.saveUser(form));
  };
  return (
    <form className="inline-form" onSubmit={submit}>
      <label>用户名<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
      <label>角色<input value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} /></label>
      <label>状态<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option>正常</option><option>暂停</option><option>停止</option></select></label>
      <button type="submit"><Users size={14} />保存用户</button>
    </form>
  );
}

function InfraGrid() {
  const items = [
    [Cpu, "计算资源", "服务器集群 / GPU集群 / 分布式计算"],
    [HardDrive, "存储资源", "高性能存储 / 内存数据库 / 备份容灾"],
    [Network, "网络资源", "高速网络 / 专线接入 / 低延迟网络"],
    [Layers, "中间件", "Kafka/RabbitMQ / Redis / Nacos/Consul"]
  ] as const;
  return <div className="infra-grid">{items.map(([Icon, title, text]) => <RoleCard key={title} icon={Icon} title={title} text={text} />)}</div>;
}

function RolePermissionTable({ roles }: { roles: RolePermission[] }) {
  return (
    <div className="role-grid">
      {roles.map((role) => (
        <div className="role-card" key={role.role}>
          <LockKeyhole size={20} />
          <strong>{role.role}</strong>
          <span>{role.description}</span>
          <div className="permission-tags">{role.permissions.map((permission) => <i key={permission}>{permission}</i>)}</div>
          <small>{role.userCount} 个用户</small>
        </div>
      ))}
    </div>
  );
}

function RoleForm({ apply }: { apply: ApplyAction }) {
  const [form, setForm] = useState({ role: "运营审计", description: "只读审计和日志查看权限", permissions: "操作日志,系统配置,数据概览" });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    apply(() => api.saveRole({
      role: form.role,
      description: form.description,
      permissions: form.permissions.split(",").map((item) => item.trim()).filter(Boolean)
    }));
  };
  return (
    <form className="inline-form" onSubmit={submit}>
      <label>角色<input value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} /></label>
      <label>描述<input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
      <label>权限<input value={form.permissions} onChange={(event) => setForm({ ...form, permissions: event.target.value })} /></label>
      <button type="submit"><LockKeyhole size={14} />保存角色</button>
    </form>
  );
}

function SystemConfigForm({ config, apply }: { config: SystemConfig; apply: ApplyAction }) {
  const [form, setForm] = useState({
    tradingMode: config.tradingMode,
    riskMode: config.riskMode,
    defaultDataSource: config.defaultDataSource,
    orderThrottleMs: String(config.orderThrottleMs),
    maxConcurrentBacktests: String(config.maxConcurrentBacktests),
    autoTradeEnabled: String(config.autoTradeEnabled),
    minSignalScore: String(config.minSignalScore),
    maxAutoOrders: String(config.maxAutoOrders),
    maxPositionWeight: String(config.maxPositionWeight),
    stopLossPct: String(config.stopLossPct),
    takeProfitPct: String(config.takeProfitPct),
    notificationChannel: config.notificationChannel,
    auditRetentionDays: String(config.auditRetentionDays)
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    apply(() => api.saveSystemConfig({
      ...form,
      orderThrottleMs: Number(form.orderThrottleMs),
      maxConcurrentBacktests: Number(form.maxConcurrentBacktests),
      autoTradeEnabled: form.autoTradeEnabled === "true",
      minSignalScore: Number(form.minSignalScore),
      maxAutoOrders: Number(form.maxAutoOrders),
      maxPositionWeight: Number(form.maxPositionWeight),
      stopLossPct: Number(form.stopLossPct),
      takeProfitPct: Number(form.takeProfitPct),
      auditRetentionDays: Number(form.auditRetentionDays)
    }));
  };
  return (
    <form className="inline-form" onSubmit={submit}>
      <label>交易模式<select value={form.tradingMode} onChange={(event) => setForm({ ...form, tradingMode: event.target.value as SystemConfig["tradingMode"] })}><option>模拟</option><option>实盘</option></select></label>
      <label>风控模式<select value={form.riskMode} onChange={(event) => setForm({ ...form, riskMode: event.target.value as SystemConfig["riskMode"] })}><option>宽松</option><option>标准</option><option>严格</option></select></label>
      <label>默认数据源<input value={form.defaultDataSource} onChange={(event) => setForm({ ...form, defaultDataSource: event.target.value })} /></label>
      <label>订单节流(ms)<input value={form.orderThrottleMs} onChange={(event) => setForm({ ...form, orderThrottleMs: event.target.value })} /></label>
      <label>并发回测<input value={form.maxConcurrentBacktests} onChange={(event) => setForm({ ...form, maxConcurrentBacktests: event.target.value })} /></label>
      <label>自动交易<select value={form.autoTradeEnabled} onChange={(event) => setForm({ ...form, autoTradeEnabled: event.target.value })}><option value="true">启用</option><option value="false">停用</option></select></label>
      <label>信号阈值<input value={form.minSignalScore} onChange={(event) => setForm({ ...form, minSignalScore: event.target.value })} /></label>
      <label>单次订单数<input value={form.maxAutoOrders} onChange={(event) => setForm({ ...form, maxAutoOrders: event.target.value })} /></label>
      <label>单标的权重<input value={form.maxPositionWeight} onChange={(event) => setForm({ ...form, maxPositionWeight: event.target.value })} /></label>
      <label>止损线(%)<input value={form.stopLossPct} onChange={(event) => setForm({ ...form, stopLossPct: event.target.value })} /></label>
      <label>止盈线(%)<input value={form.takeProfitPct} onChange={(event) => setForm({ ...form, takeProfitPct: event.target.value })} /></label>
      <label>通知通道<input value={form.notificationChannel} onChange={(event) => setForm({ ...form, notificationChannel: event.target.value })} /></label>
      <label>日志保留天数<input value={form.auditRetentionDays} onChange={(event) => setForm({ ...form, auditRetentionDays: event.target.value })} /></label>
      <button type="submit"><Settings size={14} />保存配置</button>
      <small className="form-note">最近更新：{config.updatedAt}</small>
    </form>
  );
}

function RoleCard({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return <div className="role-card"><Icon size={20} /><strong>{title}</strong><span>{text}</span></div>;
}

function Pipeline({ steps }: { steps: string[] }) {
  return <div className="pipeline">{steps.map((step, index) => <span key={step}>{step}{index < steps.length - 1 && <i />}</span>)}</div>;
}

function LogList({ logs }: { logs: QuantState["logs"] }) {
  return (
    <div className="log-list">
      {logs.length === 0 && <p className="empty">暂无日志</p>}
      {logs.map((log, index) => <p key={`${log.id}-${index}`}><span>{log.time}</span><b>{log.module}</b>{log.action}<small>{log.operator}</small></p>)}
    </div>
  );
}

function Progress({ value }: { value: number }) {
  return <span className="progress"><i style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />{Math.round(value)}%</span>;
}

function Badge({ status, label }: { status: Status; label?: string }) {
  const className = status === "正常" || status === "运行中" || status === "已完成" ? "ok" : status === "告警" ? "danger" : "warn";
  return <span className={`badge ${className}`}>{label ?? status}</span>;
}

export default App;
