/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OHLCV } from '../types';

/**
 * Calculates Simple Moving Average
 */
export function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(data[i]); // Fallback/warmup
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j];
      }
      sma.push(sum / period);
    }
  }
  return sma;
}

/**
 * Calculates Exponential Moving Average
 */
export function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = [];
  if (data.length === 0) return ema;
  
  const k = 2 / (period + 1);
  let currentEma = data[0];
  ema.push(currentEma);
  
  for (let i = 1; i < data.length; i++) {
    currentEma = data[i] * k + currentEma * (1 - k);
    ema.push(currentEma);
  }
  return ema;
}

/**
 * Calculates Relative Strength Index (RSI)
 */
export function calculateRSI(data: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  if (data.length < period) {
    return new Array(data.length).fill(50);
  }

  let gains = 0;
  let losses = 0;

  // First interval
  for (let i = 1; i <= period; i++) {
    const diff = data[i] - data[i - 1];
    if (diff > 0) {
      gains += diff;
    } else {
      losses -= diff;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = 0; i < period; i++) {
    rsi.push(50); // padding
  }

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi.push(100 - 100 / (1 + rs));

  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - 100 / (1 + rs));
  }

  return rsi;
}

/**
 * Calculates MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  data: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  const fastEma = calculateEMA(data, fastPeriod);
  const slowEma = calculateEMA(data, slowPeriod);
  const macdVal: number[] = [];

  for (let i = 0; i < data.length; i++) {
    macdVal.push(fastEma[i] - slowEma[i]);
  }

  const signalVal = calculateEMA(macdVal, signalPeriod);
  const histogramVal: number[] = [];

  for (let i = 0; i < data.length; i++) {
    histogramVal.push(macdVal[i] - signalVal[i]);
  }

  return {
    macd: macdVal,
    signal: signalVal,
    histogram: histogramVal,
  };
}

/**
 * Calculates Bollinger Bands
 */
export function calculateBollingerBands(
  data: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): { upper: number[]; middle: number[]; lower: number[] } {
  const middle = calculateSMA(data, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(data[i] * 1.05);
      lower.push(data[i] * 0.95);
    } else {
      let sumOfSquares = 0;
      const avg = middle[i];
      for (let j = 0; j < period; j++) {
        const val = data[i - j];
        sumOfSquares += Math.pow(val - avg, 2);
      }
      const valStdDev = Math.sqrt(sumOfSquares / period);
      upper.push(avg + stdDevMultiplier * valStdDev);
      lower.push(avg - stdDevMultiplier * valStdDev);
    }
  }

  return { upper, middle, lower };
}

/**
 * Calculates Average True Range (ATR)
 */
export function calculateATR(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 14
): number[] {
  const atr: number[] = [];
  if (closes.length === 0) return atr;
  
  const tr: number[] = [highs[0] - lows[0]];
  for (let i = 1; i < closes.length; i++) {
    const hl = highs[i] - lows[i];
    const hc = Math.abs(highs[i] - closes[i - 1]);
    const lc = Math.abs(lows[i] - closes[i - 1]);
    tr.push(Math.max(hl, hc, lc));
  }
  
  // ATR is rolling SMA of TR
  return calculateSMA(tr, period);
}

/**
 * Adds indicators to OHLCV array
 */
export function enrichOHLCVData(history: OHLCV[]): OHLCV[] {
  if (history.length === 0) return history;
  const closes = history.map((h) => h.close);
  const highs = history.map((h) => h.high);
  const lows = history.map((h) => h.low);

  const sma20 = calculateSMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const rsi = calculateRSI(closes, 14);
  const macdData = calculateMACD(closes, 12, 26, 9);
  const bbData = calculateBollingerBands(closes, 20, 2);

  return history.map((item, index) => ({
    ...item,
    sma20: sma20[index],
    ema50: ema50[index],
    rsi: rsi[index],
    macd: macdData.macd[index],
    macdSignal: macdData.signal[index],
    macdHist: macdData.histogram[index],
    bbUpper: bbData.upper[index],
    bbLower: bbData.lower[index],
    bbMiddle: bbData.middle[index],
  }));
}
