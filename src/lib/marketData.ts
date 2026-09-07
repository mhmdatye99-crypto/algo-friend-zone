/**
 * Real market data sources.
 * - Crypto: Binance public REST (snapshot + klines) — no API key required.
 * - Forex: Frankfurter (ECB reference rates) — no API key required.
 */

export interface MarketSnapshot {
  price: number;
  change: number;
  volume?: number;
  sparkline?: number[];
}

/* ─────────────── CRYPTO (Binance) ─────────────── */

const BINANCE_REST = "https://api.binance.com/api/v3";

export async function fetchCryptoSnapshots(
  symbolMap: Record<string, string>
): Promise<Record<string, MarketSnapshot>> {
  const pairs = Object.keys(symbolMap);
  const symbols = pairs.map((p) => symbolMap[p].toUpperCase());
  const url = `${BINANCE_REST}/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(symbols))}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Binance ticker failed: ${res.status}`);
  const rows: Array<Record<string, string>> = await res.json();

  const bySymbol: Record<string, Record<string, string>> = {};
  rows.forEach((r) => { bySymbol[r.symbol] = r; });

  const out: Record<string, MarketSnapshot> = {};
  pairs.forEach((pair) => {
    const row = bySymbol[symbolMap[pair].toUpperCase()];
    if (!row) return;
    out[pair] = {
      price: parseFloat(row.lastPrice),
      change: +parseFloat(row.priceChangePercent).toFixed(2),
      volume: parseFloat(row.quoteVolume),
    };
  });
  return out;
}

/** Real 20-point hourly closes per crypto pair (best effort, failures skipped). */
export async function fetchCryptoSparklines(
  symbolMap: Record<string, string>
): Promise<Record<string, number[]>> {
  const entries = Object.entries(symbolMap);
  const out: Record<string, number[]> = {};

  const results = await Promise.allSettled(
    entries.map(async ([pair, sym]) => {
      const res = await fetch(
        `${BINANCE_REST}/klines?symbol=${sym.toUpperCase()}&interval=1h&limit=20`
      );
      if (!res.ok) throw new Error(String(res.status));
      const rows: unknown[][] = await res.json();
      return [pair, rows.map((r) => parseFloat(String(r[4])))] as const;
    })
  );

  results.forEach((r) => {
    if (r.status === "fulfilled") {
      const [pair, series] = r.value;
      if (series.length) out[pair] = series;
    }
  });
  return out;
}

/* ─────────────── FOREX (Frankfurter / ECB) ─────────────── */

const FRANKFURTER = "https://api.frankfurter.dev/v1";

type RateRow = Record<string, number>;

function pairPrice(rates: RateRow, pair: string): number | null {
  const [base, quote] = pair.split("/");
  const rBase = base === "USD" ? 1 : rates[base];
  const rQuote = quote === "USD" ? 1 : rates[quote];
  if (!rBase || !rQuote) return null;
  return rQuote / rBase;
}

function roundFx(pair: string, value: number): number {
  return +value.toFixed(pair.endsWith("/JPY") || value > 20 ? 3 : 5);
}

/**
 * Returns real ECB rates for the given pairs, with a real daily change %
 * and a real sparkline built from the last ~30 business days.
 */
export async function fetchForexSnapshots(
  pairs: string[]
): Promise<Record<string, MarketSnapshot>> {
  const start = new Date();
  start.setDate(start.getDate() - 45);
  const startStr = start.toISOString().slice(0, 10);

  const res = await fetch(`${FRANKFURTER}/${startStr}..?base=USD`);
  if (!res.ok) throw new Error(`Frankfurter failed: ${res.status}`);
  const json: { rates: Record<string, RateRow> } = await res.json();

  const dates = Object.keys(json.rates).sort();
  if (dates.length < 2) throw new Error("Frankfurter returned no series");

  const latest = json.rates[dates[dates.length - 1]];
  const prev = json.rates[dates[dates.length - 2]];
  const window = dates.slice(-20);

  const out: Record<string, MarketSnapshot> = {};
  pairs.forEach((pair) => {
    const price = pairPrice(latest, pair);
    const before = pairPrice(prev, pair);
    if (price === null) return;

    const sparkline = window
      .map((d) => pairPrice(json.rates[d], pair))
      .filter((v): v is number => v !== null);

    out[pair] = {
      price: roundFx(pair, price),
      change: before ? +((price / before - 1) * 100).toFixed(2) : 0,
      sparkline: sparkline.length ? sparkline : undefined,
    };
  });
  return out;
}
