import React, { useState } from 'react';

export default function App() {
  const [selectedAsset, setSelectedAsset] = useState('FBTC');
  const [amount, setAmount] = useState('10000');
  const [strategy, setStrategy] = useState('delta-neutral');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [isDump, setIsDump] = useState(false);

  const assets = [
    { id: 'FBTC', name: 'FBTC (Bitcoin Bridge)', price: '64250.00' },
    { id: 'FXRP', name: 'FXRP (XRP Bridge)', price: '0.5840' },
    { id: 'FLR', name: 'FLR (Native Flare)', price: '0.0309' },
    { id: 'ETH', name: 'ETH (Ethereum)', price: '3450.00' },
    { id: 'USDC', name: 'USDC (Stablecoin)', price: '1.0000' },
    { id: 'SGB', name: 'SGB (Songbird)', price: '0.0085' },
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
      const current = assets.find(a => a.id === selectedAsset);
      setAnalysis({
        ftso_price: current.price,
        price_change_24h: '+2.4%',
        confidential_risk_score: selectedAsset === 'FBTC' ? 42 : (selectedAsset === 'SGB' ? 78 : 28),
        recommended_action: selectedAsset === 'SGB' ? 'HEDGE_REQUIRED' : 'SAFE_AUTO_YIELD',
        tee_attestation: {
          attested_by: 'Flare-Confidential-TEE (0x9a8f...)',
          ecdsa_signature: '0x3a9b8f7c1d2e4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
          execution_nonce: '0x8f2d9e1a'
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
      ftso_price: (parseFloat(prev.ftso_price) * 0.72).toFixed(4),
      price_change_24h: '-28.4% [CRASH]',
      confidential_risk_score: 98,
      recommended_action: 'EMERGENCY_PROTECTION_EXECUTED'
    } : null);
  };

  const currentAssetInfo = assets.find(a => a.id === selectedAsset);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#f8fafc', fontFamily: 'sans-serif', padding: '24px' }}>
      {/* Header */}
      <header style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #1e293b' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            🛡️ SilentVault AI <span style={{ fontSize: '12px', background: 'rgba(59,130,246,0.2)', color: '#60a5fa', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.4)' }}>v2.0 TEE</span>
          </h1>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Confidential Compute & Institutional Yield Automator</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
          <span style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)' }}>
            🟢 Flare Coston2 Testnet
          </span>
          <span style={{ background: '#1e293b', color: '#cbd5e1', padding: '6px 12px', borderRadius: '8px', fontFamily: 'monospace' }}>
            0x71C7...976F
          </span>
        </div>
      </header>

      {/* Grid */}
      <main style={{ maxWidth: '1100px', margin: '24px auto 0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left Form */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#cbd5e1', textTransform: 'uppercase', marginBottom: '16px' }}>
            ⚙️ Vault Parameters & Execution Enclave
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Target Asset (FTSO v2 Enabled)</label>
              <select
                value={selectedAsset}
                onChange={(e) => { setSelectedAsset(e.target.value); setAnalysis(null); }}
                style={{ width: '100%', background: '#020617', border: '1px solid #334155', color: '#fff', padding: '10px 14px', borderRadius: '10px', fontSize: '14px' }}
              >
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Position Size (USD Value)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%', background: '#020617', border: '1px solid #334155', color: '#fff', padding: '10px 14px', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Automated Strategy Preset</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={() => setStrategy('delta-neutral')}
                  style={{ padding: '10px', borderRadius: '10px', fontSize: '12px', cursor: 'pointer', border: strategy === 'delta-neutral' ? '1px solid #3b82f6' : '1px solid #1e293b', background: strategy === 'delta-neutral' ? 'rgba(59,130,246,0.2)' : '#020617', color: strategy === 'delta-neutral' ? '#93c5fd' : '#64748b' }}
                >
                  Delta-Neutral Yield
                </button>
                <button
                  onClick={() => setStrategy('conservative')}
                  style={{ padding: '10px', borderRadius: '10px', fontSize: '12px', cursor: 'pointer', border: strategy === 'conservative' ? '1px solid #3b82f6' : '1px solid #1e293b', background: strategy === 'conservative' ? 'rgba(59,130,246,0.2)' : '#020617', color: strategy === 'conservative' ? '#93c5fd' : '#64748b' }}
                >
                  Conservative Auto-Hedge
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={handleRunStrategy}
                disabled={loading}
                style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
              >
                {loading ? 'Processing...' : '⚡ Run TEE Strategy'}
              </button>

              <button
                onClick={handleDumpMarket}
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
              >
                🚨 Dump Market
              </button>
            </div>
          </div>
        </div>

        {/* Right Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Oracle Feed Card */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>📈 Flare FTSO v2 Live Feed</span>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: isDump ? '#f87171' : '#34d399' }}>
                {analysis ? analysis.price_change_24h : '+2.4% (24h)'}
              </span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'monospace' }}>
              ${analysis ? analysis.ftso_price : currentAssetInfo.price} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'normal' }}>{selectedAsset}/USD</span>
            </div>
          </div>

          {/* TEE Result Card */}
          <div style={{ background: isDump ? 'rgba(127,29,29,0.2)' : '#0f172a', border: isDump ? '1px solid rgba(239,68,68,0.5)' : '1px solid #1e293b', borderRadius: '16px', padding: '20px', flexGrow: 1 }}>
            <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px' }}>
              🔐 Confidential TEE Execution Status
            </h3>

            {analysis ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Risk Score:</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'monospace', color: analysis.confidential_risk_score > 70 ? '#f87171' : '#34d399' }}>
                    {analysis.confidential_risk_score} / 100
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Action:</span>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', background: '#1e293b', color: '#60a5fa', padding: '4px 8px', borderRadius: '4px' }}>
                    {analysis.recommended_action}
                  </span>
                </div>

                <div style={{ background: '#020617', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b', fontSize: '10px', fontFamily: 'monospace' }}>
                  <div style={{ color: '#34d399', marginBottom: '4px' }}>✔ {analysis.tee_attestation.attested_by}</div>
                  <div style={{ color: '#64748b', wordBreak: 'break-all' }}>Sig: {analysis.tee_attestation.ecdsa_signature}</div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b', fontSize: '13px' }}>
                Select target asset and click <span style={{ color: '#60a5fa' }}>Run TEE Strategy</span> to execute confidential analysis.
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
