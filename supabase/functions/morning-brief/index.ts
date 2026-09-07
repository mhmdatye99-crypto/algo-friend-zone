// Daily briefing built from REAL market data (Binance crypto + ECB/Frankfurter forex).
// All numbers below are computed deterministically from live series — the AI layer
// only writes the narrative around numbers it is given. No invented prices.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BINANCE = "https://api.binance.com/api/v3";
const FRANKFURTER = "https://api.frankfurter.dev/v1";

const CRYPTO: Record<string, string> = {
  "BTC/USDT": "BTCUSDT",
  "ETH/USDT": "ETHUSDT",
  "SOL/USDT": "SOLUSDT",
  "BNB/USDT": "BNBUSDT",
  "XRP/USDT": "XRPUSDT",
};

const FOREX = ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD"];

interface MarketRow {
  pair: string;
  category: "كريبتو" | "فوركس";
  price: number;
  change: number;
  trend: "صعودي" | "هبوطي" | "عرضي";
  strength: number;
  rsi: number;
  support: number;
  resistance: number;
  distanceToSupport: number;
  distanceToResistance: number;
  source: string;
}

const round = (v: number, d: number) => +v.toFixed(d);
const digits = (v: number) => (v >= 1000 ? 2 : v >= 100 ? 2 : v >= 1 ? 4 : 6);

function sma(arr: number[], n: number) {
  const s = arr.slice(-n);
  return s.reduce((a, b) => a + b, 0) / s.length;
}

function rsi(closes: number[], period = 14) {
  if (closes.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    if (d >= 0) gains += d; else losses -= d;
  }
  if (losses === 0) return 90;
  const rs = gains / period / (losses / period);
  return Math.round(100 - 100 / (1 + rs));
}

function buildRow(
  pair: string,
  category: MarketRow["category"],
  closes: number[],
  highs: number[],
  lows: number[],
  price: number,
  change: number,
  source: string,
): MarketRow {
  const fast = sma(closes, 10);
  const slow = sma(closes, Math.min(30, closes.length));
  const strengthRaw = ((fast - slow) / slow) * 100;
  const trend: MarketRow["trend"] =
    strengthRaw > 0.25 ? "صعودي" : strengthRaw < -0.25 ? "هبوطي" : "عرضي";

  const win = Math.min(40, lows.length);
  const support = Math.min(...lows.slice(-win));
  const resistance = Math.max(...highs.slice(-win));
  const d = digits(price);

  return {
    pair,
    category,
    price: round(price, d),
    change: round(change, 2),
    trend,
    strength: round(Math.abs(strengthRaw), 2),
    rsi: rsi(closes),
    support: round(support, d),
    resistance: round(resistance, d),
    distanceToSupport: round(((price - support) / price) * 100, 2),
    distanceToResistance: round(((resistance - price) / price) * 100, 2),
    source,
  };
}

async function loadCrypto(): Promise<MarketRow[]> {
  const symbols = Object.values(CRYPTO);
  const tickRes = await fetch(
    `${BINANCE}/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(symbols))}`,
  );
  const ticks: Array<Record<string, string>> = tickRes.ok ? await tickRes.json() : [];
  const bySymbol: Record<string, Record<string, string>> = {};
  ticks.forEach((t) => { bySymbol[t.symbol] = t; });

  const results = await Promise.allSettled(
    Object.entries(CRYPTO).map(async ([pair, sym]) => {
      const res = await fetch(`${BINANCE}/klines?symbol=${sym}&interval=4h&limit=120`);
      if (!res.ok) throw new Error(`klines ${sym} ${res.status}`);
      const rows: unknown[][] = await res.json();
      const highs = rows.map((r) => parseFloat(String(r[2])));
      const lows = rows.map((r) => parseFloat(String(r[3])));
      const closes = rows.map((r) => parseFloat(String(r[4])));
      const t = bySymbol[sym];
      const price = t ? parseFloat(t.lastPrice) : closes[closes.length - 1];
      const change = t ? parseFloat(t.priceChangePercent) : 0;
      return buildRow(pair, "كريبتو", closes, highs, lows, price, change, "Binance");
    }),
  );

  return results.filter((r) => r.status === "fulfilled").map((r) => (r as PromiseFulfilledResult<MarketRow>).value);
}

async function loadForex(): Promise<MarketRow[]> {
  const start = new Date();
  start.setDate(start.getDate() - 120);
  const res = await fetch(`${FRANKFURTER}/${start.toISOString().slice(0, 10)}..?base=USD`);
  if (!res.ok) return [];
  const json: { rates: Record<string, Record<string, number>> } = await res.json();
  const dates = Object.keys(json.rates).sort();
  if (dates.length < 5) return [];

  const priceAt = (day: string, pair: string): number | null => {
    const r = json.rates[day];
    const [base, quote] = pair.split("/");
    const rBase = base === "USD" ? 1 : r[base];
    const rQuote = quote === "USD" ? 1 : r[quote];
    if (!rBase || !rQuote) return null;
    return rQuote / rBase;
  };

  const out: MarketRow[] = [];
  for (const pair of FOREX) {
    const series = dates.map((d) => priceAt(d, pair)).filter((v): v is number => v !== null);
    if (series.length < 20) continue;
    const price = series[series.length - 1];
    const prev = series[series.length - 2];
    const change = ((price - prev) / prev) * 100;
    out.push(buildRow(pair, "فوركس", series, series, series, price, change, "ECB"));
  }
  return out;
}

function sentimentScore(rows: MarketRow[]) {
  if (!rows.length) return null;
  const bullish = rows.filter((r) => r.trend === "صعودي").length;
  const score = Math.round((bullish / rows.length) * 100);
  return {
    score,
    label: score >= 65 ? "متفائل" : score >= 40 ? "محايد" : "متشائم",
  };
}

async function narrate(rows: MarketRow[], key: string) {
  const table = rows
    .map(
      (r) =>
        `${r.pair} | السعر ${r.price} | التغير ${r.change}% | الاتجاه ${r.trend} | RSI ${r.rsi} | دعم ${r.support} | مقاومة ${r.resistance}`,
    )
    .join("\n");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `أنت محلل أسواق مؤسسي. ستتلقى بيانات سوق حقيقية محسوبة. اكتب إحاطة عربية موجزة تعتمد حصرياً على هذه الأرقام.
ممنوع اختراع أي سعر أو مستوى أو خبر اقتصادي غير موجود في البيانات.
أعد JSON فقط بهذا الشكل:
{
  "marketOverview": "2-3 جمل عن حالة السوق مبنية على الاتجاهات المعطاة",
  "riskAlerts": [{"alert": "تحذير مبني على الأرقام (تشبع شرائي/بيعي، قرب مقاومة...)", "severity": "high أو medium"}],
  "dailyTip": "نصيحة انضباط تداول واحدة",
  "focusAssets": ["3 أزواج من القائمة فقط"],
  "notes": {"BTC/USDT": "جملة واحدة عن الزوج"}
}`,
        },
        { role: "user", content: `بيانات اليوم:\n${table}\n\nأجب بصيغة JSON فقط.` },
      ],
      temperature: 0.3,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const [crypto, forex] = await Promise.all([
      loadCrypto().catch(() => [] as MarketRow[]),
      loadForex().catch(() => [] as MarketRow[]),
    ]);
    const markets = [...crypto, ...forex];

    if (!markets.length) {
      return new Response(
        JSON.stringify({ error: "تعذر جلب بيانات السوق الحية الآن. حاول مرة أخرى." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const key = Deno.env.get("LOVABLE_API_KEY");
    let ai: Record<string, unknown> | null = null;
    if (key) {
      try { ai = await narrate(markets, key); } catch (e) { console.error("narrate failed", e); }
    }

    const notes = (ai?.notes ?? {}) as Record<string, string>;
    const brief = {
      generatedAt: new Date().toISOString(),
      date: new Date().toLocaleDateString("ar-EG", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      }),
      markets: markets.map((m) => ({ ...m, note: notes[m.pair] ?? null })),
      sentiment: {
        crypto: sentimentScore(crypto),
        forex: sentimentScore(forex),
      },
      marketOverview: (ai?.marketOverview as string) ?? null,
      riskAlerts: (ai?.riskAlerts as unknown[]) ?? [],
      dailyTip: (ai?.dailyTip as string) ?? null,
      focusAssets: (ai?.focusAssets as string[]) ?? [],
      sources: ["Binance", "ECB"],
    };

    return new Response(JSON.stringify(brief), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("morning-brief error:", e);
    return new Response(
      JSON.stringify({ error: "تعذر إعداد الإحاطة. حاول مرة أخرى." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
