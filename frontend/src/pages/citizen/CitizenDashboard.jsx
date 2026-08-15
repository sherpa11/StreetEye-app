import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { dashboardAPI } from '../../api/api';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDate } from '../../utils/helpers';
import { Plus, AlertCircle, FileText, Activity, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export default function CitizenDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardAPI.citizen();
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <DashboardLayout title="Dashboard"><div className="loading-center"><div className="spinner"></div><span>Loading...</span></div></DashboardLayout>;
  if (error) return <DashboardLayout title="Dashboard"><div className="alert alert-error">{error}</div></DashboardLayout>;

  return (
    <DashboardLayout 
      title="Dashboard" 
      actions={
        <Link to="/citizen/complaints/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> New Complaint
        </Link>
      }
    >
      {/* Premium Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {[
          { label: 'Total Complaints', value: data.stats.total, color: '#3b82f6', icon: FileText, bg: '#eff6ff' },
          { label: 'Open', value: data.stats.open, color: '#f59e0b', icon: Activity, bg: '#fffbeb' },
          { label: 'In Progress', value: data.stats.inProgress, color: '#8b5cf6', icon: Clock, bg: '#f5f3ff' },
          { label: 'Resolved', value: data.stats.resolved, color: '#10b981', icon: CheckCircle, bg: '#ecfdf5' },
          { label: 'Rejected', value: data.stats.rejected, color: '#ef4444', icon: XCircle, bg: '#fef2f2' },
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
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 4px' }}>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.2rem', fontWeight: '700', color: 'var(--gray-900)' }}>Recent Activity</span>
          <Link to="/citizen/complaints" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)', textDecoration: 'none' }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>
        
        {(!data.recent || data.recent.length === 0) ? (
          <div style={{ background: 'white', borderRadius: '20px', border: '1px dashed var(--gray-300)', padding: '60px', textAlign: 'center', color: 'var(--gray-500)' }}>
            <AlertCircle size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
            <div style={{ fontWeight: '500' }}>No recent complaints</div>
            <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Report an issue to see it tracked here.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {data.recent.map(comp => (
              <Link 
                key={comp._id} 
                to={`/citizen/complaints/${comp._id}`}
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
                    <FileText size={20} />
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
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}>
                    <ArrowRight size={16} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{formatDate(comp.createdAt)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
