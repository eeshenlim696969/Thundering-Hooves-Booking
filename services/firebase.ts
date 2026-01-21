
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc, updateDoc, onSnapshot, collection, writeBatch, deleteDoc } from "firebase/firestore";

// Safe environment variable accessor
const getEnv = (key: string): string | undefined => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      if ((import.meta as any).env[key]) return (import.meta as any).env[key];
    }
    if (typeof process !== 'undefined' && process.env) {
      if ((process.env as any)[key]) return (process.env as any)[key];
    }
  } catch (e) {}
  return undefined;
};

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY") || "AIzaSyC0WAM7sSkR_JIl_vhvflq3lczEwqX0fSA",
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN") || "thundering-hooves-booking.firebaseapp.com",
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID") || "thundering-hooves-booking",
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET") || "thundering-hooves-booking.firebasestorage.app",
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID") || "396506097494",
  appId: getEnv("VITE_FIREBASE_APP_ID") || "1:396506097494:web:80580dd1dcb316f84ad8f7",
  measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID") || "G-NC3E8462HR"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export const submitBatchBookingRequest = async (bookings: { seatId: string, data: any }[]) => {
  const batch = writeBatch(db);
  const now = Date.now();
  
  bookings.forEach(({ seatId, data }) => {
    const seatRef = doc(db, "seats_v2", seatId);
    batch.set(seatRef, {
      ...data,
      updatedAt: now
    }, { merge: true });
  });

  return await batch.commit();
};

export const submitBookingRequest = async (seatId: string, data: any) => {
  const seatRef = doc(db, "seats_v2", seatId);
  return await setDoc(seatRef, {
    ...data,
    updatedAt: Date.now()
  }, { merge: true });
};

export const deleteBooking = async (seatId: string) => {
  const seatRef = doc(db, "seats_v2", seatId);
  return await deleteDoc(seatRef);
};

export const subscribeToSeats = (callback: (data: any) => void) => {
  const seatsCollection = collection(db, "seats_v2");
  return onSnapshot(seatsCollection, (snapshot) => {
    const seatMap: Record<string, any> = {};
    snapshot.forEach((doc) => {
      seatMap[doc.id] = doc.data();
    });
    callback(seatMap); 
  }, (error) => {
    console.error("Firestore Subscription Error:", error);
  });
};
