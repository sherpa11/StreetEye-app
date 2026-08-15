import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { tendersAPI } from '../../api/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Plus } from 'lucide-react';

export default function AuthorityTenders() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [budgetUnit, setBudgetUnit] = useState(10000000); // Default to Crores
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimatedBudget: '',
  });

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      const res = await tendersAPI.getAll();
      setTenders(res.data.tenders);
    } catch (err) {
      setError('Failed to load tenders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await tendersAPI.create({
        ...formData,
        estimatedBudget: Number(formData.estimatedBudget) * budgetUnit
      });
      alert('Tender created successfully');
      setShowModal(false);
      fetchTenders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create tender');
    }
  };

  return (
    <DashboardLayout 
      title="Tender Allocation" 
      subtitle="AI-driven, data-backed contractor selection"
      actions={
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} /> Create Tender
        </button>
      }
    >
      {loading ? (
        <div className="spinner"></div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : tenders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: 'white', borderRadius: '8px', color: '#64748b' }}>No tenders found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {tenders.map(tender => (
            <Link 
              key={tender._id} 
              to={`/authority/tenders/${tender._id}`}
              style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', borderTop: '4px solid #8b5cf6' }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>{tender.title}</h3>
                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', background: tender.status === 'AWARDED' ? '#d1fae5' : '#e0e7ff', color: tender.status === 'AWARDED' ? '#065f46' : '#3730a3' }}>
                  {tender.status}
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px', flex: 1 }}>{tender.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Est. Budget</div>
                  <div style={{ fontWeight: 'bold' }}>{formatCurrency(tender.estimatedBudget)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Bids</div>
                  <div style={{ fontWeight: 'bold', textAlign: 'right' }}>{tender.bids?.length || 0}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
            <h3 style={{ margin: '0 0 24px 0' }}>Create New Tender</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Tender Title *</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Description *</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} rows={3}></textarea>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Estimated Budget *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="number" step="0.01" value={formData.estimatedBudget} onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} onChange={e => setFormData({...formData, estimatedBudget: e.target.value})} required style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="e.g. 5.5" />
                  <select value={budgetUnit} onChange={e => setBudgetUnit(Number(e.target.value))} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '120px' }}>
                    <option value={10000000}>Crores (Cr)</option>
                    <option value={100000}>Lakhs (L)</option>
                    <option value={1}>Rupees</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
