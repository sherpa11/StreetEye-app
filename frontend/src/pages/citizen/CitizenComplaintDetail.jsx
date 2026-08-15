import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { complaintsAPI } from '../../api/api';
import { StatusBadge, SeverityBadge } from '../../components/StatusBadge';
import { formatDate } from '../../utils/helpers';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow });

export default function CitizenComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await complaintsAPI.getById(id);
        setComplaint(res.data.complaint);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load complaint');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  if (loading) return <DashboardLayout title="Complaint Details"><div className="spinner"></div></DashboardLayout>;
  if (error) return <DashboardLayout title="Complaint Details"><div className="error-message">{error}</div></DashboardLayout>;
  if (!complaint) return null;

  const getImgUrl = (path) => path ? `http://localhost:5000${path}` : '';

  const TIMELINE_STEPS = [
    { status: 'NEW', label: 'Reported' },
    { status: 'VERIFIED', label: 'Verified by Auth' },
    { status: 'ASSIGNED', label: 'Assigned' },
    { status: 'IN_PROGRESS', label: 'Repairing' },
    { status: 'RECTIFICATION_SUBMITTED', label: 'Repair Submitted' },
    { status: 'RESOLVED', label: 'Resolved' },
  ];

  return (
    <DashboardLayout 
      title={`Ticket: ${complaint.ticketId}`}
      actions={<StatusBadge status={complaint.status} />}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Issue Details */}
          <div className="card" style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>{complaint.issueType}</h2>
              <SeverityBadge severity={complaint.aiAnalysis?.severity || 'LOW'} />
            </div>
            <p style={{ color: '#475569', marginBottom: '24px' }}>{complaint.description}</p>
            
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Evidence</h3>
            {complaint.evidenceImage ? (
              <img src={getImgUrl(complaint.evidenceImage)} alt="Evidence" style={{ width: '100%', borderRadius: '8px', maxHeight: '400px', objectFit: 'contain', background: '#f1f5f9' }} />
            ) : (
              <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                No image provided.
              </div>
            )}
          </div>

          {/* Repair Evidence (if any) */}
          {(complaint.repair?.beforeImage || complaint.repair?.afterImage) && (
            <div className="card" style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Repair Evidence</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {complaint.repair?.beforeImage && (
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>Before</div>
                    <img src={getImgUrl(complaint.repair.beforeImage)} alt="Before Repair" style={{ width: '100%', borderRadius: '8px' }} />
                  </div>
                )}
                {complaint.repair?.afterImage && (
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>After</div>
                    <img src={getImgUrl(complaint.repair.afterImage)} alt="After Repair" style={{ width: '100%', borderRadius: '8px' }} />
                  </div>
                )}
              </div>
              {complaint.repair?.repairNotes && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '6px' }}>
                  <strong>Contractor Notes:</strong> {complaint.repair.repairNotes}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Timeline */}
          <div className="card" style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Status Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {TIMELINE_STEPS.map((step, idx) => {
                const isCompleted = complaint.statusHistory?.some(h => h.status === step.status);
                const isCurrent = complaint.status === step.status;
                const isRejected = complaint.status === 'REJECTED';
                
                return (
                  <div key={step.status} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', 
                      background: isCompleted || isCurrent ? '#10b981' : '#e2e8f0', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px'
                    }}>
                      {isCompleted || isCurrent ? '✓' : ''}
                    </div>
                    <div style={{ color: isCompleted || isCurrent ? '#0f172a' : '#94a3b8', fontWeight: isCurrent ? 'bold' : 'normal' }}>
                      {step.label}
                    </div>
                  </div>
                )
              })}
              {complaint.status === 'REJECTED' && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px', color: '#ef4444', fontWeight: 'bold' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>✕</div>
                  Complaint Rejected
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="card" style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Location</h3>
            <p style={{ fontSize: '14px', marginBottom: '16px', color: '#475569' }}>{complaint.location?.address}</p>
            {complaint.location?.latitude && complaint.location?.longitude && (
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden' }}>
                <MapContainer 
                  center={[complaint.location.latitude, complaint.location.longitude]} 
                  zoom={15} 
                  style={{ height: '100%', width: '100%' }}
                >
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
                  <span style={{ color: '#64748b' }}>Detected Issue</span>
                  <span style={{ fontWeight: '500',color: '#64748b' }}>{complaint.aiAnalysis.detectedIssue}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Confidence</span>
                  <span style={{ fontWeight: '500',color: '#64748b' }}>{complaint.aiAnalysis.confidence}%</span>
                </div>
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
