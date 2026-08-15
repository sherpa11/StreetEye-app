import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { aiAPI, complaintsAPI } from '../../api/api';
import { ISSUE_TYPES, getErrorMessage } from '../../utils/helpers';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow });

export default function NewComplaint() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [successTicket, setSuccessTicket] = useState(null);

  const [formData, setFormData] = useState({
    issueType: '',
    description: '',
    latitude: '',
    longitude: '',
    address: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiError, setAiError] = useState('');

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setAiError('');
    setAiAnalysis(null);

    // Trigger AI Analysis
    setAiLoading(true);
    try {
      const data = new FormData();
      data.append('image', file);
      if (formData.issueType) data.append('issueType', formData.issueType);
      const res = await aiAPI.analyzeRoad(data);
      const analysis = res.data.analysis;
      setAiAnalysis(analysis);
      if (analysis.detectedIssue && ISSUE_TYPES.includes(analysis.detectedIssue)) {
        setFormData(prev => ({ ...prev, issueType: analysis.detectedIssue }));
      }
    } catch (err) {
      setAiError('AI analysis temporarily unavailable. You can continue manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported. Please enter coordinates manually.');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
          address: prev.address || 'Location captured from device'
        }));
        setLoading(false);
      },
      () => {
        setError('Unable to retrieve location. Please enter coordinates manually.');
        setLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async () => {
    if (!formData.issueType || !formData.description) {
      return setError('Issue type and description are required.');
    }
    if (!formData.latitude || !formData.longitude) {
      return setError('Location (latitude and longitude) is required.');
    }

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      if (imageFile) data.append('evidenceImage', imageFile);
      data.append('issueType', formData.issueType);
      data.append('description', formData.description);
      data.append('latitude', formData.latitude);
      data.append('longitude', formData.longitude);
      data.append('address', formData.address || `${formData.latitude}, ${formData.longitude}`);

      const res = await complaintsAPI.create(data);
      setSuccessTicket(res.data.complaint);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (successTicket) {
    return (
      <DashboardLayout title="Complaint Submitted" subtitle="Your complaint has been received">
        <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
          <div style={{ background: 'var(--success-bg)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '24px', padding: '48px 32px', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.1)' }}>
            <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
              <span style={{ fontSize: '3rem', color: 'var(--success)' }}>✓</span>
            </div>
            <h2 style={{ color: '#065f46', marginBottom: '8px', fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Complaint Submitted!</h2>
            <p style={{ color: '#047857', marginBottom: '32px', fontSize: '1.1rem' }}>Your complaint has been registered successfully and is being assigned to the relevant authority.</p>
            
            <div style={{
              background: 'white',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Ticket Reference</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-1px' }}>
                {successTicket.ticketId}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                <span className="badge" style={{ background: 'var(--gray-100)', color: 'var(--gray-700)' }}>{successTicket.issueType}</span>
                <span className="badge" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>{successTicket.severity} SEVERITY</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={() => navigate(`/citizen/complaints/${successTicket._id}`)}
                className="btn btn-primary btn-lg"
              >
                Track Status
              </button>
              <button
                onClick={() => { setSuccessTicket(null); setStep(1); setFormData({ issueType: '', description: '', latitude: '', longitude: '', address: '' }); setImageFile(null); setImagePreview(''); setAiAnalysis(null); }}
                className="btn btn-secondary btn-lg"
              >
                Report Another
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stepLabels = ['Issue Details', 'Location', 'Review & Submit'];

  return (
    <DashboardLayout title="Report a Road Issue" subtitle="Help keep Coimbatore's roads safe">
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Step indicator */}
        <div style={{ display: 'flex', marginBottom: '32px', position: 'relative' }}>
          {stepLabels.map((label, idx) => {
            const stepNum = idx + 1;
            const done = step > stepNum;
            const current = step === stepNum;
            return (
              <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                {idx < stepLabels.length - 1 && (
                  <div style={{
                    position: 'absolute', top: '16px', left: '50%', width: '100%',
                    height: '3px', background: done ? 'var(--success)' : 'var(--gray-200)', zIndex: -1,
                    transition: 'background 0.3s ease'
                  }} />
                )}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: done ? 'var(--success)' : current ? 'var(--primary)' : 'var(--gray-200)',
                  color: done || current ? 'white' : 'var(--gray-500)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: '0.9rem', marginBottom: '8px',
                  boxShadow: current ? '0 0 0 4px var(--primary-bg)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {done ? '✓' : stepNum}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: current ? '700' : '600', color: current ? 'var(--gray-900)' : 'var(--gray-400)', transition: 'color 0.3s ease' }}>
                  {label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="card" style={{ border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}>
          <div className="card-body">
            {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>⚠️ {error}</div>}

            {/* ─── Step 1: Issue Details ─────────────────────────────── */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label className="form-label">Evidence Photo</label>
                  <div
                    className={`upload-area ${imageFile ? 'has-file' : ''}`}
                    onClick={() => document.getElementById('evidenceUpload').click()}
                  >
                    <input
                      id="evidenceUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="upload-preview" />
                    ) : (
                      <>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📷</div>
                        <div style={{ fontWeight: '600', color: '#374151' }}>Click to upload photo</div>
                        <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '4px' }}>
                          JPG, PNG, WebP — max 10MB
                        </div>
                      </>
                    )}
                  </div>

                  {/* AI loading */}
                  {aiLoading && (
                    <div className="alert alert-info" style={{ marginTop: '16px' }}>
                      <span className="spinner spinner-sm" style={{ borderColor: 'var(--info)', borderTopColor: 'transparent', display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }}></span>
                      <strong>AI is analyzing your image...</strong>
                    </div>
                  )}

                  {aiError && (
                    <div className="alert alert-warning" style={{ marginTop: '16px' }}>
                      ⚠️ {aiError}
                    </div>
                  )}

                  {/* AI Result */}
                  {aiAnalysis && (
                    <div style={{ marginTop: '20px', background: 'var(--primary-bg)', border: '1px solid var(--primary-light)', borderRadius: '12px', overflow: 'hidden' }}>
                      <div style={{ background: 'var(--primary-light)', color: 'white', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🤖</span>
                        <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>AI Damage Assessment</span>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', marginLeft: 'auto', fontSize: '0.7rem' }}>CONFIDENCE: {(aiAnalysis.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Detected Issue</div>
                          <div style={{ fontWeight: '700', color: 'var(--gray-900)' }}>{aiAnalysis.detectedIssue}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Severity</div>
                          <div style={{ fontWeight: '700', color: 'var(--danger)' }}>{aiAnalysis.severity}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Priority</div>
                          <div style={{ fontWeight: '700', color: 'var(--warning-dark)' }}>{aiAnalysis.recommendedPriority}</div>
                        </div>
                      </div>
                      <div style={{ padding: '0 20px 20px 20px' }}>
                         <div style={{ width: '100%', height: '6px', background: 'var(--gray-200)', borderRadius: '3px', overflow: 'hidden' }}>
                           <div style={{ width: `${aiAnalysis.confidence * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--accent-light))' }} />
                         </div>
                         <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--gray-500)', fontStyle: 'italic' }}>
                          * AI assessment is advisory. Final verification will be performed by the authority.
                         </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Issue Type <span>*</span></label>
                  <select
                    className="form-control"
                    value={formData.issueType}
                    onChange={e => setFormData({ ...formData, issueType: e.target.value })}
                  >
                    <option value="">Select issue type...</option>
                    {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Description <span>*</span></label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the road issue in detail — location, size, danger level..."
                  />
                </div>

                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => { setError(''); setStep(2); }}
                  disabled={!formData.issueType || !formData.description}
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  Next: Add Location →
                </button>
              </div>
            )}

            {/* ─── Step 2: Location ──────────────────────────────────── */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleGetLocation}
                  disabled={loading}
                  style={{ width: '100%', padding: '14px' }}
                >
                  {loading ? '⏳ Getting location...' : '📍 Use My Current Location'}
                </button>

                <div style={{ textAlign: 'center', color: '#9ca3af', fontWeight: '500', fontSize: '0.85rem' }}>
                  — or enter manually —
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Latitude <span>*</span></label>
                    <input
                      type="number"
                      step="any"
                      className="form-control"
                      value={formData.latitude}
                      onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="11.0168"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Longitude <span>*</span></label>
                    <input
                      type="number"
                      step="any"
                      className="form-control"
                      value={formData.longitude}
                      onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="76.9558"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Address / Landmark</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="E.g., Near BSNL office, Race Course Road"
                  />
                </div>

                {formData.latitude && formData.longitude && (
                  <div style={{ height: '250px', borderRadius: '8px', overflow: 'hidden', zIndex: 0 }}>
                    <MapContainer
                      center={[parseFloat(formData.latitude), parseFloat(formData.longitude)]}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[parseFloat(formData.latitude), parseFloat(formData.longitude)]} />
                    </MapContainer>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button className="btn btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>
                    ← Back
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => { setError(''); setStep(3); }}
                    disabled={!formData.latitude || !formData.longitude}
                    style={{ flex: 2 }}
                  >
                    Next: Review →
                  </button>
                </div>
              </div>
            )}

            {/* ─── Step 3: Review ────────────────────────────────────── */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ margin: 0 }}>Review Your Complaint</h3>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px' }}>
                  <div style={{ display: 'grid', gap: '14px' }}>
                    {[
                      ['Issue Type', formData.issueType],
                      ['Description', formData.description],
                      ['Location', `${formData.address || ''} (${formData.latitude}, ${formData.longitude})`],
                      ['Image', imageFile ? `📷 ${imageFile.name}` : 'No image'],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ minWidth: '120px', fontWeight: '600', color: '#64748b', fontSize: '0.82rem' }}>{label}</div>
                        <div style={{ color: '#1e293b', fontSize: '0.88rem' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {aiAnalysis && (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>🤖 AI Analysis will be included</div>
                    <div style={{ fontSize: '0.85rem', color: '#2563eb' }}>
                      {aiAnalysis.detectedIssue} • {(aiAnalysis.confidence * 100).toFixed(0)}% confidence • {aiAnalysis.severity} severity
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-secondary" onClick={() => setStep(2)} disabled={loading} style={{ flex: 1 }}>
                    ← Back
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ flex: 2, fontSize: '0.95rem' }}
                  >
                    {loading ? '⏳ Submitting...' : '✓ Submit Complaint'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
