import React, { useState, useEffect } from 'react';
import { CustomerSidebar, CustomerTab } from '../../components/customer/CustomerSidebar';
import { CustomerHeader } from '../../components/customer/CustomerHeader';
import { MeterImageModal } from '../../components/customer/MeterImageModal';
import { CustomerOverviewView } from './CustomerOverviewView';
import { CustomerInvoicesView } from './CustomerInvoicesView';
import { CustomerHistoryView } from './CustomerHistoryView';
import { CustomerComplaintsView } from './CustomerComplaintsView';
import { CustomerPaymentView } from './CustomerPaymentView';
import { CustomerOverviewData, CustomerInvoiceItem, CustomerComplaintItem, UserAuthSession } from '../../types';
import { api } from '../../services/api';

interface CustomerPortalPageProps {
  currentUser?: UserAuthSession | null;
  onLogout: () => void;
  onSwitchToStaff?: () => void;
}

export const CustomerPortalPage: React.FC<CustomerPortalPageProps> = ({
  currentUser,
  onLogout,
  onSwitchToStaff,
}) => {
  const [activeTab, setActiveTab] = useState<CustomerTab>('overview');
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedInvoiceIdForPayment, setSelectedInvoiceIdForPayment] = useState<number>(1);
  const [overviewData, setOverviewData] = useState<CustomerOverviewData | null>(null);
  const [invoices, setInvoices] = useState<CustomerInvoiceItem[]>([]);
  const [complaints, setComplaints] = useState<CustomerComplaintItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [overviewRes, invoicesRes, complaintsRes] = await Promise.all([
          api.getCustomerOverview(),
          api.getCustomerInvoices(),
          api.getCustomerComplaints(),
        ]);
        setOverviewData(overviewRes);
        setInvoices(invoicesRes);
        setComplaints(complaintsRes);
      } catch (err) {
        console.error('Error fetching customer data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePayInvoice = async (invoiceId: number) => {
    await api.payInvoice(invoiceId);
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: 'PAID', paidDate: 'Hôm nay' } : inv
      )
    );
    if (overviewData) {
      setOverviewData({
        ...overviewData,
        currentBill: { ...overviewData.currentBill, status: 'PAID' },
        latestInvoice: overviewData.latestInvoice ? { ...overviewData.latestInvoice, status: 'PAID' } : null,
      });
    }
  };

  const handleOpenPayment = (invoiceId: number) => {
    setSelectedInvoiceIdForPayment(invoiceId);
    setActiveTab('payment');
  };

  const handleSubmitComplaint = async (data: {
    ticketType: string;
    invoiceCode?: string;
    content: string;
    imageUrl?: string;
  }) => {
    const newTicket = await api.submitComplaint(data);
    setComplaints((prev) => [newTicket, ...prev]);
  };

  const handleTabChange = (tab: CustomerTab) => {
    if (tab === 'meter-image') {
      setIsPhotoModalOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  if (isLoading || !overviewData) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Đang tải dữ liệu khách hàng...</p>
        </div>
      </div>
    );
  }

  const invoiceForPayment =
    invoices.find((i) => i.id === selectedInvoiceIdForPayment) || invoices[0];

  return (
    <div className="flex min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      <CustomerSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={onLogout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <CustomerHeader
          customerName={overviewData.customerName || currentUser?.fullName || 'Khách hàng'}
          meterSerial={overviewData.meterSerial}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {activeTab === 'overview' && (
            <CustomerOverviewView
              data={overviewData}
              onNavigateToInvoices={() => setActiveTab('invoices')}
              onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
              onPayNow={() => handleOpenPayment(invoices[0]?.id || 1)}
            />
          )}

          {activeTab === 'invoices' && (
            <CustomerInvoicesView
              invoices={invoices}
              onPayInvoice={async (id) => handleOpenPayment(id)}
              onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
            />
          )}

          {activeTab === 'payment' && invoiceForPayment && (
            <CustomerPaymentView
              invoice={invoiceForPayment}
              customerName={overviewData.customerName}
              customerCode={overviewData.customerCode}
              meterCode={`${overviewData.meterCode} (Tầng 1)`}
              address={overviewData.address}
              onBack={() => setActiveTab('invoices')}
              onPaymentSuccess={handlePayInvoice}
            />
          )}

          {activeTab === 'history' && (
            <CustomerHistoryView
              invoices={invoices}
              meterSerial={overviewData.meterSerial}
              onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
              onPayNow={(id) => handleOpenPayment(id)}
              onNavigateToTicket={() => setActiveTab('complaints')}
            />
          )}

          {activeTab === 'complaints' && (
            <CustomerComplaintsView
              complaints={complaints}
              customerName={overviewData.customerName}
              customerCode={overviewData.customerCode}
              meterCode={overviewData.meterCode}
              address={overviewData.address}
              onSubmitComplaint={handleSubmitComplaint}
            />
          )}
        </main>
      </div>

      <MeterImageModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onViewInvoice={() => {
          setIsPhotoModalOpen(false);
          setActiveTab('invoices');
        }}
        period="Tháng 09/2026"
        meterSerial={overviewData.meterSerial}
        readingIndex={overviewData.stats.currentIndex}
        imageUrl={overviewData.latestPhoto?.imageUrl || '/uploads/raw/1_bee59a99_raw.jpg'}
      />
    </div>
  );
};
