import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import ViewApplicationModal from './components/modals/ViewApplicationModal';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import SubmitRequest from './pages/student/SubmitRequest';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import HodDashboard from './pages/hod/HodDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import WorkflowConfig from './pages/admin/WorkflowConfig';
import ApplicationHistory from './pages/common/ApplicationHistory';

// Protected Route Component
const ProtectedLayout = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const [selectedAppId, setSelectedAppId] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex items-center gap-3 text-slate-600 font-medium text-sm">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div>
          <span>Loading portal...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col">
      <Navbar onOpenApplicationModal={(id) => setSelectedAppId(id)} />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {React.cloneElement(children, {
            onOpenApplicationModal: (id) => setSelectedAppId(id)
          })}
        </main>
      </div>

      {/* Global Application Detail & Timeline Modal */}
      <ViewApplicationModal
        isOpen={!!selectedAppId}
        onClose={() => setSelectedAppId(null)}
        applicationId={selectedAppId}
      />
    </div>
  );
};

// Role-adaptive Dashboard Route
const DashboardDispatcher = ({ onOpenApplicationModal }) => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'student':
      return <StudentDashboard onOpenApplicationModal={onOpenApplicationModal} />;
    case 'faculty':
      return <FacultyDashboard onOpenApplicationModal={onOpenApplicationModal} />;
    case 'hod':
      return <HodDashboard onOpenApplicationModal={onOpenApplicationModal} />;
    case 'admin':
      return <AdminDashboard onOpenApplicationModal={onOpenApplicationModal} />;
    default:
      return <div>Invalid Role</div>;
  }
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>
                <DashboardDispatcher />
              </ProtectedLayout>
            }
          />

          <Route
            path="/submit-request"
            element={
              <ProtectedLayout allowedRoles={['student', 'admin']}>
                <SubmitRequest />
              </ProtectedLayout>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedLayout>
                <ApplicationHistory />
              </ProtectedLayout>
            }
          />

          {/* Admin Dedicated Routes */}
          <Route
            path="/admin/users"
            element={
              <ProtectedLayout allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedLayout>
            }
          />

          <Route
            path="/admin/workflow"
            element={
              <ProtectedLayout allowedRoles={['admin']}>
                <WorkflowConfig />
              </ProtectedLayout>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
