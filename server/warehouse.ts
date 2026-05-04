import { appendFile, mkdir, readdir, readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import type { DataWarehouseStats, MarketQuote } from "../src/quantEngine";

export const warehouseRoot = resolve(process.cwd(), "data/warehouse");

interface WarehouseSnapshotInput {
  quotes: MarketQuote[];
  klineRows: string[][];
  timestamp: string;
}

function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(date = new Date()) {
  return date.toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-");
}

async function appendJsonLines(path: string, rows: unknown[]) {
  if (rows.length === 0) return;
  await mkdir(dirname(path), { recursive: true });
  await appendFile(path, `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`, "utf8");
}

export async function writeMarketWarehouseSnapshot({ quotes, klineRows, timestamp }: WarehouseSnapshotInput) {
  const partition = dateKey();
  const quotePath = join(warehouseRoot, "market_quotes", `dt=${partition}`, "quotes.jsonl");
  const klinePath = join(warehouseRoot, "klines", "symbol=sh000001", `dt=${partition}`, "day.jsonl");

  await Promise.all([
    appendJsonLines(quotePath, quotes.map((quote) => ({ ...quote, ingestedAt: timestamp }))),
    appendJsonLines(klinePath, klineRows.map((row) => ({
      symbol: "sh000001",
      timeframe: "day",
      tradeDate: row[0],
      open: Number(row[1]),
      close: Number(row[2]),
      high: Number(row[3]),
      low: Number(row[4]),
      volume: Number(row[5] ?? 0),
      amount: Number(row[6] ?? 0),
      source: "腾讯证券",
      ingestedAt: timestamp
    })))
  ]);
}

async function listFiles(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const nested = await Promise.all(entries.map((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory() ? listFiles(path) : Promise.resolve([path]);
    }));
    return nested.flat();
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? (error as { code?: string }).code : "";
    if (code === "ENOENT") return [];
    throw error;
  }
}

async function countJsonlRows(path: string) {
  if (!path.endsWith(".jsonl")) return 0;
  const content = await readFile(path, "utf8");
  if (!content.trim()) return 0;
  return content.trimEnd().split("\n").length;
}

export async function getWarehouseStats(logicalRows: number): Promise<DataWarehouseStats> {
  await mkdir(warehouseRoot, { recursive: true });
  const files = await listFiles(warehouseRoot);
  const stats = await Promise.all(files.map(async (path) => {
    const [fileStat, rows] = await Promise.all([stat(path), countJsonlRows(path)]);
    return { bytes: fileStat.size, rows };
  }));
  return {
    rootPath: warehouseRoot,
    storageMode: "local-jsonl",
    actualBytes: stats.reduce((sum, item) => sum + item.bytes, 0),
    actualRows: stats.reduce((sum, item) => sum + item.rows, 0),
    fileCount: files.length,
    logicalRows,
    logicalBytes: logicalRows * 320,
    updatedAt: formatTime()
  };
}
