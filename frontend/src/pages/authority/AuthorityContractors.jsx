import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { contractorsAPI, authAPI } from '../../api/api';

export default function AuthorityContractors() {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successData, setSuccessData] = useState(null);
  
  const [formData, setFormData] = useState({
    firmName: '',
    gstin: '',
    password: ''
  });

  const fetchContractors = async () => {
    try {
      const res = await contractorsAPI.getAll();
      setContractors(res.data.contractors);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load contractors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    setSubmitLoading(true);
    setSubmitError('');

    try {
      const res = await authAPI.contractorRegister({
        firmName: formData.firmName,
        gstin: formData.gstin,
        password: formData.password
      });

      // Show success modal
      setSuccessData({
        firmName: formData.firmName,
        contractorNumber: res.data.user.contractorNumber,
        password: formData.password
      });
      
      // Reset form and close register modal
      setFormData({ firmName: '', gstin: '', password: '' });
      setShowModal(false);
      
      // Refresh list
      fetchContractors();
      
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Unable to register contractor');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <DashboardLayout title="Contractors"><div className="spinner"></div></DashboardLayout>;
  if (error) return <DashboardLayout title="Contractors"><div className="error-message">{error}</div></DashboardLayout>;

  const getScoreColor = (score) => score < 50 ? 'var(--danger)' : score < 75 ? 'var(--warning)' : 'var(--success)';

  const actions = (
    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
      <span style={{ marginRight: '6px' }}>+</span> Create New Contractor
    </button>
  );

  return (
    <DashboardLayout title="Contractor Directory" subtitle="Manage contractors and view performance scores" actions={actions}>
      
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Firm Name</th>
                <th>Contractor #</th>
                <th>Overall Score</th>
                <th>Rectification Rate</th>
                <th>Quality</th>
                <th>Avg Resolution Time</th>
              </tr>
            </thead>
            <tbody>
              {contractors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">No contractors found.</td>
                </tr>
              ) : (
                contractors.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: '700', color: 'var(--gray-900)' }}>{c.firmName}</td>
                    <td style={{ color: 'var(--gray-500)', fontFamily: 'Space Grotesk, sans-serif' }}>{c.contractorNumber}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          width: '36px', height: '36px', borderRadius: '50%', 
                          border: `2px solid ${getScoreColor(c.metrics?.overallScore || 0)}`, 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: '700', fontSize: '0.85rem', color: getScoreColor(c.metrics?.overallScore || 0),
                          background: 'white'
                        }}>
                          {Math.round(c.metrics?.overallScore || 0)}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>{(c.metrics?.rectificationRate || 0).toFixed(1)}%</td>
                    <td style={{ fontWeight: '600' }}>{(c.metrics?.qualityApprovalRate || 0).toFixed(1)}%</td>
                    <td style={{ color: 'var(--gray-600)' }}>{c.metrics?.averageResolutionTime ? `${(c.metrics.averageResolutionTime / 24).toFixed(1)} days` : 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
            
            <div style={{ padding: '24px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--gray-900)' }}>Create New Contractor</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--gray-500)' }}>✕</button>
            </div>
            
            <form onSubmit={handleRegister} style={{ padding: '24px' }}>
              
              {submitError && (
                <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                  {submitError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: '600' }}>Firm Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Igenious Infrastructure Pvt Ltd"
                    value={formData.firmName}
                    onChange={(e) => setFormData({...formData, firmName: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: '600' }}>GSTIN</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., 33AABCC9012H3Z8"
                    value={formData.gstin}
                    onChange={(e) => setFormData({...formData, gstin: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: '600' }}>Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                  {submitLoading ? 'Creating...' : 'Create Contractor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden', padding: '32px', textAlign: 'center' }}>
            
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 20px auto' }}>
              ✓
            </div>
            
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: '800', color: 'var(--gray-900)' }}>Contractor Registered</h2>
            <p style={{ color: 'var(--gray-600)', margin: '0 0 24px 0', fontSize: '0.95rem', lineHeight: '1.5' }}>
              <strong>{successData.firmName}</strong> has been successfully registered.
            </p>
            
            <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Contractor ID</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: 'var(--primary)', letterSpacing: '1px' }}>
                  {successData.contractorNumber}
                </span>
                <button 
                  onClick={() => navigator.clipboard.writeText(successData.contractorNumber)} 
                  style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', color: 'var(--gray-600)', transition: 'all 0.2s' }}
                  title="Copy to clipboard"
                >
                  Copy
                </button>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Password</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: '700', fontFamily: 'monospace', color: 'var(--gray-800)', letterSpacing: '1px' }}>
                  {successData.password}
                </span>
                <button 
                  onClick={() => navigator.clipboard.writeText(successData.password)} 
                  style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', color: 'var(--gray-600)', transition: 'all 0.2s' }}
                  title="Copy to clipboard"
                >
                  Copy
                </button>
              </div>
            </div>
            
            <p style={{ color: 'var(--gray-500)', margin: '0 0 24px 0', fontSize: '0.85rem' }}>
              The contractor can now login using this Contractor ID and the temporary password you provided.
            </p>
            
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setSuccessData(null)}>
              Done
            </button>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
