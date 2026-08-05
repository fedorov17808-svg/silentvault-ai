import React, { useState } from 'react';
import { Shield, Cpu, Lock } from 'lucide-react';

export default function App() {
  const [asset, setAsset] = useState('FLR');
  const [amount, setAmount] = useState('1000');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleEvaluate = async () => {
    setLoading(true);
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
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '32px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield color="#38bdf8" size={32} /> SilentVault AI
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Confidential Compute & Risk Automator on Flare Network</p>
          </div>
          <span style={{ backgroundColor: '#1e293b', padding: '8px 16px', borderRadius: '20px', border: '1px solid #38bdf8', fontSize: '12px', color: '#38bdf8' }}>
            ● Flare Coston2 Testnet
          </span>
        </header>

        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #334155' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={20} color="#a855f7" /> Vault Risk Analysis & Strategy Attestation
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Asset</label>
              <select value={asset} onChange={e => setAsset(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569' }}>
                <option value="FLR">FLR (Flare Native)</option>
                <option value="BTC">FXRP / BTC (Bridge)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Deposit Amount</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button onClick={handleEvaluate} disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: '6px', backgroundColor: '#0284c7', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                {loading ? 'Attesting in TEE...' : 'Run TEE Strategy'}
              </button>
            </div>
          </div>
        </div>

        {result && (
          <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #38bdf8' }}>
            <h3 style={{ color: '#38bdf8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={20} /> TEE Execution Attestation Output
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Flare FTSO Price</span>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '4px 0' }}>${result.ftso_price}</p>
              </div>
              <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Confidential Risk Score</span>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '4px 0', color: result.confidential_risk_score > 70 ? '#f43f5e' : '#10b981' }}>
                  {result.confidential_risk_score} / 100
                </p>
              </div>
              <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>TEE Recommendation</span>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '4px 0', color: '#a855f7' }}>{result.recommended_action}</p>
              </div>
            </div>
            <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace', color: '#64748b' }}>
              <p>Attested By: {result.tee_attestation.attested_by}</p>
              <p>Execution Nonce: {result.tee_attestation.execution_nonce}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
