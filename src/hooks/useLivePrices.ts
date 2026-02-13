import { useState, useEffect, useCallback } from "react";

export type AssetCategory = "الكل" | "كريبتو" | "فوركس" | "سلع" | "مؤشرات";

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

const initialAssets: Asset[] = [
  // كريبتو
  { pair: "BTC/USDT", price: 67450.00, change: 2.34, up: true, vol: "$2.4B", rsi: 62, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "₿", sparkline: [] },
  { pair: "ETH/USDT", price: 3245.80, change: 1.87, up: true, vol: "$1.1B", rsi: 58, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "Ξ", sparkline: [] },
  { pair: "SOL/USDT", price: 148.32, change: -1.23, up: false, vol: "$380M", rsi: 38, macd: "هبوطي", signal: "محايد", category: "كريبتو", icon: "◎", sparkline: [] },
  { pair: "BNB/USDT", price: 612.40, change: 0.95, up: true, vol: "$290M", rsi: 54, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "◆", sparkline: [] },
  { pair: "XRP/USDT", price: 0.5234, change: -0.45, up: false, vol: "$180M", rsi: 41, macd: "هبوطي", signal: "محايد", category: "كريبتو", icon: "✕", sparkline: [] },
  { pair: "ADA/USDT", price: 0.4521, change: 1.12, up: true, vol: "$95M", rsi: 51, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "₳", sparkline: [] },
  { pair: "DOGE/USDT", price: 0.1234, change: 3.45, up: true, vol: "$210M", rsi: 65, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "Ð", sparkline: [] },
  { pair: "DOT/USDT", price: 7.82, change: -0.67, up: false, vol: "$78M", rsi: 43, macd: "هبوطي", signal: "بيع", category: "كريبتو", icon: "●", sparkline: [] },
  { pair: "AVAX/USDT", price: 35.64, change: 2.18, up: true, vol: "$145M", rsi: 57, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "▲", sparkline: [] },
  { pair: "LINK/USDT", price: 14.56, change: 0.78, up: true, vol: "$120M", rsi: 53, macd: "صعودي", signal: "شراء", category: "كريبتو", icon: "⬡", sparkline: [] },
  { pair: "MATIC/USDT", price: 0.7845, change: -1.56, up: false, vol: "$88M", rsi: 39, macd: "هبوطي", signal: "بيع", category: "كريبتو", icon: "⬠", sparkline: [] },
  { pair: "ATOM/USDT", price: 9.23, change: 0.34, up: true, vol: "$65M", rsi: 48, macd: "محايد", signal: "محايد", category: "كريبتو", icon: "⚛", sparkline: [] },
  // فوركس
  { pair: "EUR/USD", price: 1.0845, change: -0.12, up: false, vol: "$890M", rsi: 44, macd: "هبوطي", signal: "بيع", category: "فوركس", icon: "€", sparkline: [] },
  { pair: "GBP/USD", price: 1.2634, change: 0.18, up: true, vol: "$620M", rsi: 52, macd: "صعودي", signal: "شراء", category: "فوركس", icon: "£", sparkline: [] },
  { pair: "USD/JPY", price: 154.82, change: 0.34, up: true, vol: "$780M", rsi: 71, macd: "صعودي", signal: "تشبع", category: "فوركس", icon: "¥", sparkline: [] },
  { pair: "AUD/USD", price: 0.6543, change: -0.28, up: false, vol: "$210M", rsi: 36, macd: "هبوطي", signal: "بيع", category: "فوركس", icon: "A$", sparkline: [] },
  { pair: "USD/CHF", price: 0.8912, change: 0.15, up: true, vol: "$340M", rsi: 55, macd: "صعودي", signal: "شراء", category: "فوركس", icon: "Fr", sparkline: [] },
  { pair: "NZD/USD", price: 0.6012, change: -0.42, up: false, vol: "$95M", rsi: 38, macd: "هبوطي", signal: "بيع", category: "فوركس", icon: "NZ", sparkline: [] },
  { pair: "USD/CAD", price: 1.3645, change: 0.08, up: true, vol: "$280M", rsi: 50, macd: "محايد", signal: "محايد", category: "فوركس", icon: "C$", sparkline: [] },
  { pair: "EUR/GBP", price: 0.8582, change: -0.22, up: false, vol: "$180M", rsi: 42, macd: "هبوطي", signal: "بيع", category: "فوركس", icon: "€£", sparkline: [] },
  { pair: "EUR/JPY", price: 167.95, change: 0.45, up: true, vol: "$220M", rsi: 63, macd: "صعودي", signal: "شراء", category: "فوركس", icon: "€¥", sparkline: [] },
  { pair: "GBP/JPY", price: 195.62, change: 0.67, up: true, vol: "$165M", rsi: 68, macd: "صعودي", signal: "شراء", category: "فوركس", icon: "£¥", sparkline: [] },
  // سلع
  { pair: "GOLD", price: 2345.60, change: 0.45, up: true, vol: "$540M", rsi: 67, macd: "صعودي", signal: "شراء", category: "سلع", icon: "Au", sparkline: [] },
  { pair: "SILVER", price: 27.84, change: 1.12, up: true, vol: "$120M", rsi: 59, macd: "صعودي", signal: "شراء", category: "سلع", icon: "Ag", sparkline: [] },
  { pair: "OIL", price: 78.45, change: -0.67, up: false, vol: "$340M", rsi: 45, macd: "هبوطي", signal: "محايد", category: "سلع", icon: "🛢", sparkline: [] },
  { pair: "NATGAS", price: 2.34, change: 1.89, up: true, vol: "$85M", rsi: 56, macd: "صعودي", signal: "شراء", category: "سلع", icon: "⛽", sparkline: [] },
  { pair: "COPPER", price: 4.12, change: -0.34, up: false, vol: "$65M", rsi: 47, macd: "هبوطي", signal: "محايد", category: "سلع", icon: "Cu", sparkline: [] },
  // مؤشرات
  { pair: "S&P 500", price: 5234.18, change: 0.82, up: true, vol: "$4.2B", rsi: 64, macd: "صعودي", signal: "شراء", category: "مؤشرات", icon: "📊", sparkline: [] },
  { pair: "NASDAQ", price: 16432.50, change: 1.24, up: true, vol: "$3.8B", rsi: 66, macd: "صعودي", signal: "شراء", category: "مؤشرات", icon: "📈", sparkline: [] },
  { pair: "DAX", price: 18234.70, change: -0.18, up: false, vol: "$1.2B", rsi: 52, macd: "محايد", signal: "محايد", category: "مؤشرات", icon: "🇩🇪", sparkline: [] },
];

export const assetCategories: AssetCategory[] = ["الكل", "كريبتو", "فوركس", "سلع", "مؤشرات"];

export const useLivePrices = () => {
  const [assets, setAssets] = useState<Asset[]>(() =>
    initialAssets.map(a => ({ ...a, sparkline: generateSparkline(a.price) }))
  );

  const tick = useCallback(() => {
    setAssets(prev =>
      prev.map(asset => {
        const delta = (Math.random() - 0.48) * asset.price * 0.001;
        const newPrice = +(asset.price + delta).toFixed(asset.price < 1 ? 4 : asset.price < 100 ? 2 : 2);
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
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, [tick]);

  return assets;
};

export const formatPrice = (price: number): string => {
  if (price >= 10000) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 100) return price.toFixed(2);
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(4);
};
