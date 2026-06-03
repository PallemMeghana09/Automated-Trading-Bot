/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StockData, OHLCV, NewsArticle, TradingSignal, Strategy } from './types';
import { enrichOHLCVData } from './utils/indicators';

// Generate raw OHLCV historical data
export function generateStockHistory(
  symbol: string,
  basePrice: number,
  volatility: number,
  length: number = 100
): OHLCV[] {
  const history: OHLCV[] = [];
  let currentPrice = basePrice;
  const now = new Date();
  
  // Create starting point (e.g., 100 days ago)
  const startDate = new Date(now.getTime() - length * 24 * 60 * 60 * 1000);

  for (let i = 0; i < length; i++) {
    const dateStr = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // Simple random walk
    const changePercent = (Math.random() - 0.49) * volatility; // slight upward drift
    const open = currentPrice;
    const close = currentPrice * (1 + changePercent);
    const high = Math.max(open, close) * (1 + Math.random() * (volatility / 2));
    const low = Math.min(open, close) * (1 - Math.random() * (volatility / 2));
    const volume = Math.floor(100000 + Math.random() * 900000);

    history.push({
      date: dateStr,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });

    currentPrice = close;
  }

  return history;
}

// Initial full list of demo stocks
export const INITIAL_STOCKS: StockData[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 182.52,
    open: 181.10,
    high: 183.92,
    low: 180.88,
    close: 181.16,
    volume: 52000000,
    change: 1.36,
    changePercent: 0.75,
    sector: 'Technology',
    marketCap: '2.85T',
    history: enrichOHLCVData(generateStockHistory('AAPL', 180, 0.015, 120)),
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 125.12,
    open: 122.12,
    high: 128.80,
    low: 120.10,
    close: 122.54,
    volume: 45000000,
    change: 3.58,
    changePercent: 2.93,
    sector: 'Technology (Semiconductors)',
    marketCap: '3.19T',
    history: enrichOHLCVData(generateStockHistory('NVDA', 115, 0.025, 120)),
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 175.45,
    open: 178.10,
    high: 179.43,
    low: 174.12,
    close: 179.24,
    volume: 81000000,
    change: -3.79,
    changePercent: -2.11,
    sector: 'Automotive',
    marketCap: '558B',
    history: enrichOHLCVData(generateStockHistory('TSLA', 185, 0.028, 120)),
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 421.90,
    open: 420.01,
    high: 423.80,
    low: 418.50,
    close: 420.32,
    volume: 23000000,
    change: 1.58,
    changePercent: 0.38,
    sector: 'Technology (Software)',
    marketCap: '3.13T',
    history: enrichOHLCVData(generateStockHistory('MSFT', 415, 0.012, 120)),
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    price: 178.15,
    open: 176.50,
    high: 179.12,
    low: 175.80,
    close: 176.55,
    volume: 38000000,
    change: 1.60,
    changePercent: 0.91,
    sector: 'Consumer Cyclical',
    marketCap: '1.85T',
    history: enrichOHLCVData(generateStockHistory('AMZN', 170, 0.018, 120)),
  },
  {
    symbol: 'BTC-USD',
    name: 'Bitcoin (USD)',
    price: 68120.50,
    open: 67340.20,
    high: 68950.00,
    low: 66800.10,
    close: 67350.50,
    volume: 12500000,
    change: 770.00,
    changePercent: 1.14,
    sector: 'Cryptocurrency',
    marketCap: '1.34T',
    history: enrichOHLCVData(generateStockHistory('BTC-USD', 65000, 0.045, 120)),
  },
  {
    symbol: 'EUR-USD',
    name: 'Euro / US Dollar',
    price: 1.0852,
    open: 1.0821,
    high: 1.0874,
    low: 1.0811,
    close: 1.0823,
    volume: 150000,
    change: 0.0029,
    changePercent: 0.27,
    sector: 'Forex Currencies',
    marketCap: 'N/A',
    history: enrichOHLCVData(generateStockHistory('EUR-USD', 1.08, 0.005, 120)),
  }
];

export const INITIAL_NEWS: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'NVIDIA Launches Custom AI Chips for High-Frequency Quantitative Trading Servers',
    source: 'TechCrunch',
    time: '2 hours ago',
    sentiment: 'BULLISH',
    score: 0.85,
    summary: 'NVIDIA announced specialized processors dedicated exclusively to speeding up order executions and running neural networks at the microsecond level for high-frequency algorithmic traders.',
  },
  {
    id: 'news-2',
    title: 'Fed Signals Potential Rates Pause Amid Stabilizing Core Inflation Numbers',
    source: 'Bloomberg Bloomberg',
    time: '4 hours ago',
    sentiment: 'BULLISH',
    score: 0.65,
    summary: 'In an afternoon press release, the Federal Reserve chair hinted that inflation indices are returning to targeted boundaries, which could support a rate freeze or cut in the next quarterly meeting.',
  },
  {
    id: 'news-3',
    title: 'Securities and Exchange Commission Investigates Leveraged Algorithmic Crypto Entities',
    source: 'Reuters',
    time: '6 hours ago',
    sentiment: 'BEARISH',
    score: -0.75,
    summary: 'Regulators have issued requests for audit schedules to several proprietary desks and decentralized protocols offering automated trading strategies, citing synthetic leverage exposure.',
  },
  {
    id: 'news-4',
    title: 'Apple Expands Smart Siri Orchestration with On-Device CoreML Market Models',
    source: 'WSJ',
    time: 'Yesterday',
    sentiment: 'BULLISH',
    score: 0.45,
    summary: 'Apple intends to push updates that enable consumer stock widgets to draw basic moving average warnings and compute personal asset distributions directly on custom silicon.',
  },
  {
    id: 'news-5',
    title: 'Tesla Short Sellers Facing $2B Loss in Massive Pre-Market Squeeze Event',
    source: 'Financial Times',
    time: '2 days ago',
    sentiment: 'BULLISH',
    score: 0.80,
    summary: 'A dramatic rebound in retail delivery counts prompted sudden institutional hedging, setting off sequential buy-stops and driving shares up over nine percent in early trade lines.',
  }
];

export const BUILTIN_STRATEGIES: Strategy[] = [
  {
    id: 'strat-1',
    name: 'Moving Average Crossover (SMA)',
    description: 'Generates buy flags when the short-term 20-day SMA crosses above the long-term 50-day EMA, and sell flags when it crosses below.',
    type: 'crossover',
    status: 'ACTIVE',
    parameters: {
      fastPeriod: 20,
      slowPeriod: 50,
    },
    rules: [
      'Buy: 20-day SMA crossings above 50-day EMA from below',
      'Sell: 20-day SMA crossings below 50-day EMA from above',
      'Target Profit: Trailing 5% above entry price',
    ]
  },
  {
    id: 'strat-2',
    name: 'RSI Mean Reversion',
    description: 'Identifies oversold extremes (RSI < 30) for swift trend entry captures and overbought extremes (RSI > 70) for defensive pullbacks.',
    type: 'rsi',
    status: 'INACTIVE',
    parameters: {
      oversold: 30,
      overbought: 70,
    },
    rules: [
      'Buy: RSI drops below 30 and starts angling back upwards',
      'Sell: RSI spikes above 70 and begins curve descent',
      'Defensive: Strict stop-loss at 2% under trigger candle low',
    ]
  },
  {
    id: 'strat-3',
    name: 'MACD Momentum Tracker',
    description: 'Capitalizes on heavy impulse waves by buying when the MACD Line crosses above the Signal Line and selling on reverse crossover.',
    type: 'macd',
    status: 'ACTIVE',
    parameters: {
      fast: 12,
      slow: 26,
      signal: 9
    },
    rules: [
      'Buy: MACD Line crosses above Signal Line while below zero',
      'Sell: MACD Line crosses below Signal Line while above zero',
      'Position Sizing: Risk exactly 1.5% of equity per instance',
    ]
  },
  {
    id: 'strat-5',
    name: 'AI Neural Trend Predictor',
    description: 'Uses advanced Gemini prediction matrices and machine learning metrics to execute on anticipated 24-hour sentiment swings.',
    type: 'ai',
    status: 'ACTIVE',
    parameters: {
      minConfidence: 75,
      forecastDays: 1,
    },
    rules: [
      'Buy: AI sentiment forecast returns >75% Bullish confidence score',
      'Sell: AI indicators trigger warning of Bearish reversal with >80% score',
      'Risk: Auto-calculated Stop Loss via Average True Range (ATR)',
    ]
  }
];

export const INITIAL_SIGNALS: TradingSignal[] = [
  {
    symbol: 'AAPL',
    signal: 'BUY',
    strength: 'STRONG',
    confidence: 88,
    entryPrice: 181.80,
    stopLoss: 178.00,
    targetPrice: 190.50,
    indicators: {
      rsi: 38.5,
      macd: 'Bullish Crossover Near',
      trend: 'Uptrend Channel Solid',
      bb: 'Rebounding from Lower Band',
    },
    timestamp: 'Just now',
    rationale: 'Multiple technical triggers are aligning. RSI is emerging from oversold conditions, and prices have established a double-bottom rebound near the 180 horizontal psychological support channel.'
  },
  {
    symbol: 'NVDA',
    signal: 'BUY',
    strength: 'STRONG',
    confidence: 94,
    entryPrice: 874.00,
    stopLoss: 845.00,
    targetPrice: 925.00,
    indicators: {
      rsi: 61.2,
      macd: 'Highly Bullish Divergence',
      trend: 'Parabolic Expansion Stage',
      bb: 'Riding Upper Bollinger Band',
    },
    timestamp: '2 mins ago',
    rationale: 'Volume surges support the custom semiconductor breakout. Moving averages show complete golden stacking across 20, 50, and 200 periods with highly bullish proprietary model prediction.'
  },
  {
    symbol: 'TSLA',
    signal: 'SELL',
    strength: 'MODERATE',
    confidence: 76,
    entryPrice: 175.00,
    stopLoss: 180.00,
    targetPrice: 162.00,
    indicators: {
      rsi: 28.1,
      macd: 'Bearish Histograms Expanding',
      trend: 'Solid Descending Wedge',
      bb: 'Pierced Lower Band',
    },
    timestamp: '15 mins ago',
    rationale: 'Despite minor bounces, heavy institutional delivery distribution is dragging TSLA. Relentless MACD bearish extensions indicate that a re-test of the lower absolute support is highly probable.'
  }
];
