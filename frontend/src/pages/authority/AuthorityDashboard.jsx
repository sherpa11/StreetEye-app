import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { dashboardAPI } from '../../api/api';
import { StatusBadge, SeverityBadge } from '../../components/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { FileText, Clock, CheckCircle, AlertTriangle, PlayCircle, ShieldCheck, XCircle, Users } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow });

const SEVERITY_COLORS = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444' };

export default function AuthorityDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardAPI.authority();
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <DashboardLayout title="Authority Command Center">
      <div className="loading-center"><div className="spinner" /><span>Loading dashboard...</span></div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout title="Authority Command Center">
      <div className="alert alert-error">{error}</div>
    </DashboardLayout>
  );

  const { stats, severityBreakdown, recent, topContractors, mapComplaints, budget } = data;

  // Map setup - use location.latitude / location.longitude
  const validMapComplaints = (mapComplaints || []).filter(
    c => c.location?.latitude && c.location?.longitude
  );
  const mapCenter = validMapComplaints.length > 0
    ? [validMapComplaints[0].location.latitude, validMapComplaints[0].location.longitude]
    : [11.0168, 76.9558]; // Coimbatore default

  // Severity pie chart
  const pieData = (severityBreakdown || []).map(s => ({
    name: s._id || 'Unknown',
    value: s.count
  })).filter(d => d.name && d.value > 0);

  // Stats cards config
  const statCards = [
    { label: 'Total Complaints', value: stats.total, color: '#3b82f6', icon: FileText, bg: '#eff6ff' },
    { label: 'Pending Review', value: stats.pending, color: '#f59e0b', icon: Clock, bg: '#fffbeb' },
    { label: 'Verified', value: stats.verified, color: '#0ea5e9', icon: ShieldCheck, bg: '#e0f2fe' },
    { label: 'Active Repair', value: stats.activeRepair, color: '#8b5cf6', icon: PlayCircle, bg: '#f5f3ff' },
    { label: 'Pending Approval', value: stats.pendingReview, color: '#0d9488', icon: AlertTriangle, bg: '#ccfbf1' },
    { label: 'Resolved', value: stats.resolved, color: '#10b981', icon: CheckCircle, bg: '#ecfdf5' },
    { label: 'Rejected', value: stats.rejected, color: '#ef4444', icon: XCircle, bg: '#fef2f2' },
    { label: 'Active Contractors', value: stats.activeContractors, color: '#475569', icon: Users, bg: '#f1f5f9' },
  ];

  return (
    <DashboardLayout
      title="Authority Command Center"
      subtitle="City-wide road infrastructure management"
      actions={
        <Link to="/authority/complaints" className="btn btn-primary btn-sm">
          View All Complaints →
        </Link>
      }
    >
      {/* ─── Premium Stats Grid ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {statCards.map(stat => (
          <div key={stat.label} style={{ 
            background: 'white', borderRadius: '20px', padding: '20px', 
            border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                <stat.icon size={22} strokeWidth={2.5} />
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--gray-900)', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1, marginBottom: '6px' }}>
                {stat.value ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Charts Row ─────────────────────────────────────────── */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>

        {/* Severity breakdown chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Issues by Severity</span>
          </div>
          <div className="card-body" style={{ padding: '16px' }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '40px' }}>
                <div className="empty-state-icon">📊</div>
                <div className="empty-state-text">No severity data yet</div>
              </div>
            )}
          </div>
        </div>

        {/* Top contractors ranking */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Contractor Performance Ranking</span>
            <Link to="/authority/contractors" className="btn btn-secondary btn-sm">View Details</Link>
          </div>
          <div className="card-body" style={{ padding: '16px 24px' }}>
            {(topContractors || []).length === 0 ? (
              <div className="empty-state" style={{ padding: '30px' }}>No contractors yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(topContractors || []).map((m, idx) => {
                  const score = m.overallScore || 0;
                  const scoreColor = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
                  return (
                    <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                        background: idx === 0 ? '#fef3c7' : idx === 1 ? 'var(--gray-200)' : 'white',
                        color: idx === 0 ? '#b45309' : 'var(--gray-700)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.9rem', fontWeight: '800'
                      }}>
                        #{idx + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {m.contractorId?.firmName || 'Unknown'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '2px' }}>
                          {m.contractorId?.contractorNumber}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '800', fontSize: '1.2rem', color: scoreColor, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>
                          {score.toFixed(1)}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>
                          Score
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Live Map ───────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <span className="card-title">Live Infrastructure Incident Map</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
            {validMapComplaints.length} active plots in region
          </span>
        </div>
        <div style={{ height: '420px', position: 'relative' }}>
          <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {validMapComplaints.map(comp => (
              <Marker
                key={comp._id}
                position={[comp.location.latitude, comp.location.longitude]}
              >
                <Popup>
                  <div style={{ minWidth: '160px', padding: '4px' }}>
                    <div style={{ fontWeight: '700', color: '#1d4ed8', marginBottom: '4px', fontSize: '0.82rem' }}>
                      {comp.ticketId}
                    </div>
                    <div style={{ fontWeight: '600', marginBottom: '6px', fontSize: '0.88rem' }}>
                      {comp.issueType}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <StatusBadge status={comp.status} />
                      <SeverityBadge severity={comp.severity} />
                    </div>
                    {comp.contractorId?.firmName && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        📋 {comp.contractorId.firmName}
                      </div>
                    )}
                    <Link
                      to={`/authority/complaints/${comp._id}`}
                      style={{ display: 'block', marginTop: '8px', fontSize: '0.78rem', color: '#1d4ed8', fontWeight: '600' }}
                    >
                      View Details →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* ─── Recent Complaints Table ─────────────────────────────── */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <span className="card-title">Recent Complaints</span>
          <Link to="/authority/complaints" className="btn btn-secondary btn-sm">View All</Link>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Citizen</th>
                <th>Issue</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(recent || []).length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>No complaints yet</td></tr>
              ) : (recent || []).map(comp => (
                <tr key={comp._id}>
                  <td>
                    <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: '700', color: 'var(--primary)', fontSize: '0.85rem' }}>
                      {comp.ticketId}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{comp.citizenId?.name || '—'}</td>
                  <td style={{ fontWeight: '500' }}>{comp.issueType}</td>
                  <td><SeverityBadge severity={comp.severity} /></td>
                  <td><StatusBadge status={comp.status} /></td>
                  <td style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>{formatDate(comp.createdAt)}</td>
                  <td>
                    <Link to={`/authority/complaints/${comp._id}`} className="btn btn-outline btn-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Budget Summary ──────────────────────────────────────── */}
      {budget && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 4px' }}>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.2rem', fontWeight: '700', color: 'var(--gray-900)' }}>Infrastructure Budget</span>
            <Link to="/authority/projects" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)', textDecoration: 'none' }}>
              View Smart Contracts
            </Link>
          </div>
          
          <div style={{ 
            background: 'linear-gradient(145deg, #0f172a, #1e293b)', borderRadius: '24px', 
            padding: '32px', border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {[
                { label: 'Total Project Budget', value: formatCurrency(budget.totalBudget), color: 'white' },
                { label: 'Total Retained Assurance (20%)', value: formatCurrency(budget.totalRetained), color: '#fcd34d' },
                { label: 'Released Retention', value: formatCurrency(budget.totalReleased), color: '#6ee7b7' },
              ].map(item => (
                <div key={item.label} style={{ 
                  background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: item.color, fontFamily: 'Space Grotesk, sans-serif' }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
