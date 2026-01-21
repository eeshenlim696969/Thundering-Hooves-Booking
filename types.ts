
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

export interface SeatDetail {
  studentName: string;
  studentId: string;
  isMember: boolean;
  isVegan: boolean;
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
  paymentInfo?: {
    refNo: string;
    receiptImage?: string; // Base64 encoded string
    studentName: string;
    studentId: string;
    date: string;
    isMember: boolean;
    isVegan: boolean;
  };
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
