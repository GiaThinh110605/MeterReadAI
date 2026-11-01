import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { RouteManagementPage } from './pages/RouteManagementPage';
import { MeterReadingPage } from './pages/MeterReadingPage';
import { HistoryPage } from './pages/HistoryPage';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AdminLayout, AdminPage } from './components/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { CustomerHomePage } from './pages/CustomerHomePage';
import { AuthUser } from './types/auth';

const ReaderApp: React.FC<{ user: AuthUser; onLogout: () => void }> = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState<'routes' | 'reading' | 'history'>('routes');
  const [selectedRouteId, setSelectedRouteId] = useState<number>(1);

  const handleOpenMeterReading = (routeId: number) => {
    setSelectedRouteId(routeId);
    setCurrentPage('reading');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentRouteTitle={
            selectedRouteId === 2
              ? 'Tuyến A02 – P. Đa Kao'
              : 'Tuyến A01 – P. Bến Nghé'
          }
          billingPeriod="Kỳ 04/2025"
          userName={user.fullName}
          userSubtitle={user.employeeCode ? `NV Ghi số #${user.employeeCode}` : 'Nhân viên ghi số'}
          onLogout={onLogout}
        />

        <main className="flex-1 overflow-y-auto">
          {currentPage === 'routes' && (
            <RouteManagementPage onOpenMeterReading={handleOpenMeterReading} />
          )}

          {currentPage === 'reading' && (
            <MeterReadingPage
              routeId={selectedRouteId}
              onBackToRoutes={() => setCurrentPage('routes')}
            />
          )}

          {currentPage === 'history' && (
            <HistoryPage onBack={() => setCurrentPage('routes')} />
          )}
        </main>
      </div>
    </div>
  );
};

const AdminApp: React.FC<{ user: AuthUser; onLogout: () => void }> = ({ user, onLogout }) => {
  const [page, setPage] = useState<AdminPage>('dashboard');
  return (
    <AdminLayout user={user} currentPage={page} onNavigate={setPage} onLogout={onLogout}>
      {page === 'dashboard' && <AdminDashboardPage onOpenReports={() => setPage('reports')} />}
      {page === 'reports' && <AdminReportsPage />}
    </AdminLayout>
  );
};

export const App: React.FC = () => {
  const { user, initializing, logout } = useAuth();
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return authScreen === 'login' ? (
      <LoginPage onGoToRegister={() => setAuthScreen('register')} />
    ) : (
      <RegisterPage onGoToLogin={() => setAuthScreen('login')} />
    );
  }

  // Điều hướng theo vai trò (RBAC phía giao diện; backend vẫn kiểm tra quyền ở từng API)
  switch (user.role) {
    case 'ADMIN':
      return <AdminApp user={user} onLogout={logout} />;
    case 'READER':
      return <ReaderApp user={user} onLogout={logout} />;
    default:
      return <CustomerHomePage user={user} onLogout={logout} />;
  }
};

export default App;
