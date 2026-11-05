import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { RouteManagementPage } from './pages/RouteManagementPage';
import { MeterReadingPage } from './pages/MeterReadingPage';
import { HistoryPage } from './pages/HistoryPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CustomerPortalPage } from './pages/customer/CustomerPortalPage';
import { AdminPortalPage } from './pages/admin/AdminPortalPage';
import { UserAuthSession } from './types';

const getInitialUser = (): UserAuthSession | null => {
  try {
    const raw = localStorage.getItem('waterflow_user');
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupted storage
  }
  return null;
};

const getInitialPage = (
  user: UserAuthSession | null
): 'login' | 'register' | 'customer' | 'admin' | 'routes' | 'reading' | 'history' => {
  if (!user) return 'login';
  if (user.role === 'ADMIN') return 'admin';
  if (user.role === 'READER') return 'routes';
  return 'customer';
};

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserAuthSession | null>(getInitialUser);
  const [currentPage, setCurrentPage] = useState<
    'login' | 'register' | 'customer' | 'admin' | 'routes' | 'reading' | 'history'
  >(() => getInitialPage(getInitialUser()));
  const [selectedRouteId, setSelectedRouteId] = useState<number>(1);

  const handleOpenMeterReading = (routeId: number) => {
    setSelectedRouteId(routeId);
    setCurrentPage('reading');
  };

  const handleLoginSuccess = (user: UserAuthSession) => {
    try {
      localStorage.setItem('waterflow_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    setCurrentUser(user);
    if (user.role === 'ADMIN') {
      setCurrentPage('admin');
    } else if (user.role === 'READER') {
      setCurrentPage('routes');
    } else {
      setCurrentPage('customer');
    }
  };

  const handleRegisterSuccess = (user: UserAuthSession) => {
    try {
      localStorage.setItem('waterflow_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    setCurrentUser(user);
    setCurrentPage('customer');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('waterflow_user');
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setCurrentPage('login');
  };

  if (!currentUser && currentPage !== 'register') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={() => setCurrentPage('register')}
      />
    );
  }

  if (currentPage === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={() => setCurrentPage('register')}
      />
    );
  }

  if (currentPage === 'register') {
    return (
      <RegisterPage
        onRegisterSuccess={handleRegisterSuccess}
        onNavigateToLogin={() => setCurrentPage('login')}
      />
    );
  }

  if (currentPage === 'admin') {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={() => setCurrentPage('register')}
        />
      );
    }
    return (
      <AdminPortalPage
        currentUser={currentUser}
        onSwitchPortal={(target) => {
          if (target === 'reader') setCurrentPage('routes');
          if (target === 'customer') setCurrentPage('customer');
        }}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPage === 'customer') {
    if (!currentUser) {
      return (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={() => setCurrentPage('register')}
        />
      );
    }
    return (
      <CustomerPortalPage
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page as any)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentRouteTitle={
            selectedRouteId === 2
              ? 'Tuyến A02 – P. Đa Kao'
              : 'Tuyến A01 – P. Bến Nghé'
          }
          billingPeriod="Kỳ 04/2025"
          currentUser={currentUser}
          onLogout={handleLogout}
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

export default App;
