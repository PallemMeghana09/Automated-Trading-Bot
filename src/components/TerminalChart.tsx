/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  ReferenceLine,
} from 'recharts';
import { OHLCV } from '../types';
import { Eye, EyeOff, TrendingUp } from 'lucide-react';

interface TerminalChartProps {
  data: OHLCV[];
  symbol: string;
}

export default function TerminalChart({ data, symbol }: TerminalChartProps) {
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(false);
  const [showBB, setShowBB] = useState(true);
  const [chartType, setChartType] = useState<'line' | 'candle'>('line');

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 font-mono text-xs">
        [NO CHART CANDLE DATA AVAILABLE]
      </div>
    );
  }

  // Find min/max values for Y-Axis bounds
  const prices = data.flatMap((d) => [d.open, d.high, d.low, d.close]);
  const minPrice = Math.min(...prices) * 0.98;
  const maxPrice = Math.max(...prices) * 1.02;

  // Custom Candle stick rendering helper
  const CustomCandlestick = (props: any) => {
    const { x, y, width, height, open, close, high, low } = props;
    const isBullish = close >= open;
    const strokeColor = isBullish ? '#00ffa3' : '#ff4d4d';
    const fillColor = isBullish ? '#00ffa3' : '#ff4d4d';

    // Calculate coordinates for SVG rect
    // In Recharts ComposedChart, props x/y represent the category center
    const candleWidth = Math.max(5, width - 4);
    const rectX = x + (width - candleWidth) / 2;
    const top = Math.min(y, y + height);
    const bodyHeight = Math.max(2, Math.abs(height));

    // Calculate Wick positions
    // We map close/open to y-height
    // Recharts already did this coordinate mapping, but we helper it:
    return (
      <g stroke={strokeColor} strokeWidth={1.5}>
        {/* Draw Wick line from high to low */}
        <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y + height} />
        {/* Draw open-close body */}
        <rect
          x={rectX}
          y={top}
          width={candleWidth}
          height={bodyHeight}
          fill={fillColor}
          stroke={strokeColor}
        />
      </g>
    );
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-950 text-emerald-400 font-mono px-2 py-0.5 rounded text-xs font-bold border border-emerald-800/50">
            {symbol}
          </div>
          <span className="text-gray-300 font-semibold text-sm">Interactive Analytics Engine</span>
        </div>

        {/* Technical Overlays bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setChartType(chartType === 'line' ? 'candle' : 'line')}
            className={`px-2 py-1 rounded transition duration-200 border ${
              chartType === 'candle'
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-700/60'
                : 'bg-neutral-800 text-gray-400 border-neutral-700 hover:text-white'
            }`}
          >
            {chartType === 'candle' ? 'Candles (OHLC)' : 'Regular Line'}
          </button>

          <span className="h-4 w-[1px] bg-neutral-800 mx-1"></span>

          {/* SMA 20 */}
          <button
            onClick={() => setShowSMA(!showSMA)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded transition duration-200 border ${
              showSMA
                ? 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                : 'bg-neutral-800 text-gray-400 border-neutral-700 hover:text-white'
            }`}
          >
            {showSMA ? <Eye size={12} /> : <EyeOff size={12} />}
            SMA 20
          </button>

          {/* EMA 50 */}
          <button
            onClick={() => setShowEMA(!showEMA)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded transition duration-200 border ${
              showEMA
                ? 'bg-purple-950/40 text-purple-400 border-purple-800/40'
                : 'bg-neutral-800 text-gray-400 border-neutral-700 hover:text-white'
            }`}
          >
            {showEMA ? <Eye size={12} /> : <EyeOff size={12} />}
            EMA 50
          </button>

          {/* Bollinger Bands */}
          <button
            onClick={() => setShowBB(!showBB)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded transition duration-200 border ${
              showBB
                ? 'bg-sky-950/40 text-sky-400 border-sky-800/40'
                : 'bg-neutral-800 text-gray-400 border-neutral-700 hover:text-white'
            }`}
          >
            {showBB ? <Eye size={12} /> : <EyeOff size={12} />}
            B-Bands
          </button>
        </div>
      </div>

      {/* Primary stock chart (Price) */}
      <div className="h-64 sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <XAxis dataKey="date" stroke="#525252" fontSize={10} minTickGap={25} tickLine={false} />
            <YAxis domain={[minPrice, maxPrice]} stroke="#525252" fontSize={10} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f0f11', borderColor: 'rgba(255, 255, 255, 0.08)', color: '#e2e8f0', borderRadius: '8px' }}
              labelClassName="text-gray-400 text-xs font-mono"
            />
            
            {/* Bollinger Lower and Upper Bands */}
            {showBB && (
              <Line
                type="monotone"
                dataKey="bbUpper"
                stroke="#38bdf8"
                strokeDasharray="3 3"
                strokeWidth={1.1}
                dot={false}
                name="BB Upper"
              />
            )}
            {showBB && (
              <Line
                type="monotone"
                dataKey="bbLower"
                stroke="#38bdf8"
                strokeDasharray="3 3"
                strokeWidth={1.1}
                dot={false}
                name="BB Lower"
              />
            )}
            {showBB && (
              <Line
                type="monotone"
                dataKey="bbMiddle"
                stroke="#0284c7"
                strokeWidth={1}
                dot={false}
                name="BB Middle"
                opacity={0.4}
              />
            )}

            {/* SMA 20 */}
            {showSMA && (
              <Line
                type="monotone"
                dataKey="sma20"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                name="SMA 20"
              />
            )}

            {/* EMA 50 */}
            {showEMA && (
              <Line
                type="monotone"
                dataKey="ema50"
                stroke="#a855f7"
                strokeWidth={1.5}
                dot={false}
                name="EMA 50"
              />
            )}

            {/* Main price representation */}
            {chartType === 'candle' ? (
              <Bar
                dataKey="close"
                // Custom shape renders the candlestick wick + body
                shape={<CustomCandlestick />}
                name="Candle"
              />
            ) : (
              <Line
                type="monotone"
                dataKey="close"
                stroke="#00ffa3"
                strokeWidth={2}
                dot={false}
                name="Price"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Sub-subplot for RSI Momentum indicators */}
      <div className="mt-4 pt-3 border-t border-neutral-800">
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
          <span className="font-mono text-neutral-400">RSI Indicator (14 Oscillations)</span>
          <span className="font-mono text-amber-500/90 text-[10px]">Oversold ≤ 30 | Overbought ≥ 70</span>
        </div>
        <div className="h-20">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="date" hide={true} />
              <YAxis domain={[10, 90]} stroke="#525252" fontSize={8} tickCount={3} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f0f11', borderColor: 'rgba(255, 255, 255, 0.08)', color: '#e2e8f0', borderRadius: '8px' }}
              />
              
              {/* Trigger boundaries lines */}
              <ReferenceLine y={70} stroke="#ff4d4d" strokeDasharray="3 3" opacity={0.6} />
              <ReferenceLine y={30} stroke="#00ffa3" strokeDasharray="3 3" opacity={0.6} />
              
              <Line
                type="monotone"
                dataKey="rsi"
                stroke="#f59e0b"
                strokeWidth={1.2}
                dot={false}
                name="RSI"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
