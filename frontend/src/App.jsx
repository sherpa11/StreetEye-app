import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Public
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Citizen
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import CitizenComplaints from './pages/citizen/CitizenComplaints';
import NewComplaint from './pages/citizen/NewComplaint';
import CitizenComplaintDetail from './pages/citizen/CitizenComplaintDetail';

// Contractor
import ContractorDashboard from './pages/contractor/ContractorDashboard';
import ContractorAssignments from './pages/contractor/ContractorAssignments';
import ContractorAssignmentDetail from './pages/contractor/ContractorAssignmentDetail';
import ContractorPerformance from './pages/contractor/ContractorPerformance';

// Authority
import AuthorityDashboard from './pages/authority/AuthorityDashboard';
import AuthorityComplaints from './pages/authority/AuthorityComplaints';
import AuthorityComplaintDetail from './pages/authority/AuthorityComplaintDetail';
import AuthorityContractors from './pages/authority/AuthorityContractors';
import AuthorityProjects from './pages/authority/AuthorityProjects';
import AuthorityProjectDetail from './pages/authority/AuthorityProjectDetail';
import AuthorityTenders from './pages/authority/AuthorityTenders';
import AuthorityTenderDetail from './pages/authority/AuthorityTenderDetail';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Citizen */}
        <Route path="/citizen/dashboard" element={<ProtectedRoute role="citizen"><CitizenDashboard /></ProtectedRoute>} />
        <Route path="/citizen/complaints" element={<ProtectedRoute role="citizen"><CitizenComplaints /></ProtectedRoute>} />
        <Route path="/citizen/complaints/new" element={<ProtectedRoute role="citizen"><NewComplaint /></ProtectedRoute>} />
        <Route path="/citizen/complaints/:id" element={<ProtectedRoute role="citizen"><CitizenComplaintDetail /></ProtectedRoute>} />

        {/* Contractor */}
        <Route path="/contractor/dashboard" element={<ProtectedRoute role="contractor"><ContractorDashboard /></ProtectedRoute>} />
        <Route path="/contractor/assignments" element={<ProtectedRoute role="contractor"><ContractorAssignments /></ProtectedRoute>} />
        <Route path="/contractor/assignments/:id" element={<ProtectedRoute role="contractor"><ContractorAssignmentDetail /></ProtectedRoute>} />
        <Route path="/contractor/performance" element={<ProtectedRoute role="contractor"><ContractorPerformance /></ProtectedRoute>} />

        {/* Authority */}
        <Route path="/authority/dashboard" element={<ProtectedRoute role="authority"><AuthorityDashboard /></ProtectedRoute>} />
        <Route path="/authority/complaints" element={<ProtectedRoute role="authority"><AuthorityComplaints /></ProtectedRoute>} />
        <Route path="/authority/complaints/:id" element={<ProtectedRoute role="authority"><AuthorityComplaintDetail /></ProtectedRoute>} />
        <Route path="/authority/contractors" element={<ProtectedRoute role="authority"><AuthorityContractors /></ProtectedRoute>} />
        <Route path="/authority/projects" element={<ProtectedRoute role="authority"><AuthorityProjects /></ProtectedRoute>} />
        <Route path="/authority/projects/:id" element={<ProtectedRoute role="authority"><AuthorityProjectDetail /></ProtectedRoute>} />
        <Route path="/authority/tenders" element={<ProtectedRoute role="authority"><AuthorityTenders /></ProtectedRoute>} />
        <Route path="/authority/tenders/:id" element={<ProtectedRoute role="authority"><AuthorityTenderDetail /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
