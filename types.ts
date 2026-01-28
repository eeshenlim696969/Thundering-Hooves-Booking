export enum SeatStatus {
  AVAILABLE = 'AVAILABLE',
  SELECTED = 'SELECTED',
  SOLD = 'SOLD',
  BLOCKED = 'BLOCKED',
  PENDING = 'PENDING',
  CHECKOUT = 'CHECKOUT',
}

export enum SeatTier {
  PLATINUM = 'PLATINUM', // Kept for legacy compatibility
  GOLD = 'GOLD',
  SILVER = 'SILVER',
}

// --- NEW: Visitor Categories ---
export type VisitorCategory = 'VITROXIAN' | 'STUDENT' | 'OUTSIDER';

export interface SeatDetail {
  category: VisitorCategory;
  studentName: string;
  
  // Dynamic IDs based on category
  studentId?: string;        // For Student or Vitroxian
  icNumber?: string;         // For Outsider
  carPlate?: string;         // For Outsider
  phoneNumber?: string;      // NEW: For Outsider
  email?: string;            // NEW: For Outsider
  
  isMember: boolean;
  isVegan: boolean;
  
  // Payment/System fields
  refNo?: string;
  receiptImage?: string;
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
  paymentInfo?: SeatDetail; // Linked to the interface above
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

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
export type ImageSize = "1K" | "2K" | "4K";
