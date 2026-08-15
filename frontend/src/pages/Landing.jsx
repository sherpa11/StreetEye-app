import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Activity, MapPin, CheckCircle, BrainCircuit, Users, 
  BarChart4, ShieldCheck, Camera, FileText, Award, Gavel, 
  ChevronRight, Play
} from 'lucide-react';
import './landing.css';

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // MUST match physical DOM order
      const sections = ['home', 'how-it-works', 'features', 'accountability'];
      let current = 'home';
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Adjust offset to account for navbar height
          if (rect.top <= 120) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      
      {/* 4. NAVBAR */}
      <nav className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: scrolled ? '#2563EB' : 'white', display: 'flex', alignItems: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className="logo-text" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px', color: scrolled ? '#0F172A' : 'white' }}>
            StreetEye
          </div>
          <div style={{ fontSize: '0.75rem', color: scrolled ? '#64748B' : 'rgba(255,255,255,0.6)', marginLeft: '8px', paddingLeft: '12px', borderLeft: `1px solid ${scrolled ? '#E2E8F0' : 'rgba(255,255,255,0.2)'}`, display: 'none' }} className="nav-desktop-only">
            Road Intelligence Platform
          </div>
        </div>
        
        <div className="nav-links" style={{ 
          display: 'flex', position: 'relative', 
          background: scrolled ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)', 
          borderRadius: '12px', padding: '4px',
          border: `1px solid ${scrolled ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'}`
        }}>
          {/* Sliding Pill */}
          <div style={{
            position: 'absolute',
            top: '4px', bottom: '4px',
            left: activeSection === 'home' ? '4px' : 
                  activeSection === 'how-it-works' ? '114px' : 
                  activeSection === 'features' ? '224px' : '334px',
            width: '110px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: 1
          }} />

          {[
            { id: 'home', label: 'Home', href: '#' },
            { id: 'how-it-works', label: 'How It Works', href: '#how-it-works' },
            { id: 'features', label: 'Features', href: '#features' },
            { id: 'accountability', label: 'Accountability', href: '#accountability' }
          ].map(item => (
            <a 
              key={item.id}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                setActiveSection(item.id);
                const target = document.getElementById(item.id);
                if (target) {
                  // Scroll to target, minus 100px to account for sticky navbar
                  const topPos = target.getBoundingClientRect().top + window.scrollY - 100;
                  window.scrollTo({ top: topPos, behavior: 'smooth' });
                }
              }}
              style={{
                position: 'relative', zIndex: 2,
                width: '110px', textAlign: 'center', padding: '6px 0',
                color: activeSection === item.id ? 'white' : (scrolled ? '#64748B' : 'rgba(255,255,255,0.8)'),
                fontWeight: activeSection === item.id ? '700' : '600',
                fontSize: '0.85rem', textDecoration: 'none',
                transition: 'color 0.3s ease',
                textShadow: activeSection === item.id ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
              }}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/citizen/complaints/new" className="btn-primary-landing">
            Report an Issue
          </Link>
        </div>
      </nav>

      {/* 5. & 7. HERO SECTION */}
      <header className="landing-hero" id="home">
        <div className="landing-container hero-grid">
          
          <div style={{ zIndex: 10 }}>
            <div className="eyebrow">
              <Activity size={14} /> AI-POWERED CIVIC INFRASTRUCTURE
            </div>
            
            <h1 className="hero-title">
              Smarter Roads.<br/>
              Accountable Contractors.<br/>
              Safer Cities.
            </h1>
            
            <p className="hero-desc">
              StreetEye connects citizen road reporting, AI-assisted damage analysis, verified repair workflows and contractor performance intelligence in one transparent platform — turning every road issue into measurable accountability.
            </p>
            
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/citizen/complaints/new" className="btn-primary-landing" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
                Report a Road Issue <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: '600', fontSize: '1.1rem', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                Explore How It Works
              </a>
            </div>
            
            <div className="hero-trust">
              <div className="trust-item"><BrainCircuit size={16} color="#06B6D4" /> AI-Assisted Analysis</div>
              <div className="trust-item"><CheckCircle size={16} color="#10B981" /> Verified Repair Evidence</div>
              <div className="trust-item"><BarChart4 size={16} color="#8B5CF6" /> Performance-Based Accountability</div>
            </div>
          </div>

          {/* 6. HERO PRODUCT VISUAL */}
          <div className="hero-visual">
            
            {/* Complaint Card */}
            <div className="glass-card delay-1" style={{ top: '20px', left: '10%', width: '280px', zIndex: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '600' }}>LIVE ROAD ISSUE</span>
                <span style={{ fontSize: '0.8rem', color: '#60A5FA', fontWeight: '700' }}>ST-2026-0001</span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'white', marginBottom: '8px' }}>Pothole Detected</div>
              <div style={{ display: 'inline-block', background: 'rgba(239,68,68,0.2)', color: '#FCA5A5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800', marginBottom: '16px' }}>SEVERITY: HIGH</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#CBD5E1', fontSize: '0.85rem' }}>
                <MapPin size={14} /> Avinashi Road
              </div>
            </div>

            {/* AI Analysis Card */}
            <div className="glass-card delay-2" style={{ top: '160px', right: '0%', width: '220px', zIndex: 4, background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'conic-gradient(#06B6D4 94%, transparent 0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '32px', height: '32px', background: '#0F172A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#06B6D4' }}>94%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'white' }}>AI Analysis</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>High Confidence</div>
                </div>
              </div>
            </div>

            {/* Contractor Card */}
            <div className="glass-card delay-3" style={{ bottom: '100px', left: '0%', width: '240px', zIndex: 2 }}>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '600', marginBottom: '8px' }}>ASSIGNED CONTRACTOR</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'white', marginBottom: '12px' }}>Apex Roads</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>Performance</span>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: '#10B981' }}>92 / 100</span>
              </div>
            </div>

            {/* Status Card */}
            <div className="glass-card" style={{ bottom: '40px', right: '10%', padding: '12px 20px', zIndex: 5, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34D399', fontWeight: '700', fontSize: '0.9rem' }}>
                <CheckCircle size={16} /> Repair Verified
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* 8. QUICK VALUE STRIP */}
      <div className="value-strip">
        <div className="landing-container value-grid">
          <div className="value-item">
            <div style={{ color: '#2563EB', fontWeight: '800', fontSize: '1.5rem', fontFamily: 'Space Grotesk' }}>01</div>
            <h4>Report → Resolution</h4>
            <p>End-to-End Tracking</p>
          </div>
          <div className="value-item">
            <div style={{ color: '#2563EB', fontWeight: '800', fontSize: '1.5rem', fontFamily: 'Space Grotesk' }}>02</div>
            <h4>0–100</h4>
            <p>Contractor Performance Score</p>
          </div>
          <div className="value-item">
            <div style={{ color: '#2563EB', fontWeight: '800', fontSize: '1.5rem', fontFamily: 'Space Grotesk' }}>03</div>
            <h4>80 / 20</h4>
            <p>Construction & Retained Assurance</p>
          </div>
          <div className="value-item">
            <div style={{ color: '#2563EB', fontWeight: '800', fontSize: '1.5rem', fontFamily: 'Space Grotesk' }}>04</div>
            <h4>80 / 20</h4>
            <p>Performance & Price Tender Ranking</p>
          </div>
        </div>
      </div>

      {/* 9. PROBLEM SECTION */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="section-header">
            <div style={{ color: '#2563EB', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '16px' }}>WHY STREETEYE</div>
            <h2 className="section-title">Reporting the problem isn't enough.</h2>
            <p style={{ fontSize: '1.15rem', color: '#64748B', lineHeight: '1.6' }}>
              Road complaints are often recorded without creating meaningful accountability. Citizens may report damage, but responsibility, repair quality, contractor performance and future procurement decisions remain disconnected.
            </p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '32px', color: '#0F172A' }}>StreetEye closes that loop.</h3>
          </div>

          <div className="compare-grid">
            <div className="compare-card muted">
              <h4 style={{ fontSize: '1.2rem', color: '#64748B', marginBottom: '24px', borderBottom: '1px solid #3f4751', paddingBottom: '16px' }}>BEFORE STREETEYE</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: '#64748B' }}>
                <div>Citizen reports road damage</div>
                <div style={{ paddingLeft: '8px', borderLeft: '2px solid #E2E8F0' }}>↓</div>
                <div>Complaint recorded</div>
                <div style={{ paddingLeft: '8px', borderLeft: '2px solid #E2E8F0' }}>↓</div>
                <div>Limited visibility</div>
                <div style={{ paddingLeft: '8px', borderLeft: '2px solid #E2E8F0' }}>↓</div>
                <div>Repair accountability unclear</div>
                <div style={{ paddingLeft: '8px', borderLeft: '2px solid #E2E8F0' }}>↓</div>
                <div>Contractor performance disconnected</div>
              </div>
            </div>
            
            <div className="compare-card highlight">
              <h4 style={{ fontSize: '1.2rem', color: '#2563EB', marginBottom: '24px', borderBottom: '1px solid #BFDBFE', paddingBottom: '16px' }}>WITH STREETEYE</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: '#0F172A', fontWeight: '600' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '8px', height: '8px', background: '#3B82F6', borderRadius: '50%' }}></div> Citizen Reports</div>
                <div style={{ paddingLeft: '3px', borderLeft: '2px solid #BFDBFE', marginLeft: '3px', height: '12px' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '8px', height: '8px', background: '#3B82F6', borderRadius: '50%' }}></div> Authority Verifies</div>
                <div style={{ paddingLeft: '3px', borderLeft: '2px solid #BFDBFE', marginLeft: '3px', height: '12px' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '8px', height: '8px', background: '#3B82F6', borderRadius: '50%' }}></div> Contractor Assigned</div>
                <div style={{ paddingLeft: '3px', borderLeft: '2px solid #BFDBFE', marginLeft: '3px', height: '12px' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '8px', height: '8px', background: '#3B82F6', borderRadius: '50%' }}></div> Repair Evidence</div>
                <div style={{ paddingLeft: '3px', borderLeft: '2px solid #BFDBFE', marginLeft: '3px', height: '12px' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '8px', height: '8px', background: '#3B82F6', borderRadius: '50%' }}></div> Authority Approval</div>
                <div style={{ paddingLeft: '3px', borderLeft: '2px solid #BFDBFE', marginLeft: '3px', height: '12px' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%' }}></div> Performance Updated</div>
                <div style={{ paddingLeft: '3px', borderLeft: '2px solid #A7F3D0', marginLeft: '3px', height: '12px' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '8px', height: '8px', background: '#8B5CF6', borderRadius: '50%' }}></div> Future Tender Ranking</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. CORE WORKFLOW SECTION */}
      <section className="landing-section" id="how-it-works" style={{ background: 'white' }}>
        <div className="landing-container">
          <div className="section-header">
            <div style={{ color: '#2563EB', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '16px' }}>END-TO-END ACCOUNTABILITY</div>
            <h2 className="section-title">From one road complaint to long-term accountability.</h2>
          </div>

          <div className="workflow-flex">
            {[
              { num: '1', title: 'REPORT', desc: 'Citizen submits road issue, evidence and location.' },
              { num: '2', title: 'ANALYZE', desc: 'AI assists in identifying damage and severity.' },
              { num: '3', title: 'VERIFY', desc: 'Authority reviews complaint evidence.' },
              { num: '4', title: 'ASSIGN', desc: 'Responsible contractor receives the task.' },
              { num: '5', title: 'REPAIR', desc: 'Contractor fixes the road and provides evidence.' },
              { num: '6', title: 'APPROVE', desc: 'Authority independently verifies rectification.' },
              { num: '7', title: 'SCORE', desc: 'Contractor performance metrics update.' },
              { num: '8', title: 'RANK', desc: 'Performance influences future tender ranking.' }
            ].map(step => (
              <div key={step.num} className="workflow-step">
                <div className="step-icon">{step.num}</div>
                <h5 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '8px', color: '#0F172A' }}>{step.title}</h5>
                <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: '1.4', margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. CORE FEATURES SECTION */}
      <section className="landing-section" id="features">
        <div className="landing-container">
          <div className="section-header">
            <div style={{ color: '#2563EB', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '16px' }}>ONE CONNECTED PLATFORM</div>
            <h2 className="section-title">Road monitoring, repair and accountability in one system.</h2>
          </div>

          <div className="feature-grid">
            {[
              { icon: <MapPin />, title: 'Citizen Road Reporting', desc: 'Report road damage with evidence, description and GPS location, then track the complaint throughout its entire lifecycle.' },
              { icon: <BrainCircuit />, title: 'AI-Assisted Road Analysis', desc: 'Analyze road evidence to estimate damage type, severity and recommended priority while leaving final verification to the authority.' },
              { icon: <Activity />, title: 'Authority Command Center', desc: 'Monitor complaints, locations, contractor assignments, repairs, budgets and infrastructure activity from one operational dashboard.' },
              { icon: <Camera />, title: 'Verified Repair Evidence', desc: 'Contractors submit before-and-after road evidence before an authority can approve rectification and resolve the complaint.' },
              { icon: <BarChart4 />, title: 'Contractor Performance Intelligence', desc: 'Measure contractors using actual repair quality, rectification, timeliness, repeat issues and budget compliance.' },
              { icon: <Gavel />, title: 'Smart Tender Ranking', desc: 'Combine contractor performance and quotation instead of automatically selecting the lowest bidder.' }
            ].map(feature => (
              <div key={feature.title} className="feature-card">
                <div style={{ width: '56px', height: '56px', background: '#EFF6FF', color: '#2563EB', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px', color: '#0F172A' }}>{feature.title}</h3>
                <p style={{ color: '#64748B', lineHeight: '1.6', margin: 0 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. AI ROAD INTELLIGENCE SECTION */}
      <section className="landing-section landing-section-dark">
        <div className="landing-container">
          <div className="hero-grid">
            <div>
              <div style={{ color: '#06B6D4', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '16px' }}>AI-ASSISTED ROAD INTELLIGENCE</div>
              <h2 className="section-title" style={{ margin: '0 0 24px 0', color: '#a6aeba' }}>Turn road evidence into actionable insight.</h2>
              <p style={{ fontSize: '1.15rem', color: '#94A3B8', lineHeight: '1.6' }}>
                StreetEye uses AI as a decision-support tool to help classify road damage and estimate severity. Final validation remains with the responsible authority.
              </p>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '32px', backdropFilter: 'blur(12px)' }}>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '600', letterSpacing: '1px', marginBottom: '24px' }}>ROAD DAMAGE ANALYSIS</div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '4px' }}>Detected Issue</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'white' }}>Pothole</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '4px' }}>Confidence</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#06B6D4' }}>94%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '4px' }}>Severity</div>
                  <div style={{ display: 'inline-block', background: 'rgba(239,68,68,0.2)', color: '#FCA5A5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700' }}>HIGH</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '4px' }}>Recommended Priority</div>
                  <div style={{ display: 'inline-block', background: 'rgba(245,158,11,0.2)', color: '#FCD34D', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700' }}>URGENT</div>
                </div>
              </div>
              
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: '#94A3B8' }}>Authority Verification</span>
                <span style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '6px 12px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '600' }}>REQUIRED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 13. CONTRACTOR ACCOUNTABILITY SECTION */}
      <section className="landing-section" id="accountability" style={{ background: 'white' }}>
        <div className="landing-container hero-grid">
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '40px' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600', letterSpacing: '1px', marginBottom: '8px' }}>CONTRACTOR PERFORMANCE</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '32px' }}>
              <span style={{ fontSize: '4rem', fontWeight: '800', color: '#10B981', lineHeight: '1', fontFamily: 'Space Grotesk' }}>92</span>
              <span style={{ fontSize: '1.2rem', color: '#94A3B8', fontWeight: '700' }}>/ 100</span>
              <span style={{ marginLeft: 'auto', background: '#D1FAE5', color: '#059669', padding: '6px 12px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '700' }}>EXCELLENT</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { label: 'Rectification Rate', val: 95 },
                { label: 'On-Time Resolution', val: 90 },
                { label: 'Repair Quality', val: 95 },
                { label: 'Repeat Issue Performance', val: 85 },
                { label: 'Budget Compliance', val: 90 }
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                    <span>{stat.label}</span>
                    <span style={{ color: '#10B981' }}>{stat.val}</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${stat.val}%`, height: '100%', background: '#10B981', borderRadius: '4px' }}></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '32px', textAlign: 'center', color: '#64748B', fontSize: '0.9rem', fontStyle: 'italic' }}>
              Transparent. Explainable. Outcome-driven.
            </div>
          </div>

          <div>
            <div style={{ color: '#2563EB', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '16px' }}>MEASURABLE ACCOUNTABILITY</div>
            <h2 className="section-title" style={{ margin: '0 0 24px 0' }}>Contractor quality should be measurable.</h2>
            <p style={{ fontSize: '1.15rem', color: '#64748B', lineHeight: '1.6' }}>
              StreetEye builds an explainable contractor performance score using real maintenance outcomes rather than arbitrary ratings.
            </p>
          </div>
        </div>
      </section>

      {/* 14. BUDGET ACCOUNTABILITY SECTION */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="section-header">
            <div style={{ color: '#2563EB', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '16px' }}>FINANCIAL ACCOUNTABILITY</div>
            <h2 className="section-title">Keep quality connected to project spending.</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '24px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', fontFamily: 'Space Grotesk' }}>80% Construction</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#3B82F6', fontFamily: 'Space Grotesk' }}>20% Retained Assurance</div>
            </div>
          </div>

          <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600', letterSpacing: '1px', marginBottom: '8px' }}>PROJECT BUDGET</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0F172A', fontFamily: 'Space Grotesk', marginBottom: '32px' }}>₹1,00,00,000</div>
            
            <div style={{ display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
              <div style={{ width: '80%', background: '#94A3B8' }}></div>
              <div style={{ width: '20%', background: '#3B82F6' }}></div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: '600' }}>80%</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A' }}>Construction Allocation</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#64748B', marginTop: '4px' }}>₹80,00,000</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', color: '#3B82F6', fontWeight: '600' }}>20%</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A' }}>Retained Assurance</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#3B82F6', marginTop: '4px' }}>₹20,00,000</div>
              </div>
            </div>
          </div>

          <p style={{ textAlign: 'center', maxWidth: '700px', margin: '48px auto 0', fontSize: '1.1rem', color: '#64748B', lineHeight: '1.6' }}>
            StreetEye tracks retained assurance as an accountability mechanism, helping authorities keep road quality and rectification visible throughout the maintenance lifecycle.
          </p>
        </div>
      </section>

      {/* 15. SMART TENDER SECTION */}
      <section className="landing-section" style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="landing-container hero-grid">
          <div>
            <div style={{ color: '#2563EB', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '16px' }}>PERFORMANCE-DRIVEN PROCUREMENT</div>
            <h2 className="section-title" style={{ margin: '0 0 24px 0' }}>Lowest price shouldn't automatically mean first place.</h2>
            <p style={{ fontSize: '1.15rem', color: '#64748B', lineHeight: '1.6', marginBottom: '32px' }}>
              StreetEye combines proven contractor performance with price competitiveness, helping authorities prioritize long-term infrastructure quality instead of choosing solely by quotation.
            </p>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0F172A', fontFamily: 'Space Grotesk' }}>
              80% PERFORMANCE<br/>+ 20% PRICE
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'white', border: '2px solid #10B981', padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 10px 20px -5px rgba(16,185,129,0.15)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, background: '#10B981', color: 'white', padding: '4px 12px', fontSize: '0.75rem', fontWeight: '700', borderBottomLeftRadius: '12px' }}>RECOMMENDED</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10B981', width: '32px' }}>#1</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A' }}>Apex Roads</div>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Performance: <span style={{ fontWeight: '700', color: '#10B981' }}>92</span></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>₹10 Cr</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Quotation</div>
              </div>
            </div>

            <div style={{ background: 'white', border: '1px solid #E2E8F0', padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#94A3B8', width: '32px' }}>#2</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A' }}>Metro Infra</div>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Performance: <span style={{ fontWeight: '700' }}>76</span></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>₹8 Cr</div>
              </div>
            </div>

            <div style={{ background: 'white', border: '1px solid #E2E8F0', padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, background: '#F1F5F9', color: '#64748B', padding: '4px 12px', fontSize: '0.75rem', fontWeight: '700', borderBottomLeftRadius: '12px' }}>Lowest Quote</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#94A3B8', width: '32px' }}>#3</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A' }}>UrbanWorks</div>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Performance: <span style={{ fontWeight: '700', color: '#EF4444' }}>41</span></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>₹6 Cr</div>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#EF4444' }}>
              Lowest quotation ≠ automatic winner
            </div>
          </div>
        </div>
      </section>

      {/* 16. ROLE-BASED PLATFORM SECTION */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="section-header">
            <div style={{ color: '#2563EB', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '16px' }}>ONE PLATFORM. THREE EXPERIENCES.</div>
            <h2 className="section-title">Built for everyone involved.</h2>
          </div>

          <div className="feature-grid">
            <div className="feature-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>CITIZEN</div>
              <h3 style={{ fontSize: '1.1rem', color: '#2563EB', marginBottom: '24px' }}>Report. Track. Stay Informed.</h3>
              <ul style={{ paddingLeft: '20px', color: '#64748B', lineHeight: '1.8', marginBottom: '32px', flex: 1 }}>
                <li>Report road damage</li>
                <li>Upload evidence</li>
                <li>Add GPS location</li>
                <li>Track complaint progress</li>
                <li>View repair status</li>
              </ul>
              <Link to="/citizen/complaints/new" className="btn-primary-landing" style={{ justifyContent: 'center', width: '100%' }}>Report an Issue</Link>
            </div>

            <div className="feature-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>CONTRACTOR</div>
              <h3 style={{ fontSize: '1.1rem', color: '#10B981', marginBottom: '24px' }}>Repair. Verify. Improve.</h3>
              <ul style={{ paddingLeft: '20px', color: '#64748B', lineHeight: '1.8', marginBottom: '32px', flex: 1 }}>
                <li>View assigned complaints</li>
                <li>Start repair workflow</li>
                <li>Upload before/after evidence</li>
                <li>Track contractor performance</li>
                <li>Improve accountability score</li>
              </ul>
              <Link to="/login" className="btn-primary-landing" style={{ justifyContent: 'center', width: '100%', background: '#10B981' }} onMouseOver={e => e.currentTarget.style.background = '#059669'} onMouseOut={e => e.currentTarget.style.background = '#10B981'}>Contractor Login</Link>
            </div>

            <div className="feature-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>AUTHORITY</div>
              <h3 style={{ fontSize: '1.1rem', color: '#8B5CF6', marginBottom: '24px' }}>Monitor. Decide. Hold Accountable.</h3>
              <ul style={{ paddingLeft: '20px', color: '#64748B', lineHeight: '1.8', marginBottom: '32px', flex: 1 }}>
                <li>Verify citizen complaints</li>
                <li>Assign contractors</li>
                <li>Monitor road repairs</li>
                <li>Track budgets</li>
                <li>Review contractor performance</li>
                <li>Rank tender participants</li>
              </ul>
              <Link to="/login" className="btn-primary-landing" style={{ justifyContent: 'center', width: '100%', background: '#8B5CF6' }} onMouseOver={e => e.currentTarget.style.background = '#7C3AED'} onMouseOut={e => e.currentTarget.style.background = '#8B5CF6'}>Authority Login</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 17. IMPACT SECTION */}
      <section className="landing-section" style={{ background: 'white' }}>
        <div className="landing-container">
          <div className="section-header">
            <div style={{ color: '#2563EB', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '16px' }}>WHY IT MATTERS</div>
            <h2 className="section-title">From reactive complaints to accountable infrastructure.</h2>
          </div>
          
          <div className="feature-grid">
            <div className="compare-card" style={{ background: '#F8FAFC' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0F172A', marginBottom: '12px' }}>Faster Visibility</h4>
              <p style={{ color: '#64748B', margin: 0, lineHeight: '1.6' }}>Road problems reach authorities with evidence and location.</p>
            </div>
            <div className="compare-card" style={{ background: '#F8FAFC' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0F172A', marginBottom: '12px' }}>Verified Repairs</h4>
              <p style={{ color: '#64748B', margin: 0, lineHeight: '1.6' }}>Complaints remain tracked until repair evidence is approved.</p>
            </div>
            <div className="compare-card" style={{ background: '#F8FAFC' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0F172A', marginBottom: '12px' }}>Contractor Accountability</h4>
              <p style={{ color: '#64748B', margin: 0, lineHeight: '1.6' }}>Actual road-maintenance outcomes influence performance scores.</p>
            </div>
            <div className="compare-card" style={{ background: '#F8FAFC' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0F172A', marginBottom: '12px' }}>Better Procurement</h4>
              <p style={{ color: '#64748B', margin: 0, lineHeight: '1.6' }}>Contractor history contributes to future tender decisions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 18. FINAL CTA */}
      <section style={{ padding: '100px 24px', background: '#071426', color: 'white', textAlign: 'center' }}>
        <div className="landing-container" style={{ maxWidth: '800px' }}>
          <h2 className="section-title" style={{ margin: '0 0 24px 0',color: '#a6aeba' }}>Better roads begin with better accountability.</h2>
          <p style={{ fontSize: '1.15rem', color: '#94A3B8', lineHeight: '1.6', marginBottom: '40px' }}>
            Report infrastructure problems, verify repairs and build a performance-driven road maintenance ecosystem with StreetEye.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/citizen/complaints/new" className="btn-primary-landing" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
              Report a Road Issue
            </Link>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: '600', fontSize: '1.1rem', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
              Login to StreetEye
            </Link>
          </div>
        </div>
      </section>

      {/* 19. FOOTER */}
      <footer style={{ background: '#0F172A', color: 'white', padding: '60px 24px 40px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="landing-container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '40px', marginBottom: '32px' }}>
          <div style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>StreetEye</span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: '1.7', textAlign: 'justify' }}>
              StreetEye is a smart road safety and accountability platform that connects citizens, 
              contractors, and authorities in one system. Citizens can report road problems with photos
              and location details, authorities can verify and assign the issue, and contractors can
              complete repairs with before-and-after evidence. StreetEye also tracks contractor performance,
              project budgets, and future tender rankings, helping ensure that road maintenance is transparent,
              measurable, and focused on quality.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '8px' }}>Platform</span>
              <a href="#how-it-works" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.9rem' }}>How It Works</a>
              <a href="#features" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.9rem' }}>Features</a>
              <Link to="/login" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.9rem' }}>Login</Link>
            </div>
          </div>
        </div>
        <div className="landing-container" style={{ color: '#64748B', fontSize: '0.85rem', textAlign: 'center' }}>
          AI-Powered Road Safety & Contractor Accountability System
        </div>
      </footer>
    </div>
  );
}
