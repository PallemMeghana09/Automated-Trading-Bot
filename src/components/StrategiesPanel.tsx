/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Strategy } from '../types';
import { Plus, ToggleLeft, ToggleRight, Settings, Braces, Code, CheckCircle } from 'lucide-react';

interface StrategiesPanelProps {
  strategies: Strategy[];
  onToggleStrategy: (id: string) => void;
  onAddCustomStrategy: (strategy: Strategy) => void;
}

export default function StrategiesPanel({
  strategies,
  onToggleStrategy,
  onAddCustomStrategy,
}: StrategiesPanelProps) {
  // Custom Strategy state variables
  const [newName, setNewName] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [customRsiVal, setCustomRsiVal] = useState<number>(30);
  const [customSmaVal, setCustomSmaVal] = useState<number>(20);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDesc.trim()) return;

    const customStrat: Strategy = {
      id: 'custom-' + Date.now(),
      name: newName,
      description: newDesc,
      type: 'custom',
      status: 'INACTIVE',
      parameters: {
        rsiThreshold: customRsiVal,
        smaFilter: customSmaVal,
      },
      rules: [
        `Trigger buy allocation when Relative Strength (RSI) falls severely below ${customRsiVal}`,
        `Verify trade direction matches upward sloping ${customSmaVal}-day SMA filters.`,
        'Exit targets: 4.5% rigid trailing trailing stop execution',
      ],
    };

    onAddCustomStrategy(customStrat);
    setNewName('');
    setNewDesc('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 font-sans space-y-6">
      
      <div>
        <h2 className="text-gray-200 text-sm font-semibold mb-1 flex items-center gap-2">
          <Settings size={16} className="text-emerald-400" />
          Quant Bot Trading Algorithms
        </h2>
        <p className="text-xs text-neutral-500 font-mono">
          Configure active parameter variables or toggle robot execution statuses.
        </p>
      </div>

      {/* Strategies Directory List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strategies.map((strat) => (
          <div
            key={strat.id}
            className={`p-4 rounded border transition duration-200 ${
              strat.status === 'ACTIVE'
                ? 'bg-emerald-950/20 border-emerald-900/50 hover:bg-emerald-950/30'
                : 'bg-neutral-950 border-neutral-850 hover:bg-neutral-950/80'
            }`}
          >
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-gray-200 text-xs font-mono font-bold">{strat.name}</span>
              <button
                onClick={() => onToggleStrategy(strat.id)}
                className="text-neutral-400 hover:text-white transition cursor-pointer"
                title={strat.status === 'ACTIVE' ? 'Pause bot' : 'Deploy bot'}
              >
                {strat.status === 'ACTIVE' ? (
                  <ToggleRight size={28} className="text-emerald-400" />
                ) : (
                  <ToggleLeft size={28} className="text-neutral-600" />
                )}
              </button>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">
              {strat.description}
            </p>

            {/* Rules guidelines */}
            <div className="bg-neutral-950/60 p-2.5 rounded border border-neutral-900">
              <span className="block text-[9px] uppercase font-mono text-neutral-500 mb-1">Algorithmic Code Block</span>
              <ul className="text-[10px] space-y-1 list-disc pl-3 text-neutral-400 font-mono">
                {strat.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Structured custom strategy builder */}
      <div className="bg-neutral-950 p-4 rounded border border-neutral-800">
        <h3 className="text-gray-200 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 font-mono">
          <Braces size={14} className="text-emerald-400 font-bold" />
          Proprietary Strategy Blueprint Builder
        </h3>

        {showSuccess && (
          <div className="bg-emerald-950/40 text-emerald-400 border border-emerald-900 p-2.5 rounded text-xs mb-3 flex items-center gap-2 font-mono">
            <CheckCircle size={14} />
            [SUCCESS] Strategy code Compiled! Added to Quant bot directory.
          </div>
        )}

        <form onSubmit={handleCreateCustom} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-mono text-neutral-500 mb-1">Strategy ID Identifier</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Bollinger-RSI Oscillator"
                className="w-full bg-neutral-950 text-gray-200 border border-neutral-800 rounded p-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono text-neutral-500 mb-1">Brief Algorithmic Summary</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Buy on oversold metrics and track momentum triggers"
                className="w-full bg-neutral-950 text-gray-200 border border-neutral-800 rounded p-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-mono text-neutral-500 mb-1">RSI Threshold Filter ({customRsiVal})</label>
              <input
                type="range"
                min="10"
                max="50"
                value={customRsiVal}
                onChange={(e) => setCustomRsiVal(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-850 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono text-neutral-500 mb-1">SMA Trend filter length ({customSmaVal} days)</label>
              <input
                type="range"
                min="5"
                max="100"
                value={customSmaVal}
                onChange={(e) => setCustomSmaVal(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-850 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs px-4 py-2 rounded transition flex items-center gap-1 cursor-pointer"
          >
            <Plus size={14} />
            Compile Custom Rules
          </button>
        </form>
      </div>

    </div>
  );
}
