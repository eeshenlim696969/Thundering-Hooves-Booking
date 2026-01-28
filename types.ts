export enum SeatStatus {
  AVAILABLE = 'AVAILABLE',
  SELECTED = 'SELECTED',
  SOLD = 'SOLD',
  BLOCKED = 'BLOCKED',
  PENDING = 'PENDING',
  CHECKOUT = 'CHECKOUT',
}

export enum SeatTier {
  PLATINUM = 'PLATINUM',
  GOLD = 'GOLD',
  SILVER = 'SILVER',
}

// --- UPDATED: 3 Categories ---
export type VisitorCategory = 'VITROXIAN' | 'STUDENT' | 'OUTSIDER';

export interface SeatDetail {
  category: VisitorCategory;
  studentName: string;
  studentId?: string;        // Used for Student ID or Vitroxian ID
  icNumber?: string;         // For outsiders
  carPlate?: string;         // For outsiders
  isMember: boolean;
  isVegan: boolean;
  
  refNo?: string;
  date?: string;
}

export interface SeatData {
  id: string;
  tableId: number;
  seatNumber: number;
  status: SeatStatus;
  tier: SeatTier;
  price: number;
  lockedBy?: string;
  lockedAt?: number;
  paymentInfo?: SeatDetail;
}

export interface PaymentConfig {
  tngQrUrl: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
}

export interface ConcertConfig {
  totalTables: number;
  section1Count: number;
  section2Count: number;
  section3Count: number;
  seatsPerTable: number;
  driveFolderLink?: string;
  payment: PaymentConfig;
  tiers: {
    [key in SeatTier]: {
      price: number;
      color: string;
      label: string;
    }
  };
}
