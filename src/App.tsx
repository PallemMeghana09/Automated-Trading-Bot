/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  INITIAL_STOCKS,
  INITIAL_NEWS,
  BUILTIN_STRATEGIES,
  INITIAL_SIGNALS,
} from './mockData';
import { StockData, Position, TradeLog, Strategy, TradingSignal, AlertTrigger } from './types';
import { enrichOHLCVData } from './utils/indicators';

// Navigation Lucide Icons
import {
  LineChart,
  Brain,
  Sliders,
  TrendingUp,
  Newspaper,
  Settings,
  User,
  Shield,
  Percent,
  Play,
  Pause,
  AlertTriangle,
  RefreshCw,
  Eye,
  LogOut,
  Sparkles,
  Lock,
  Compass,
  Cpu,
} from 'lucide-react';

// Sections Sub-components
import TerminalChart from './components/TerminalChart';
import BacktestPanel from './components/BacktestPanel';
import PortfolioPanel from './components/PortfolioPanel';
import AIChatPanel from './components/AIChatPanel';
import StrategiesPanel from './components/StrategiesPanel';
import NewsPanel from './components/NewsPanel';
import SettingsPanel from './components/SettingsPanel';

export default function App() {
  // Authentication Simulated State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('rupanandpalakurthi@gmail.com');
  const [password, setPassword] = useState<string>('**********');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Base Data state
  const [stocks, setStocks] = useState<StockData[]>(INITIAL_STOCKS);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');
  const [cashBalance, setCashBalance] = useState<number>(100000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>(['AAPL', 'NVDA', 'TSLA', 'BTC-USD', 'EUR-USD']);
  
  // Custom strategies list state
  const [strategies, setStrategies] = useState<Strategy[]>(BUILTIN_STRATEGIES);
  
  // Custom alerts triggers state
  const [alerts, setAlerts] = useState<AlertTrigger[]>([]);

  // System status parameters
  const [botStatus, setBotStatus] = useState<'ACTIVE' | 'IDLE'>('IDLE');
  const [activeStrategy, setActiveStrategy] = useState<string>('strat-1');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  
  // Activity simulation logs feed
  const [activityLogs, setActivityLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] System terminal loaded. Demo core running on Port 3000...`,
    `[${new Date().toLocaleTimeString()}] Safeguard warning: Paper Demo Mode enabled by default. No real assets risked.`
  ]);

  // Main navigation active tab configuration
  const [activeTab, setActiveTab] = useState<'dash' | 'strat' | 'backtest' | 'portfolio' | 'news' | 'ai' | 'settings'>('dash');

  // Watchlist addition
  const [watchlistInput, setWatchlistInput] = useState<string>('');

  // 1. LIVE PRICE TICK SIMULATION
  // Adjust prices slightly on a 5-second interval to represent real-time updates
  useEffect(() => {
    const handleTicks = setInterval(() => {
      setStocks((prevStocks) => {
        return prevStocks.map((stock) => {
          // Add minor Brownian drift volatility (e.g. up to 1.5% variance)
          const multiplier = 1 + (Math.random() - 0.492) * 0.007;
          let newPrice = stock.price * multiplier;
          // limit absolute decimal ranges
          newPrice = Number(newPrice.toFixed(stock.symbol.includes('USD') && !stock.symbol.includes('BTC') ? 4 : 2));
          
          const change = Number((newPrice - stock.open).toFixed(2));
          const changePercent = Number(((change / stock.open) * 100).toFixed(2));

          // Append to candle history (latest day close adjusts)
          const updatedHistory = [...stock.history];
          if (updatedHistory.length > 0) {
            const lastCandle = { ...updatedHistory[updatedHistory.length - 1] };
            lastCandle.close = newPrice;
            if (newPrice > lastCandle.high) lastCandle.high = newPrice;
            if (newPrice < lastCandle.low) lastCandle.low = newPrice;
            updatedHistory[updatedHistory.length - 1] = lastCandle;
          }

          const enrichedHistory = enrichOHLCVData(updatedHistory);

          // CHECK ACTIVE Price Alarm Limits
          alerts.forEach((al) => {
            if (al.symbol === stock.symbol && al.isActive) {
              let triggerFired = false;
              if (al.metric === 'PRICE_BELOW' && newPrice < Number(al.value)) {
                triggerFired = true;
              } else if (al.metric === 'PRICE_ABOVE' && newPrice > Number(al.value)) {
                triggerFired = true;
              }

              if (triggerFired) {
                // Post warning to activity stream
                setActivityLogs((log) => [
                  `[ALARM NOTIFY] ${stock.symbol} crossed trigger target at ${newPrice} USD (Limit ${al.value})! Alert broadcasted via Telegram and email.`,
                  ...log,
                ]);
                // Deactivate alert
                setAlerts((prevA) =>
                  prevA.map((currA) => (currA.id === al.id ? { ...currA, isActive: false } : currA))
                );
              }
            }
          });

          return {
            ...stock,
            price: newPrice,
            change,
            changePercent,
            history: enrichedHistory,
          };
        });
      });
    }, 5000);

    return () => clearInterval(handleTicks);
  }, [alerts]);

  // Fetch actual, correct real-world stock prices from Yahoo Finance via backend endpoint
  const fetchRealStockPrices = async () => {
    setActivityLogs((log) => [
      `[${new Date().toLocaleTimeString()}] Fetching real-time market quotes from Yahoo Finance...`,
      ...log
    ]);

    const targetSymbols = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN', 'BTC-USD', 'EUR-USD'];
    
    const fetchPromises = targetSymbols.map(async (sym) => {
      try {
        const res = await fetch(`/api/market/quote/${encodeURIComponent(sym)}`);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();
        return data;
      } catch (err) {
        console.warn(`Could not sync real-time price info for ${sym}, utilizing fallback standard charts.`, err);
        return null;
      }
    });

    try {
      const results = await Promise.all(fetchPromises);
      
      setStocks((prevStocks) => {
        return prevStocks.map((currentStock) => {
          const matchingRealData = results.find(r => r && r.symbol === currentStock.symbol);
          if (matchingRealData) {
            return {
              ...currentStock,
              price: matchingRealData.price,
              open: matchingRealData.open,
              high: matchingRealData.high,
              low: matchingRealData.low,
              close: matchingRealData.close,
              volume: matchingRealData.volume,
              change: matchingRealData.change,
              changePercent: matchingRealData.changePercent,
              marketCap: matchingRealData.marketCap,
              sector: matchingRealData.sector,
              history: enrichOHLCVData(matchingRealData.history)
            };
          }
          return currentStock;
        });
      });

      setActivityLogs((log) => [
        `[${new Date().toLocaleTimeString()}] Real-time stock prices successfully calibrated with live exchange rates.`,
        ...log
      ]);
    } catch (error) {
      console.error("Failed to batch retrieve current, actual stock quotes:", error);
    }
  };

  const fetchAndAddSymbol = async (symbol: string) => {
    try {
      setActivityLogs((log) => [
        `[${new Date().toLocaleTimeString()}] Fetching real-time market data for newly tracked ticker "${symbol}"...`,
        ...log
      ]);
      const res = await fetch(`/api/market/quote/${encodeURIComponent(symbol)}`);
      if (!res.ok) throw new Error(`Symbol not supported: ${res.status}`);
      const data = await res.json();
      
      setStocks((prev) => {
        const filtered = prev.filter(s => s.symbol !== symbol);
        return [
          ...filtered,
          {
            symbol: data.symbol,
            name: data.name,
            price: data.price,
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
            volume: data.volume,
            change: data.change,
            changePercent: data.changePercent,
            sector: data.sector,
            marketCap: data.marketCap,
            history: enrichOHLCVData(data.history)
          }
        ];
      });

      setActivityLogs((log) => [
        `[${new Date().toLocaleTimeString()}] Success: Tracked ticker "${symbol}" synchronised with live values.`,
        ...log
      ]);
    } catch (err: any) {
      console.warn(`Could not fetch live price for ${symbol}. Using simulated fallback.`, err);
    }
  };

  // 1c. FETCH REAL-TIME YAHOO FINANCE PRICES ON MOUNT
  useEffect(() => {
    fetchRealStockPrices();
  }, []);

  // 2. AUTOMATIC TRADING SIMULATION LOOP
  // When botStatus is 'ACTIVE', let it evaluate crossover/RSI checks every 10 seconds and carry out mock trades!
  useEffect(() => {
    let handleAutoTraders: NodeJS.Timeout | null = null;

    if (botStatus === 'ACTIVE') {
      handleAutoTraders = setInterval(() => {
        // Fetch current active strategy parameters
        const selectedStrat = strategies.find((st) => st.id === activeStrategy) || strategies[0];
        setActivityLogs((logs) => [
          `[BOT TICK] Evaluating algorithmic criteria for strategy: "${selectedStrat.name}" across active watchlist...`,
          ...logs,
        ]);

        // Intercept a random watchlist item and trigger a mock buy or sell based on technical indicator levels!
        const targetSymbol = watchlist[Math.floor(Math.random() * watchlist.length)];
        const stock = stocks.find((s) => s.symbol === targetSymbol);
        
        if (stock && stock.history.length > 0) {
          const lastCandle = stock.history[stock.history.length - 1];
          const rsi = lastCandle.rsi || 50;
          const emaFast = lastCandle.sma20 || stock.price;
          const emaSlow = lastCandle.ema50 || stock.price;

          let decision: 'BUY' | 'SELL' | null = null;

          if (selectedStrat.type === 'crossover') {
            decision = emaFast > emaSlow ? 'BUY' : 'SELL';
          } else if (selectedStrat.type === 'rsi') {
            if (rsi < 35) decision = 'BUY';
            else if (rsi > 65) decision = 'SELL';
          } else {
            decision = Math.random() > 0.5 ? 'BUY' : 'SELL';
          }

          if (decision === 'BUY') {
            // Check if we don't already have positions in targetSymbol
            const alreadyOpen = positions.some((p) => p.symbol === targetSymbol);
            if (!alreadyOpen) {
              const allocationQuantity = Math.floor((cashBalance * 0.15) / stock.price); // buy 15% worth
              if (allocationQuantity > 0) {
                handleBuyHolding(targetSymbol, allocationQuantity, stock.price, 'LONG');
                setActivityLogs((logs) => [
                  `[AUTO-TRIG APPROVED] Robot strategy crossed triggers on ${targetSymbol}. Executing buy of ${allocationQuantity} units at $${stock.price.toFixed(2)} on Margin Account.`,
                  ...logs,
                ]);
              }
            }
          } else if (decision === 'SELL') {
            const matchingPosition = positions.find((p) => p.symbol === targetSymbol);
            if (matchingPosition) {
              handleSellHolding(matchingPosition.id);
              setActivityLogs((logs) => [
                `[AUTO-TRIG APPROVED] Strategy signals sell targets on ${targetSymbol}. Full liquidation ordered for position ID ${matchingPosition.id} at $${stock.price.toFixed(2)}.`,
                ...logs,
              ]);
            }
          }
        }
      }, 12000);
    }

    return () => {
      if (handleAutoTraders) clearInterval(handleAutoTraders);
    };
  }, [botStatus, activeStrategy, stocks, cashBalance, positions, watchlist, strategies]);

  // Handler functions for portfolio additions and subtractions
  const handleBuyHolding = (symbol: string, units: number, price: number, type: 'LONG' | 'SHORT') => {
    const totalCost = units * price;
    if (cashBalance < totalCost) {
      setActivityLogs((logs) => [`[ORDER REJECTED] Insufficient margin collateral to purchase ${units} of ${symbol}`, ...logs]);
      return;
    }

    const newPosition: Position = {
      id: 'pos-' + Date.now(),
      symbol,
      type,
      entryPrice: price,
      units,
      currentPrice: price,
      pnl: 0,
      pnlPercent: 0,
      timestamp: new Date().toLocaleTimeString(),
    };

    setPositions((prev) => [...prev, newPosition]);
    setCashBalance((prev) => prev - totalCost);
    setActivityLogs((logs) => [
      `[ORDER FILLED] Acquired ${units} units of ${symbol} ${type} at $${price.toFixed(2)}`,
      ...logs,
    ]);
  };

  const handleSellHolding = (positionId: string) => {
    const pos = positions.find((p) => p.id === positionId);
    if (!pos) return;

    const s = stocks.find((st) => st.symbol === pos.symbol);
    const liquidationPrice = s ? s.price : pos.entryPrice;

    // Calculate return output
    const isLong = pos.type === 'LONG';
    const profit = isLong 
      ? (liquidationPrice - pos.entryPrice) * pos.units 
      : (pos.entryPrice - liquidationPrice) * pos.units;

    const totalReturn = pos.units * pos.entryPrice + profit;

    setPositions((prev) => prev.filter((p) => p.id !== positionId));
    setCashBalance((prev) => prev + totalReturn);
    setActivityLogs((logs) => [
      `[LIQUIDATED] Sold position ID ${pos.id} (${pos.symbol}) of ${pos.units} units at $${liquidationPrice.toFixed(2)}. Return: ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`,
      ...logs,
    ]);
  };

  // List alerts additions
  const handleAddAlert = (al: AlertTrigger) => {
    setAlerts((prev) => [...prev, al]);
    setActivityLogs((logs) => [
      `[ALERT INSTALLED] Threshold alarm added for ${al.symbol} on condition: ${al.metric} ($${al.value}) via ${al.channels.join(',')}`,
      ...logs,
    ]);
  };

  const handleRemoveAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleToggleStrategy = (id: string) => {
    setStrategies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : s))
    );
  };

  const handleAddCustomStrategy = (strat: Strategy) => {
    setStrategies((prev) => [...prev, strat]);
    setActivityLogs((logs) => [
      `[STRAT COMPILED] Custom quantitative model "${strat.name}" compiled and active in registry.`,
      ...logs,
    ]);
  };

  const handleAddWatchlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!watchlistInput.trim()) return;
    const formatInput = watchlistInput.toUpperCase().trim();
    if (!watchlist.includes(formatInput)) {
      setWatchlist((prev) => [...prev, formatInput]);
      // If symbol doesn't exist in stock data list, simulate placeholder data and fetch live
      if (!stocks.some((s) => s.symbol === formatInput)) {
        const dummyVal: StockData = {
          symbol: formatInput,
          name: `${formatInput} Corporate Equities`,
          price: 150 + Math.random() * 100,
          open: 150,
          high: 160,
          low: 145,
          close: 149,
          volume: 240000,
          change: 2.25,
          changePercent: 1.5,
          sector: 'Financial Assets',
          marketCap: '25B',
          history: enrichOHLCVData(generateStockHistoryPlaceholder(formatInput)),
        };
        setStocks((prev) => [...prev, dummyVal]);
        // Fire custom fetch for the newly added symbol
        fetchAndAddSymbol(formatInput);
      }
      setWatchlistInput('');
      setSelectedSymbol(formatInput);
      setActivityLogs((logs) => [
        `[TRACK WATCHLIST] Custom symbol "${formatInput}" appended to terminal trackers.`,
        ...logs,
      ]);
    }
  };

  // Helper placeholder data for new manual symbols
  function generateStockHistoryPlaceholder(sym: string) {
    const history: any[] = [];
    let start = 150;
    for (let i = 0; i < 100; i++) {
      const dateStr = new Date(Date.now() - (100 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      start = start * (1 + (Math.random() - 0.495) * 0.02);
      history.push({
        date: dateStr,
        open: start * 0.98,
        high: start * 1.02,
        low: start * 0.97,
        close: start,
        volume: 120000,
      });
    }
    return history;
  }

  // Find currently selected stock statistics
  const currentStock = stocks.find((s) => s.symbol === selectedSymbol) || stocks[0];

  // Simulated Login interface handler
  const handleSimulatedAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
      setActivityLogs((logs) => [
        `[AUTH OK] Operators credentials verified. Authenticated session token created in storage.`,
        ...logs,
      ]);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans text-xs">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black opacity-90 z-0"></div>
        
        <div className="relative max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-6 shadow-2xl z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex bg-emerald-950/40 p-2.5 rounded-full border border-emerald-900/40 text-emerald-400 shadow-lg shadow-emerald-500/5">
              <Compass size={28} className="animate-spin duration-12000" />
            </div>
            <h1 className="text-gray-100 text-lg font-bold tracking-tight uppercase">
              <span className="text-emerald-400 font-extrabold mr-1">Λ</span>LGO-TRADER
            </h1>
            <p className="text-neutral-500 font-mono text-[10px]">Verify trader credentials to mount systemic servers</p>
          </div>

          <form onSubmit={handleSimulatedAuth} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-mono text-neutral-500 mb-1">Corporate SSO Email</label>
              <input
                type="email"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-neutral-950 text-gray-200 border border-neutral-800 rounded p-2.5 outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                placeholder="operator@company.com"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono text-neutral-500 mb-1">Client Signing Token / Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-950 text-gray-200 border border-neutral-800 rounded p-2.5 outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold uppercase tracking-wider py-2.5 rounded text-xs transition duration-200 cursor-pointer"
            >
              Secure Initial Connection
            </button>
          </form>

          <p className="text-[10px] text-neutral-500 italic text-center font-mono leading-relaxed">
            By logging in, you acknowledge that automated trades operate under simulated paper parameters. Zero liability coordinates apply.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans flex flex-col justify-between">
      
      {/* 1. Header System status bar */}
      <header className="bg-neutral-950 border-b border-neutral-850 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-950 border border-emerald-800 text-emerald-400 p-2 rounded">
              <Compass size={18} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-gray-100 text-sm font-bold tracking-wider uppercase font-sans">
                <span className="text-emerald-400 font-extrabold mr-1">Λ</span>LGO-TRADER <span className="text-neutral-500 font-normal ml-1 text-xs">TERMINAL</span>
              </h1>
              <p className="text-[10px] font-mono text-neutral-500 flex items-center gap-1.5 leading-none mt-1">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Active Server • Host 3000 • SSL Secured
              </p>
            </div>
          </div>

          {/* Quick Metrics tracker */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="bg-neutral-900 border border-neutral-850 px-3 py-1 rounded">
              <span className="text-neutral-500 text-[9px] uppercase block leading-tight">Total Portfolio NAV</span>
              <span className="text-emerald-400 font-bold">
                ${(cashBalance + positions.reduce((acc, p) => acc + p.units * (stocks.find((st) => st.symbol === p.symbol)?.price || p.entryPrice), 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-neutral-900 border border-neutral-850 px-3 py-1 rounded">
              <span className="text-neutral-500 text-[9px] uppercase block leading-tight">Bot Sentry Engine</span>
              <span className={`font-bold flex items-center gap-1.5 ${botStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-neutral-400'}`}>
                {botStatus === 'ACTIVE' ? <Play size={10} fill="currentColor" /> : <Pause size={10} />}
                {botStatus}
              </span>
            </div>

            <div className="bg-neutral-900 border border-neutral-850 px-3 py-1 rounded flex items-center gap-2">
              <div className="text-right">
                <span className="text-neutral-500 text-[9px] uppercase block leading-tight">SSO Session</span>
                <span className="text-gray-300 font-bold">{username.split('@')[0]}</span>
              </div>
              <button
                onClick={() => setIsLoggedIn(false)}
                className="text-neutral-500 hover:text-rose-400 p-1 rounded bg-neutral-950 transition cursor-pointer"
                title="Sign Out Session"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* 2. Main layout Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-5">
        
        {/* Watchlist Sidebar Column */}
        <aside className="lg:col-span-1 bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col justify-between space-y-4">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-gray-200 text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Percent size={14} className="text-emerald-400" />
                Index Watchlist
              </span>
              <span className="text-[9px] font-mono text-neutral-500">Live ticks 5s</span>
            </div>

            {/* symbols table layout */}
            <div className="space-y-1">
              {watchlist.map((sym) => {
                const s = stocks.find((st) => st.symbol === sym);
                if (!s) return null;
                const isSelected = selectedSymbol === sym;

                return (
                  <button
                    key={sym}
                    onClick={() => setSelectedSymbol(sym)}
                    className={`w-full flex items-center justify-between p-2.5 rounded transition duration-150 border text-left cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300 shadow-sm'
                        : 'bg-neutral-955 border-transparent hover:bg-neutral-850/60'
                    }`}
                  >
                    <div>
                      <span className="font-mono font-bold text-xs block text-gray-200">{s.symbol}</span>
                      <span className="text-[10px] text-neutral-500 line-clamp-1">{s.name}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-xs font-bold block text-gray-150">
                        ${s.price.toLocaleString(undefined, { minimumFractionDigits: s.symbol.includes('USD') && !s.symbol.includes('BTC') ? 4 : 2 })}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          s.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {s.changePercent >= 0 ? '+' : ''}
                        {s.changePercent}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add to watchlist formulation */}
          <div className="border-t border-neutral-800 pt-3 space-y-2">
            <span className="block text-[10px] uppercase font-mono text-neutral-550">Dynamic Ticker Importer</span>
            <form onSubmit={handleAddWatchlist} className="flex gap-2">
              <input
                type="text"
                value={watchlistInput}
                onChange={(e) => setWatchlistInput(e.target.value)}
                placeholder="e.g. MSFT, EUR-USD"
                className="flex-1 bg-neutral-950 border border-neutral-800 text-gray-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-mono uppercase"
              />
              <button
                type="submit"
                className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs px-2.5 rounded transition"
              >
                Track
              </button>
            </form>

            <div className="bg-neutral-950 p-3 rounded border border-neutral-850">
              <span className="block text-[9px] uppercase font-mono text-neutral-500 mb-1">Target Stock Stats</span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono leading-relaxed text-gray-400">
                <div>
                  <span className="text-neutral-600 block">Sector:</span>
                  <span className="text-gray-300 font-bold line-clamp-1">{currentStock.sector}</span>
                </div>
                <div>
                  <span className="text-neutral-600 block">Volume:</span>
                  <span className="text-gray-300 font-bold">{currentStock.volume.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-neutral-600 block">Cap:</span>
                  <span className="text-gray-300 font-bold">{currentStock.marketCap}</span>
                </div>
                <div>
                  <span className="text-neutral-600 block">Change Pnt:</span>
                  <span className={currentStock.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-450'}>
                    {currentStock.changePercent >= 0 ? '+' : ''}{currentStock.changePercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>

        </aside>

        {/* Central Terminal Interface Controller */}
        <section className="lg:col-span-3 space-y-5 flex flex-col">
          
          {/* Section Navigation Tabs row */}
          <nav className="flex flex-wrap items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1.5 text-xs select-none">
            
            <button
              onClick={() => setActiveTab('dash')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded font-semibold transition duration-150 cursor-pointer border ${
                activeTab === 'dash'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-900/45 shadow-sm'
                  : 'text-gray-400 hover:text-white border-transparent hover:bg-neutral-800/40'
              }`}
            >
              <LineChart size={14} />
              Unified Terminal
            </button>

            <button
              onClick={() => setActiveTab('strat')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded font-semibold transition duration-150 cursor-pointer border ${
                activeTab === 'strat'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-900/45 shadow-sm'
                  : 'text-gray-400 hover:text-white border-transparent hover:bg-neutral-800/40'
              }`}
            >
              <Sliders size={14} />
              Robot Algorithms
            </button>

            <button
              onClick={() => setActiveTab('backtest')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded font-semibold transition duration-150 cursor-pointer border ${
                activeTab === 'backtest'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-900/45 shadow-sm'
                  : 'text-gray-400 hover:text-white border-transparent hover:bg-neutral-800/40'
              }`}
            >
              <TrendingUp size={14} />
              Engine backtesting
            </button>

            <button
              onClick={() => setActiveTab('portfolio')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded font-semibold transition duration-150 cursor-pointer border ${
                activeTab === 'portfolio'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-900/45 shadow-sm'
                  : 'text-gray-400 hover:text-white border-transparent hover:bg-neutral-800/40'
              }`}
            >
              <Compass size={14} />
              Balance & Portfolio
            </button>

            <button
              onClick={() => setActiveTab('news')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded font-semibold transition duration-150 cursor-pointer border ${
                activeTab === 'news'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-900/45 shadow-sm'
                  : 'text-gray-400 hover:text-white border-transparent hover:bg-neutral-800/40'
              }`}
            >
              <Newspaper size={14} />
              Sentiment News
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded font-semibold transition duration-150 cursor-pointer border ${
                activeTab === 'ai'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-900/45 shadow-sm'
                  : 'text-gray-400 hover:text-white border-transparent hover:bg-neutral-800/40'
              }`}
            >
              <Sparkles size={14} />
              Gemini AI Analyst
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded font-semibold transition duration-150 cursor-pointer border ${
                activeTab === 'settings'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-900/45 shadow-sm'
                  : 'text-gray-400 hover:text-white border-transparent hover:bg-neutral-800/40'
              }`}
            >
              <Settings size={14} />
              Control Settings
            </button>

          </nav>

          {/* Active section dispatcher views */}
          <div className="flex-1 min-h-[420px] transition duration-200">
            {activeTab === 'dash' && (
              <div className="space-y-5 animate-fade-in">
                {/* Candlestick line chart */}
                <TerminalChart data={currentStock.history} symbol={selectedSymbol} />

                {/* Automation triggers pane */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* Automated robot switcher cabinet */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-gray-200 text-xs font-bold uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                        <Cpu size={14} className="text-emerald-400" />
                        Sentry Trading Sytem Execution
                      </h3>
                      <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">
                        Turn on the algorithmic execution bot. When active, it will periodically process market triggers and execute trades on paper balance.
                      </p>
                    </div>

                    <div className="space-y-3 pt-3">
                      <div>
                        <label className="block text-[9px] uppercase font-mono text-neutral-500 mb-1">Target algorithm</label>
                        <select
                          value={activeStrategy}
                          onChange={(e) => setActiveStrategy(e.target.value)}
                          className="w-full bg-neutral-950 text-gray-200 border border-neutral-800 rounded p-1.5 text-[11px] outline-none"
                        >
                          {strategies.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setBotStatus(botStatus === 'ACTIVE' ? 'IDLE' : 'ACTIVE');
                            setActivityLogs((logs) => [
                              `[BOT STATE CHANGE] Automated pilot changed to: ${botStatus === 'ACTIVE' ? 'IDLE' : 'ACTIVE'} at ${new Date().toLocaleTimeString()}`,
                              ...logs,
                            ]);
                          }}
                          className={`flex-1 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition duration-200 cursor-pointer ${
                            botStatus === 'ACTIVE'
                              ? 'bg-rose-950/40 text-rose-450 border border-rose-800/40 hover:bg-rose-900/30'
                              : 'bg-emerald-500 text-black hover:bg-emerald-600'
                          }`}
                        >
                          {botStatus === 'ACTIVE' ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                          {botStatus === 'ACTIVE' ? 'Deactivate Bot' : 'Deploy Automated Bot'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sentry activity logs console box */}
                  <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col h-[200px] md:h-auto">
                    <h3 className="text-gray-200 text-xs font-bold uppercase tracking-wider mb-2 font-mono flex items-center justify-between">
                      <span>Mechanical Output Feed Logger</span>
                      <span className="text-neutral-600 font-mono text-[9px]">Autoscrolling active</span>
                    </h3>
                    <div className="flex-1 bg-black p-2 rounded border border-neutral-850 overflow-y-auto space-y-1.5 font-mono text-[10px] text-emerald-400">
                      {activityLogs.map((log, idx) => (
                        <div key={idx} className="leading-snug">
                          <span className="text-emerald-600 select-none">&gt;</span> {log}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'strat' && (
              <div className="animate-fade-in">
                <StrategiesPanel
                  strategies={strategies}
                  onToggleStrategy={handleToggleStrategy}
                  onAddCustomStrategy={handleAddCustomStrategy}
                />
              </div>
            )}

            {activeTab === 'backtest' && (
              <div className="animate-fade-in">
                <BacktestPanel strategies={strategies} stocks={stocks} />
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div className="animate-fade-in">
                <PortfolioPanel
                  positions={positions}
                  stocks={stocks}
                  onAddHolding={handleBuyHolding}
                  onRemoveHolding={handleSellHolding}
                  cashBalance={cashBalance}
                />
              </div>
            )}

            {activeTab === 'news' && (
              <div className="animate-fade-in">
                <NewsPanel articles={INITIAL_NEWS} />
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="animate-fade-in">
                <AIChatPanel stocks={stocks} selectedSymbol={selectedSymbol} />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="animate-fade-in">
                <SettingsPanel
                  alerts={alerts}
                  onAddAlert={handleAddAlert}
                  onRemoveAlert={handleRemoveAlert}
                  strategies={strategies}
                />
              </div>
            )}
          </div>

        </section>

      </main>

      {/* 3. Footer Legal Bar */}
      <footer className="bg-neutral-950 border-t border-neutral-850 px-4 py-3 pb-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-neutral-500">
          <div className="flex items-center gap-1.5 leading-none">
            <AlertTriangle size={12} className="text-amber-500" />
            <span>Quantitative Risk warnings: Paper Sandbox mode operates natively. Zero execution liabilities on live accounts.</span>
          </div>
          <div className="text-center sm:text-right">
            <span>Terminal Port: 3000 | Antigravity AI Engine | Google DeepMind Gemini</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
