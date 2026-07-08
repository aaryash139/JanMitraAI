import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Bot, BarChart3, Clock, ArrowRight, ShieldCheck, Smartphone, MapPin, Sun, Moon, Globe } from 'lucide-react';
import { useThemeLang } from '../contexts/ThemeLangContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { lang, setLang, theme, toggleTheme, t } = useThemeLang();

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="logo-section">
          <ShieldCheck size={28} color="var(--accent-color)" />
          <span className="logo-text">{t.appName}</span>
        </div>
        <div className="nav-links">
          
          {/* Theme Toggle */}
          <button className="nav-btn-ghost" onClick={toggleTheme} title="Toggle Theme" style={{ padding: '0.5rem' }}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Language Selector */}
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

          <button className="nav-btn-ghost" onClick={() => navigate('/mp/login')}>{t.adminLogin}</button>
          <button className="nav-btn-primary" onClick={() => navigate('/jan-sunwai')}>
            {t.lodgeComplaint} <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge">{t.heroBadge}</div>
          <h1 className="hero-title">{t.heroTitle1}<br/><span className="gradient-text">{t.heroTitle2}</span></h1>
          <p className="hero-subtitle">{t.heroSub}</p>
          <div className="hero-buttons">
            <button className="btn-primary-large" onClick={() => navigate('/jan-sunwai')}>
              <Megaphone size={20} /> {t.btnRegister}
            </button>
            <button className="btn-secondary-large" onClick={() => document.getElementById('features').scrollIntoView({behavior: 'smooth'})}>
              {t.btnLearn}
            </button>
          </div>
        </div>
        
        {/* Abstract 3D/Glass visual elements for the hero */}
        <div className="hero-visual">
          <div className="glass-card float-anim-1">
            <div className="stat-value">24/7</div>
            <div className="stat-label">{t.stat1}</div>
          </div>
          <div className="glass-card float-anim-2">
            <Bot size={32} color="var(--accent-color)" />
            <div className="stat-label">{t.stat2}</div>
          </div>
          <div className="glass-card float-anim-3">
            <div className="stat-value">100%</div>
            <div className="stat-label">{t.stat3}</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>{t.featHeader}</h2>
          <p>{t.featSub}</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Smartphone size={24} /></div>
            <h3>{t.f1Title}</h3>
            <p>{t.f1Desc}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Bot size={24} /></div>
            <h3>{t.f2Title}</h3>
            <p>{t.f2Desc}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><ArrowRight size={24} /></div>
            <h3>{t.f3Title}</h3>
            <p>{t.f3Desc}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><MapPin size={24} /></div>
            <h3>{t.f4Title}</h3>
            <p>{t.f4Desc}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><BarChart3 size={24} /></div>
            <h3>{t.f5Title}</h3>
            <p>{t.f5Desc}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Clock size={24} /></div>
            <h3>{t.f6Title}</h3>
            <p>{t.f6Desc}</p>
          </div>
        </div>
      </section>

      {/* Footer / CTA */}
      <footer className="landing-footer">
        <div className="cta-box">
          <h2>{t.ctaHeader}</h2>
          <p>{t.ctaSub}</p>
          <button className="btn-primary-large" onClick={() => navigate('/jan-sunwai')}>
            {t.ctaBtn}
          </button>
        </div>
        <div className="footer-bottom">
          <p>{t.footerText}</p>
          <a href="#" className="admin-link" onClick={(e) => { e.preventDefault(); navigate('/mp/login'); }}>{t.adminLogin}</a>
        </div>
      </footer>
    </div>
  );
}
