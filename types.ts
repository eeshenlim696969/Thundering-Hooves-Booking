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

export type VisitorCategory = 'VITROXIAN' | 'STUDENT' | 'OUTSIDER';

export interface SeatDetail {
  category: VisitorCategory;
  studentName: string;
  studentId?: string; 
  icNumber?: string;  
  carPlate?: string;  
  email?: string;     
  phone?: string;     
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

export interface ConcertConfig {
  totalTables: number;
  section1Count: number;
  section2Count: number;
  section3Count: number;
  seatsPerTable: number;
  payment: {
    tngQrUrl: string;
    bankAccountName: string;
    bankAccountNumber: string;
    bankName: string;
  };
  tiers: {
    [key in SeatTier]: {
      price: number;
      color: string;
      label: string;
    }
  };
}
