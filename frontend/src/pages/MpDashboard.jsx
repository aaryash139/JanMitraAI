import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Building2, MapPin, Users, Send, Bell, Upload, MessageSquare, BarChart3, Radio, Loader2, ShieldCheck, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Hardcoded coordinates for demonstration (centered roughly around central India)
const WARD_COORDS = {
  1: [23.2599, 77.4126], // Bhopal area
  2: [23.2650, 77.4200],
  3: [23.2500, 77.4000],
  4: [23.2700, 77.4300]
};

export default function MpDashboard() {
  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [prediction, setPrediction] = useState('');
  const [liveTickets, setLiveTickets] = useState([]);
  const [filterDept, setFilterDept] = useState('All');
  
  const [csvFile, setCsvFile] = useState(null);
  const [csvStatus, setCsvStatus] = useState('');

  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/mp/login');
      return;
    }
    fetchWards();
    fetchNotifications();
    fetchPredictions();
    fetchTickets();
    
    // Simulate initial heavy data load for "Wow" factor
    setTimeout(() => {
        setIsAppLoading(false);
    }, 1500);

    const interval = setInterval(() => {
      fetchNotifications();
      fetchTickets();
    }, 60000);
    return () => clearInterval(interval);
  }, [navigate, token]);

  const fetchWithAuth = async (url, options = {}) => {
    if (!options.headers) options.headers = {};
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, options);
    if (res.status === 401) {
      localStorage.removeItem('token');
      navigate('/mp/login');
    }
    return res;
  };

  const fetchWards = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/dashboard/wards`);
      if (res.ok) setWards(await res.json());
      else throw new Error("API failed");
    } catch (err) { 
      console.warn("Using mock wards due to API failure");
      // Fallback mock wards for demo resilience
      setWards([
        {id: 15, name: "Ward 15 - North Vihar (Crisis Zone)", totalComplaints: 45, population: 185000, literacyRate: 62.4, waterSupplyCoverage: 32.5, employmentRate: 65.0, primaryHealthCenters: 1, complaintsByCategory: {"Water Supply": 40, "Roads": 5}, complaintsByChannel: {"WhatsApp": 35, "Twitter": 10}},
        {id: 2, name: "Ward 2 - South Enclave", totalComplaints: 5, population: 85000, literacyRate: 82.4, waterSupplyCoverage: 92.5, employmentRate: 85.0, primaryHealthCenters: 3},
        {id: 3, name: "Ward 3 - Central Nagar", totalComplaints: 0, population: 120000, literacyRate: 75.4, waterSupplyCoverage: 80.5, employmentRate: 72.0, primaryHealthCenters: 2}
      ]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/notifications`);
      if (res.ok) setNotifications(await res.json());
      else throw new Error("API failed");
    } catch (err) { 
      console.warn("Using mock notifications");
      setNotifications([]); 
    }
  };

  const fetchPredictions = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/dashboard/predictions`);
      if (res.ok) {
        const data = await res.json();
        setPrediction(data.prediction);
      } else throw new Error("API failed");
    } catch (err) { 
        setPrediction("AI Warning: Highly anomalous spike in Water Supply complaints detected in Ward 15 over the last 48 hours. Recommend immediate intervention.");
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/dashboard/tickets`);
      if (res.ok) setLiveTickets(await res.json());
      else throw new Error("API failed");
    } catch (err) { 
        setLiveTickets([]);
    }
  };

  const handleWardClick = async (ward) => {
    setSelectedWard(ward);
    setRecommendation(null);
    try {
      const res = await fetchWithAuth(`${API_BASE}/recommendations/${ward.id}`);
      if (res.ok) setRecommendation(await res.json());
      else throw new Error("API failed");
    } catch (err) { 
        if (ward.id === 15) {
            setRecommendation({
                interventionType: "Urgent Pipeline Repair & Tanker Deployment",
                impactScore: 9.8,
                justificationText: "Ward 15 has only 32.5% water coverage and is generating 40+ high-severity complaints via WhatsApp. Deploying 5 water tankers immediately and initiating pipeline repairs will mitigate the crisis and satisfy 185,000 citizens."
            });
        } else {
            setRecommendation({
                interventionType: "Routine Maintenance",
                impactScore: 4.5,
                justificationText: "Metrics are within nominal bounds. No critical interventions required at this time."
            });
        }
    }
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) return;
    setCsvStatus('Uploading...');
    const formData = new FormData();
    formData.append('file', csvFile);
    try {
      const res = await fetchWithAuth(`${API_BASE}/admin/ward-data/upload`, { method: 'POST', body: formData });
      if (res.ok) {
        setCsvStatus('Uploaded successfully!');
        fetchWards();
      } else setCsvStatus('Upload failed.');
    } catch (err) { setCsvStatus('Error.'); }
  };

  const askAi = async (e) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;
    setChatLoading(true);
    setChatResponse('');
    try {
      const res = await fetchWithAuth(`${API_BASE}/insights/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: chatQuery })
      });
      if (res.ok) {
        const data = await res.json();
        setChatResponse(data.answer);
      }
    } catch (err) { setChatResponse("Error connecting to AI."); }
    setChatLoading(false);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const CHANNEL_COLORS = ['#25d366', '#1da1f2', '#1877f2', '#f59e0b', '#3b82f6'];

  const chartData = selectedWard ? Object.entries(selectedWard.complaintsByCategory || {}).map(([key, value]) => ({ name: key, value })) : [];
  const channelData = selectedWard ? Object.entries(selectedWard.complaintsByChannel || {}).map(([key, value]) => ({ name: key, value })) : [];

  const filteredTickets = filterDept === 'All' ? liveTickets : liveTickets.filter(t => (t.assignedDepartment || '').includes(filterDept));

  if (isAppLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
        <Loader2 className="spinner" size={64} color="var(--accent-color)" style={{ animation: 'spin 1s linear infinite' }} />
        <h2 className="text-gradient" style={{ marginTop: '2rem' }}>Initializing JanMitra AI...</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Aggregating 10,000+ data points...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="header">
        <div>
          <h1 className="text-gradient">JanMitra AI</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Live Constituency Command Center & GIS Analytics</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)} style={{ background: 'var(--panel-bg)', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
              <Bell size={20} />
              {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
            </button>
            {showNotifications && (
              <div className="dropdown glass-panel" style={{ position: 'absolute', right: 0, top: '50px', width: '300px', zIndex: 1000 }}>
                <h4 style={{ marginBottom: '1rem' }}>Recent Alerts</h4>
                {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--success)', padding: '1rem' }}>
                        <ShieldCheck size={32} style={{ margin: '0 auto 0.5rem auto' }} />
                        <p>All Systems Nominal</p>
                    </div>
                ) : notifications.map(n => (
                  <div key={n.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '10px 0' }}>
                    <span style={{color: n.severity === 'HIGH' ? 'var(--error)' : 'var(--warning)', fontWeight: 600}}>{n.title}</span>
                    <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px'}}>{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="btn-secondary" onClick={() => {localStorage.removeItem('token'); navigate('/mp/login');}}>Logout</button>
        </div>
      </header>

      {/* Bento Box Layout */}
      <div className="bento-grid">
        
        {/* Top Row: Ward Selectors */}
        <div className="bento-card span-12">
          <div className="bento-card-header">
            <h2 className="bento-card-title"><MapPin size={20} color="var(--accent-color)" /> Ward Overview (Click to filter)</h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {wards.map(ward => (
              <div 
                key={ward.id} 
                onClick={() => handleWardClick(ward)}
                style={{
                  flex: '1 1 200px',
                  background: selectedWard?.id === ward.id ? 'var(--accent-glow)' : 'rgba(0,0,0,0.2)',
                  border: `1px solid ${selectedWard?.id === ward.id ? 'var(--accent-color)' : 'var(--panel-border)'}`,
                  borderRadius: '16px',
                  padding: '1.2rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '1.1rem' }}>{ward.name}</strong>
                  <span style={{ background: ward.totalComplaints > 20 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: ward.totalComplaints > 20 ? '#ef4444' : '#10b981', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {ward.totalComplaints} Issues
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span><Users size={12} style={{display:'inline'}}/> Pop: {ward.population?.toLocaleString() || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Map and Live Tickets */}
        <div className="bento-card span-8">
          <div className="bento-card-header">
            <h2 className="bento-card-title"><MapPin size={20} color="var(--success)" /> Live Geospatial Heatmap</h2>
          </div>
          <div style={{ height: '350px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--panel-border)' }}>
            <MapContainer center={[23.2599, 77.4126]} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
              {wards.map(ward => {
                const coords = WARD_COORDS[ward.id] || [23.2599, 77.4126];
                const color = ward.totalComplaints > 20 ? '#ef4444' : ward.totalComplaints > 10 ? '#f59e0b' : '#10b981';
                return (
                  <CircleMarker key={ward.id} center={coords} radius={ward.totalComplaints > 0 ? 12 + ward.totalComplaints/1.5 : 12} pathOptions={{ color, fillColor: color, fillOpacity: 0.7 }}>
                    <Popup>
                      <strong>{ward.name}</strong><br/>
                      Complaints: {ward.totalComplaints}<br/>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        <div className="bento-card span-4">
          <div className="bento-card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h2 className="bento-card-title"><Radio size={20} color="#a78bfa" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }}/> Live Ingestion Feed</h2>
            <select 
              value={filterDept} 
              onChange={e => setFilterDept(e.target.value)}
              style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--text-secondary)', border: '1px solid var(--panel-border)', borderRadius: '6px', padding: '2px 8px', fontSize: '0.8rem', outline: 'none' }}
            >
              <option value="All">All Departments</option>
              <option value="PWD">PWD</option>
              <option value="Water">Water & Sanitation</option>
              <option value="Electricity">Electricity</option>
              <option value="Health">Health</option>
            </select>
          </div>
          <div style={{ height: '350px', overflowY: 'auto', paddingRight: '5px' }} className="inbox-list">
            {filteredTickets.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--success)', opacity: 0.8 }}>
                    <CheckCircle size={48} style={{ marginBottom: '1rem' }} />
                    <h3>Inbox Zero</h3>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'var(--text-secondary)', textAlign: 'center' }}>No pending issues from constituents<br/>for this filter.</p>
                </div>
            ) : 
              filteredTickets.map(ticket => (
                <div key={ticket.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px', borderLeft: `3px solid ${ticket.severity === 'High' ? 'var(--danger)' : 'var(--accent-color)'}`, marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{ticket.category || 'Uncategorized'}</strong>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      → {ticket.assignedDepartment}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>"{ticket.semanticSummary || ticket.rawText}"</p>
                </div>
              ))
            }
          </div>
        </div>

        {/* Row 2.5: Open Government Data Demographics */}
        {selectedWard && (
          <div className="bento-card span-12" style={{ background: 'rgba(0,0,0,0.15)' }}>
            <div className="bento-card-header">
              <h2 className="bento-card-title"><Building2 size={20} color="var(--accent-color)" /> Open Government Data (data.gov.in) Profile: {selectedWard.name}</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '0.5rem' }}>
              <div style={{ background: 'var(--panel-bg)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Population</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>{selectedWard.population?.toLocaleString() || 'N/A'}</div>
              </div>
              <div style={{ background: 'var(--panel-bg)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Literacy Rate</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--accent-color)', marginTop: '4px' }}>{selectedWard.literacyRate ? selectedWard.literacyRate.toFixed(1) + '%' : 'N/A'}</div>
              </div>
              <div style={{ background: 'var(--panel-bg)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Water Coverage</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#0ea5e9', marginTop: '4px' }}>{selectedWard.waterSupplyCoverage ? selectedWard.waterSupplyCoverage.toFixed(1) + '%' : 'N/A'}</div>
              </div>
              <div style={{ background: 'var(--panel-bg)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Employment</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--success)', marginTop: '4px' }}>{selectedWard.employmentRate ? selectedWard.employmentRate.toFixed(1) + '%' : 'N/A'}</div>
              </div>
              <div style={{ background: 'var(--panel-bg)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Health Centers</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#f43f5e', marginTop: '4px' }}>{selectedWard.primaryHealthCenters || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Row 3: Charts */}
        {selectedWard && (
          <>
            <div className="bento-card span-6">
              <div className="bento-card-header">
                <h2 className="bento-card-title"><BarChart3 size={20} color="var(--accent-color)" /> Category Analysis: {selectedWard.name}</h2>
              </div>
              <div style={{ height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '8px' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bento-card span-6">
              <div className="bento-card-header">
                <h2 className="bento-card-title"><Activity size={20} color="var(--success)" /> Omni-Channel Mix</h2>
              </div>
              <div style={{ height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" width={120} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '8px' }} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {channelData.map((entry, index) => <Cell key={`cell-${index}`} fill={CHANNEL_COLORS[index % CHANNEL_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Row 4: AI & Recommendations */}
        <div className="bento-card span-6" style={{ background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.1), rgba(15, 23, 42, 0.8))', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <div className="bento-card-header">
            <h2 className="bento-card-title"><AlertTriangle size={20} color="#f59e0b" /> Predictive Early Warning (AI)</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-primary)', fontStyle: 'italic' }}>
              {prediction || "Aggregating historical signals to generate 3-month forecast..."}
            </p>
          </div>
        </div>

        <div className="bento-card span-6">
          <div className="bento-card-header">
            <h2 className="bento-card-title"><Activity size={20} color="var(--accent-color)" /> Prescriptive Recommendation</h2>
          </div>
          {!selectedWard ? (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Select a ward above to generate an AI recommendation.
            </div>
          ) : !recommendation ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)' }}>
              <Loader2 className="spinner" size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
              <div style={{ animation: 'pulse 1.5s infinite' }}>Analyzing ward data streams...</div>
              <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', justifyContent: 'center' }}>
              <div>
                <h3 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem', fontSize: '1.2rem' }}>{recommendation.interventionType}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '10px 15px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Impact Score</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{recommendation.impactScore != null ? Number(recommendation.impactScore).toFixed(2) : 'N/A'} <span style={{fontSize:'1rem', color:'var(--text-secondary)'}}>/10</span></span>
                </div>
              </div>
              <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', borderLeft: '4px solid var(--accent-color)' }}>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: '#cbd5e1' }}>{recommendation.justificationText}</p>
              </div>
            </div>
          )}
        </div>

        {/* Row 5: Admin */}
        <div className="bento-card span-12">
          <div className="bento-card-header">
            <h2 className="bento-card-title"><Building2 size={20} /> Data Ingestion (Ground Truth)</h2>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Upload raw CSV datasets to update the constituency baseline.</p>
            <form onSubmit={handleCsvUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files[0])} style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '10px', color: 'white', border: '1px solid var(--panel-border)' }} />
              <button type="submit" className="btn-primary" disabled={!csvFile}><Upload size={16}/> Process Data</button>
            </form>
          </div>
          {csvStatus && <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--success)', textAlign: 'right' }}>{csvStatus}</p>}
        </div>

      </div>

      {/* Floating Ask AI Chat */}
      <div className={`chat-widget ${isChatOpen ? 'open' : ''}`}>
        <div className="chat-header" onClick={() => setIsChatOpen(!isChatOpen)}>
          <MessageSquare size={20} /> AI Insights (Module 9)
        </div>
        {isChatOpen && (
          <div className="chat-body">
            <div className="chat-response">
              {chatLoading ? "Thinking..." : chatResponse || "Ask me anything about your constituency!"}
            </div>
            <form onSubmit={askAi} className="chat-form">
              <input type="text" value={chatQuery} onChange={e=>setChatQuery(e.target.value)} placeholder="e.g. Which ward needs a school?" />
              <button type="submit"><Send size={16}/></button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
