import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import ViewApplicationModal from './components/modals/ViewApplicationModal';

// Existing Pages
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

// Newly Added Module Pages
import ApplicationTracking from './pages/student/ApplicationTracking';
import StudentServices from './pages/student/StudentServices';
import AttendanceVerification from './pages/faculty/AttendanceVerification';
import MentorshipRecords from './pages/faculty/MentorshipRecords';
import DepartmentManagement from './pages/department/DepartmentManagement';
import EventCalendar from './pages/calendar/EventCalendar';
import ReportsAnalytics from './pages/reports/ReportsAnalytics';
import SettingsPage from './pages/settings/SettingsPage';

// Protected Layout Component
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
          {React.isValidElement(children)
            ? React.cloneElement(children, {
                onOpenApplicationModal: (id) => setSelectedAppId(id)
              })
            : children}
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

          {/* Module A: Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>
                <DashboardDispatcher />
              </ProtectedLayout>
            }
          />

          {/* Module B: Application Management & Tracking */}
          <Route
            path="/tracking"
            element={
              <ProtectedLayout>
                <ApplicationTracking />
              </ProtectedLayout>
            }
          />

          {/* Module D: Student Services Hub & Application Submit */}
          <Route
            path="/student-services"
            element={
              <ProtectedLayout allowedRoles={['student', 'admin']}>
                <StudentServices />
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

          {/* Module E: Faculty Portal */}
          <Route
            path="/faculty/attendance"
            element={
              <ProtectedLayout allowedRoles={['faculty', 'hod', 'admin']}>
                <AttendanceVerification />
              </ProtectedLayout>
            }
          />

          <Route
            path="/faculty/mentorship"
            element={
              <ProtectedLayout allowedRoles={['faculty', 'hod', 'admin']}>
                <MentorshipRecords />
              </ProtectedLayout>
            }
          />

          {/* Module F: Department Management */}
          <Route
            path="/department"
            element={
              <ProtectedLayout>
                <DepartmentManagement />
              </ProtectedLayout>
            }
          />

          {/* Module I: Calendar & Events */}
          <Route
            path="/calendar"
            element={
              <ProtectedLayout>
                <EventCalendar />
              </ProtectedLayout>
            }
          />

          {/* Module H: History & SLA Reports */}
          <Route
            path="/history"
            element={
              <ProtectedLayout>
                <ApplicationHistory />
              </ProtectedLayout>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedLayout allowedRoles={['faculty', 'hod', 'admin']}>
                <ReportsAnalytics />
              </ProtectedLayout>
            }
          />

          {/* Module J: User & Role Management (Admin) */}
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

          {/* Module K: Settings */}
          <Route
            path="/settings"
            element={
              <ProtectedLayout>
                <SettingsPage />
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
