import { cloneState, type MarketQuote, type QuantState } from "../src/quantEngine";

let ingestionLogSequence = 0;

interface TencentKlineResponse {
  code: number;
  data?: Record<string, { day?: string[][]; qfqday?: string[][] }>;
}

interface FetchResult<T> {
  data: T;
  latency: number;
}

const TENCENT_QUOTE_URL = "https://qt.gtimg.cn/q=";
const TENCENT_KLINE_URL = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get";
const REALTIME_SYMBOLS = [
  "sh000001",
  "sz399001",
  "sz399006",
  "sh000300",
  "sh600519",
  "sh601318",
  "sh600036",
  "sh600276",
  "sz000858",
  "sz000333",
  "sz002594",
  "sz300059",
  "sz300750",
  "sh510300",
  "sh588000",
  "sz159915"
];

async function fetchText(url: string, encoding: string): Promise<FetchResult<string>> {
  const started = performance.now();
  const response = await fetch(url, {
    headers: {
      Accept: "text/plain,*/*",
      Referer: "https://gu.qq.com/"
    }
  });
  if (!response.ok) {
    throw new Error(`数据源请求失败 ${response.status}: ${url}`);
  }
  const buffer = await response.arrayBuffer();
  return {
    data: new TextDecoder(encoding).decode(buffer),
    latency: Math.round(performance.now() - started)
  };
}

async function fetchJson<T>(url: string): Promise<FetchResult<T>> {
  const started = performance.now();
  const response = await fetch(url, {
    headers: {
      Accept: "application/json,text/plain,*/*",
      Referer: "https://gu.qq.com/"
    }
  });
  if (!response.ok) {
    throw new Error(`数据源请求失败 ${response.status}: ${url}`);
  }
  return {
    data: (await response.json()) as T,
    latency: Math.round(performance.now() - started)
  };
}

function nowText() {
  return new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-");
}

function toNumber(value: string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseQuoteLine(line: string, timestamp: string): MarketQuote | null {
  const match = line.match(/="(.*)";?$/);
  if (!match) return null;

  const fields = match[1].split("~");
  const amountFromTuple = fields[35]?.split("/")[2];
  return {
    symbol: fields[2] ?? "",
    name: fields[1] ?? "",
    price: toNumber(fields[3]),
    change: toNumber(fields[31]),
    pctChange: toNumber(fields[32]),
    open: toNumber(fields[5]),
    previousClose: toNumber(fields[4]),
    high: toNumber(fields[33]),
    low: toNumber(fields[34]),
    volume: toNumber(fields[36] ?? fields[6]),
    amount: toNumber(amountFromTuple) || toNumber(fields[37]) * 10000,
    source: "腾讯证券",
    timestamp
  };
}

function parseQuotes(text: string, timestamp: string) {
  return text
    .split(/\n+/)
    .map((line) => parseQuoteLine(line.trim(), timestamp))
    .filter((quote): quote is MarketQuote => Boolean(quote && quote.symbol && quote.price > 0));
}

function buildSeries(klineRows: string[][]) {
  const recent = klineRows.slice(-13);
  const closeValues = recent.map((row) => Number(row[2])).filter((value) => Number.isFinite(value));
  const first = closeValues[0] || 1;
  return {
    labels: recent.map((row) => row[0].slice(5)),
    series: closeValues.map((close) => Number((((close - first) / first) * 100).toFixed(2)))
  };
}

function addIngestionLog(state: QuantState, message: string) {
  state.logs.unshift({
    id: `log-${Date.now()}-${ingestionLogSequence++}`,
    module: "数据处理",
    action: message,
    operator: "market-ingestor",
    time: new Date().toLocaleTimeString("zh-CN", { hour12: false })
  });
  state.logs = state.logs.slice(0, 40);
}

export async function ingestRealMarketData(state: QuantState): Promise<QuantState> {
  const next = cloneState(state);
  const timestamp = nowText();

  const quoteUrl = `${TENCENT_QUOTE_URL}${REALTIME_SYMBOLS.join(",")}`;
  const klineUrl = `${TENCENT_KLINE_URL}?param=sh000001,day,,,30,qfq`;

  const [quotesResponse, klineResponse] = await Promise.all([
    fetchText(quoteUrl, "gbk"),
    fetchJson<TencentKlineResponse>(klineUrl)
  ]);

  const quotes = parseQuotes(quotesResponse.data, timestamp);
  if (quotes.length === 0) {
    throw new Error("腾讯证券实时行情返回为空");
  }

  next.marketQuotes = quotes;
  next.baseTime = new Date();

  const klineRows = klineResponse.data.data?.sh000001?.qfqday ?? klineResponse.data.data?.sh000001?.day ?? [];
  if (klineResponse.data.code === 0 && klineRows.length > 0) {
    const { labels, series } = buildSeries(klineRows);
    next.marketLabels = labels;
    next.marketSeries = series;
  }

  const averageLatency = Math.round((quotesResponse.latency + klineResponse.latency) / 2);
  const quoteCount = quotes.length;
  const klineCount = klineRows.length;

  next.dataSources = next.dataSources.map((source) => {
    if (source.id === "ds-1") {
      return {
        ...source,
        endpoint: "腾讯证券 qt.gtimg.cn 实时行情",
        status: "正常",
        latency: quotesResponse.latency,
        rows: source.rows + quoteCount,
        quality: 100,
        latestUpdate: timestamp
      };
    }

    if (source.id === "ds-2") {
      return {
        ...source,
        endpoint: "腾讯证券 ifzq.gtimg.cn 日 K",
        status: "正常",
        latency: klineResponse.latency,
        rows: source.rows + klineCount,
        quality: klineCount > 0 ? 99.8 : 92,
        latestUpdate: timestamp
      };
    }

    return {
      ...source,
      status: source.subscribed ? "正常" : source.status,
      latency: Math.max(8, Math.round((source.latency + averageLatency) / 2)),
      latestUpdate: source.subscribed ? timestamp : source.latestUpdate
    };
  });

  const quoteBySymbol = new Map(quotes.map((quote) => [quote.symbol, quote]));
  next.positions = next.positions.map((position) => {
    const normalized = position.symbol.replace(".SH", "").replace(".SZ", "");
    const quote = quoteBySymbol.get(normalized);
    if (!quote || quote.price <= 0) return position;
    const pnl = position.cost > 0 ? ((quote.price - position.cost) / position.cost) * 100 : position.pnl;
    return {
      ...position,
      name: quote.name,
      last: quote.price,
      pnl: Number(pnl.toFixed(2))
    };
  });

  addIngestionLog(next, `真实数据源同步完成：腾讯证券实时行情 ${quoteCount} 条，日 K ${klineCount} 条，平均延迟 ${averageLatency}ms`);
  return next;
}
