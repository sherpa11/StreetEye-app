import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { contractorsAPI } from '../../api/api';
import { StatusBadge, SeverityBadge } from '../../components/StatusBadge';
import { formatDate } from '../../utils/helpers';

export default function ContractorAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await contractorsAPI.getAssignments();
        setAssignments(res.data.complaints);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  if (loading) return <DashboardLayout title="Assignments"><div className="spinner"></div></DashboardLayout>;
  if (error) return <DashboardLayout title="Assignments"><div className="error-message">{error}</div></DashboardLayout>;

  const filteredAssignments = assignments.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['ASSIGNED', 'IN_PROGRESS'].includes(a.status);
    if (filter === 'completed') return ['RESOLVED'].includes(a.status);
    return true;
  });

  return (
    <DashboardLayout title="My Assignments">
      
      {/* Glowing Glass Effect NavBar with Sliding Pill */}
      <div style={{ 
        display: 'inline-flex', gap: '0', marginBottom: '32px', position: 'relative',
        background: 'rgba(255, 255, 255, 0.7)', 
        backdropFilter: 'blur(16px)', 
        border: '1px solid rgba(255, 255, 255, 0.8)',
        borderRadius: '16px', 
        padding: '6px',
        boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
      }}>
        
        {/* The Sliding Pill */}
        <div style={{
          position: 'absolute',
          top: '6px', bottom: '6px',
          left: filter === 'all' ? '6px' : filter === 'active' ? '126px' : '246px',
          width: '120px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          boxShadow: '0 6px 16px -4px rgba(37, 99, 235, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          zIndex: 1
        }} />

        {['all', 'active', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`segment-tab ${filter === f ? 'active' : ''}`}
            style={{
              width: '120px',
              padding: '10px 0',
              borderRadius: '12px',
              border: 'none',
              background: 'transparent',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '0.95rem',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'color 0.3s ease, background 0.2s ease',
              position: 'relative',
              zIndex: 2,
              fontWeight: filter === f ? '700' : '600',
              color: filter === f ? 'white' : 'var(--gray-500)',
              textShadow: filter === f ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredAssignments.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', background: 'white', borderRadius: '8px', color: '#64748b' }}>
          No assignments found for this filter.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredAssignments.map(comp => (
            <Link 
              key={comp._id} 
              to={`/contractor/assignments/${comp._id}`}
              style={{ 
                display: 'flex', 
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                textDecoration: 'none', 
                color: 'inherit',
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'; }}
            >
              <div style={{ width: '120px', height: '120px', flexShrink: 0 }}>
                {comp.evidenceImage ? (
                  <img 
                    src={`http://localhost:5000${comp.evidenceImage}`} 
                    alt="Evidence" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {e.target.src = 'https://via.placeholder.com/120?text=No+Img'}}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px', textAlign: 'center', padding: '8px' }}>
                    No Image Provided
                  </div>
                )}
              </div>
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>{comp.ticketId}</div>
                    <div style={{ fontSize: '14px', color: '#475569' }}>{comp.issueType}</div>
                  </div>
                  <StatusBadge status={comp.status} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
                  <div style={{ fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SeverityBadge severity={comp.aiAnalysis?.severity || 'LOW'} />
                    <span>{comp.location?.address}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Assigned: {formatDate(comp.updatedAt)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </DashboardLayout>
  );
}
