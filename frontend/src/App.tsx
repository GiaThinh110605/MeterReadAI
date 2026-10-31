import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { RouteManagementPage } from './pages/RouteManagementPage';
import { MeterReadingPage } from './pages/MeterReadingPage';
import { HistoryPage } from './pages/HistoryPage';

export const App: React.FC = () => {
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
