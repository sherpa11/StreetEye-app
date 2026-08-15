import { STATUS_CONFIG, SEVERITY_CONFIG } from '../utils/helpers';

export const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span className="badge" style={{ 
      color: config.color, 
      background: config.bg,
      padding: '4px 8px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: '500',
      display: 'inline-block'
    }}>
      {config.label}
    </span>
  );
};

export const SeverityBadge = ({ severity }) => {
  const config = SEVERITY_CONFIG[severity] || { label: severity, color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span className="badge" style={{ 
      color: config.color, 
      background: config.bg,
      padding: '4px 8px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: '500',
      display: 'inline-block'
    }}>
      {severity}
    </span>
  );
};
