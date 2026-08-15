import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { complaintsAPI } from '../../api/api';
import { StatusBadge, SeverityBadge } from '../../components/StatusBadge';
import { formatDate } from '../../utils/helpers';

export default function AuthorityComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  
  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, severityFilter]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (severityFilter) params.severity = severityFilter;
      
      const res = await complaintsAPI.getAll(params);
      setComplaints(res.data.complaints);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Complaints Management">
      
      {/* Filters */}
      <div className="card" style={{ background: 'white', padding: '16px 24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold' }}>Filters:</div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="VERIFIED">Verified</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RECTIFICATION_SUBMITTED">Rectification Submitted</option>
          <option value="RESOLVED">Resolved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
          <option value="">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="card" style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 24px', color: '#64748b', fontWeight: '500' }}>Ticket</th>
                  <th style={{ padding: '12px 24px', color: '#64748b', fontWeight: '500' }}>Citizen</th>
                  <th style={{ padding: '12px 24px', color: '#64748b', fontWeight: '500' }}>Issue</th>
                  <th style={{ padding: '12px 24px', color: '#64748b', fontWeight: '500' }}>Severity</th>
                  <th style={{ padding: '12px 24px', color: '#64748b', fontWeight: '500' }}>Status</th>
                  <th style={{ padding: '12px 24px', color: '#64748b', fontWeight: '500' }}>Date</th>
                  <th style={{ padding: '12px 24px', color: '#64748b', fontWeight: '500' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No complaints found matching filters.</td>
                  </tr>
                ) : (
                  complaints.map(comp => (
                    <tr key={comp._id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 24px', fontWeight: '500' }}>{comp.ticketId}</td>
                      <td style={{ padding: '12px 24px' }}>{comp.citizenId?.name || 'Unknown'}</td>
                      <td style={{ padding: '12px 24px' }}>{comp.issueType}</td>
                      <td style={{ padding: '12px 24px' }}><SeverityBadge severity={comp.aiAnalysis?.severity || 'LOW'} /></td>
                      <td style={{ padding: '12px 24px' }}><StatusBadge status={comp.status} /></td>
                      <td style={{ padding: '12px 24px', color: '#64748b', fontSize: '14px' }}>{formatDate(comp.createdAt)}</td>
                      <td style={{ padding: '12px 24px' }}>
                        <Link to={`/authority/complaints/${comp._id}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500', padding: '6px 12px', border: '1px solid #3b82f6', borderRadius: '4px' }}>View Details</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
