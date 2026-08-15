import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { tendersAPI, contractorsAPI } from '../../api/api';
import { formatCurrency } from '../../utils/helpers';
import { Plus } from 'lucide-react';

export default function AuthorityTenderDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add bid form
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidUnit, setBidUnit] = useState(10000000); // Default to Crores
  const [bidData, setBidData] = useState({ contractorId: '', quotation: '' });
  const [bidLoading, setBidLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [tenderRes, contRes] = await Promise.all([
        tendersAPI.getRankings(id),
        contractorsAPI.getAll()
      ]);
      setData(tenderRes.data.tender);
      setContractors(contRes.data.contractors);
    } catch (err) {
      setError('Failed to load tender data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBid = async (e) => {
    e.preventDefault();
    setBidLoading(true);
    try {
      await tendersAPI.addBid(id, {
        ...bidData,
        quotation: Number(bidData.quotation) * bidUnit
      });
      setBidData({ contractorId: '', quotation: '' });
      setShowBidForm(false);
      fetchData(); // Refresh rankings
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add bid');
    } finally {
      setBidLoading(false);
    }
  };

  if (loading) return <DashboardLayout title="Tender Evaluation"><div className="spinner"></div></DashboardLayout>;
  if (error) return <DashboardLayout title="Tender Evaluation"><div className="error-message">{error}</div></DashboardLayout>;
  if (!data) return null;

  const tender = data;
  const rankedBids = data.bids || [];

  return (
    <DashboardLayout 
      title="Tender Evaluation & Ranking" 
      subtitle={`AI-assisted contractor selection for: ${tender.title}`}
    >
      
      {/* Tender Info */}
      <div className="card" style={{ padding: '28px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: '0 0 12px 0', fontSize: '1.5rem', color: 'var(--gray-900)' }}>{tender.title}</h2>
          <p style={{ color: 'var(--gray-600)', margin: '0 0 24px 0', fontSize: '0.95rem' }}>{tender.description}</p>
          <div style={{ display: 'flex', gap: '32px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Status</div>
              <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{tender.status}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Estimated Budget</div>
              <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{formatCurrency(tender.estimatedBudget)}</div>
            </div>
          </div>
        </div>
        
        {tender.status === 'OPEN' && (
          <button 
            onClick={() => setShowBidForm(!showBidForm)} 
            className={showBidForm ? "btn btn-secondary" : "btn btn-primary"}
          >
            {showBidForm ? 'Cancel' : <><Plus size={18} /> Add Bid</>}
          </button>
        )}
      </div>

      {/* Add Bid Form */}
      {showBidForm && (
        <div className="card" style={{ padding: '24px 28px', background: 'var(--gray-50)', marginBottom: '32px' }}>
          <h3 className="section-title" style={{ margin: '0 0 20px 0' }}>Simulate New Bid</h3>
          <form onSubmit={handleAddBid} style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 2, margin: 0 }}>
              <label className="form-label">Contractor</label>
              <select className="form-control" value={bidData.contractorId} onChange={e => setBidData({...bidData, contractorId: e.target.value})} required>
                <option value="">Select Contractor</option>
                {contractors.map(c => <option key={c._id} value={c._id}>{c.firmName} (Score: {(c.metrics?.overallScore || 0).toFixed(1)})</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1.5, margin: 0 }}>
              <label className="form-label">Quotation</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="number" step="0.01" className="form-control" value={bidData.quotation} onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} onChange={e => setBidData({...bidData, quotation: e.target.value})} required placeholder="e.g. 5.5" />
                <select className="form-control" value={bidUnit} onChange={e => setBidUnit(Number(e.target.value))} style={{ width: '120px' }}>
                  <option value={10000000}>Cr</option>
                  <option value={100000}>Lakhs</option>
                  <option value={1}>Rupees</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={bidLoading} className="btn btn-success" style={{ height: '42px' }}>
              {bidLoading ? 'Adding...' : 'Submit Bid'}
            </button>
          </form>
        </div>
      )}

      {/* AI Ranking Explanation */}
      <div className="alert alert-info" style={{ alignItems: 'center', padding: '20px', marginBottom: '32px', border: '1px solid var(--info)', background: 'var(--info-bg)' }}>
        <div style={{ fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: 'white', borderRadius: '50%', color: 'var(--info)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2c-.08 1.5-1.5 3-1.5 3 .5-1 2-2 2-2a2 2 0 0 1 2 2c0 1.5-1.5 3-1.5 3s1.5-1.5 3-1.5a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2c1.5 0 3 1.5 3 1.5S7.5 8 7.5 6.5A2 2 0 0 1 9.5 4.5c0 1.5 1.5 3 1.5 3s-1.5-1.5-1.5-3a2 2 0 0 1 2-2Z"/><path d="M8 14h.01"/><path d="M16 14h.01"/><path d="M11 18h2"/></svg>
        </div>
        <div>
          <div style={{ fontWeight: '700', color: 'var(--info)', marginBottom: '4px' }}>Smart Ranking Algorithm Active</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--gray-700)', lineHeight: '1.5' }}>
            StreetEye recommends contractors based on a combined score: <strong style={{ color: 'var(--primary)' }}>80% Past Performance Score</strong> + <strong style={{ color: 'var(--primary)' }}>20% Price Score</strong>. 
            The lowest bidder is <em>not</em> automatically the best choice if they have a history of poor quality work.
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                <th>Contractor</th>
                <th>Performance (80%)</th>
                <th>Quotation</th>
                <th>Price Score (20%)</th>
                <th>Final Score</th>
              </tr>
            </thead>
            <tbody>
              {rankedBids.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state" style={{ padding: '48px' }}>No bids received yet.</td>
                </tr>
              ) : (
                rankedBids.map((bid, index) => {
                  const isWinner = index === 0;
                  return (
                    <tr key={bid._id || index} style={{ background: isWinner ? 'var(--success-bg)' : 'transparent' }}>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ 
                          width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto',
                          background: index === 0 ? '#fef3c7' : index === 1 ? 'var(--gray-200)' : 'transparent', 
                          border: index > 1 ? '1px solid var(--gray-300)' : 'none',
                          color: index === 0 ? '#b45309' : 'var(--gray-700)', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' 
                        }}>
                          {bid.rank || index + 1}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: isWinner ? 'var(--success)' : 'var(--gray-900)' }}>{bid.contractorId?.firmName || 'Unknown'}</div>
                        {isWinner && <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '700', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>★ Recommended</div>}
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: bid.contractorPerformanceScore >= 75 ? 'var(--success)' : 'var(--warning)' }}>{(bid.contractorPerformanceScore || 0).toFixed(1)} / 100</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--gray-700)' }}>{formatCurrency(bid.quotation)}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--gray-800)' }}>{(bid.priceScore || 0).toFixed(1)} / 100</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontWeight: '800', fontSize: '1.2rem', color: isWinner ? 'var(--success)' : 'var(--primary)', fontFamily: 'Space Grotesk, sans-serif' }}>{(bid.finalTenderScore || 0).toFixed(1)}</span>
                          <div style={{ flex: 1, height: '6px', background: 'var(--gray-200)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${bid.finalTenderScore || 0}%`, height: '100%', background: isWinner ? 'var(--success)' : 'var(--primary)' }}></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </DashboardLayout>
  );
}
