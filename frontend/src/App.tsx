import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/toast';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MachinesPage } from './pages/MachinesPage';
import { MaintenancesPage } from './pages/MaintenancesPage';
import { SchedulingPage } from './pages/SchedulingPage';
import { ReportsPage } from './pages/ReportsPage';
import { AlertsPage } from './pages/AlertsPage';
import { UsersPage } from './pages/UsersPage';
import { AuditPage } from './pages/AuditPage';
import { ConfigPage } from './pages/ConfigPage';
import { CatalogsPage } from './pages/CatalogsPage';
import { ProfilePage } from './pages/ProfilePage';
import { MachineDetailPage } from './pages/MachineDetailPage';
import { SparePartsPage } from './pages/SparePartsPage';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { SessionRestore } from './components/auth/SessionRestore';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <SessionRestore>
          <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="machines" element={<MachinesPage />} />
            <Route path="machines/:id" element={<MachineDetailPage />} />
            <Route path="maintenances" element={<MaintenancesPage />} />
            <Route path="spare-parts" element={<SparePartsPage />} />
            <Route
              path="scheduling"
              element={
                <ProtectedRoute requiredRoles={['ADMIN', 'SUPERVISOR', 'TECHNICIAN']}>
                  <SchedulingPage />
                </ProtectedRoute>
              }
            />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route
              path="users"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="audit"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AuditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="catalogs"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <CatalogsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="config"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <ConfigPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </SessionRestore>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
