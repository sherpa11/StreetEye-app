import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { dashboardAPI } from '../../api/api';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDate } from '../../utils/helpers';
import { Briefcase, AlertCircle, CheckCircle, Clock, ArrowRight, Activity, Zap } from 'lucide-react';

export default function ContractorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardAPI.contractor();
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <DashboardLayout title="Contractor Dashboard"><div className="loading-center"><div className="spinner"></div><span>Loading...</span></div></DashboardLayout>;
  if (error) return <DashboardLayout title="Contractor Dashboard"><div className="alert alert-error">{error}</div></DashboardLayout>;

  const score = data.metrics?.overallScore || 0;
  const scoreColor = score < 50 ? 'var(--danger)' : score < 75 ? 'var(--warning)' : 'var(--success)';

  return (
    <DashboardLayout title="Contractor Dashboard" subtitle="Manage your assignments and performance">
      
      {/* Top Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '24px', marginBottom: '35px' }}>
        
        {/* Premium Score Card */}
        <div style={{
          background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
          borderRadius: '24px',
          padding: '32px 24px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 12px 24px -10px rgba(15, 23, 42, 0.05), inset 0 2px 4px rgba(255,255,255,0.5)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Subtle background glow based on score */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '200px', background: `radial-gradient(circle, ${scoreColor}22 0%, transparent 70%)`, filter: 'blur(20px)', zIndex: 0 }} />
          
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.6rem', fontWeight: '700', color: 'var(--gray-700)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={25} color={scoreColor} /> Performance Score
            </div>
            
            <div style={{ 
              width: '160px', height: '160px', borderRadius: '50%', 
              background: `conic-gradient(${scoreColor} calc(${score} * 1%), var(--gray-100) 0)`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '20px 0', position: 'relative',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <div style={{ 
                width: '130px', height: '130px', borderRadius: '50%', background: 'white', 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)'
              }}>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '2.5rem', fontWeight: '800', color: scoreColor, lineHeight: 1 }}>
                  {score.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', fontWeight: '600', letterSpacing: '1px', marginTop: '4px' }}>OUT OF 100</div>
              </div>
            </div>
            <Link to="/contractor/performance" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent)', textDecoration: 'none', background: 'var(--accent-subtle)', padding: '8px 16px', borderRadius: '20px', transition: 'all 0.2s' }}>
              View Breakdown <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Premium Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {[
            { label: 'Assigned', value: data.stats.assigned, color: '#3b82f6', icon: Briefcase, bg: '#eff6ff' },
            { label: 'Active', value: data.stats.active, color: '#f59e0b', icon: Activity, bg: '#fffbeb' },
            { label: 'Submitted', value: data.stats.submitted, color: '#8b5cf6', icon: Clock, bg: '#f5f3ff' },
            { label: 'Completed', value: data.stats.completed, color: '#10b981', icon: CheckCircle, bg: '#ecfdf5' },
          ].map(stat => (
            <div key={stat.label} style={{ 
              background: 'white', borderRadius: '20px', padding: '24px', 
              border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                  <stat.icon size={24} strokeWidth={2.5} />
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--gray-900)', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1, marginBottom: '8px' }}>
                  {stat.value ?? 0}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {stat.label} Projects
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Assignments */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 4px' }}>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.2rem', fontWeight: '700', color: 'var(--gray-900)' }}>Recent Assignments</span>
          <Link to="/contractor/assignments" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)', textDecoration: 'none' }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>
        
        {(!data.recent || data.recent.length === 0) ? (
          <div style={{ background: 'white', borderRadius: '20px', border: '1px dashed var(--gray-300)', padding: '60px', textAlign: 'center', color: 'var(--gray-500)' }}>
            <AlertCircle size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
            <div style={{ fontWeight: '500' }}>No recent assignments</div>
            <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>New tasks assigned by authorities will appear here.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {data.recent.map(comp => (
              <Link 
                key={comp._id} 
                to={`/contractor/assignments/${comp._id}`}
                style={{ 
                  background: 'white', border: '1px solid var(--gray-200)', borderRadius: '16px', 
                  padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  textDecoration: 'none', transition: 'all 0.2s ease', boxShadow: 'var(--shadow-sm)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(6px)'; e.currentTarget.style.borderColor = 'var(--accent-light)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gray-50)', border: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-500)' }}>
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: '700', color: 'var(--gray-900)', fontSize: '1.1rem' }}>
                        {comp.ticketId}
                      </span>
                      <StatusBadge status={comp.status} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                      <span style={{ background: 'var(--gray-100)', padding: '2px 8px', borderRadius: '12px', fontWeight: '500', color: 'var(--gray-700)' }}>{comp.issueType}</span>
                      <span>•</span>
                      <span>{comp.location?.address || 'Location not specified'}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}>
                    <ArrowRight size={16} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Updated {formatDate(comp.updatedAt)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </DashboardLayout>
  );
}
