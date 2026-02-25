

# Upgrade: Live Trade Tracking & Portfolio Synchronization Engine

## Problem Summary
The current system has three critical weaknesses:
1. **No automatic TP/SL detection** -- Open trades don't auto-close when price hits Take Profit or Stop Loss
2. **Portfolio balance ignores open trades** -- Dashboard and Goal Progress only count closed trades; unrealized PnL from open positions is invisible
3. **Forex pairs have no live PnL** -- Only crypto pairs (via Binance WebSocket) update in real-time; forex pairs stay static

---

## Solution Architecture

```text
Live Prices (WebSocket/Simulated)
         |
         v
  +------------------+
  | useLivePnl (v2)  |  <-- Enhanced: forex mapping + TP/SL monitor
  +------------------+
         |
    +----+----+
    |         |
    v         v
 TradeRow   usePortfolioSync (NEW)
 (Journal)       |
              +--+--+
              |     |
              v     v
         Dashboard  ProfilePage
         (Balance)  (Equity)
```

---

## Implementation Plan

### 1. Enhance `useLivePnl` -- Add Forex Price Mapping & TP/SL Auto-Close

**File: `src/hooks/useLivePnl.ts`**

- Extend `priceMap` to also map forex pairs directly (e.g., `EUR/USD` from `useLivePrices` already has these)
- Add a new function `checkTPSL(trade, currentPrice)` that returns `"tp_hit" | "sl_hit" | null`
- Add `useAutoCloseMonitor(trades, closeTradeFn)` -- a `useEffect` loop that checks every open trade against its TP/SL on each price tick, and auto-closes the trade when triggered (with toast notification)

### 2. Create `usePortfolioSync` -- Unified Live Balance Hook

**File: `src/hooks/usePortfolioSync.ts` (NEW)**

- Combines closed-trade PnL (from DB) with open-trade unrealized PnL (from live prices)
- Exports:
  - `totalEquity` = initial capital + closed PnL + unrealized PnL
  - `unrealizedPnl` = sum of all open trades' live PnL
  - `realizedPnl` = sum of all closed trades' PnL
  - `goalProgress` = recalculated using totalEquity instead of just closed PnL
- Uses `useLivePnl` internally to get live prices for open trades

### 3. Update Dashboard -- Live Portfolio Balance

**File: `src/pages/Dashboard.tsx`**

- Replace static `currentBalance` (from `useGoalPlanner`) with `usePortfolioSync().totalEquity`
- Show unrealized PnL separately with a pulsing indicator
- Monthly Goal progress bar uses the new total equity (realized + unrealized)
- Add open positions count badge

### 4. Update Trade Journal -- Auto-Close Engine

**File: `src/pages/TradeJournal.tsx`**

- Integrate the TP/SL auto-close monitor from `useLivePnl`
- When a trade is auto-closed:
  - Update DB with exit price and PnL
  - Invalidate all relevant queries (trades, equity, goal)
  - Show toast: "Trade X hit TP/SL -- auto-closed"
- Add visual indicators on open trades showing proximity to TP/SL (progress bar: how close price is to TP vs SL)

### 5. Update Profile Page -- Consistent Live Equity

**File: `src/pages/ProfilePage.tsx`**

- Use `usePortfolioSync` for `totalEquity` display
- Show breakdown: Realized PnL + Unrealized PnL
- Open trades section shows live PnL per position

### 6. Forex Price Simulation Enhancement

**File: `src/hooks/useLivePrices.ts`**

- The forex simulation interval (currently every 3-5 seconds) will be kept but ensure the price updates propagate correctly to `useLivePnl`'s `priceMap` so forex open trades also show moving PnL

---

## Technical Details

**TP/SL Detection Logic:**
```text
For LONG trades:
  - TP Hit: currentPrice >= take_profit
  - SL Hit: currentPrice <= stop_loss

For SHORT trades:
  - TP Hit: currentPrice <= take_profit  
  - SL Hit: currentPrice >= stop_loss
```

**Portfolio Equity Formula:**
```text
totalEquity = initial_capital + SUM(closed_trades.pnl) + SUM(open_trades.live_pnl)
goalProgress = (totalEquity - initial_capital) / (target_goal - initial_capital) * 100
```

**Auto-Close Throttle:** Check runs on every price update but with a 2-second debounce per trade to prevent duplicate closes.

