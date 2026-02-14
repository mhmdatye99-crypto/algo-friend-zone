import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, TrendingUp, BarChart3, Users, BookOpen, Calculator, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLivePrices, formatPrice } from "@/hooks/useLivePrices";
import { cn } from "@/lib/utils";

const tools = [
  { name: "سجل الصفقات", path: "/trade-journal", icon: Briefcase, keywords: ["trade", "journal", "صفقة", "سجل"] },
  { name: "الإشارات", path: "/signals", icon: TrendingUp, keywords: ["signal", "إشارة", "توصية"] },
  { name: "المجتمع", path: "/community", icon: Users, keywords: ["community", "مجتمع", "غرفة"] },
  { name: "الأكاديمية", path: "/academy", icon: BookOpen, keywords: ["academy", "أكاديمية", "تعلم", "درس"] },
  { name: "حاسبة المخاطر", path: "/risk-calculator", icon: Calculator, keywords: ["risk", "calculator", "حاسبة", "مخاطر"] },
  { name: "سجل التحليلات", path: "/my-analyses", icon: BarChart3, keywords: ["analysis", "تحليل", "تحليلات"] },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

const UniversalSearch = ({ open, onClose }: Props) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const assets = useLivePrices();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return { assets: [], tools: [] };
    const q = query.toLowerCase();
    const matchedAssets = assets
      .filter(a => a.pair.toLowerCase().includes(q) || a.category.includes(q))
      .slice(0, 5);
    const matchedTools = tools.filter(t =>
      t.name.includes(q) || t.keywords.some(k => k.includes(q))
    );
    return { assets: matchedAssets, tools: matchedTools };
  }, [query, assets]);

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-start justify-center pt-16"
          style={{ background: "hsla(0,0%,0%,0.6)", backdropFilter: "blur(12px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md mx-4 bg-card rounded-[16px] border border-border/30 overflow-hidden shadow-2xl"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/20">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="ابحث عن أصل أو أداة... BTC, Gold, صفقات"
                className="flex-1 bg-transparent text-[13px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {!query.trim() && (
                <div className="p-4 text-center text-[12px] font-mono text-muted-foreground">
                  ابحث عن أي أصل أو أداة في التطبيق
                </div>
              )}

              {/* Asset Results */}
              {results.assets.length > 0 && (
                <div className="p-2">
                  <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider px-2 mb-1">الأصول</p>
                  {results.assets.map(asset => (
                    <button
                      key={asset.pair}
                      onClick={() => handleSelect(`/asset/${encodeURIComponent(asset.pair)}`)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-secondary/40 transition-colors text-right"
                    >
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border/20 shrink-0">
                        <span className="text-sm">{asset.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-mono font-bold truncate">{asset.pair}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{asset.category}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] font-mono font-medium tabular-nums">{formatPrice(asset.price)}</p>
                        <p className={cn("text-[10px] font-mono font-bold", asset.up ? "text-success" : "text-destructive")}>
                          {asset.up ? "+" : ""}{asset.change}%
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Tool Results */}
              {results.tools.length > 0 && (
                <div className="p-2 border-t border-border/10">
                  <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider px-2 mb-1">الأدوات</p>
                  {results.tools.map(tool => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.path}
                        onClick={() => handleSelect(tool.path)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-secondary/40 transition-colors text-right"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-[12px] font-mono font-medium">{tool.name}</p>
                      </button>
                    );
                  })}
                </div>
              )}

              {query.trim() && results.assets.length === 0 && results.tools.length === 0 && (
                <div className="p-6 text-center text-[12px] font-mono text-muted-foreground">
                  لا توجد نتائج لـ "{query}"
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UniversalSearch;
