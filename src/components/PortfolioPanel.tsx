/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Position, StockData } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Wallet, Briefcase, PlusCircle, Trash2, ArrowUpRight, ArrowDownRight, DollarSign, RefreshCw } from 'lucide-react';

interface PortfolioPanelProps {
  positions: Position[];
  stocks: StockData[];
  onAddHolding: (symbol: string, units: number, price: number, type: 'LONG' | 'SHORT') => void;
  onRemoveHolding: (id: string) => void;
  cashBalance: number;
}

const SECTOR_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#a855f7', '#ec4899', '#f43f5e', '#14b8a6'];

export default function PortfolioPanel({
  positions,
  stocks,
  onAddHolding,
  onRemoveHolding,
  cashBalance,
}: PortfolioPanelProps) {
  // Local state for addition form
  const [addSymbol, setAddSymbol] = useState<string>('AAPL');
  const [addUnits, setAddUnits] = useState<number>(10);
  const [addType, setAddType] = useState<'LONG' | 'SHORT'>('LONG');

  // Calculate portfolio totals
  const totalHoldingsValue = positions.reduce((acc, pos) => {
    const currentPrice = stocks.find((s) => s.symbol === pos.symbol)?.price || pos.entryPrice;
    return acc + pos.units * currentPrice;
  }, 0);

  const totalPortfolioValue = cashBalance + totalHoldingsValue;

  // Pie chart calculations (allocation by symbol)
  const allocationData = positions.map((pos) => {
    const s = stocks.find((st) => st.symbol === pos.symbol);
    const value = pos.units * (s?.price || pos.entryPrice);
    return {
      name: pos.symbol,
      value: Number(value.toFixed(2)),
    };
  });

  // Calculate Sector distribution representation
  const sectorMap = new Map<string, number>();
  positions.forEach((pos) => {
    const s = stocks.find((st) => st.symbol === pos.symbol);
    const sector = s?.sector || 'Unknown';
    const value = pos.units * (s?.price || pos.entryPrice);
    sectorMap.set(sector, (sectorMap.get(sector) || 0) + value);
  });

  const sectorData = Array.from(sectorMap.entries()).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2)),
  }));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = stocks.find((st) => st.symbol === addSymbol);
    if (!s) return;
    onAddHolding(addSymbol, addUnits, s.price, addType);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 font-sans space-y-6">
      
      {/* Portfolio Headline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-950 p-4 border border-neutral-800 rounded">
          <span className="block text-xs font-mono text-neutral-400 mb-1">Total Account Net Worth</span>
          <div className="text-xl font-mono text-emerald-400 font-bold flex items-center">
            <DollarSign size={18} />
            {totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-neutral-500 font-mono mt-1">Cash Balance + Current Holdings</p>
        </div>

        <div className="bg-neutral-950 p-4 border border-neutral-800 rounded">
          <span className="block text-xs font-mono text-neutral-400 mb-1">Current Open Exposure</span>
          <div className="text-xl font-mono text-gray-100 font-bold flex items-center">
            <DollarSign size={18} />
            {totalHoldingsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-neutral-500 font-mono mt-1">Capital active in market channels</p>
        </div>

        <div className="bg-neutral-950 p-4 border border-neutral-800 rounded">
          <span className="block text-xs font-mono text-neutral-400 mb-1">Free Usable Margin Cash</span>
          <div className="text-xl font-mono text-cyan-400 font-bold flex items-center">
            <DollarSign size={18} />
            {cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-neutral-500 font-mono mt-1">Awaiting robot strategy entry triggers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Holdings detail Tracker */}
        <div className="bg-neutral-950/40 p-4 rounded border border-neutral-800">
          <h3 className="text-gray-200 text-sm font-semibold mb-3 flex items-center gap-2">
            <Briefcase size={16} className="text-emerald-500" />
            Current Margin Holdings
          </h3>

          {positions.length === 0 ? (
            <div className="text-xs font-mono text-neutral-500 p-8 text-center border border-dashed border-neutral-800 rounded">
              [NO ACTIVE POSITIONS DETECTED]
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-neutral-500 border-b border-neutral-800 pb-2">
                    <th className="py-2">Asset</th>
                    <th className="py-2">Entry Price</th>
                    <th className="py-2">Units</th>
                    <th className="py-2">Liquidity PnL</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {positions.map((pos) => {
                    const st = stocks.find((s) => s.symbol === pos.symbol);
                    const currentPrice = st?.price || pos.entryPrice;
                    const val = pos.units * currentPrice;
                    const pnl = pos.type === 'LONG' 
                      ? (currentPrice - pos.entryPrice) * pos.units 
                      : (pos.entryPrice - currentPrice) * pos.units;
                    const pnlPct = (pnl / (pos.entryPrice * pos.units)) * 100;

                    return (
                      <tr key={pos.id} className="hover:bg-neutral-900/30">
                        <td className="py-2.5">
                          <span className="font-bold text-gray-200 block">{pos.symbol}</span>
                          <span className={`text-[10px] ${pos.type === 'LONG' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {pos.type}
                          </span>
                        </td>
                        <td className="py-2.5 text-gray-300">
                          ${pos.entryPrice.toFixed(2)}
                        </td>
                        <td className="py-2.5 text-gray-300">{pos.units}</td>
                        <td className={`py-2.5 font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ${pnl.toFixed(2)} ({pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%)
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => onRemoveHolding(pos.id)}
                            className="text-neutral-500 hover:text-rose-400 p-1 rounded hover:bg-rose-950/20 transition cursor-pointer"
                            title="Liquidate Position"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sector Allocation Graph visualizer */}
        <div className="bg-neutral-950/40 p-4 rounded border border-neutral-800 flex flex-col justify-between">
          <h3 className="text-gray-200 text-sm font-semibold mb-2">
            Asset Sector Diversification
          </h3>

          {positions.length === 0 ? (
            <div className="text-xs font-mono text-neutral-500 py-12 text-center">
              [PIE ALLOCATION CHART EMPTY - ACQUIRE ASSETS TO RENDER]
            </div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#e5e5e5' }}
                    formatter={(v) => [`$${v}`, 'Holding Allocation']}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', color: '#737373' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Manual order allocation builder */}
      <div className="bg-neutral-950/20 p-4 rounded border border-neutral-800">
        <h3 className="text-gray-200 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 font-mono">
          <PlusCircle size={14} className="text-emerald-500" />
          Acquire Portfolio Position (Simulate Order Entry)
        </h3>

        <form onSubmit={handleAddSubmit} className="flex flex-wrap items-end gap-4 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-mono text-neutral-500 mb-1">Asset Symbol</label>
            <select
              value={addSymbol}
              onChange={(e) => setAddSymbol(e.target.value)}
              className="bg-neutral-950 text-gray-200 border border-neutral-800 rounded p-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {stocks.map((s) => (
                <option key={s.symbol} value={s.symbol}>
                  {s.symbol} - ${s.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-neutral-500 mb-1">Position Type</label>
            <select
              value={addType}
              onChange={(e) => setAddType(e.target.value as 'LONG' | 'SHORT')}
              className="bg-neutral-950 text-gray-200 border border-neutral-800 rounded p-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="LONG">LONG (Buy / Spot)</option>
              <option value="SHORT">SHORT (Borrow Margin / Future)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-neutral-500 mb-1">Token Units</label>
            <input
              type="number"
              value={addUnits}
              onChange={(e) => setAddUnits(Math.max(1, Number(e.target.value)))}
              className="w-24 bg-neutral-950 text-gray-200 border border-neutral-800 rounded p-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-4 py-2 rounded transition duration-200 cursor-pointer text-xs"
          >
            Execute Order
          </button>
        </form>
      </div>

    </div>
  );
}
