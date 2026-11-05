import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import NavbarSidebar from './components/NavbarSidebar.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardReportPage from './pages/DashboardReportPage.jsx';
import CampaignsPage from './pages/CampaignsPage.jsx';
import DonorsPage from './pages/DonorsPage.jsx';
import DonationsPage from './pages/DonationsPage.jsx';
import ReceiptsPage from './pages/ReceiptsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import SubmissionGuidePage from './pages/SubmissionGuidePage.jsx';
import DonatePage from './pages/DonatePage.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-600">
        Loading NGO Donation Management Workspace...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <NavbarSidebar>{children}</NavbarSidebar>;
};

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaigns"
            element={
              <ProtectedRoute>
                <CampaignsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donors"
            element={
              <ProtectedRoute>
                <DonorsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donations"
            element={
              <ProtectedRoute>
                <DonationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donate"
            element={
              <ProtectedRoute>
                <DonatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receipts"
            element={
              <ProtectedRoute>
                <ReceiptsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submission-docs"
            element={
              <ProtectedRoute>
                <SubmissionGuidePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
