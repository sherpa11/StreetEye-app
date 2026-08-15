// Status colors and labels
export const STATUS_CONFIG = {
  NEW: { label: 'New', color: '#6366f1', bg: '#eef2ff' },
  UNDER_REVIEW: { label: 'Under Review', color: '#f59e0b', bg: '#fffbeb' },
  VERIFIED: { label: 'Verified', color: '#3b82f6', bg: '#eff6ff' },
  ASSIGNED: { label: 'Assigned', color: '#8b5cf6', bg: '#f5f3ff' },
  IN_PROGRESS: { label: 'In Progress', color: '#f97316', bg: '#fff7ed' },
  RECTIFICATION_SUBMITTED: { label: 'Pending Review', color: '#06b6d4', bg: '#ecfeff' },
  AUTHORITY_VERIFICATION: { label: 'Auth. Verification', color: '#0891b2', bg: '#ecfeff' },
  RESOLVED: { label: 'Resolved', color: '#10b981', bg: '#f0fdf4' },
  REJECTED: { label: 'Rejected', color: '#ef4444', bg: '#fef2f2' },
};

export const SEVERITY_CONFIG = {
  LOW: { label: 'Low', color: '#10b981', bg: '#f0fdf4' },
  MEDIUM: { label: 'Medium', color: '#f59e0b', bg: '#fffbeb' },
  HIGH: { label: 'High', color: '#f97316', bg: '#fff7ed' },
  CRITICAL: { label: 'Critical', color: '#ef4444', bg: '#fef2f2' },
};

export const PRIORITY_CONFIG = {
  NORMAL: { label: 'Normal', color: '#6b7280' },
  IMPORTANT: { label: 'Important', color: '#3b82f6' },
  URGENT: { label: 'Urgent', color: '#f97316' },
  EMERGENCY: { label: 'Emergency', color: '#ef4444' },
};

export const STATUS_STEPS = [
  'NEW',
  'UNDER_REVIEW',
  'VERIFIED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RECTIFICATION_SUBMITTED',
  'AUTHORITY_VERIFICATION',
  'RESOLVED',
];

export const STATUS_STEP_LABELS = {
  NEW: 'Complaint Submitted',
  UNDER_REVIEW: 'Authority Review',
  VERIFIED: 'Verified',
  ASSIGNED: 'Contractor Assigned',
  IN_PROGRESS: 'Repair in Progress',
  RECTIFICATION_SUBMITTED: 'Repair Submitted',
  AUTHORITY_VERIFICATION: 'Final Verification',
  RESOLVED: 'Resolved',
};

export const formatCurrency = (amount) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount?.toLocaleString('en-IN') || 0}`;
};

export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getErrorMessage = (error) => {
  return error?.response?.data?.message || error?.message || 'Something went wrong';
};

export const ISSUE_TYPES = [
  'Pothole',
  'Crack',
  'Surface Damage',
  'Waterlogging',
  'Road Collapse',
  'Unsafe Road',
  'Accident Related',
  'Delayed Maintenance',
  'Other',
];
