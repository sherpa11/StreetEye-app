import Sidebar from '../components/Sidebar';
export default function DashboardLayout({ children, title, subtitle, actions }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-header-title">{title}</h1>
            {subtitle && <div className="page-header-subtitle">{subtitle}</div>}
          </div>
          {actions && <div className="flex gap-3">{actions}</div>}
        </div>
        <div className="page-body">
          {children}
        </div>
      </div>
    </div>
  );
}
