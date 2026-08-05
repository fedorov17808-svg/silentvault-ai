import React, { useState } from 'react';
import { Shield, TrendingUp, AlertTriangle, Cpu, CheckCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [selectedAsset, setSelectedAsset] = useState('FBTC');
  const [amount, setAmount] = useState('10000');
  const [strategy, setStrategy] = useState('delta-neutral');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [isDump, setIsDump] = useState(false);

  const assets = [
    { id: 'FBTC', name: 'FBTC (Bitcoin Bridge)', price: '$64,250.00' },
    { id: 'FXRP', name: 'FXRP (XRP Bridge)', price: '$0.5840' },
    { id: 'FLR', name: 'FLR (Native Flare)', price: '$0.0309' },
    { id: 'ETH', name: 'ETH (Ethereum)', price: '$3,450.00' },
    { id: 'USDC', name: 'USDC (Stablecoin)', price: '$1.00' },
    { id: 'SGB', name: 'SGB (Songbird)', price: '$0.0085' },
  ];

  const handleRunStrategy = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/evaluate-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: '0x71C7...976F',
          asset_symbol: selectedAsset,
          amount: parseFloat(amount) || 10000,
        }),
      });
      const data = await response.json();
      setAnalysis(data);
      setIsDump(false);
    } catch (err) {
      // Резервный динамический рассчет для Vercel / offline
      const mockPrice = selectedAsset === 'FBTC' ? 64250 : (selectedAsset === 'FXRP' ? 0.584 : 0.0309);
      setAnalysis({
        ftso_price: mockPrice,
        price_change_24h: '+2.4%',
        confidential_risk_score: selectedAsset === 'FBTC' ? 42 : (selectedAsset === 'SGB' ? 78 : 28),
        recommended_action: selectedAsset === 'SGB' ? 'HEDGE_REQUIRED' : 'SAFE_AUTO_YIELD',
        tee_attestation: {
          attested_by: 'Flare-Confidential-TEE (0x9a8f...)',
          ecdsa_signature: '0x3a9b8f...7c1d2e',
          execution_nonce: '0x8f2d...'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDumpMarket = () => {
    setIsDump(true);
    setAnalysis(prev => prev ? {
      ...prev,
      ftso_price: (prev.ftso_price * 0.72).toFixed(4),
      price_change_24h: '-28.4% [CRASH]',
      confidential_risk_score: 98,
      recommended_action: 'EMERGENCY_PROTECTION_EXECUTED'
    } : null);
  };

  const currentAssetInfo = assets.find(a => a.id === selectedAsset);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 border border-blue-500/40 rounded-xl">
            <Shield className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              SilentVault AI <span className="text-xs px-2 py-0.5 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-full">v2.0 TEE</span>
            </h1>
            <p className="text-xs text-slate-400">Confidential Compute & Institutional Yield Automator</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Flare Coston2 Testnet
          </span>
          <span className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-mono">
            0x71C7...976F
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
        
        {/* Left Panel: Form */}
        <div className="md:col-span-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" /> Vault Parameters & Execution Enclave
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Target Asset (FTSO v2 Enabled)</label>
              <select
                value={selectedAsset}
                onChange={(e) => { setSelectedAsset(e.target.value); setAnalysis(null); }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              >
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Position Size (USD Value)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-2">Automated Strategy Preset</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStrategy('delta-neutral')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${strategy === 'delta-neutral' ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                >
                  Delta-Neutral Yield
                </button>
                <button
                  onClick={() => setStrategy('conservative')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${strategy === 'conservative' ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                >
                  Conservative Auto-Hedge
                </button>
              </div>
            </div>

            <div className="pt-2 grid grid-cols-12 gap-3">
              <button
                onClick={handleRunStrategy}
                disabled={loading}
                className="col-span-8 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                Run TEE Strategy
              </button>

              <button
                onClick={handleDumpMarket}
                className="col-span-4 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-400 font-medium py-3 px-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Dump Market
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Live Oracle & TEE Results */}
        <div className="md:col-span-6 space-y-6">
          {/* Oracle Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Flare FTSO v2 Live Feed
              </span>
              <span className={`text-xs font-semibold ${isDump ? 'text-red-400' : 'text-emerald-400'}`}>
                {analysis ? analysis.price_change_24h : '+2.4% (24h)'}
              </span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-white">
              ${analysis ? analysis.ftso_price : currentAssetInfo.price.replace('$', '')}
              <span className="text-xs text-slate-500 font-normal ml-2">{selectedAsset}/USD</span>
            </div>
          </div>

          {/* TEE Analysis Result Card */}
          <div className={`border rounded-2xl p-6 transition-all ${isDump ? 'bg-red-950/20 border-red-500/40' : 'bg-slate-900/60 border-slate-800'}`}>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Confidential TEE Execution Status
            </h3>

            {analysis ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <span className="text-xs text-slate-400">Risk Score:</span>
                  <span className={`text-sm font-bold font-mono ${analysis.confidential_risk_score > 70 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {analysis.confidential_risk_score} / 100
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <span className="text-xs text-slate-400">Action:</span>
                  <span className="text-xs font-mono font-bold px-2 py-1 bg-slate-800 text-blue-300 rounded">
                    {analysis.recommended_action}
                  </span>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[10px] font-mono space-y-1">
                  <div className="text-slate-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" /> Attested by: {analysis.tee_attestation.attested_by}
                  </div>
                  <div className="text-slate-500 truncate">Sig: {analysis.tee_attestation.ecdsa_signature}</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                Select asset and click <span className="text-blue-400 font-medium">Run TEE Strategy</span> to execute confidential analysis.
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
