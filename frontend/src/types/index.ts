export interface RouteItem {
  id: number;
  routeCode: string;
  routeName: string;
  description?: string;
  ward: string;
  district: string;
  totalMeters: number;
  recordedMeters: number;
  pendingMeters: number;
  abnormalMeters: number;
  percentComplete: number;
  status: string;
  priority: number;
  lastUpdated?: string;
}

export interface PriorityAlert {
  id: number;
  meterCode: string;
  customerName: string;
  address: string;
  phone?: string;
  issueType: string;
  issueDescription: string;
  routeCode: string;
  actionPrompt: string;
}

export interface AssignedRoutesData {
  shiftProgressPercent: number;
  totalMetersInShift: number;
  recordedMetersInShift: number;
  pendingMetersInShift: number;
  abnormalMetersInShift: number;
  startTime: string;
  estimatedEndTime: string;
  routes: RouteItem[];
  priorityAlerts: PriorityAlert[];
}

export interface MeterItem {
  id: number;
  meterCode: string;
  customerName: string;
  customerPhone?: string;
  address: string;
  meterSize: string;
  meterType: string;
  standardTierLimit: number;
  previousIndex: number;
  currentIndex?: number | null;
  readingStatus: 'PENDING' | 'RECORDED' | 'LOCKED' | 'ABNORMAL';
  isPriority: boolean;
  priorityReason?: string;
  notes?: string;
}

export interface PolygonPoint {
  x: number;
  y: number;
}

export interface AIPredictionResponse {
  requestId: string;
  meterId: number;
  meterCode: string;
  previousIndex: number;
  prediction: {
    predictedSequence: string;
    numericalValue: number;
    confidence: number;
    modelVersion: string;
  };
  visualization: {
    originalImageUrl: string;
    croppedImageUrl: string;
    polygon: PolygonPoint[];
    bbox: number[];
  };
}

export interface TierItem {
  tierOrder: number;
  tierName: string;
  volume: number;
  unitPrice: number;
  amount: number;
}

export interface TariffCalculation {
  consumption: number;
  waterAmount: number;
  envFee: number;
  vatAmount: number;
  totalAmount: number;
  tiers: TierItem[];
}
