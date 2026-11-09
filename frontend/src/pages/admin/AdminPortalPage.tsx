import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminOverviewView } from './AdminOverviewView';
import { AdminRoutesView } from './AdminRoutesView';
import { AdminAssignRouteView } from './AdminAssignRouteView';
import { AdminEmployeesView } from './AdminEmployeesView';
import { AdminPricingView } from './AdminPricingView';
import { AdminInvoicesView } from './AdminInvoicesView';
import { AdminComplaintsView } from './AdminComplaintsView';
import { AdminReportsView } from './AdminReportsView';
import { UserAuthSession } from '../../types';
import { api } from '../../services/api';

interface AdminPortalPageProps {
  currentUser?: UserAuthSession | null;
  onSwitchPortal?: (target: 'reader' | 'customer') => void;
  onLogout?: () => void;
}

export const AdminPortalPage: React.FC<AdminPortalPageProps> = ({
  currentUser,
  onSwitchPortal,
  onLogout,
}) => {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [assignRouteId, setAssignRouteId] = useState<number | undefined>(undefined);
  const [pendingComplaintsCount, setPendingComplaintsCount] = useState<number>(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    api.getAdminComplaints()
      .then((items) => {
        const count = items.filter((c) => c.status === 'PENDING').length;
        setPendingComplaintsCount(count);
      })
      .catch(() => {});
  }, [currentTab]);

  const handleAssignClick = (routeId?: number) => {
    setAssignRouteId(routeId);
    setCurrentTab('assign_route');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'overview':
        return <AdminOverviewView onNavigateTab={(tab) => setCurrentTab(tab)} />;
      case 'routes':
        return <AdminRoutesView onAssignClick={handleAssignClick} />;
      case 'assign_route':
        return (
          <AdminAssignRouteView
            initialRouteId={assignRouteId}
            onBack={() => setCurrentTab('routes')}
          />
        );
      case 'employees':
        return <AdminEmployeesView />;
      case 'pricing':
        return <AdminPricingView />;
      case 'invoices':
        return <AdminInvoicesView onNavigatePricing={() => setCurrentTab('pricing')} />;
      case 'complaints':
        return <AdminComplaintsView />;
      case 'reports':
        return <AdminReportsView />;
      default:
        return <AdminOverviewView onNavigateTab={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-800">
      <AdminSidebar
        currentTab={currentTab === 'assign_route' ? 'routes' : currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onSwitchPortal={onSwitchPortal}
        onLogout={onLogout}
        pendingComplaintsCount={pendingComplaintsCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          adminName={currentUser?.fullName || 'Quản trị viên'}
          adminRole={currentUser?.role === 'ADMIN' ? 'Quản trị viên cấp cao' : 'Nhân sự vận hành'}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
};
