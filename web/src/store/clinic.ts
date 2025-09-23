import { atom } from 'nanostores';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  contact: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Visit {
  id: string;
  patientId: string;
  date: Date;
  diagnosis: string;
  prescribedMedicines: PrescribedMedicine[];
  notes?: string;
  createdAt: Date;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  expiryDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrescribedMedicine {
  medicineId: string;
  medicineName: string;
  dosage: string;
  quantity: number;
}

export const $patients = atom<Patient[]>([]);
export const $medicines = atom<Medicine[]>([]);
export const $visits = atom<Visit[]>([]);
export const $selectedPatient = atom<Patient | null>(null);
export const $loading = atom<boolean>(false);
export const $todayStats = atom<{
  patients: number;
  visits: number;
  revenue: number;
  lowStock: number;
}>({ patients: 0, visits: 0, revenue: 0, lowStock: 0 });

// Store Actions
import {
  getPatients,
  getMedicines,
  getVisits,
  getTodayStats,
  getLowStockMedicines
} from '@/lib/firestore';

export const loadPatients = async () => {
  $loading.set(true);
  const { patients, error } = await getPatients();
  if (!error) {
    $patients.set(patients);
  }
  $loading.set(false);
  return { patients, error };
};

export const loadMedicines = async () => {
  $loading.set(true);
  const { medicines, error } = await getMedicines();
  if (!error) {
    $medicines.set(medicines);
  }
  $loading.set(false);
  return { medicines, error };
};

export const loadVisits = async (patientId?: string) => {
  $loading.set(true);
  const { visits, error } = await getVisits(patientId);
  if (!error) {
    $visits.set(visits);
  }
  $loading.set(false);
  return { visits, error };
};

export const loadTodayStats = async () => {
  const { stats, error } = await getTodayStats();
  if (!error) {
    $todayStats.set(stats);
  }
  return { stats, error };
};

export const loadLowStockMedicines = async () => {
  const { medicines, error } = await getLowStockMedicines();
  return { medicines, error };
};