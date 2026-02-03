export interface Port {
  code: string;
  name: string;
  address: string;
  city: string;
  state: string;
  region: string;
}

export interface Warehouse {
  code: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  region: string;

  // Computed/Live fields (simulated for MVP)
  congestionLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  avgWaitTimeMins?: number;
  isRemote?: boolean;
}

export type VehicleType = 'CONTAINER_20' | 'CONTAINER_40' | 'DRY_VAN_53' | 'BOX_TRUCK_26';
export type HandlingMethod = 'PALLETIZED' | 'FLOOR_LOADED';

export interface QuoteParams {
  origin: string;
  destinationCode: string;
  vehicleType: VehicleType;
  handlingMethod: HandlingMethod;
  // Detailed Cost Params
  chassisDays: number;
  isOverweight: boolean;
  isHazmat: boolean;
  isPrePull: boolean;
}

export interface QuoteResult {
  baseCost: number;
  fuelSurcharge: number;
  congestionSurcharge: number;
  handlingFee: number;

  // Advanced Fees
  chassisFee: number;
  overweightFee: number;
  hazmatFee: number;
  prePullFee: number;
  remoteSurcharge: number;

  totalCost: number;
  recommendedPrice: number;
  distanceMiles: number;
  estimatedHours: number;
}

export type JobStatus = 'PENDING' | 'DISPATCHED' | 'OUTGATED' | 'IN_WAREHOUSE' | 'EMPTY_RETURNED';
export type DriverStatus = 'IDLE' | 'HAULING_LOAD' | 'HAULING_EMPTY' | 'OFF_DUTY';

export interface ContainerJob {
  id: string;
  containerNo: string;
  masterBL: string; // MBL
  customerRef?: string;
  size: '20' | '40' | '45';
  type: 'GP' | 'HQ' | 'RF';

  origin: string; // Port Code
  destination: string; // Warehouse Code

  // Dates & Criticality
  eta: string; // ISO Date
  availableDate?: string;
  lfdTerminal: string; // Last Free Day at Terminal (Demurrage)
  lfdChassis?: string; // Last Free Day for Chassis (usage)

  status: JobStatus;
  assignedDriverId?: string;

  // Fees
  potentialDemurrage?: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licensePlate: string;
  status: DriverStatus;
  currentJobId?: string;
  location?: string; // e.g. "LBCT Gate" or "I-710 N"
}
