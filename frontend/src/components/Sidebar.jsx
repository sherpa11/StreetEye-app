import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Plus,
  Settings,
  LogOut,
  Briefcase,
  Star,
  ClipboardList,
  Users,
  FolderOpen,
  Gavel,
  BarChart3
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
  };

  const citizenNav = [
    { to: '/citizen/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/citizen/complaints/new', icon: Plus, label: 'Report Issue' },
    { to: '/citizen/complaints', icon: FileText, label: 'My Complaints' },
  ];

  const contractorNav = [
    { to: '/contractor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/contractor/assignments', icon: Briefcase, label: 'Assignments' },
    { to: '/contractor/performance', icon: Star, label: 'Performance' },
  ];

  const authorityNav = [
    { to: '/authority/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/authority/complaints', icon: ClipboardList, label: 'Complaints' },
    { to: '/authority/contractors', icon: Users, label: 'Contractors' },
    { to: '/authority/projects', icon: FolderOpen, label: 'Projects' },
    { to: '/authority/tenders', icon: Gavel, label: 'Tenders' },
  ];

  let navItems = [];
  if (user?.role === 'citizen') navItems = citizenNav;
  if (user?.role === 'contractor') navItems = contractorNav;
  if (user?.role === 'authority') navItems = authorityNav;

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-title">StreetEye</div>
          <div className="sidebar-logo-subtitle">Infrastructure Intel</div>
        </div>
      </div>
      
      <div className="sidebar-nav">
        <div className="sidebar-section-label">Main Menu</div>
        {navItems.map((item) => {
          // Custom active logic to prevent /complaints from being active on /complaints/new
          const isExact = location.pathname === item.to;
          const isSubPath = location.pathname.startsWith(item.to + '/');
          const isNewPath = location.pathname.endsWith('/new');
          
          let isActive = isExact || isSubPath;
          if (item.to.endsWith('/complaints') && isNewPath) {
             isActive = false;
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="nav-icon" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {(user?.name || user?.firmName || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || user?.firmName || 'User'}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>
        <button className="sidebar-nav-item" onClick={handleLogout} style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', marginTop: '16px', fontSize: '1.05rem', gap: '14px', padding: '14px 12px' }}>
          <LogOut size={22} style={{ color: 'var(--danger)' }} />
          <span style={{ color: 'var(--gray-300)', fontWeight: '600' }}>Logout</span>
        </button>
      </div>
    </div>
  );
}
