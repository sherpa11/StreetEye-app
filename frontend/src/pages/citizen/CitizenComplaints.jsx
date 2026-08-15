import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { complaintsAPI } from '../../api/api';
import { StatusBadge, SeverityBadge } from '../../components/StatusBadge';
import { formatDate } from '../../utils/helpers';
import { Plus } from 'lucide-react';

export default function CitizenComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await complaintsAPI.getMy();
        setComplaints(res.data.complaints);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load complaints');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  if (loading) return <DashboardLayout title="My Complaints"><div className="spinner"></div></DashboardLayout>;
  if (error) return <DashboardLayout title="My Complaints"><div className="error-message">{error}</div></DashboardLayout>;

  return (
    <DashboardLayout 
      title="My Complaints"
      actions={
        <Link to="/citizen/complaints/new" className="btn btn-primary">
          <Plus size={18} /> New Complaint
        </Link>
      }
    >
      {complaints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: 'white', borderRadius: '8px', color: '#64748b' }}>
          <p>You haven't reported any issues yet.</p>
          <Link to="/citizen/complaints/new" style={{ color: '#3b82f6', fontWeight: 'bold' }}>Report your first issue</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {complaints.map(comp => (
            <Link 
              key={comp._id} 
              to={`/citizen/complaints/${comp._id}`}
              className="complaint-card"
              style={{ 
                background: 'white', 
                borderRadius: '8px', 
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ height: '160px', overflow: 'hidden' }}>
                <img 
                  src={`http://localhost:5000${comp.evidenceImage}`} 
                  alt="Evidence" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {e.target.src = 'https://via.placeholder.com/300x160?text=No+Image'}}
                />
              </div>
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{comp.ticketId}</div>
                  <StatusBadge status={comp.status} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>{comp.issueType}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {comp.location?.address || 'Location unknown'}
                  </div>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                  <SeverityBadge severity={comp.aiAnalysis?.severity || 'LOW'} />
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{formatDate(comp.createdAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
