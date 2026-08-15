import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { projectsAPI, contractorsAPI } from '../../api/api';
import { formatCurrency } from '../../utils/helpers';
import { Plus } from 'lucide-react';

export default function AuthorityProjects() {
  const [projects, setProjects] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    roadName: '',
    description: '',
    contractorId: '',
    totalBudget: '',
    startDate: '',
    expectedCompletionDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projRes, contRes] = await Promise.all([
        projectsAPI.getAll(),
        contractorsAPI.getAll()
      ]);
      setProjects(projRes.data.projects);
      setContractors(contRes.data.contractors);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await projectsAPI.create(formData);
      alert('Project created successfully');
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create project');
    }
  };

  return (
    <DashboardLayout 
      title="Projects & Budget Assurance" 
      subtitle="Track smart contracts and retention budgets"
      actions={
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} /> Create Project
        </button>
      }
    >
      {loading ? (
        <div className="spinner"></div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: 'white', borderRadius: '8px', color: '#64748b' }}>No projects found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {projects.map(proj => (
            <Link 
              key={proj._id} 
              to={`/authority/projects/${proj._id}`}
              style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', borderTop: '4px solid #3b82f6' }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>{proj.projectName}</h3>
                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', background: proj.status === 'COMPLETED' ? '#d1fae5' : '#fef3c7', color: proj.status === 'COMPLETED' ? '#065f46' : '#92400e' }}>
                  {proj.status}
                </span>
              </div>
              <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>{proj.roadName}</div>
              
              <div style={{ fontSize: '14px', marginBottom: '16px' }}>
                <strong>Contractor:</strong> {proj.contractorId?.firmName || 'Unknown'}
              </div>

              <div style={{ marginTop: 'auto', background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span>Total Budget</span>
                  <span style={{ fontWeight: 'bold' }}>{formatCurrency(proj.totalBudget)}</span>
                </div>
                
                {/* Visual Budget Bar */}
                <div style={{ width: '100%', height: '8px', borderRadius: '4px', overflow: 'hidden', display: 'flex', marginTop: '12px' }}>
                  <div style={{ width: '80%', background: '#3b82f6' }} title="Construction Allocation (80%)"></div>
                  <div style={{ width: '20%', background: '#f59e0b' }} title="Retention (20%)"></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', color: '#64748b' }}>
                  <span>Construction (80%)</span>
                  <span>Retention (20%)</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 24px 0' }}>Create New Project</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Project Name *</label>
                <input type="text" value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} required style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Road Name *</label>
                <input type="text" value={formData.roadName} onChange={e => setFormData({...formData, roadName: e.target.value})} required style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} rows={2}></textarea>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Contractor *</label>
                <select value={formData.contractorId} onChange={e => setFormData({...formData, contractorId: e.target.value})} required style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                  <option value="">Select Contractor</option>
                  {contractors.map(c => <option key={c._id} value={c._id}>{c.firmName}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Total Budget (₹) *</label>
                <input type="number" value={formData.totalBudget} onChange={e => setFormData({...formData, totalBudget: e.target.value})} required style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Start Date *</label>
                  <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>End Date *</label>
                  <input type="date" value={formData.expectedCompletionDate} onChange={e => setFormData({...formData, expectedCompletionDate: e.target.value})} required style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
