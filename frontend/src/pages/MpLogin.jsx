import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export default function MpLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        navigate('/mp/dashboard');
      } else {
        setLoginError('Invalid credentials');
        triggerShake();
      }
    } catch (err) {
      setLoginError('Server error');
      triggerShake();
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400); // Remove class after animation ends
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--bg-color)' }}>
      
      {/* Left Branding Side */}
      <div style={{ flex: 1, position: 'relative', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '300px', height: '300px', background: 'var(--ai-glow)', filter: 'blur(100px)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px', background: 'var(--accent-glow)', filter: 'blur(120px)', borderRadius: '50%' }}></div>
        
        <div style={{ zIndex: 10, maxWidth: '500px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: '1.5rem' }}>
            JanMitra AI
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '2rem' }}>
            Next-generation predictive governance. Monitor public sentiment, auto-route grievances, and predict civic issues before they escalate.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <span style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="pulse-dot"></div> Systems Online
            </span>
            <span style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', fontSize: '0.9rem' }}>
              Secured Node
            </span>
          </div>
        </div>
      </div>

      {/* Right Login Side */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', background: 'var(--bg-color)' }}>
        
        <button onClick={() => navigate('/')} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', fontWeight: 600 }}>
          ← Back to Public Portal
        </button>

        <div className={`glass-panel ${isShaking ? 'shake' : ''}`} style={{ width: '100%', maxWidth: '420px', padding: '3rem 2.5rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
              <LogIn size={32} />
            </div>
          </div>
          
          <h2 style={{ textAlign: 'center', fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Admin Access</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>Authenticate to access the command center</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Username / ID</label>
              <input className="input-field" type="text" placeholder="e.g. admin" value={username} onChange={e=>setUsername(e.target.value)} style={{ padding: '1rem', fontSize: '1rem' }} />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Secure Password</label>
              <input className="input-field" type="password" placeholder="e.g. admin123" value={password} onChange={e=>setPassword(e.target.value)} style={{ padding: '1rem', fontSize: '1rem' }} />
            </div>
            
            {loginError && <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>⚠️ {loginError}</div>}
            
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '1.2rem', fontSize: '1.1rem', borderRadius: '12px' }}>
              Authenticate
            </button>
          </form>
        </div>
      </div>
      
    </div>
  );
}
