import { useState, useEffect, useCallback, useRef } from "react";

export type AssetCategory = "الكل" | "كريبتو" | "فوركس";

export interface Asset {
  pair: string;
  price: number;
  change: number;
  up: boolean;
  vol: string;
  rsi: number;
  macd: string;
  signal: string;
  category: AssetCategory;
  icon: string;
  logoUrl?: string;
  sparkline: number[];
}

const generateSparkline = (base: number, points = 20): number[] => {
  const data: number[] = [];
  let current = base;
  for (let i = 0; i < points; i++) {
    current += (Math.random() - 0.48) * base * 0.003;
    data.push(current);
  }
  return data;
};

// Map from our pair names to Binance stream symbols
const BINANCE_SYMBOL_MAP: Record<string, string> = {
  "BTC/USDT": "btcusdt",
  "ETH/USDT": "ethusdt",
  "SOL/USDT": "solusdt",
  "BNB/USDT": "bnbusdt",
  "XRP/USDT": "xrpusdt",
  "ADA/USDT": "adausdt",
  "DOGE/USDT": "dogeusdt",
  "DOT/USDT": "dotusdt",
  "AVAX/USDT": "avaxusdt",
  "LINK/USDT": "linkusdt",
  "MATIC/USDT": "maticusdt",
  "ATOM/USDT": "atomusdt",
  "UNI/USDT": "uniusdt",
  "LTC/USDT": "ltcusdt",
  "NEAR/USDT": "nearusdt",
  "APT/USDT": "aptusdt",
  "FIL/USDT": "filusdt",
  "ARB/USDT": "arbusdt",
  "OP/USDT": "opusdt",
  "SUI/USDT": "suiusdt",
  "INJ/USDT": "injusdt",
  "TIA/USDT": "tiausdt",
  "SEI/USDT": "seiusdt",
  "PEPE/USDT": "pepeusdt",
  "SHIB/USDT": "shibusdt",
  "WIF/USDT": "wifusdt",
  "RENDER/USDT": "renderusdt",
  "FET/USDT": "fetusdt",
  "AAVE/USDT": "aaveusdt",
  "TRX/USDT": "trxusdt",
};

// Reverse map: binance symbol -> our pair name
const REVERSE_SYMBOL_MAP: Record<string, string> = {};
for (const [pair, sym] of Object.entries(BINANCE_SYMBOL_MAP)) {
  REVERSE_SYMBOL_MAP[sym] = pair;
}

const initialAssets: Asset[] = [
  // كريبتو — مرتبة حسب القيمة السوقية العالمية
  { pair: "BTC/USDT", price: 67450.00, change: 2.34, up: true, vol: "$2.4B", rsi: 62, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "₿", sparkline: [] },
  { pair: "ETH/USDT", price: 3245.80, change: 1.87, up: true, vol: "$1.1B", rsi: 58, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "Ξ", sparkline: [] },
  { pair: "BNB/USDT", price: 612.40, change: 0.95, up: true, vol: "$290M", rsi: 54, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "◆", sparkline: [] },
  { pair: "XRP/USDT", price: 0.5234, change: -0.45, up: false, vol: "$180M", rsi: 41, macd: "هبوطي", signal: "محايد", category: "كريبتو", icon: "✕", sparkline: [] },
  { pair: "SOL/USDT", price: 148.32, change: -1.23, up: false, vol: "$380M", rsi: 38, macd: "هبوطي", signal: "محايد", category: "كريبتو", icon: "◎", sparkline: [] },
  { pair: "ADA/USDT", price: 0.4521, change: 1.12, up: true, vol: "$95M", rsi: 51, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "₳", sparkline: [] },
  { pair: "DOGE/USDT", price: 0.1234, change: 3.45, up: true, vol: "$210M", rsi: 65, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "Ð", sparkline: [] },
  { pair: "TRX/USDT", price: 0.1089, change: 0.23, up: true, vol: "$78M", rsi: 47, macd: "محايد", signal: "محايد", category: "كريبتو", icon: "⚡", sparkline: [] },
  { pair: "AVAX/USDT", price: 35.64, change: 2.18, up: true, vol: "$145M", rsi: 57, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "▲", sparkline: [] },
  { pair: "LINK/USDT", price: 14.56, change: 0.78, up: true, vol: "$120M", rsi: 53, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "⬡", sparkline: [] },
  { pair: "DOT/USDT", price: 7.82, change: -0.67, up: false, vol: "$78M", rsi: 43, macd: "هبوطي", signal: "بيع", category: "كريبتو", icon: "●", sparkline: [] },
  { pair: "SHIB/USDT", price: 0.00002456, change: 5.67, up: true, vol: "$185M", rsi: 69, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "🐕", sparkline: [] },
  { pair: "MATIC/USDT", price: 0.7845, change: -1.56, up: false, vol: "$88M", rsi: 39, macd: "هبوطي", signal: "بيع", category: "كريبتو", icon: "⬠", sparkline: [] },
  { pair: "LTC/USDT", price: 84.32, change: -0.89, up: false, vol: "$110M", rsi: 44, macd: "هبوطي", signal: "محايد", category: "كريبتو", icon: "Ł", sparkline: [] },
  { pair: "UNI/USDT", price: 7.45, change: 1.67, up: true, vol: "$92M", rsi: 55, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "🦄", sparkline: [] },
  { pair: "ATOM/USDT", price: 9.23, change: 0.34, up: true, vol: "$65M", rsi: 48, macd: "محايد", signal: "محايد", category: "كريبتو", icon: "⚛", sparkline: [] },
  { pair: "NEAR/USDT", price: 5.67, change: 2.45, up: true, vol: "$72M", rsi: 60, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "Ⓝ", sparkline: [] },
  { pair: "AAVE/USDT", price: 92.45, change: 0.45, up: true, vol: "$35M", rsi: 50, macd: "محايد", signal: "محايد", category: "كريبتو", icon: "👻", sparkline: [] },
  { pair: "INJ/USDT", price: 24.56, change: 3.21, up: true, vol: "$76M", rsi: 63, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "💉", sparkline: [] },
  { pair: "FIL/USDT", price: 5.89, change: 0.56, up: true, vol: "$45M", rsi: 49, macd: "محايد", signal: "محايد", category: "كريبتو", icon: "⨏", sparkline: [] },
  { pair: "ARB/USDT", price: 1.12, change: 1.89, up: true, vol: "$82M", rsi: 56, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "🔵", sparkline: [] },
  { pair: "RENDER/USDT", price: 7.23, change: 1.34, up: true, vol: "$48M", rsi: 52, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "🎨", sparkline: [] },
  { pair: "OP/USDT", price: 2.34, change: -0.78, up: false, vol: "$55M", rsi: 42, macd: "هبوطي", signal: "محايد", category: "كريبتو", icon: "🔴", sparkline: [] },
  { pair: "FET/USDT", price: 2.15, change: 2.89, up: true, vol: "$62M", rsi: 61, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "🤖", sparkline: [] },
  { pair: "APT/USDT", price: 9.12, change: -2.34, up: false, vol: "$68M", rsi: 35, macd: "هبوطي", signal: "بيع", category: "كريبتو", icon: "🅰", sparkline: [] },
  { pair: "SUI/USDT", price: 1.78, change: 4.12, up: true, vol: "$98M", rsi: 68, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "💧", sparkline: [] },
  { pair: "PEPE/USDT", price: 0.00001234, change: 8.90, up: true, vol: "$320M", rsi: 72, macd: "صعودي", signal: "تشبع", category: "كريبتو", icon: "🐸", sparkline: [] },
  { pair: "TIA/USDT", price: 12.34, change: -1.45, up: false, vol: "$42M", rsi: 40, macd: "هبوطي", signal: "بيع", category: "كريبتو", icon: "🌐", sparkline: [] },
  { pair: "SEI/USDT", price: 0.5678, change: 2.67, up: true, vol: "$38M", rsi: 58, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "🌊", sparkline: [] },
  { pair: "WIF/USDT", price: 2.89, change: -3.45, up: false, vol: "$156M", rsi: 34, macd: "هبوطي", signal: "بيع", category: "كريبتو", icon: "🐶", sparkline: [] },
  // فوركس — مرتبة حسب حجم التداول العالمي
  { pair: "EUR/USD", price: 1.0845, change: -0.12, up: false, vol: "$890M", rsi: 44, macd: "هبوطي", signal: "بيع", category: "فوركس", icon: "€", sparkline: [] },
  { pair: "USD/JPY", price: 154.82, change: 0.34, up: true, vol: "$780M", rsi: 71, macd: "صعودي", signal: "تشبع", category: "فوركس", icon: "¥", sparkline: [] },
  { pair: "GBP/USD", price: 1.2634, change: 0.18, up: true, vol: "$620M", rsi: 52, macd: "صعودي", signal: "شراء", category: "فوركس", icon: "£", sparkline: [] },
  { pair: "USD/CHF", price: 0.8912, change: 0.15, up: true, vol: "$340M", rsi: 55, macd: "صعودي", signal: "شراء", category: "فوركس", icon: "Fr", sparkline: [] },
  { pair: "USD/CAD", price: 1.3645, change: 0.08, up: true, vol: "$280M", rsi: 50, macd: "محايد", signal: "محايد", category: "فوركس", icon: "C$", sparkline: [] },
  { pair: "AUD/USD", price: 0.6543, change: -0.28, up: false, vol: "$210M", rsi: 36, macd: "هبوطي", signal: "بيع", category: "فوركس", icon: "A$", sparkline: [] },
  { pair: "EUR/JPY", price: 167.95, change: 0.45, up: true, vol: "$220M", rsi: 63, macd: "صعودي", signal: "شراء", category: "فوركس", icon: "€¥", sparkline: [] },
  { pair: "EUR/GBP", price: 0.8582, change: -0.22, up: false, vol: "$180M", rsi: 42, macd: "هبوطي", signal: "بيع", category: "فوركس", icon: "€£", sparkline: [] },
  { pair: "GBP/JPY", price: 195.62, change: 0.67, up: true, vol: "$165M", rsi: 68, macd: "صعودي", signal: "شراء", category: "فوركس", icon: "£¥", sparkline: [] },
  { pair: "USD/HKD", price: 7.8123, change: 0.01, up: true, vol: "$120M", rsi: 50, macd: "محايد", signal: "محايد", category: "فوركس", icon: "HK", sparkline: [] },
  { pair: "NZD/USD", price: 0.6012, change: -0.42, up: false, vol: "$95M", rsi: 38, macd: "هبوطي", signal: "بيع", category: "فوركس", icon: "NZ", sparkline: [] },
  { pair: "EUR/CHF", price: 0.9665, change: -0.08, up: false, vol: "$92M", rsi: 45, macd: "هبوطي", signal: "محايد", category: "فوركس", icon: "€F", sparkline: [] },
  { pair: "AUD/JPY", price: 101.23, change: 0.12, up: true, vol: "$85M", rsi: 54, macd: "صعودي", signal: "شراء", category: "فوركس", icon: "A¥", sparkline: [] },
  { pair: "CHF/JPY", price: 173.45, change: 0.28, up: true, vol: "$72M", rsi: 59, macd: "صعودي", signal: "شراء", category: "فوركس", icon: "F¥", sparkline: [] },
  { pair: "EUR/AUD", price: 1.6578, change: 0.23, up: true, vol: "$68M", rsi: 57, macd: "صعودي", signal: "شراء", category: "فوركس", icon: "€A", sparkline: [] },
  { pair: "USD/TRY", price: 32.45, change: 0.78, up: true, vol: "$65M", rsi: 72, macd: "صعودي", signal: "تشبع", category: "فوركس", icon: "₺", sparkline: [] },
  { pair: "CAD/JPY", price: 113.56, change: 0.34, up: true, vol: "$55M", rsi: 53, macd: "صعودي", signal: "شراء", category: "فوركس", icon: "C¥", sparkline: [] },
  { pair: "GBP/AUD", price: 1.9312, change: 0.45, up: true, vol: "$52M", rsi: 61, macd: "صعودي", signal: "شراء", category: "فوركس", icon: "£A", sparkline: [] },
  { pair: "USD/MXN", price: 17.23, change: -0.28, up: false, vol: "$52M", rsi: 39, macd: "هبوطي", signal: "بيع", category: "فوركس", icon: "MX", sparkline: [] },
  { pair: "NZD/JPY", price: 93.12, change: -0.15, up: false, vol: "$48M", rsi: 46, macd: "هبوطي", signal: "محايد", category: "فوركس", icon: "N¥", sparkline: [] },
  { pair: "USD/SGD", price: 1.3456, change: 0.05, up: true, vol: "$45M", rsi: 48, macd: "محايد", signal: "محايد", category: "فوركس", icon: "S$", sparkline: [] },
  { pair: "GBP/CHF", price: 1.1267, change: 0.12, up: true, vol: "$42M", rsi: 51, macd: "صعودي", signal: "شراء", category: "فوركس", icon: "£F", sparkline: [] },
  { pair: "USD/ZAR", price: 18.67, change: -0.45, up: false, vol: "$38M", rsi: 41, macd: "هبوطي", signal: "بيع", category: "فوركس", icon: "ZA", sparkline: [] },
  { pair: "EUR/CAD", price: 1.4789, change: -0.18, up: false, vol: "$38M", rsi: 43, macd: "هبوطي", signal: "بيع", category: "فوركس", icon: "€C", sparkline: [] },
  { pair: "GBP/CAD", price: 1.7234, change: 0.22, up: true, vol: "$35M", rsi: 55, macd: "صعودي", signal: "شراء", category: "فوركس", icon: "£C", sparkline: [] },
  { pair: "USD/SEK", price: 10.78, change: 0.15, up: true, vol: "$28M", rsi: 52, macd: "صعودي", signal: "شراء", category: "فوركس", icon: "kr", sparkline: [] },
  { pair: "AUD/CAD", price: 0.8923, change: -0.34, up: false, vol: "$28M", rsi: 40, macd: "هبوطي", signal: "بيع", category: "فوركس", icon: "AC", sparkline: [] },
  { pair: "EUR/NZD", price: 1.8034, change: 0.31, up: true, vol: "$25M", rsi: 56, macd: "صعودي", signal: "شراء", category: "فوركس", icon: "€N", sparkline: [] },
  { pair: "USD/NOK", price: 10.45, change: -0.12, up: false, vol: "$25M", rsi: 46, macd: "هبوطي", signal: "محايد", category: "فوركس", icon: "NK", sparkline: [] },
  { pair: "AUD/NZD", price: 1.0882, change: 0.08, up: true, vol: "$22M", rsi: 49, macd: "محايد", signal: "محايد", category: "فوركس", icon: "AN", sparkline: [] },
  { pair: "GBP/NZD", price: 2.1023, change: 0.42, up: true, vol: "$20M", rsi: 60, macd: "صعودي", signal: "شراء", category: "فوركس", icon: "£N", sparkline: [] },
];

export const assetCategories: AssetCategory[] = ["الكل", "كريبتو", "فوركس"];

// Crypto logo URLs from CoinGecko CDN
const CRYPTO_LOGO_MAP: Record<string, string> = {
  "BTC/USDT": "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  "ETH/USDT": "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  "SOL/USDT": "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  "BNB/USDT": "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  "XRP/USDT": "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  "ADA/USDT": "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  "DOGE/USDT": "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  "DOT/USDT": "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
  "AVAX/USDT": "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  "LINK/USDT": "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  "MATIC/USDT": "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
  "ATOM/USDT": "https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png",
  "UNI/USDT": "https://assets.coingecko.com/coins/images/12504/small/uni.jpg",
  "LTC/USDT": "https://assets.coingecko.com/coins/images/2/small/litecoin.png",
  "NEAR/USDT": "https://assets.coingecko.com/coins/images/10365/small/near.jpg",
  "APT/USDT": "https://assets.coingecko.com/coins/images/26455/small/aptos_round.png",
  "FIL/USDT": "https://assets.coingecko.com/coins/images/12817/small/filecoin.png",
  "ARB/USDT": "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
  "OP/USDT": "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
  "SUI/USDT": "https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg",
  "INJ/USDT": "https://assets.coingecko.com/coins/images/12882/small/Secondary_Symbol.png",
  "TIA/USDT": "https://assets.coingecko.com/coins/images/31967/small/tia.jpg",
  "SEI/USDT": "https://assets.coingecko.com/coins/images/28205/small/Sei_Logo_-_Transparent.png",
  "PEPE/USDT": "https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg",
  "SHIB/USDT": "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
  "WIF/USDT": "https://assets.coingecko.com/coins/images/33566/small/dogwifhat.jpg",
  "RENDER/USDT": "https://assets.coingecko.com/coins/images/11636/small/rndr.png",
  "FET/USDT": "https://assets.coingecko.com/coins/images/5681/small/Fetch.jpg",
  "AAVE/USDT": "https://assets.coingecko.com/coins/images/12645/small/AAVE.png",
  "TRX/USDT": "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png",
};

// Forex flag pairs
const FOREX_FLAG_MAP: Record<string, string> = {
  "EUR/USD": "🇪🇺🇺🇸", "GBP/USD": "🇬🇧🇺🇸", "USD/JPY": "🇺🇸🇯🇵", "AUD/USD": "🇦🇺🇺🇸",
  "USD/CHF": "🇺🇸🇨🇭", "NZD/USD": "🇳🇿🇺🇸", "USD/CAD": "🇺🇸🇨🇦", "EUR/GBP": "🇪🇺🇬🇧",
  "EUR/JPY": "🇪🇺🇯🇵", "GBP/JPY": "🇬🇧🇯🇵", "AUD/JPY": "🇦🇺🇯🇵", "CHF/JPY": "🇨🇭🇯🇵",
  "NZD/JPY": "🇳🇿🇯🇵", "CAD/JPY": "🇨🇦🇯🇵", "EUR/AUD": "🇪🇺🇦🇺", "GBP/AUD": "🇬🇧🇦🇺",
  "EUR/CHF": "🇪🇺🇨🇭", "GBP/CHF": "🇬🇧🇨🇭", "EUR/CAD": "🇪🇺🇨🇦", "GBP/CAD": "🇬🇧🇨🇦",
  "AUD/CAD": "🇦🇺🇨🇦", "AUD/NZD": "🇦🇺🇳🇿", "EUR/NZD": "🇪🇺🇳🇿", "GBP/NZD": "🇬🇧🇳🇿",
  "USD/SGD": "🇺🇸🇸🇬", "USD/HKD": "🇺🇸🇭🇰", "USD/TRY": "🇺🇸🇹🇷", "USD/ZAR": "🇺🇸🇿🇦",
  "USD/MXN": "🇺🇸🇲🇽", "USD/SEK": "🇺🇸🇸🇪", "USD/NOK": "🇺🇸🇳🇴",
};

export { CRYPTO_LOGO_MAP, FOREX_FLAG_MAP };

// Helper: compute RSI-like value from sparkline
function computeRsi(sparkline: number[]): number {
  if (sparkline.length < 5) return 50;
  let gains = 0, losses = 0;
  const len = Math.min(14, sparkline.length - 1);
  for (let i = sparkline.length - len; i < sparkline.length; i++) {
    const diff = sparkline[i] - sparkline[i - 1];
    if (diff > 0) gains += diff; else losses -= diff;
  }
  if (losses === 0) return 90;
  const rs = gains / losses;
  return Math.round(100 - 100 / (1 + rs));
}

function deriveSignal(rsi: number, macd: string): string {
  if (rsi > 70) return "تشبع";
  if (rsi > 55 && macd === "صعودي") return "شراء";
  if (rsi < 30) return "تشبع";
  if (rsi < 45 && macd === "هبوطي") return "بيع";
  return "محايد";
}

function formatVolume(vol: number): string {
  if (vol >= 1e9) return `$${(vol / 1e9).toFixed(1)}B`;
  if (vol >= 1e6) return `$${(vol / 1e6).toFixed(0)}M`;
  return `$${(vol / 1e3).toFixed(0)}K`;
}

export const useLivePrices = () => {
  const [assets, setAssets] = useState<Asset[]>(() =>
    initialAssets.map(a => ({ ...a, sparkline: generateSparkline(a.price) }))
  );
  const wsRef = useRef<WebSocket | null>(null);
  const openPricesRef = useRef<Record<string, number>>({});
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Store initial open prices for 24h change calculation
  useEffect(() => {
    const openPrices: Record<string, number> = {};
    initialAssets.forEach(a => {
      if (a.category === "كريبتو") {
        openPrices[a.pair] = a.price;
      }
    });
    openPricesRef.current = openPrices;
  }, []);

  // Binance WebSocket for crypto
  useEffect(() => {
    const cryptoSymbols = Object.values(BINANCE_SYMBOL_MAP);
    
    // Build combined stream URL for all crypto pairs using miniTicker
    const streams = cryptoSymbols.map(s => `${s}@miniTicker`).join("/");
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    let isUnmounted = false;

    const connect = () => {
      if (isUnmounted) return;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const data = msg.data;
          if (!data || !data.s) return;

          const symbol = data.s.toLowerCase();
          const pair = REVERSE_SYMBOL_MAP[symbol];
          if (!pair) return;

          const price = parseFloat(data.c); // current price
          const open24h = parseFloat(data.o); // 24h open price
          const volume = parseFloat(data.v) * price; // volume in USDT (approx)
          const change = open24h > 0 ? +((price / open24h - 1) * 100).toFixed(2) : 0;

          setAssets(prev => prev.map(a => {
            if (a.pair !== pair) return a;
            const newSparkline = [...a.sparkline.slice(1), price];
            const rsi = computeRsi(newSparkline);
            const macd = change > 0.5 ? "صعودي" : change < -0.5 ? "هبوطي" : "محايد";
            return {
              ...a,
              price,
              change,
              up: change >= 0,
              vol: formatVolume(volume),
              sparkline: newSparkline,
              rsi,
              macd,
              signal: deriveSignal(rsi, macd),
            };
          }));
        } catch (e) {
          // Silently ignore parse errors
        }
      };

      ws.onerror = () => {
        console.warn("Binance WebSocket error, will reconnect...");
      };

      ws.onclose = () => {
        if (!isUnmounted) {
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  // Simulation tick for non-crypto assets only (forex, commodities, indices)
  const tick = useCallback(() => {
    setAssets(prev =>
      prev.map(asset => {
        if (asset.category === "كريبتو") return asset; // Skip crypto — handled by WebSocket
        const delta = (Math.random() - 0.48) * asset.price * 0.001;
        const newPrice = +(asset.price + delta).toFixed(asset.price < 1 ? 4 : 2);
        const newChange = +((newPrice / (asset.price / (1 + asset.change / 100)) - 1) * 100).toFixed(2);
        const newSparkline = [...asset.sparkline.slice(1), newPrice];
        return {
          ...asset,
          price: newPrice,
          change: newChange,
          up: newChange >= 0,
          sparkline: newSparkline,
        };
      })
    );
  }, []);

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  return assets;
};

export const formatPrice = (price: number): string => {
  if (price >= 10000) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 100) return price.toFixed(2);
  if (price >= 1) return price.toFixed(4);
  if (price >= 0.01) return price.toFixed(4);
  if (price >= 0.0001) return price.toFixed(6);
  return price.toFixed(8);
};
