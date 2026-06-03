/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertTrigger, Strategy } from '../types';
import { ShieldAlert, AlertCircle, Bell, Key, Plus, Trash, HelpCircle, HardDrive, Cpu, Smartphone } from 'lucide-react';

interface SettingsPanelProps {
  alerts: AlertTrigger[];
  onAddAlert: (alert: AlertTrigger) => void;
  onRemoveAlert: (id: string) => void;
  strategies: Strategy[];
}

export default function SettingsPanel({
  alerts,
  onAddAlert,
  onRemoveAlert,
  strategies,
}: SettingsPanelProps) {
  // Local state for broker mock connections
  const [broker, setBroker] = useState<string>('alpaca');
  const [apiKey, setApiKey] = useState<string>('**********************');
  const [apiSecret, setApiSecret] = useState<string>('**********************');
  const [isBrokerConnected, setIsBrokerConnected] = useState<boolean>(true);

  // Local states for custom alert triggers
  const [alertSymbol, setAlertSymbol] = useState<string>('AAPL');
  const [alertMetric, setAlertMetric] = useState<AlertTrigger['metric']>('PRICE_BELOW');
  const [alertValue, setAlertValue] = useState<number>(180);
  const [alertChannel, setAlertChannel] = useState<'telegram' | 'email' | 'push'>('telegram');

  // Telegram Mock handle state
  const [telegramUsername, setTelegramUsername] = useState<string>('@QuantTradingBot');
  const [isTelegramConnected, setIsTelegramConnected] = useState<boolean>(true);

  const handleConnectBroker = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBrokerConnected(!isBrokerConnected);
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: AlertTrigger = {
      id: 'alert-' + Date.now(),
      symbol: alertSymbol,
      metric: alertMetric,
      value: alertValue,
      channels: [alertChannel],
      isActive: true,
    };
    onAddAlert(newAlert);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 font-sans space-y-6">
      
      {/* Risk Warnings Disclosure Notice - MANDATORY HIGHEST DESIGNED PRIORITY */}
      <div className="bg-rose-950/20 border border-rose-900/60 p-4.5 rounded text-neutral-300 text-xs leading-relaxed space-y-2 font-mono">
        <h3 className="text-rose-450 font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
          <ShieldAlert size={16} />
          Mandatory Financial Risk Disclaimers & Disclosures
        </h3>
        <p className="text-gray-400">
          Algorithmic and automated high-frequency trading involves substantial risk of ruin and is not appropriate for all investors. Capital market operations can fluctuate extremely quickly resulting in sudden, irreversible financial damage.
        </p>
        <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-500">
          <li><strong>Paper Trading Sandbox:</strong> By default, this terminal initiates all transactions in Paper Demonstration mode. No real capital coordinates are placed.</li>
          <li><strong>Systemic Slippage:</strong> Algorithmic calculations do not guarantee real-world price points due to network latency, market gaps, volume density shifts and broker API execution limits.</li>
          <li><strong>Indicator Fallibility:</strong> Historical technical oscillators (RSI, MACD, Bollinger Bands) show historic pathways and are not predictive of future trend changes.</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* API Broker Integrations Column */}
        <div className="space-y-4">
          <div className="bg-neutral-950 p-4 rounded border border-neutral-850">
            <h3 className="text-gray-200 text-sm font-semibold mb-3 flex items-center gap-2">
              <Key size={16} className="text-emerald-500" />
              Institutional Broker API Access keys
            </h3>

            <form onSubmit={handleConnectBroker} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-mono text-neutral-500 mb-1">Brokerage desk</label>
                <select
                  value={broker}
                  onChange={(e) => setBroker(e.target.value)}
                  className="w-full bg-neutral-900 text-gray-200 border border-neutral-800 rounded p-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="alpaca">Alpaca Pro API (Zero-Commission)</option>
                  <option value="interactive">Interactive Brokers (TWS / Gateway)</option>
                  <option value="zerodha">Zerodha Kite (Indian equities)</option>
                  <option value="angel">Angel One SmartAPI</option>
                  <option value="upstox">Upstox developer API</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-neutral-500 mb-1">Developer API Key</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-neutral-900 text-gray-200 border border-neutral-800 rounded p-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-neutral-500 mb-1">Signing Client Secret</label>
                <input
                  type="password"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  className="w-full bg-neutral-900 text-gray-200 border border-neutral-800 rounded p-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-500">
                  <span className={`h-2.5 w-2.5 rounded-full ${isBrokerConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  Status: {isBrokerConnected ? 'API Connected (Demo Mode)' : 'Disconnected'}
                </span>

                <button
                  type="submit"
                  className={`px-4 py-2 rounded text-xs font-semibold cursor-pointer transition ${
                    isBrokerConnected ? 'bg-rose-950/40 text-rose-450 hover:bg-rose-900/30' : 'bg-emerald-500 text-black hover:bg-emerald-600'
                  }`}
                >
                  {isBrokerConnected ? 'Revoke Connection' : 'Verify Credentials'}
                </button>
              </div>
            </form>
          </div>

          {/* Telegram Settings Section */}
          <div className="bg-neutral-950 p-4 rounded border border-neutral-850">
            <h3 className="text-gray-200 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
              <Smartphone size={14} className="text-cyan-400" />
              Telegram Bot Integration Configuration
            </h3>

            <div className="space-y-2 text-xs">
              <p className="text-neutral-450 leading-relaxed font-mono">
                Connect your Telegram account to receive real-time trading signals, portfolio updates, and market alarms.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <span className="bg-neutral-900 border border-neutral-800 p-1 rounded text-[10px] font-mono text-neutral-450 text-center">/portfolio</span>
                <span className="bg-neutral-900 border border-neutral-800 p-1 rounded text-[10px] font-mono text-neutral-450 text-center">/signal</span>
                <span className="bg-neutral-900 border border-neutral-800 p-1 rounded text-[10px] font-mono text-neutral-450 text-center">/watchlist</span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="text"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  placeholder="@MyTradingBotHandle"
                  className="flex-1 bg-neutral-900 text-gray-200 border border-neutral-800 rounded p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setIsTelegramConnected(!isTelegramConnected)}
                  className={`px-3 py-2 rounded text-xs font-semibold font-mono ${
                    isTelegramConnected ? 'bg-cyan-950 text-cyan-400' : 'bg-neutral-800 text-gray-400'
                  }`}
                >
                  {isTelegramConnected ? 'Bot Active' : 'Start session'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Alert system settings Column */}
        <div className="space-y-4">
          <div className="bg-neutral-950 p-4 rounded border border-neutral-850">
            <h3 className="text-gray-200 text-sm font-semibold mb-3 flex items-center gap-2">
              <Bell size={16} className="text-emerald-500" />
              Mechanical Threshold Alarms
            </h3>

            <form onSubmit={handleCreateAlert} className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
              <div className="col-span-1">
                <label className="block text-[10px] uppercase font-mono text-neutral-500 mb-1">Asset</label>
                <select
                  value={alertSymbol}
                  onChange={(e) => setAlertSymbol(e.target.value)}
                  className="w-full bg-neutral-900 text-gray-200 border border-neutral-800 rounded p-2 outline-none"
                >
                  <option value="AAPL">AAPL</option>
                  <option value="NVDA">NVDA</option>
                  <option value="TSLA">TSLA</option>
                  <option value="BTC-USD">BTC</option>
                  <option value="EUR-USD">EUR</option>
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-[10px] uppercase font-mono text-neutral-500 mb-1">Trigger Metric</label>
                <select
                  value={alertMetric}
                  onChange={(e) => setAlertMetric(e.target.value as any)}
                  className="w-full bg-neutral-900 text-gray-200 border border-neutral-800 rounded p-2 outline-none"
                >
                  <option value="PRICE_BELOW">Under price</option>
                  <option value="PRICE_ABOVE">Over price</option>
                  <option value="SIGNAL_CHANGE">Signal change</option>
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-[10px] uppercase font-mono text-neutral-500 mb-1">Trigger Value</label>
                <input
                  type="number"
                  value={alertValue}
                  onChange={(e) => setAlertValue(Number(e.target.value))}
                  className="w-full bg-neutral-900 text-gray-200 border border-neutral-800 rounded p-2 outline-none"
                />
              </div>

              <div className="col-span-1 flex items-end">
                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-2 rounded text-xs flex items-center justify-center gap-0.5 cursor-pointer"
                >
                  <Plus size={13} />
                  Add Alarm
                </button>
              </div>
            </form>

            {/* List alert triggers */}
            <div className="space-y-2">
              <span className="block text-[10px] uppercase font-mono text-neutral-500 mb-1">Configured Triggers</span>
              {alerts.length === 0 ? (
                <div className="text-[11px] font-mono text-neutral-550 border border-dashed border-neutral-850 rounded p-4 text-center">
                  [NO TRIGGERS CONFIGURED]
                </div>
              ) : (
                <div className="space-y-1.5 font-mono text-xs">
                  {alerts.map((al) => (
                    <div
                      key={al.id}
                      className="bg-neutral-900 p-2.5 rounded border border-neutral-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-200 font-bold">{al.symbol}</span>
                        <span className="text-neutral-500">|</span>
                        <span className="text-gray-400">
                          {al.metric.replace('_', ' ')}: {al.value}
                        </span>
                        <span className="text-neutral-500">•</span>
                        <span className="text-cyan-400 font-mono text-[10px]">
                          {al.channels[0]}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemoveAlert(al.id)}
                        className="text-neutral-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
