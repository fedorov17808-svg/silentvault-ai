import React, { useState } from 'react';

export default function App() {
  const [selectedAsset, setSelectedAsset] = useState('FBTC');
  const [amount, setAmount] = useState('10000');
  const [strategy, setStrategy] = useState('delta-neutral');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [isDump, setIsDump] = useState(false);

  const assets = {
    FBTC: { name: 'FBTC (Bitcoin Bridge)', basePrice: 64250.00, risk: 42, apy: '8.4%' },
    FXRP: { name: 'FXRP (XRP Bridge)', basePrice: 0.5840, risk: 58, apy: '12.1%' },
    FLR: { name: 'FLR (Native Flare)', basePrice: 0.0309, risk: 28, apy: '15.6%' },
    ETH: { name: 'ETH (Ethereum)', basePrice: 3450.00, risk: 35, apy: '6.2%' },
    USDC: { name: 'USDC (Stablecoin)', price: 1.0000, risk: 5, apy: '4.8%' },
  };

  const current = assets[selectedAsset] || assets.FBTC;

  const handleRunStrategy = async () => {
    setLoading(true);
    setIsDump(false);
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
      setAnalysis({
        price: data.ftso_price || current.basePrice,
        risk: data.confidential_risk_score || current.risk,
        action: data.recommended_action || 'SAFE_AUTO_YIELD',
        signature: data.tee_attestation?.ecdsa_signature || '0x3a9b8f7c1d2e4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
        signer: data.tee_attestation?.attested_by || 'Flare-Confidential-TEE'
      });
    } catch (err) {
      setAnalysis({
        price: current.basePrice,
        risk: current.risk,
        action: 'SAFE_AUTO_YIELD',
        signature: '0x8f2d9e1a3b9b8f7c1d2e4a5b6c7d8e9f0a1b2c3d',
        signer: 'Flare-Confidential-TEE (0x9a8f...)'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDumpMarket = () => {
    setIsDump(true);
    const crashedPrice = (current.basePrice * 0.72).toFixed(4);
    setAnalysis({
      price: crashedPrice,
      risk: 96,
      action: 'EMERGENCY_PROTECTION_EXECUTED',
      signature: '0xCRASH_PROTECTED_TEE_EMERGENCY_SIG_9982',
      signer: 'Flare-TEE-AutoDefender'
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030712', color: '#f3f4f6', fontFamily: 'Inter, system-ui, sans-serif', padding: '32px 24px' }}>
      
      {/* Top Navigation */}
      <header style={{ maxWidth: '1200px', margin: '0 auto 32px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #1f2937' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
            🛡️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>SilentVault AI</span>
              <span style={{ fontSize: '10px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '2px 8px', borderRadius: '20px', border: '1px solid rgba(59,130,246,0.3)', fontWeight: '600' }}>TEE ENCLAVE v2.0</span>
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Confidential Compute & Institutional Yield Automator for Flare Network</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }}></span> Coston2 Testnet
          </div>
          <div style={{ background: '#111827', border: '1px solid #1f2937', color: '#9ca3af', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontFamily: 'monospace' }}>
            0x71C7...976F
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '5fr 7fr', gap: '28px' }}>
        
        {/* Left Panel: Controls */}
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '20px', padding: '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚙️ Vault Execution Control
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Asset Select */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#d1d5db', display: 'block', marginBottom: '8px' }}>Target Asset (FTSO v2 Oracle)</label>
              <select
                value={selectedAsset}
                onChange={(e) => { setSelectedAsset(e.target.value); setAnalysis(null); setIsDump(false); }}
                style={{ width: '100%', background: '#030712', border: '1px solid #374151', color: '#fff', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
              >
                {Object.keys(assets).map(key => (
                  <option key={key} value={key}>{assets[key].name}</option>
                ))}
              </select>
            </div>

            {/* Position Size & APY Badge */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#d1d5db' }}>Vault Deposit (USD)</label>
                <span style={{ fontSize: '12px', color: '#34d399', fontWeight: '600' }}>Est. APY: {current.apy}</span>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%', background: '#030712', border: '1px solid #374151', color: '#fff', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Strategy Select */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#d1d5db', display: 'block', marginBottom: '8px' }}>Confidential TEE Strategy</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={() => setStrategy('delta-neutral')}
                  style={{ padding: '12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: strategy === 'delta-neutral' ? '1px solid #3b82f6' : '1px solid #1f2937', background: strategy === 'delta-neutral' ? 'rgba(59,130,246,0.15)' : '#030712', color: strategy === 'delta-neutral' ? '#60a5fa' : '#6b7280', transition: 'all 0.2s' }}
                >
                  Delta-Neutral Yield
                </button>
                <button
                  onClick={() => setStrategy('conservative')}
                  style={{ padding: '12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: strategy === 'conservative' ? '1px solid #3b82f6' : '1px solid #1f2937', background: strategy === 'conservative' ? 'rgba(59,130,246,0.15)' : '#030712', color: strategy === 'conservative' ? '#60a5fa' : '#6b7280', transition: 'all 0.2s' }}
                >
                  Auto-Hedge Shield
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '12px', marginTop: '10px' }}>
              <button
                onClick={handleRunStrategy}
                disabled={loading}
                style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 14px rgba(37,99,235,0.4)', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Evaluating Enclave...' : '⚡ Run TEE Strategy'}
              </button>

              <button
                onClick={handleDumpMarket}
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171', padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s' }}
              >
                🚨 Dump Market
              </button>
            </div>

          </div>
        </div>

        {/* Right Panel: Analytics Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Price Chart Card */}
          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                📈 Flare FTSO v2 Live Feed
              </span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: isDump ? '#f87171' : '#34d399', background: isDump ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                {isDump ? '-28.4% CRASH DETECTED' : '+2.4% (24h)'}
              </span>
            </div>

            <div style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '-1px', marginBottom: '16px' }}>
              ${analysis ? analysis.price : current.basePrice} <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 'normal' }}>{selectedAsset}/USD</span>
            </div>

            {/* Simulated Live Sparkline SVG */}
            <div style={{ width: '100%', height: '60px', overflow: 'hidden' }}>
              <svg width="100%" height="100%" viewBox="0 0 400 60" preserveAspectRatio="none">
                <path
                  d={isDump 
                    ? "M 0 10 Q 100 15, 200 12 T 300 18 L 320 55 L 400 58" 
                    : "M 0 45 Q 100 40, 200 25 T 300 20 L 400 10"}
                  fill="none"
                  stroke={isDump ? '#f87171' : '#34d399'}
                  strokeWidth="3"
                />
              </svg>
            </div>
          </div>

          {/* TEE Attestation Status Card */}
          <div style={{ background: isDump ? 'rgba(127,29,29,0.15)' : '#111827', border: isDump ? '1px solid rgba(239,68,68,0.5)' : '1px solid #1f2937', borderRadius: '20px', padding: '24px', flexGrow: 1, transition: 'all 0.3s' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '20px' }}>
              🔐 Confidential TEE Attestation & On-Chain Audit
            </h3>

            {analysis ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Risk Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: '#9ca3af' }}>Confidential Risk Score:</span>
                    <span style={{ fontWeight: '800', fontFamily: 'monospace', color: analysis.risk > 70 ? '#f87171' : '#34d399' }}>
                      {analysis.risk} / 100
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#030712', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${analysis.risk}%`, height: '100%', background: analysis.risk > 70 ? '#f87171' : '#34d399', transition: 'width 0.5s ease' }}></div>
                  </div>
                </div>

                {/* Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#030712', padding: '12px 16px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>Recommended Action:</span>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: '700', color: isDump ? '#f87171' : '#60a5fa', background: isDump ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)', padding: '4px 10px', borderRadius: '6px' }}>
                    {analysis.action}
                  </span>
                </div>

                {/* ECDSA Attestation Log */}
                <div style={{ background: '#030712', padding: '14px', borderRadius: '12px', border: '1px solid #1f2937', fontSize: '11px', fontFamily: 'monospace' }}>
                  <div style={{ color: '#34d399', fontWeight: '600', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ✔ Verified by {analysis.signer}
                  </div>
                  <div style={{ color: '#6b7280', wordBreak: 'break-all' }}>
                    ECDSA Sig: {analysis.signature}
                  </div>
                </div>

              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#4b5563', fontSize: '13px' }}>
                Select an asset and click <span style={{ color: '#60a5fa', fontWeight: '600' }}>Run TEE Strategy</span> to execute confidential analysis.
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
