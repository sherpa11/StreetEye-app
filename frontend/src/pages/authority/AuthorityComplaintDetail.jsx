import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { complaintsAPI, contractorsAPI } from '../../api/api';
import { StatusBadge, SeverityBadge } from '../../components/StatusBadge';
import { formatDate } from '../../utils/helpers';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow });

export default function AuthorityComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Action Modals State
  const [showModal, setShowModal] = useState(''); // 'verify', 'reject', 'assign', 'approve_repair', 'reject_repair'
  const [remarks, setRemarks] = useState('');
  const [selectedContractor, setSelectedContractor] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const res = await complaintsAPI.getById(id);
      const data = res.data.complaint;
      setComplaint(data);
      if (data.status === 'VERIFIED') {
        const contRes = await contractorsAPI.getAll();
        setContractors(contRes.data.contractors);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionFn, payload, successMsg) => {
    setActionLoading(true);
    try {
      await actionFn(id, payload);
      alert(successMsg);
      setShowModal('');
      setRemarks('');
      setAssignmentNotes('');
      setSelectedContractor('');
      await fetchComplaint(); // Refresh data
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const onVerify = () => handleAction(complaintsAPI.verify, { remarks }, 'Complaint verified');
  const onReject = () => handleAction(complaintsAPI.reject, { remarks }, 'Complaint rejected');
  const onAssign = () => handleAction(complaintsAPI.assign, { contractorId: selectedContractor, notes: assignmentNotes }, 'Assigned to contractor');
  const onApproveRepair = () => handleAction(complaintsAPI.approveRectification, { remarks }, 'Repair approved and resolved');
  const onRejectRepair = () => handleAction(complaintsAPI.rejectRectification, { remarks }, 'Repair rejected, sent back to contractor');

  if (loading) return <DashboardLayout title="Complaint Details"><div className="spinner"></div></DashboardLayout>;
  if (error) return <DashboardLayout title="Complaint Details"><div className="error-message">{error}</div></DashboardLayout>;
  if (!complaint) return null;

  const getImgUrl = (path) => path ? `http://localhost:5000${path}` : '';

  return (
    <DashboardLayout 
      title={`Ticket: ${complaint.ticketId}`}
      actions={<StatusBadge status={complaint.status} />}
    >
      
      {/* Action Bar */}
      <div className="card" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--primary-bg)', border: '1px solid var(--primary-light)' }}>
        <div style={{ fontWeight: '700', marginRight: 'auto', color: 'var(--primary)', fontFamily: 'Space Grotesk, sans-serif' }}>Action Required:</div>
        
        {(complaint.status === 'NEW' || complaint.status === 'UNDER_REVIEW') && (
          <>
            <button onClick={() => setShowModal('verify')} className="btn btn-success">Verify Incident</button>
            <button onClick={() => setShowModal('reject')} className="btn btn-danger">Reject</button>
          </>
        )}

        {complaint.status === 'VERIFIED' && (
          <button onClick={() => setShowModal('assign')} className="btn btn-primary">Assign Contractor</button>
        )}

        {(complaint.status === 'RECTIFICATION_SUBMITTED' || complaint.status === 'AUTHORITY_VERIFICATION') && (
          <>
            <button onClick={() => setShowModal('approve_repair')} className="btn btn-success">Approve Repair & Resolve</button>
            <button onClick={() => setShowModal('reject_repair')} className="btn btn-danger">Reject & Re-assign</button>
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card">
            <div className="card-header" style={{ padding: '24px 28px', borderBottom: '1px solid var(--gray-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--gray-900)' }}>{complaint.issueType}</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <SeverityBadge severity={complaint.aiAnalysis?.severity || 'LOW'} />
                </div>
              </div>
            </div>
            
            <div className="card-body" style={{ padding: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', fontSize: '0.9rem', marginBottom: '32px' }}>
                <div style={{ fontWeight: '600', color: 'var(--gray-500)' }}>Reported By:</div>
                <div style={{ fontWeight: '500', color: 'var(--gray-900)' }}>{complaint.citizenId?.name} <span style={{ color: 'var(--gray-400)', marginLeft: '4px' }}>({complaint.citizenId?.phone})</span></div>
                
                <div style={{ fontWeight: '600', color: 'var(--gray-500)' }}>Date:</div>
                <div style={{ fontWeight: '500', color: 'var(--gray-900)' }}>{formatDate(complaint.createdAt)}</div>
                
                <div style={{ fontWeight: '600', color: 'var(--gray-500)' }}>Description:</div>
                <div style={{ color: 'var(--gray-700)', lineHeight: '1.6' }}>{complaint.description}</div>
                
                {complaint.assignedTo && (
                  <>
                    <div style={{ fontWeight: '600', color: 'var(--gray-500)' }}>Contractor:</div>
                    <div style={{ fontWeight: '500', color: 'var(--primary)' }}>{complaint.assignedTo.firmName} ({complaint.assignedTo.contractorNumber})</div>
                  </>
                )}
              </div>

              <div className="section-title" style={{ marginBottom: '16px' }}>Citizen Evidence</div>
              {complaint.evidenceImage ? (
                <div className="image-box">
                  <img src={getImgUrl(complaint.evidenceImage)} alt="Evidence" style={{ height: 'auto', maxHeight: '400px' }} />
                </div>
              ) : (
                <div className="empty-state" style={{ background: 'var(--gray-50)', padding: '32px', borderRadius: 'var(--radius-sm)' }}>
                  No image provided by citizen.
                </div>
              )}
            </div>
          </div>

          {/* Repair Evidence */}
          {(complaint.repair?.beforeImage || complaint.repair?.afterImage) && (
            <div className="card" style={{ padding: '28px' }}>
              <div className="section-title" style={{ marginBottom: '20px' }}>Rectification Evidence</div>
              <div className="before-after-grid">
                {complaint.repair?.beforeImage && (
                  <div className="image-box">
                    <img src={getImgUrl(complaint.repair.beforeImage)} alt="Before" style={{ height: '240px' }} />
                    <div className="image-box-label">Before Repair</div>
                  </div>
                )}
                {complaint.repair?.afterImage && (
                  <div className="image-box">
                    <img src={getImgUrl(complaint.repair.afterImage)} alt="After" style={{ height: '240px' }} />
                    <div className="image-box-label" style={{ color: 'var(--success)' }}>After Repair</div>
                  </div>
                )}
              </div>
              {complaint.repair?.repairNotes && (
                <div style={{ marginTop: '20px', padding: '16px', background: 'var(--info-bg)', border: '1px solid rgba(2, 132, 199, 0.2)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: '600', color: 'var(--info)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px' }}>Contractor Notes</div>
                  <div style={{ color: 'var(--gray-800)', fontSize: '0.9rem' }}>{complaint.repair.repairNotes}</div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Location */}
          <div className="card" style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Location</h3>
            <p style={{ fontSize: '14px', marginBottom: '16px', color: '#475569' }}>{complaint.location?.address}</p>
            {complaint.location?.latitude && complaint.location?.longitude && (
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', zIndex: 0 }}>
                <MapContainer center={[complaint.location.latitude, complaint.location.longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[complaint.location.latitude, complaint.location.longitude]} />
                </MapContainer>
              </div>
            )}
          </div>

          {/* AI Analysis */}
          {complaint.aiAnalysis && (
            <div className="ai-result-card" style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>🤖 AI Assessment</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Detected</span>
                  <span style={{ fontWeight: '500',color:'#64748b' }}>{complaint.aiAnalysis.detectedIssue}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Confidence</span>
                  <span style={{ fontWeight: '500',color:'#64748b' }}>{complaint.aiAnalysis.confidence}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Priority</span>
                  <span style={{ fontWeight: '500',color:'#64748b' }}>{complaint.aiAnalysis.recommendedPriority}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODALS */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title" style={{ textTransform: 'capitalize' }}>{showModal.replace('_', ' ')} Incident</div>
              <button className="modal-close" onClick={() => setShowModal('')}>✕</button>
            </div>
            
            {showModal === 'assign' && (
              <div className="form-group">
                <label className="form-label">Select Contractor <span>*</span></label>
                <select className="form-control" value={selectedContractor} onChange={e => setSelectedContractor(e.target.value)}>
                  <option value="">-- Choose Contractor --</option>
                  {contractors.map(c => (
                    <option key={c._id} value={c._id}>{c.firmName} (Score: {(c.metrics?.overallScore || 0).toFixed(1)})</option>
                  ))}
                </select>
                <label className="form-label" style={{ marginTop: '20px' }}>Assignment Notes</label>
                <textarea className="form-control" value={assignmentNotes} onChange={e => setAssignmentNotes(e.target.value)} placeholder="Instructions for contractor..."></textarea>
              </div>
            )}

            {['verify', 'reject', 'approve_repair', 'reject_repair'].includes(showModal) && (
              <div className="form-group">
                <label className="form-label">Remarks {showModal.includes('reject') ? <span>*</span> : <span style={{ color: 'var(--gray-400)', fontWeight: 'normal' }}>(Optional)</span>}</label>
                <textarea className="form-control" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Enter remarks..."></textarea>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
              <button onClick={() => setShowModal('')} className="btn btn-secondary">Cancel</button>
              <button 
                onClick={() => {
                  if (showModal === 'verify') onVerify();
                  if (showModal === 'reject') onReject();
                  if (showModal === 'assign') onAssign();
                  if (showModal === 'approve_repair') onApproveRepair();
                  if (showModal === 'reject_repair') onRejectRepair();
                }}
                disabled={actionLoading || (showModal.includes('reject') && !remarks) || (showModal === 'assign' && !selectedContractor)}
                className="btn btn-primary"
              >
                {actionLoading ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
