export interface AIAccuracySummary {
  totalReadings: number;
  acceptedAsIs: number;
  corrected: number;
  accuracyRate: number;
}

export interface RouteProgressItem {
  routeId: number;
  routeCode: string;
  routeName: string;
  totalMeters: number;
  recordedMeters: number;
  abnormalMeters: number;
  percentComplete: number;
  status: string;
}

export interface RecentAbnormalityItem {
  id: number;
  meterCode: string;
  customerName: string;
  reportType: string;
  description: string;
  reportedBy: string;
  status: string;
  reportedAt: string;
}

export interface AdminDashboardData {
  billingPeriod: string;
  meters: {
    total: number;
    recorded: number;
    pending: number;
    abnormal: number;
    locked: number;
    progressPercent: number;
  };
  totalConsumption: number;
  previousPeriodConsumption: number;
  consumptionChangePercent: number | null;
  revenue: {
    invoiceCount: number;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    collectionRate: number;
  };
  ai: AIAccuracySummary;
  pendingAbnormalities: number;
  totalCustomers: number;
  totalReaders: number;
  routes: RouteProgressItem[];
  recentAbnormalities: RecentAbnormalityItem[];
}

export interface MonthlyStatItem {
  period: string;
  readingsCount: number;
  consumption: number;
  invoiceCount: number;
  revenue: number;
  paidAmount: number;
  unpaidAmount: number;
}

export interface CategoryStatItem {
  label: string;
  count: number;
  value: number;
}

export interface AdminReportData {
  fromPeriod: string;
  toPeriod: string;
  monthly: MonthlyStatItem[];
  totals: {
    consumption: number;
    revenue: number;
    paidAmount: number;
    unpaidAmount: number;
    collectionRate: number;
    averageConsumptionPerReading: number;
  };
  ai: AIAccuracySummary;
  consumptionByMeterType: CategoryStatItem[];
  abnormalitiesByType: CategoryStatItem[];
  topConsumers: {
    meterCode: string;
    customerName: string;
    meterType: string;
    consumption: number;
  }[];
  employeePerformance: {
    employeeCode: string;
    fullName: string;
    readings: number;
    corrected: number;
    correctionRate: number;
  }[];
}
