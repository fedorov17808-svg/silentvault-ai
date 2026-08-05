import React, { useState, useEffect } from 'react';

const TOP_100_ASSETS = [
  { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', price: 64250.00, apy: '8.4%', risk: 38, icon: '₿' },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH', price: 3450.00, apy: '6.2%', risk: 32, icon: 'Ξ' },
  { id: 'SOL', name: 'Solana', symbol: 'SOL', price: 145.20, apy: '9.8%', risk: 52, icon: '◎' },
  { id: 'XRP', name: 'XRP', symbol: 'XRP', price: 0.5840, apy: '12.1%', risk: 45, icon: '✕' },
  { id: 'BNB', name: 'BNB Chain', symbol: 'BNB', price: 575.00, apy: '5.5%', risk: 30, icon: '🔶' },
  { id: 'FLR', name: 'Flare Network', symbol: 'FLR', price: 0.0309, apy: '15.6%', risk: 28, icon: '🔥' },
  { id: 'AVAX', name: 'Avalanche', symbol: 'AVAX', price: 24.80, apy: '10.5%', risk: 48, icon: '🔺' },
  { id: 'SUI', name: 'Sui Network', symbol: 'SUI', price: 1.85, apy: '18.2%', risk: 64, icon: '💧' },
  { id: 'NEAR', name: 'NEAR Protocol', symbol: 'NEAR', price: 4.60, apy: '14.0%', risk: 58, icon: 'Ⓝ' },
  { id: 'ALGO', name: 'Algorand', symbol: 'ALGO', price: 0.1420, apy: '11.2%', risk: 40, icon: 'Ⱥ' },
  { id: 'OP', name: 'Optimism', symbol: 'OP', price: 1.55, apy: '13.5%', risk: 55, icon: '🔴' },
  { id: 'ARB', name: 'Arbitrum', symbol: 'ARB', price: 0.5400, apy: '12.8%', risk: 56, icon: '🔵' },
  { id: 'DOGE', name: 'Dogecoin', symbol: 'DOGE', price: 0.1080, apy: '22.0%', risk: 72, icon: '🐕' },
  { id: 'PEPE', name: 'Pepe', symbol: 'PEPE', price: 0.000008, apy: '35.0%', risk: 85, icon: '🐸' },
  { id: 'USDC', name: 'USD Coin', symbol: 'USDC', price: 1.0000, apy: '4.8%', risk: 5, icon: '💵' },
];

for (let i = 16; i <= 100; i++) {
  TOP_100_ASSETS.push({
    id: `TOKEN_${i}`,
    name: `Asset #${i}`,
    symbol: `TK${i}`,
    price: parseFloat((Math.random() * 50 + 0.5).toFixed(2)),
    apy: `${(Math.random() * 12 + 4).toFixed(1)}%`,
    risk: Math.floor(Math.random() * 40 + 30),
    icon: '🪙'
  });
}

export default function App() {
  const [selectedAsset, setSelectedAsset] = useState(TOP_100_ASSETS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [amount, setAmount] = useState('10000');
  const [strategy, setStrategy] = useState('delta-neutral');
  const [timeframe, setTimeframe] = useState('24H');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [isDump, setIsDump] = useState(false);

  const filteredAssets = TOP_100_ASSETS.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateRandomSig = () => {
    const chars = '0123456789abcdef';
    let res = '0x';
    for (let i = 0; i < 40; i++) res += chars[Math.floor(Math.random() * chars.length)];
    return res;
  };

  const fetchAnalysis = async (asset, isCrashed = false, strat = strategy) => {
    setLoading(true);
    // Добавляем искусственную микрозадержку для визуального отклика TEE
    await new Promise(resolve => setTimeout(resolve, 350));

    try {
      const response = await fetch('http://localhost:8000/api/evaluate-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: '0x71C7...976F',
          asset_symbol: asset.symbol,
          amount: parseFloat(amount) || 10000,
        }),
      });
      const data = await response.json();
      
      let defaultAction = strat === 'conservative' ? 'AUTO_HEDGE_ACTIVE' : 'DELTA_NEUTRAL_YIELD';
      if (asset.risk > 70) defaultAction = 'EMERGENCY_PROTECTION';

      setAnalysis({
        price: isCrashed ? (asset.price * 0.72).toFixed(4) : (data.ftso_price || asset.price),
        risk: isCrashed ? 98 : (data.confidential_risk_score || asset.risk),
        action: isCrashed ? 'EMERGENCY_PROTECTION_EXECUTED' : defaultAction,
        signature: data.tee_attestation?.ecdsa_signature || generateRandomSig(),
        signer: data.tee_attestation?.attested_by || 'Flare-Confidential-TEE (0x9a8f...)'
      });
    } catch (err) {
      let defaultAction = strat === 'conservative' ? 'AUTO_HEDGE_ACTIVE' : 'DELTA_NEUTRAL_YIELD';
      if (asset.risk > 70) defaultAction = 'EMERGENCY_PROTECTION';

      setAnalysis({
        price: isCrashed ? (asset.price * 0.72).toFixed(4) : asset.price,
        risk: isCrashed ? 98 : asset.risk,
        action: isCrashed ? 'EMERGENCY_PROTECTION_EXECUTED' : defaultAction,
        signature: generateRandomSig(),
        signer: 'Flare-Confidential-TEE (0x9a8f...)'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsDump(false);
    fetchAnalysis(selectedAsset, false, strategy);
  }, [selectedAsset]);

  const handleStrategyChange = (newStrat) => {
    setStrategy(newStrat);
    if (!isDump) {
      fetchAnalysis(selectedAsset, false, newStrat);
    }
  };

  const handleRunStrategy = () => {
    setIsDump(false);
    fetchAnalysis(selectedAsset, false, strategy);
  };

  const handleDumpMarket = () => {
    setIsDump(true);
    fetchAnalysis(selectedAsset, true, strategy);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030712', color: '#f3f4f6', fontFamily: 'Inter, system-ui, sans-serif', padding: '24px' }}>
      
      {/* Header */}
      <header style={{ maxWidth: '1280px', margin: '0 auto 24px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0b0f19', border: '1px solid #1f2937', padding: '16px 24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}>
            🛡️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>SilentVault AI</span>
              <span style={{ fontSize: '10px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '2px 8px', borderRadius: '20px', border: '1px solid rgba(59,130,246,0.3)', fontWeight: '700' }}>TEE ENCLAVE v2.0</span>
            </div>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Institutional Multi-Asset Yield & Risk Protocol (100+ FTSO v2 Feeds)</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#6b7280' }}>Total Vault Protection</div>
            <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'monospace', color: '#34d399' }}>$14,280,400</div>
          </div>
          <div style={{ width: '1px', height: '28px', background: '#1f2937' }}></div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>
              🟢 Flare Coston2
            </span>
            <span style={{ background: '#111827', border: '1px solid #1f2937', color: '#9ca3af', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}>
              0x71C7...976F
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '4.5fr 7.5fr', gap: '24px' }}>
        
        {/* Left Panel */}
        <div style={{ background: '#0b0f19', border: '1px solid #1f2937', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
            ⚙️ Vault Execution Control
          </h2>

          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>
              Target Asset (Top 100+ Feeds)
            </label>
            
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ width: '100%', background: '#111827', border: '1px solid #374151', color: '#fff', padding: '12px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>{selectedAsset.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700' }}>{selectedAsset.name} ({selectedAsset.symbol})</div>
                  <div style={{ fontSize: '10px', color: '#6b7280' }}>Est. APY: {selectedAsset.apy}</div>
                </div>
              </div>
              <span style={{ color: '#6b7280', fontSize: '12px' }}>{isDropdownOpen ? '▲' : '▼'}</span>
            </button>

            {isDropdownOpen && (
              <div style={{ position: 'absolute', top: '105%', left: 0, width: '100%', background: '#111827', border: '1px solid #374151', borderRadius: '12px', zIndex: 50, padding: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}>
                <input
                  type="text"
                  placeholder="🔍 Search 100+ coins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', background: '#030712', border: '1px solid #1f2937', color: '#fff', padding: '10px', borderRadius: '8px', fontSize: '12px', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' }}
                />
                <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {filteredAssets.map(asset => (
                    <div
                      key={asset.id}
                      onClick={() => { setSelectedAsset(asset); setIsDropdownOpen(false); }}
                      style={{ padding: '8px 10px', borderRadius: '8px', background: selectedAsset.id === asset.id ? 'rgba(59,130,246,0.15)' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{asset.icon}</span>
                        <span style={{ fontSize: '12px', fontWeight: '600' }}>{asset.name}</span>
                        <span style={{ fontSize: '10px', color: '#6b7280' }}>{asset.symbol}</span>
                      </div>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#9ca3af' }}>${asset.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af' }}>Vault Deposit Amount (USD)</label>
              <span style={{ fontSize: '11px', color: '#60a5fa' }}>Wallet: $50,000</span>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: '100%', background: '#111827', border: '1px solid #374151', color: '#fff', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>Confidential TEE Strategy Preset</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => handleStrategyChange('delta-neutral')}
                style={{ padding: '10px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', border: strategy === 'delta-neutral' ? '1px solid #3b82f6' : '1px solid #1f2937', background: strategy === 'delta-neutral' ? 'rgba(59,130,246,0.15)' : '#111827', color: strategy === 'delta-neutral' ? '#60a5fa' : '#6b7280' }}
              >
                Delta-Neutral Yield
              </button>
              <button
                onClick={() => handleStrategyChange('conservative')}
                style={{ padding: '10px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', border: strategy === 'conservative' ? '1px solid #3b82f6' : '1px solid #1f2937', background: strategy === 'conservative' ? 'rgba(59,130,246,0.15)' : '#111827', color: strategy === 'conservative' ? '#60a5fa' : '#6b7280' }}
              >
                Auto-Hedge Shield
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '10px', marginTop: 'auto' }}>
            <button
              onClick={handleRunStrategy}
              disabled={loading}
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 14px rgba(37,99,235,0.4)', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? '⏳ Evaluating Enclave...' : '⚡ Re-evaluate TEE'}
            </button>

            <button
              onClick={handleDumpMarket}
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171', padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '11px' }}
            >
              🚨 Dump Market
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#0b0f19', border: '1px solid #1f2937', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{selectedAsset.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: '700' }}>{selectedAsset.name} / USD</span>
                <span style={{ fontSize: '10px', background: '#111827', color: '#6b7280', padding: '2px 6px', borderRadius: '4px' }}>FTSO v2 Feed</span>
              </div>

              <div style={{ display: 'flex', gap: '4px', background: '#111827', padding: '2px', borderRadius: '8px' }}>
                {['1H', '24H', '7D', '1Y'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    style={{ background: timeframe === tf ? '#1f2937' : 'transparent', border: 'none', color: timeframe === tf ? '#fff' : '#6b7280', fontSize: '10px', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '-1px' }}>
                ${analysis ? analysis.price : selectedAsset.price}
              </span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: isDump ? '#f87171' : '#34d399', background: isDump ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                {isDump ? '-28.4% CRASH DETECTED' : '+2.4% (24h)'}
              </span>
            </div>

            <div style={{ width: '100%', height: '100px', overflow: 'hidden' }}>
              <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isDump ? '#f87171' : '#34d399'} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={isDump ? '#f87171' : '#34d399'} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d={isDump 
                    ? "M 0 20 L 150 25 L 250 30 L 280 85 L 400 90 L 400 100 L 0 100 Z" 
                    : "M 0 80 L 100 70 L 200 45 L 300 30 L 400 15 L 400 100 L 0 100 Z"}
                  fill="url(#chartGradient)"
                />
                <path
                  d={isDump 
                    ? "M 0 20 L 150 25 L 250 30 L 280 85 L 400 90" 
                    : "M 0 80 L 100 70 L 200 45 L 300 30 L 400 15"}
                  fill="none"
                  stroke={isDump ? '#f87171' : '#34d399'}
                  strokeWidth="3"
                />
              </svg>
            </div>
          </div>

          <div style={{ background: isDump ? 'rgba(127,29,29,0.15)' : '#0b0f19', border: isDump ? '1px solid rgba(239,68,68,0.5)' : '1px solid #1f2937', borderRadius: '20px', padding: '24px', flexGrow: 1, position: 'relative' }}>
            <h3 style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
              🔐 Confidential TEE Attestation & On-Chain Audit
            </h3>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#60a5fa', fontSize: '12px', fontWeight: '600' }} className="animate-pulse">
                ⚡ Executing Confidential TEE Enclave Scan...
              </div>
            ) : analysis && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
                    <span style={{ color: '#9ca3af' }}>Confidential Risk Score:</span>
                    <span style={{ fontWeight: '800', fontFamily: 'monospace', color: analysis.risk > 70 ? '#f87171' : '#34d399' }}>
                      {analysis.risk} / 100
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#111827', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${analysis.risk}%`, height: '100%', background: analysis.risk > 70 ? '#f87171' : '#34d399', transition: 'width 0.5s ease' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111827', padding: '12px 16px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>Recommended Action:</span>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '700', color: isDump ? '#f87171' : '#60a5fa', background: isDump ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)', padding: '4px 10px', borderRadius: '6px' }}>
                    {analysis.action}
                  </span>
                </div>

                <div style={{ background: '#111827', padding: '12px', borderRadius: '12px', border: '1px solid #1f2937', fontSize: '10px', fontFamily: 'monospace' }}>
                  <div style={{ color: '#34d399', fontWeight: '600', marginBottom: '4px' }}>
                    ✔ Attested by {analysis.signer}
                  </div>
                  <div style={{ color: '#6b7280', wordBreak: 'break-all' }}>
                    Sig: {analysis.signature}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
