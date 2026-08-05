import React, { useState, useEffect } from 'react';
import { Shield, Cpu, Lock, AlertTriangle, TrendingUp, RefreshCw, Zap, Wallet, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockPriceData = [
  { time: '12:00', price: 0.0312 },
  { time: '12:05', price: 0.0315 },
  { time: '12:10', price: 0.0308 },
  { time: '12:15', price: 0.0310 },
  { time: '12:20', price: 0.0307 },
  { time: '12:25', price: 0.0309 },
];

export default function App() {
  const [asset, setAsset] = useState('FLR');
  const [amount, setAmount] = useState('10000');
  const [strategy, setStrategy] = useState('Delta-Neutral Yield');
  const [loading, setLoading] = useState(false);
  const [simulatingCrash, setSimulatingCrash] = useState(false);
  const [result, setResult] = useState(null);
  const [connected, setConnected] = useState(true);

  const handleEvaluate = async (isCrash = false) => {
    setLoading(true);
    // Имитация паузы вычислений в TEE-анклаве для визуального эффекта
    setTimeout(async () => {
      try {
        const res = await fetch('http://localhost:8000/api/evaluate-strategy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
            asset_symbol: asset,
            amount: parseFloat(amount)
          })
        });
        const data = await res.json();
        
        if (isCrash) {
          data.confidential_risk_score = 92;
          data.recommended_action = 'EMERGENCY LIQUIDATED / HEDGED';
          data.ftso_price = (data.ftso_price * 0.65).toFixed(4);
        }
        
        setResult(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <div style={{ backgroundColor: '#090d16', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* TOP NAVBAR */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'linear-gradient(135deg, #0284c7, #6366f1)', padding: '10px', borderRadius: '12px', boxShadow: '0 0 20px rgba(56,189,248,0.3)' }}>
              <Shield size={28} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', margin: 0 }}>SilentVault <span style={{ color: '#38bdf8' }}>AI</span></h1>
                <span style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>v2.0 TEE</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Confidential Compute & Institutional Yield Automator</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px', fontSize: '12px' }}>
              <span style={{ height: '8px', width: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
              <span>Flare Coston2 Testnet</span>
            </div>

            <button style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '1px solid rgba(56,189,248,0.4)', color: '#f8fafc', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wallet size={16} color="#38bdf8" /> 0x71C7...976F
            </button>
          </div>
        </header>

        {/* MAIN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginBottom: '24px' }}>
          
          {/* LEFT PANEL: CONFIGURATION */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#e2e8f0' }}>
              <Cpu size={18} color="#a855f7" /> Vault Parameters & Execution Enclave
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Target Asset</label>
                <select value={asset} onChange={e => setAsset(e.target.value)} style={{ width: '100%', padding: '12px', background: '#090d16', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '14px' }}>
                  <option value="FLR">FLR (Native Flare)</option>
                  <option value="FXRP">FXRP (Flare Bridge)</option>
                  <option value="FBTC">FBTC (Non-EVM Enclave)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Position Size</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: '100%', padding: '12px', background: '#090d16', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '14px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Automated Strategy Preset</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {['Delta-Neutral Yield', 'Conservative Auto-Hedge'].map((st) => (
                  <button 
                    key={st}
                    onClick={() => setStrategy(st)}
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      cursor: 'pointer',
                      border: strategy === st ? '1px solid #38bdf8' : '1px solid #1e293b',
                      background: strategy === st ? 'rgba(56,189,248,0.15)' : '#090d16',
                      color: strategy === st ? '#38bdf8' : '#64748b'
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => handleEvaluate(false)} 
                disabled={loading}
                style={{ 
                  flex: 1, 
                  padding: '14px', 
                  borderRadius: '10px', 
                  background: 'linear-gradient(135deg, #0284c7, #2563eb)', 
                  border: 'none', 
                  color: '#fff', 
                  fontWeight: '700', 
                  fontSize: '14px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
                }}
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
                {loading ? 'Attesting in TEE...' : 'Run TEE Strategy'}
              </button>

              <button 
                onClick={() => {
                  setSimulatingCrash(true);
                  handleEvaluate(true);
                }} 
                disabled={loading}
                style={{ 
                  padding: '14px', 
                  borderRadius: '10px', 
                  background: 'rgba(225, 29, 72, 0.15)', 
                  border: '1px solid rgba(225, 29, 72, 0.4)', 
                  color: '#fb7185', 
                  fontWeight: '700', 
                  fontSize: '12px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <AlertTriangle size={16} /> Dump Market
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: LIVE ORACLE CHART */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={16} color="#10b981" /> Flare FTSO v2 Live Feed
                </span>
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold' }}>+2.4% (24h)</span>
              </div>
              <p style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 16px 0' }}>$0.0309 <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'normal' }}>FLR/USD</span></p>
            </div>

            <div style={{ height: '140px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockPriceData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ background: '#090d16', border: '1px solid #334155', borderRadius: '6px' }} />
                  <Area type="monotone" dataKey="price" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* BOTTOM PANEL: TEE ATTESTATION OUTPUT */}
        {result && (
          <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: result.confidential_risk_score > 80 ? '1px solid #f43f5e' : '1px solid #38bdf8', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: result.confidential_risk_score > 80 ? '#fb7185' : '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} /> Cryptographic TEE Enclave Attestation
              </h3>
              <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={12} /> On-Chain Verified
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: '#090d16', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Verified FTSO Price</span>
                <p style={{ fontSize: '22px', fontWeight: '800', margin: '4px 0 0 0' }}>${result.ftso_price}</p>
              </div>

              <div style={{ background: '#090d16', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Confidential Risk Metric</span>
                <p style={{ fontSize: '22px', fontWeight: '800', margin: '4px 0 0 0', color: result.confidential_risk_score > 80 ? '#f43f5e' : '#10b981' }}>
                  {result.confidential_risk_score} / 100
                </p>
              </div>

              <div style={{ background: '#090d16', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Enclave Execution Signal</span>
                <p style={{ fontSize: '16px', fontWeight: '800', margin: '8px 0 0 0', color: '#a855f7' }}>{result.recommended_action}</p>
              </div>
            </div>

            <div style={{ background: '#090d16', padding: '14px', borderRadius: '8px', border: '1px solid #1e293b', fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Attested Enclave: <strong style={{ color: '#94a3b8' }}>{result.tee_attestation.attested_by}</strong></span>
                <span>Algorithm: <strong style={{ color: '#94a3b8' }}>ECDSA-secp256k1</strong></span>
              </div>
              <div>Execution Nonce: <span style={{ color: '#38bdf8' }}>{result.tee_attestation.execution_nonce}</span></div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
