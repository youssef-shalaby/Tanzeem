#!/usr/bin/env node

const DEFAULT_BASE_URL = "https://tanzeem.runasp.net";
const PAGE_SIZE = Number(process.env.PAGE_SIZE || 100);
const BASE_URL = (process.env.TANZEEM_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
const TOKEN = process.env.TANZEEM_TOKEN || "";
const SALES_ONLY = process.argv.includes("--sales-only");

function parseArgs() {
  const args = new Map();
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) args.set(match[1], match[2]);
  }
  return args;
}

const args = parseArgs();
const asOf = args.has("as-of") ? new Date(args.get("as-of")) : new Date();
const lookbackDays = Number(args.get("lookback-days") || 30);

if (Number.isNaN(asOf.getTime())) {
  console.error("Invalid --as-of date. Use YYYY-MM-DD.");
  process.exit(1);
}

function headers() {
  return {
    "Content-Type": "application/json",
    ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
  };
}

async function apiGet(path) {
  const response = await fetch(`${BASE_URL}${path}`, { headers: headers() });
  const text = await response.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // Keep text body for diagnostics.
  }

  if (!response.ok) {
    throw new Error(`GET ${path} failed (${response.status}): ${typeof data === "string" ? data : JSON.stringify(data)}`);
  }

  return data;
}

function listFromResponse(data) {
  if (Array.isArray(data)) return data;
  return data?.data ?? data?.items ?? data?.results ?? [];
}

async function fetchForecasts() {
  const forecasts = [];
  let page = 1;
  let totalPages = 1;

  do {
    const body = await apiGet(`/api/DemandForecasting?page=${page}&page_size=${PAGE_SIZE}`);
    forecasts.push(...listFromResponse(body));
    totalPages = body?.totalPages > 0 ? body.totalPages : page;
    page += 1;
  } while (page <= totalPages);

  return forecasts;
}

async function fetchTransactions() {
  const body = await apiGet("/api/Transaction/Get-Transactions");
  return listFromResponse(body);
}

function productKeysFromForecast(item) {
  const keys = [];
  const id = item.productId ?? item.productID ?? item.id;
  if (id !== undefined && id !== null && Number(id) !== 0) keys.push(`id:${String(id).toLowerCase()}`);
  if (item.sku) keys.push(`sku:${String(item.sku).toLowerCase()}`);
  return keys;
}

function productKeysFromTransactionItem(item) {
  const keys = [];
  const id = item.product?.id ?? item.productId ?? item.productID;
  if (id !== undefined && id !== null && Number(id) !== 0) keys.push(`id:${String(id).toLowerCase()}`);
  const sku = item.product?.sku ?? item.sku;
  if (sku) keys.push(`sku:${String(sku).toLowerCase()}`);
  return keys;
}

function productLabelFromForecast(item) {
  return `${item.productName ?? item.name ?? "Unknown product"} (${item.sku ?? "no SKU"})`;
}

function daysAgo(date) {
  return (asOf.getTime() - date.getTime()) / 86_400_000;
}

function quantityFromTransactionItem(tx, item) {
  return Number(
    item.quantity ??
    item.transactedItems ??
    item.totalTransactedItems ??
    item.count ??
    tx.totalTransactedItems ??
    0
  ) || 0;
}

function isDemandTransaction(tx) {
  const type = tx.type;
  const isStockOut = type === 2 || String(type || "").toLowerCase() === "stock out";
  if (!isStockOut) return false;

  if (!SALES_ONLY) return true;

  const reason = tx.sourceReason;
  const reasonText = String(tx.source ?? tx.sourceReasonName ?? "").toLowerCase();
  return reason === 13 || reasonText.includes("sold") || reasonText.includes("customer");
}

function aggregateDemand(transactions) {
  const cutoffDays = lookbackDays;
  const byProduct = new Map();

  for (const tx of transactions) {
    if (!isDemandTransaction(tx)) continue;

    const createdAt = new Date(tx.createdAt ?? tx.date ?? tx.transactionDate);
    if (Number.isNaN(createdAt.getTime())) continue;
    if (daysAgo(createdAt) < 0 || daysAgo(createdAt) > cutoffDays) continue;

    const items = Array.isArray(tx.transactionItemDtos) && tx.transactionItemDtos.length > 0
      ? tx.transactionItemDtos
      : [{ product: tx.product, productId: tx.productId, sku: tx.sku }];

    for (const item of items) {
      const keys = productKeysFromTransactionItem(item);
      if (keys.length === 0) continue;

      const current = {
        quantity: 0,
        transactions: 0,
        latestDate: null,
      };
      for (const key of keys) {
        const existing = byProduct.get(key);
        if (!existing) continue;
        current.quantity = Math.max(current.quantity, existing.quantity);
        current.transactions = Math.max(current.transactions, existing.transactions);
        current.latestDate = !current.latestDate || (existing.latestDate && existing.latestDate > current.latestDate)
          ? existing.latestDate
          : current.latestDate;
      }

      current.quantity += quantityFromTransactionItem(tx, item);
      current.transactions += 1;
      if (!current.latestDate || createdAt > current.latestDate) current.latestDate = createdAt;
      for (const key of keys) byProduct.set(key, current);
    }
  }

  return byProduct;
}

function classify(row) {
  const flags = [];
  const predicted = row.predicted;
  const recent = row.recentQuantity;
  const segment = String(row.segment ?? "").toLowerCase();
  const confidence = row.confidence;

  if (segment === "zero" && recent > 0) flags.push("zero segment despite recent demand");
  if (predicted === 0 && recent >= 3) flags.push("0 forecast despite repeated recent demand");
  if (predicted > 0 && recent === 0 && confidence >= 0.75) flags.push("confident positive forecast with no recent demand");
  if (recent > 0 && predicted / recent >= 3) flags.push("forecast is 3x+ recent demand");
  if (predicted > 0 && recent / predicted >= 3) flags.push("recent demand is 3x+ forecast");

  return flags;
}

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "n/a";
  return `${Math.round(value * 100)}%`;
}

function printTable(rows) {
  const widths = [34, 9, 9, 10, 10, 38];
  const headersRow = ["Product", "Forecast", "Recent", "Confidence", "Segment", "Flags"];
  const line = headersRow.map((h, i) => h.padEnd(widths[i])).join("  ");
  console.log(line);
  console.log(widths.map((w) => "-".repeat(w)).join("  "));

  for (const row of rows) {
    const values = [
      row.product.length > widths[0] ? `${row.product.slice(0, widths[0] - 1)}…` : row.product,
      String(row.predicted),
      String(row.recentQuantity),
      formatPercent(row.confidence),
      String(row.segment ?? "n/a"),
      row.flags.join("; ") || "OK",
    ];
    console.log(values.map((value, i) => value.padEnd(widths[i])).join("  "));
  }
}

async function main() {
  if (!TOKEN) {
    console.warn("No TANZEEM_TOKEN set. If the API returns 401/403, rerun with TANZEEM_TOKEN=\"...\".");
  }

  const [forecasts, transactions] = await Promise.all([
    fetchForecasts(),
    fetchTransactions(),
  ]);

  const demandByProduct = aggregateDemand(transactions);
  const rows = forecasts.map((forecast) => {
    const demand = productKeysFromForecast(forecast)
      .map((key) => demandByProduct.get(key))
      .find(Boolean);
    const predicted = Number(forecast.predicted_units ?? forecast.predictedUnits ?? forecast.predictedDemand ?? 0) || 0;
    const confidence = Number(forecast.confidence ?? 0);
    const row = {
      product: productLabelFromForecast(forecast),
      predicted,
      recentQuantity: demand?.quantity ?? 0,
      recentTransactions: demand?.transactions ?? 0,
      confidence,
      segment: forecast.segment,
    };
    row.flags = classify(row);
    return row;
  });

  const flagged = rows.filter((row) => row.flags.length > 0);
  const compared = rows.filter((row) => row.recentQuantity > 0 || row.predicted > 0);
  const mae = compared.length
    ? compared.reduce((sum, row) => sum + Math.abs(row.predicted - row.recentQuantity), 0) / compared.length
    : 0;

  console.log(`Forecast rows: ${forecasts.length}`);
  console.log(`Transactions scanned: ${transactions.length}`);
  console.log(`Demand basis: ${SALES_ONLY ? "sales/customer stock-outs only" : "all stock-outs"}`);
  console.log(`Lookback window: ${lookbackDays} days ending ${asOf.toISOString().slice(0, 10)}`);
  console.log(`Rows with forecast or recent demand: ${compared.length}`);
  console.log(`Mean absolute difference vs recent demand: ${mae.toFixed(2)} units`);
  console.log(`Flagged rows: ${flagged.length}`);
  console.log("");

  printTable(flagged.length ? flagged : rows.slice(0, 25));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
