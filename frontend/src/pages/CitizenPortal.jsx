import React, { useState } from 'react';
import { Send, Mic, User, Phone, Megaphone, Sun, Moon, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useThemeLang } from '../contexts/ThemeLangContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export default function CitizenPortal() {
  const [complaintText, setComplaintText] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('Jan Sunwai Portal');
  const [status, setStatus] = useState('');
  const [response, setResponse] = useState(null);
  
  const navigate = useNavigate();
  const { lang, setLang, theme, toggleTheme, t } = useThemeLang();

  const [selectedDepartment, setSelectedDepartment] = useState('Auto-Assign (AI Routed)');

  const [wards, setWards] = useState([]);
  const [selectedWardId, setSelectedWardId] = useState('');
  
  React.useEffect(() => {
    fetch(`${API_BASE}/dashboard/wards`)
      .then(res => res.json())
      .then(data => setWards(data))
      .catch(err => console.log('Failed to fetch wards for portal', err));
  }, []);

  const handleIngest = async (e) => {
    e.preventDefault();
    if (!complaintText.trim() && !audioFile) return;
    setStatus(t.processing);
    
    try {
      let res;
      if (audioFile) {
        const formData = new FormData();
        formData.append('audio', audioFile);
        formData.append('channel', selectedChannel + ' (Voice)');
        if (citizenName) formData.append('citizenName', citizenName);
        if (citizenPhone) formData.append('citizenPhone', citizenPhone);
        if (selectedDepartment !== 'Auto-Assign (AI Routed)') {
          formData.append('manualDepartment', selectedDepartment);
        }
        if (selectedWardId) {
          formData.append('wardId', selectedWardId);
        }
        
        res = await fetch(`${API_BASE}/complaints/ingest/audio`, { method: 'POST', body: formData });
      } else {
        res = await fetch(`${API_BASE}/complaints/ingest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            rawText: complaintText, 
            sourceChannel: selectedChannel,
            citizenName,
            citizenPhone,
            manualDepartment: selectedDepartment === 'Auto-Assign (AI Routed)' ? null : selectedDepartment,
            wardId: selectedWardId || null
          })
        });
      }
      
      if (res.ok) {
        const data = await res.json();
        if (data.aiReply) {
          setResponse(data);
          setStatus('');
        } else {
          setStatus('Success! Complaint logged.');
        }
        setComplaintText('');
        setAudioFile(null);
      } else {
        setStatus('Error processing complaint.');
      }
    } catch (err) {
      console.error(err);
      setStatus('Network error. Backend might be down.');
    }
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: '800px', paddingTop: '4rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/')} 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'var(--text-secondary)', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px'
          }}>
          ← {t.backHome}
        </button>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="nav-btn-ghost" onClick={toggleTheme} title="Toggle Theme" style={{ padding: '0.5rem' }}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(128,128,128,0.2)', padding: '4px 8px', borderRadius: '8px' }}>
            <Globe size={16} color="var(--text-secondary)" />
            <select 
              value={lang} 
              onChange={e => setLang(e.target.value)}
              style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', outline: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="mr">MR</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--ai-glow)', filter: 'blur(50px)', borderRadius: '50%' }}></div>
        
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Megaphone color="var(--accent-color)" /> {t.portalTitle}
        </h2>
        
        <form onSubmit={handleIngest} className="ingest-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="var(--accent-color)"/> 1. Citizen Details
            </h3>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px' }}>
                <label style={{display:'block', marginBottom:'8px', color:'var(--text-secondary)', fontSize:'0.9rem'}}>{t.fullName}</label>
                <input className="input-field" type="text" placeholder="e.g. Ramesh Kumar" value={citizenName} onChange={e => setCitizenName(e.target.value)} required style={{ padding: '0.8rem' }} />
              </div>
              <div style={{ flex: '1 1 300px' }}>
                <label style={{display:'block', marginBottom:'8px', color:'var(--text-secondary)', fontSize:'0.9rem'}}>{t.phone}</label>
                <input className="input-field" type="text" placeholder="e.g. 9876543210" value={citizenPhone} onChange={e => setCitizenPhone(e.target.value)} required style={{ padding: '0.8rem' }} />
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Megaphone size={18} color="var(--success)"/> 2. Grievance Details
            </h3>
            
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px' }}>
                <label style={{display:'block', marginBottom:'8px', color:'var(--text-secondary)', fontSize:'0.9rem'}}>{t.channelSim}</label>
                <select className="input-field" value={selectedChannel} onChange={e => setSelectedChannel(e.target.value)} style={{ padding: '0.8rem' }}>
                  <option value="Jan Sunwai Portal">🌐 Jan Sunwai Portal (Web)</option>
                  <option value="WhatsApp">📱 WhatsApp Bot</option>
                  <option value="Twitter">🐦 Twitter / X</option>
                  <option value="Facebook">📘 Facebook Messenger</option>
                  <option value="Scanned Letter">✉️ Scanned Letter (OCR)</option>
                </select>
              </div>
              
              <div style={{ flex: '1 1 300px' }}>
                <label style={{display:'block', marginBottom:'8px', color:'var(--text-secondary)', fontSize:'0.9rem'}}>Location / Area</label>
                <select className="input-field" value={selectedWardId} onChange={e => setSelectedWardId(e.target.value)} style={{ padding: '0.8rem' }} required>
                  <option value="" disabled>Select your location...</option>
                  {wards.length > 0 ? wards.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  )) : (
                    <>
                      <option value="1">Ward 1 - TT Nagar</option>
                      <option value="2">Ward 2 - MP Nagar</option>
                      <option value="3">Ward 3 - Kolar</option>
                      <option value="4">Ward 4 - Bairagarh</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{display:'block', marginBottom:'8px', color:'var(--text-secondary)', fontSize:'0.9rem'}}>Target Department (Optional)</label>
              <select className="input-field" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} style={{ padding: '0.8rem', borderColor: selectedDepartment === 'Auto-Assign (AI Routed)' ? 'var(--ai-color)' : 'var(--panel-border)' }}>
                <option value="Auto-Assign (AI Routed)">✨ Auto-Assign via AI</option>
                <option value="Public Works Department (PWD)">🚧 Public Works Department (PWD)</option>
                <option value="Municipal Corporation (Water & Sanitation)">🚰 Municipal Corporation (Water)</option>
                <option value="State Electricity Board">⚡ State Electricity Board</option>
                <option value="Health Ministry">🏥 Health Ministry</option>
                <option value="Transport Department">🚌 Transport Department</option>
                <option value="Education Department">📚 Education Department</option>
                <option value="General Administration">🏛️ General Administration</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ color:'var(--text-secondary)', fontSize:'0.9rem'}}>{t.complaintText}</label>
              <span style={{ fontSize: '0.8rem', color: complaintText.length > 500 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                {complaintText.length} / 500
              </span>
            </div>
            <textarea 
              placeholder={t.complaintText}
              value={complaintText}
              onChange={e => setComplaintText(e.target.value)}
              style={{ padding: '1rem', minHeight: '120px', borderColor: complaintText.length > 500 ? 'var(--danger)' : '' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '10px' }}>
            <label className="btn-secondary" style={{ cursor: 'pointer' }}>
              <Mic size={16} style={{ marginRight: '8px' }} /> {t.orUploadVoice}
              <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={e => setAudioFile(e.target.files[0])} />
            </label>
            {audioFile && <span style={{fontSize: '0.9rem', color: 'var(--success)'}}>{audioFile.name} attached</span>}
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={(!complaintText.trim() && !audioFile) || status === t.processing}>
            <Send size={16} style={{display:'inline', marginRight:'8px'}}/> {t.submitBtn}
          </button>
        </form>
        
        {status && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', borderRadius: '8px', color: 'var(--success)' }}>
            {status}
          </div>
        )}

        {response && (
          <div style={{ marginTop: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ padding: '1.5rem', background: 'var(--success-glow)', border: '1px solid var(--success)', borderRadius: '12px' }}>
              <h3 style={{ color: 'var(--success)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="pulse-dot"></div> AI Auto-Reply Generated
              </h3>
              
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontStyle: 'italic', borderLeft: '3px solid var(--success)' }}>
                "{response.aiReply}"
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Routed To</span>
                  <strong>{response.assignedDepartment}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Category</span>
                  <strong>{response.category}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <button onClick={() => navigate('/mp/login')} className="btn-secondary" style={{ fontSize: '0.8rem', opacity: 0.5 }}>
          {t.adminLogin}
        </button>
      </div>
    </div>
  );
}
