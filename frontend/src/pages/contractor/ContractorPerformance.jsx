import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { contractorsAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Briefcase, CheckCircle, Clock } from 'lucide-react';

export default function ContractorPerformance() {
  const { user } = useAuth();
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const res = await contractorsAPI.getScore(user._id);
        setScoreData(res.data.metrics);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load performance score');
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchScore();
  }, [user]);

  if (loading) return <DashboardLayout title="Performance"><div className="spinner"></div></DashboardLayout>;
  if (error) return <DashboardLayout title="Performance"><div className="error-message">{error}</div></DashboardLayout>;
  if (!scoreData) return null;

  const getScoreColor = (score) => score < 50 ? '#ef4444' : score < 75 ? '#f59e0b' : '#10b981';
  const overallColor = getScoreColor(scoreData.overallScore);

  const chartData = [
    { name: 'Rectification', score: scoreData.rectificationRate || 0, weight: 30 },
    { name: 'On-Time Res', score: scoreData.onTimeResolutionRate || 0, weight: 25 },
    { name: 'Repair Quality', score: scoreData.qualityApprovalRate || 0, weight: 25 },
    { name: 'Repeat Issue', score: scoreData.repeatIssueScore || 0, weight: 10 },
    { name: 'Budget Comp.', score: scoreData.budgetComplianceScore || 0, weight: 10 },
  ];

  return (
    <DashboardLayout title="Performance Metrics" subtitle="Detailed breakdown of your performance score">
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '32px' }}>
        
        {/* Premium Overall Score */}
        <div style={{ 
          background: 'linear-gradient(145deg, #ffffff, #f8fafc)', padding: '32px', borderRadius: '24px', 
          border: '1px solid var(--gray-200)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: `radial-gradient(circle, ${overallColor}15 0%, transparent 50%)`, zIndex: 0 }}></div>
          
          <h2 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', fontWeight: '700', color: 'var(--gray-900)', zIndex: 1 }}>Overall Score</h2>
          <div style={{ 
            width: '180px', height: '180px', borderRadius: '50%', 
            background: `conic-gradient(${overallColor} ${(scoreData.overallScore || 0) * 3.6}deg, var(--gray-100) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: '144px', height: '144px', borderRadius: '50%', background: 'white',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.05)'
            }}>
              <span style={{ fontSize: '3.5rem', fontWeight: '800', color: overallColor, lineHeight: '1', fontFamily: 'Space Grotesk, sans-serif' }}>
                {scoreData.overallScore.toFixed(1)}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>OUT OF 100</span>
            </div>
          </div>
          <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--gray-500)', fontSize: '0.85rem', zIndex: 1, lineHeight: '1.5' }}>
            Updated in real-time based on your repair performance, quality, and speed.
          </div>
        </div>

        {/* Premium Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {[
            { label: 'Total Assignments', value: scoreData.totalAssigned || 0, color: '#3b82f6', icon: Briefcase, bg: '#eff6ff' },
            { label: 'Total Resolved', value: scoreData.totalResolved || 0, color: '#10b981', icon: CheckCircle, bg: '#ecfdf5' },
            { label: 'Avg Resolution (Days)', value: ((scoreData.averageResolutionTime || 0) / 24).toFixed(1), color: '#8b5cf6', icon: Clock, bg: '#f5f3ff', span: 2 }
          ].map((stat, idx) => (
            <div key={idx} style={{ 
              background: 'white', borderRadius: '20px', padding: '24px', gridColumn: stat.span ? `span ${stat.span}` : 'auto',
              border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                  <stat.icon size={24} strokeWidth={2.5} />
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--gray-900)', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1, marginBottom: '8px' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown Chart & Table */}
      <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', fontFamily: 'Space Grotesk, sans-serif', fontWeight: '700', color: 'var(--gray-900)' }}>Component Breakdown</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          
          {/* Table */}
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 8px', color: '#64748b' }}>Component</th>
                  <th style={{ padding: '12px 8px', color: '#64748b' }}>Weight</th>
                  <th style={{ padding: '12px 8px', color: '#64748b' }}>Score (/100)</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map(item => (
                  <tr key={item.name} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 8px', fontWeight: '500' }}>{item.name}</td>
                    <td style={{ padding: '12px 8px' }}>{item.weight}%</td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 'bold', color: getScoreColor(item.score), width: '40px' }}>{item.score.toFixed(1)}</span>
                        <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${item.score}%`, height: '100%', background: getScoreColor(item.score) }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Chart */}
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>

    </DashboardLayout>
  );
}
