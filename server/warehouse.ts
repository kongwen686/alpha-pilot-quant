import { appendFile, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import type { DataWarehouseFile, DataWarehouseMaintenance, DataWarehouseStats, MarketQuote } from "../src/quantEngine";

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

function parseJsonl(content: string) {
  if (!content.trim()) return [];
  return content
    .trimEnd()
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      try {
        return JSON.parse(line) as Record<string, unknown>;
      } catch {
        return { raw: line };
      }
    });
}

function dedupeKey(relativePath: string, row: Record<string, unknown>, index: number) {
  const normalized = relativePath.replace(/\\/g, "/");
  if (normalized.startsWith("klines/") && row.symbol && row.tradeDate) {
    return `kline:${row.symbol}:${row.tradeDate}`;
  }
  if (normalized.startsWith("market_quotes/") && row.symbol && row.timestamp) {
    return `quote:${row.symbol}:${row.timestamp}`;
  }
  if (row.raw) return `raw:${row.raw}`;
  return `row:${index}:${JSON.stringify(row)}`;
}

export async function compactWarehouseFiles(): Promise<DataWarehouseMaintenance> {
  await mkdir(warehouseRoot, { recursive: true });
  const files = (await listFiles(warehouseRoot)).filter((path) => path.endsWith(".jsonl"));
  let rowsBefore = 0;
  let rowsAfter = 0;
  let bytesBefore = 0;
  let bytesAfter = 0;

  await Promise.all(files.map(async (path) => {
    const relativePath = relative(warehouseRoot, path);
    const beforeStat = await stat(path);
    const rows = parseJsonl(await readFile(path, "utf8"));
    const deduped = new Map<string, Record<string, unknown>>();
    rows.forEach((row, index) => {
      deduped.set(dedupeKey(relativePath, row, index), row);
    });
    const compactedRows = Array.from(deduped.values());
    const nextContent = compactedRows.length > 0 ? `${compactedRows.map((row) => row.raw ? String(row.raw) : JSON.stringify(row)).join("\n")}\n` : "";
    await writeFile(path, nextContent, "utf8");
    const afterStat = await stat(path);

    rowsBefore += rows.length;
    rowsAfter += compactedRows.length;
    bytesBefore += beforeStat.size;
    bytesAfter += afterStat.size;
  }));

  const bytesSaved = Math.max(0, bytesBefore - bytesAfter);
  return {
    type: "compact",
    filesProcessed: files.length,
    rowsBefore,
    rowsAfter,
    bytesBefore,
    bytesAfter,
    bytesSaved,
    summary: `压缩 ${files.length} 个 JSONL 文件，去重 ${Math.max(0, rowsBefore - rowsAfter)} 行，节省 ${bytesSaved} bytes`,
    updatedAt: formatTime()
  };
}

function inferDataset(path: string) {
  const normalized = path.replace(/\\/g, "/");
  if (normalized.startsWith("market_quotes/")) return "实时行情";
  if (normalized.startsWith("klines/")) return "日K行情";
  return normalized.split("/")[0] || "unknown";
}

function inferPartition(path: string) {
  const match = path.match(/dt=([^/]+)/);
  return match?.[1] ?? "-";
}

export async function getWarehouseStats(logicalRows: number, lastMaintenance?: DataWarehouseMaintenance): Promise<DataWarehouseStats> {
  await mkdir(warehouseRoot, { recursive: true });
  const files = await listFiles(warehouseRoot);
  const fileStats: DataWarehouseFile[] = await Promise.all(files.map(async (path) => {
    const [fileStat, rows] = await Promise.all([stat(path), countJsonlRows(path)]);
    const relativePath = relative(warehouseRoot, path);
    return {
      path: relativePath,
      dataset: inferDataset(relativePath),
      partition: inferPartition(relativePath),
      bytes: fileStat.size,
      rows,
      updatedAt: fileStat.mtime.toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-")
    };
  }));
  const sortedFiles = fileStats.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || b.bytes - a.bytes);
  return {
    rootPath: warehouseRoot,
    storageMode: "local-jsonl",
    actualBytes: sortedFiles.reduce((sum, item) => sum + item.bytes, 0),
    actualRows: sortedFiles.reduce((sum, item) => sum + item.rows, 0),
    fileCount: files.length,
    logicalRows,
    logicalBytes: logicalRows * 320,
    updatedAt: formatTime(),
    files: sortedFiles,
    lastMaintenance
  };
}
