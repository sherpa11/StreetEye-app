import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { complaintsAPI } from '../../api/api';
import { StatusBadge, SeverityBadge } from '../../components/StatusBadge';

export default function ContractorAssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Forms state
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await complaintsAPI.getById(id);
        setComplaint(res.data.complaint);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load assignment');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  const handleStartRepair = async (e) => {
    e.preventDefault();
    if (!beforeImage) return alert('Please upload a before image');
    
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('beforeImage', beforeImage);
      await complaintsAPI.startRepair(id, formData);
      alert('Repair started successfully');
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start repair');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitRectification = async (e) => {
    e.preventDefault();
    if (!afterImage) return alert('Please upload an after image');
    if (!notes) return alert('Please provide repair notes');

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('afterImage', afterImage);
      formData.append('notes', notes);
      await complaintsAPI.submitRectification(id, formData);
      alert('Rectification submitted successfully');
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit rectification');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <DashboardLayout title="Assignment Details"><div className="spinner"></div></DashboardLayout>;
  if (error) return <DashboardLayout title="Assignment Details"><div className="error-message">{error}</div></DashboardLayout>;
  if (!complaint) return null;

  const getImgUrl = (path) => path ? `http://localhost:5000${path}` : '';

  return (
    <DashboardLayout 
      title={`Ticket: ${complaint.ticketId}`}
      actions={<StatusBadge status={complaint.status} />}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Action Area based on status */}
          <div className="card" style={{ background: 'white', padding: '24px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            
            {complaint.status === 'ASSIGNED' && (
              <form onSubmit={handleStartRepair}>
                <h3 style={{ margin: '0 0 16px 0' }}>Step 1: Start Repair</h3>
                <p style={{ color: '#475569', marginBottom: '16px' }}>Upload a photo of the site before starting the repair work.</p>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Before Image *</label>
                  <input type="file" accept="image/*" onChange={e => setBeforeImage(e.target.files[0])} required style={{ display: 'block', width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                </div>
                <button type="submit" disabled={actionLoading} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {actionLoading ? 'Saving...' : 'Start Repair'}
                </button>
              </form>
            )}

            {complaint.status === 'IN_PROGRESS' && (
              <form onSubmit={handleSubmitRectification}>
                <h3 style={{ margin: '0 0 16px 0' }}>Step 2: Submit Rectification</h3>
                <p style={{ color: '#475569', marginBottom: '16px' }}>Upload a photo of the completed repair and provide notes.</p>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>After Image *</label>
                  <input type="file" accept="image/*" onChange={e => setAfterImage(e.target.files[0])} required style={{ display: 'block', width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Repair Notes *</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} required rows={3} placeholder="Describe the materials used and work done..." style={{ display: 'block', width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}></textarea>
                </div>
                <button type="submit" disabled={actionLoading} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {actionLoading ? 'Submitting...' : 'Submit Rectification'}
                </button>
              </form>
            )}

            {(complaint.status === 'RECTIFICATION_SUBMITTED' || complaint.status === 'AUTHORITY_VERIFICATION') && (
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#f59e0b' }}>Waiting for Authority Review</h3>
                <p style={{ color: '#475569', margin: 0 }}>You have submitted the repair evidence. The authority will review it soon.</p>
              </div>
            )}

            {complaint.status === 'RESOLVED' && (
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#10b981' }}>Repair Approved</h3>
                <p style={{ color: '#475569', margin: 0 }}>This issue has been successfully resolved and approved by the authority.</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="card" style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>Issue Details</h2>
              <SeverityBadge severity={complaint.aiAnalysis?.severity || 'LOW'} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', fontSize: '14px', marginBottom: '24px' }}>
              <div style={{ fontWeight: 'bold', color: '#64748b' }}>Issue Type:</div>
              <div>{complaint.issueType}</div>
              <div style={{ fontWeight: 'bold', color: '#64748b' }}>Description:</div>
              <div>{complaint.description}</div>
              <div style={{ fontWeight: 'bold', color: '#64748b' }}>Location:</div>
              <div>{complaint.location?.address}</div>
            </div>

            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Citizen Evidence</h3>
            {complaint.evidenceImage ? (
              <img src={getImgUrl(complaint.evidenceImage)} alt="Evidence" style={{ width: '100%', borderRadius: '8px', maxHeight: '400px', objectFit: 'contain', background: '#f1f5f9' }} />
            ) : (
              <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                No image provided by citizen.
              </div>
            )}
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Repair Evidence Display */}
          {(complaint.repair?.beforeImage || complaint.repair?.afterImage) && (
            <div className="card" style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Submitted Evidence</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {complaint.repair?.beforeImage && (
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Before</div>
                    <img src={getImgUrl(complaint.repair.beforeImage)} alt="Before" style={{ width: '100%', borderRadius: '8px' }} />
                  </div>
                )}
                {complaint.repair?.afterImage && (
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>After</div>
                    <img src={getImgUrl(complaint.repair.afterImage)} alt="After" style={{ width: '100%', borderRadius: '8px' }} />
                  </div>
                )}
                {complaint.repair?.repairNotes && (
                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', fontSize: '14px' }}>
                    <strong>Notes:</strong> {complaint.repair.repairNotes}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* AI Analysis */}
          {complaint.aiAnalysis && (
            <div className="ai-result-card" style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>🤖 AI Assessment</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Priority</span>
                  <span style={{ fontWeight: '500',color: '#64748b' }}>{complaint.aiAnalysis.recommendedPriority}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
