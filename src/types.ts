/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
  history: OHLCV[];
  sector: string;
  marketCap: string;
}

export interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  // Calculated technical indicators
  sma20?: number;
  ema50?: number;
  rsi?: number;
  macd?: number;
  macdSignal?: number;
  macdHist?: number;
  bbUpper?: number;
  bbLower?: number;
  bbMiddle?: number;
}

export type SignalType = 'BUY' | 'SELL' | 'HOLD';

export interface TradingSignal {
  symbol: string;
  signal: SignalType;
  strength: 'STRONG' | 'MODERATE' | 'WEAK';
  confidence: number; // 0-100
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  indicators: {
    rsi: number;
    macd: string;
    trend: string;
    bb: string;
  };
  timestamp: string;
  rationale: string;
}

export interface Position {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  units: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: string;
}

export interface TradeLog {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  price: number;
  units: number;
  total: number;
  timestamp: string;
  isPaper: boolean;
  status: 'COMPLETED' | 'CANCELLED' | 'PENDING';
  strategyName: string;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  type: 'crossover' | 'rsi' | 'macd' | 'breakout' | 'ai' | 'custom';
  status: 'ACTIVE' | 'INACTIVE';
  parameters: {
    [key: string]: number | string | boolean;
  };
  rules: string[];
}

export interface BacktestConfig {
  symbol: string;
  strategyId: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
}

export interface BacktestResult {
  symbol: string;
  strategyName: string;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number; // Percent
  cagr: number; // Compound annual growth rate
  sharpeRatio: number;
  maxDrawdown: number; // Percent
  winRate: number; // Percent
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  equityCurve: { date: string; equity: number }[];
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  score: number; // -1 to +1
  summary: string;
  url?: string;
}

export interface AlertTrigger {
  id: string;
  symbol: string;
  metric: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'SIGNAL_CHANGE' | 'INDICATOR';
  value: number | string;
  channels: ('telegram' | 'email' | 'push')[];
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isThinking?: boolean;
}

export interface AIPrediction {
  symbol: string;
  targetDate: string;
  currentPrice: number;
  predictedPrice: number;
  direction: 'UP' | 'DOWN';
  confidence: number; // Percent
  weeklyTrend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  monthlyTrend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  accuracyRate: number; // Historic accuracy score
  recommendation: string;
}
