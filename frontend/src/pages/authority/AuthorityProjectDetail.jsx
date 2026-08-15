import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { projectsAPI } from '../../api/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { ShieldAlert } from 'lucide-react';

export default function AuthorityProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [releaseAmount, setReleaseAmount] = useState('');
  const [releaseActionLoading, setReleaseActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [projRes, budgetRes] = await Promise.all([
        projectsAPI.getById(id),
        projectsAPI.getBudget(id)
      ]);
      setProject(projRes.data.project);
      setBudget(budgetRes.data.budget);
    } catch (err) {
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleRelease = async (e) => {
    e.preventDefault();
    if (!releaseAmount || isNaN(releaseAmount)) return alert('Please enter a valid amount');
    if (Number(releaseAmount) > budget.remainingRetained) return alert('Cannot release more than remaining retained amount');

    setReleaseActionLoading(true);
    try {
      await projectsAPI.updateBudget(id, { releasedRetainedAmount: budget.releasedRetainedAmount + Number(releaseAmount) });
      alert('Amount released successfully');
      setReleaseAmount('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to release amount');
    } finally {
      setReleaseActionLoading(false);
    }
  };

  if (loading) return <DashboardLayout title="Project Details"><div className="spinner"></div></DashboardLayout>;
  if (error) return <DashboardLayout title="Project Details"><div className="error-message">{error}</div></DashboardLayout>;
  if (!project || !budget) return null;

  return (
    <DashboardLayout 
      title={project.projectName}
      subtitle={`Smart Contract Retention System - ${project.roadName}`}
      actions={
        <span className="badge" style={{ 
          fontSize: '0.85rem', fontWeight: '700', padding: '8px 16px', borderRadius: 'var(--radius-sm)', textTransform: 'uppercase', letterSpacing: '0.5px',
          background: project.status === 'COMPLETED' ? 'var(--success-bg)' : 'var(--warning-bg)', 
          color: project.status === 'COMPLETED' ? 'var(--success)' : 'var(--warning-dark)' 
        }}>
          {project.status}
        </span>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* Project Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Project Information</span>
            </div>
            <div className="card-body" style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', fontSize: '0.9rem' }}>
                <div style={{ fontWeight: '600', color: 'var(--gray-500)' }}>Road Name:</div>
                <div style={{ fontWeight: '500', color: 'var(--gray-900)' }}>{project.roadName}</div>
                
                <div style={{ fontWeight: '600', color: 'var(--gray-500)' }}>Contractor:</div>
                <div style={{ fontWeight: '500', color: 'var(--primary)' }}>{project.contractorId?.firmName}</div>
                
                <div style={{ fontWeight: '600', color: 'var(--gray-500)' }}>Start Date:</div>
                <div style={{ fontWeight: '500', color: 'var(--gray-900)' }}>{formatDate(project.startDate)}</div>
                
                <div style={{ fontWeight: '600', color: 'var(--gray-500)' }}>Expected End:</div>
                <div style={{ fontWeight: '500', color: 'var(--gray-900)' }}>{formatDate(project.expectedCompletionDate)}</div>
                
                {project.description && (
                  <>
                    <div style={{ fontWeight: '600', color: 'var(--gray-500)' }}>Description:</div>
                    <div style={{ color: 'var(--gray-700)', lineHeight: '1.5' }}>{project.description}</div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Release Funds Action */}
          <div className="card" style={{ border: '1px solid var(--warning-light)', background: 'var(--warning-bg)' }}>
            <div className="card-body" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning-dark)', fontFamily: 'Space Grotesk, sans-serif' }}>
                <ShieldAlert size={20} /> Manage Retention
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--gray-700)', marginBottom: '24px', lineHeight: '1.5' }}>
                Release retained funds after successful verification of road durability post-construction.
              </p>
              <form onSubmit={handleRelease}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ color: 'var(--warning-dark)' }}>Amount to Release (₹)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={releaseAmount} 
                    onChange={e => setReleaseAmount(e.target.value)}
                    max={budget.remainingRetained}
                    placeholder={`Max: ${budget.remainingRetained}`}
                    disabled={budget.remainingRetained === 0}
                    style={{ background: 'white', borderColor: 'var(--warning-light)' }}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={releaseActionLoading || budget.remainingRetained === 0}
                  style={{ width: '100%', opacity: budget.remainingRetained === 0 ? 0.5 : 1 }}
                >
                  {releaseActionLoading ? 'Processing...' : 'Release Funds'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Budget Visualizer */}
        <div className="card" style={{ padding: '40px 32px' }}>
          <h2 style={{ margin: '0 0 32px 0', fontSize: '1.5rem', color: 'var(--gray-900)' }}>Budget Breakdown</h2>
          
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: '600' }}>Total Project Budget</div>
            <div style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--gray-900)', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>{formatCurrency(budget.totalBudget)}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Construction Phase */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray-800)' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                  Construction Allocation (80%)
                </div>
                <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{formatCurrency(budget.constructionAllocation)}</div>
              </div>
              <div style={{ width: '100%', height: '16px', background: 'var(--gray-200)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: 'var(--primary)' }}></div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '8px' }}>Paid during active construction phase</div>
            </div>

            {/* Retention Phase */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray-800)' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--warning)' }}></div>
                  Retained Assurance (20%)
                </div>
                <div style={{ fontWeight: '700', color: 'var(--warning)' }}>{formatCurrency(budget.retainedAmount)}</div>
              </div>
              
              <div style={{ width: '100%', height: '16px', background: 'var(--gray-200)', borderRadius: '8px', overflow: 'hidden', display: 'flex' }}>
                {/* Released portion */}
                <div style={{ width: `${(budget.releasedRetainedAmount / budget.retainedAmount) * 100}%`, height: '100%', background: 'var(--success)' }}></div>
                {/* Remaining portion */}
                <div style={{ width: `${(budget.remainingRetained / budget.retainedAmount) * 100}%`, height: '100%', background: 'var(--warning)' }}></div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '0.9rem', background: 'var(--gray-50)', padding: '16px 20px', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <span style={{ color: 'var(--success)', fontWeight: '700', marginRight: '8px' }}>Released: </span>
                  <span style={{ fontWeight: '600' }}>{formatCurrency(budget.releasedRetainedAmount)}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--warning-dark)', fontWeight: '700', marginRight: '8px' }}>Remaining: </span>
                  <span style={{ fontWeight: '600' }}>{formatCurrency(budget.remainingRetained)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
