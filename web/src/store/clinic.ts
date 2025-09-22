import { signal, type Signal } from '@builder.io/qwik';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  contact: string;
  address?: string;
  notes?: string;
  createdAt: Date;
}

export interface Visit {
  id: string;
  patientId: string;
  date: Date;
  diagnosis: string;
  prescribedMedicines: string[];
  notes?: string;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  expiryDate: Date;
  lowStockThreshold: number;
}

export interface ClinicStats {
  totalPatientsToday: number;
  totalRevenue: number;
  lowStockCount: number;
}

export const patientsState: Signal<Patient[]> = signal<Patient[]>([]);
export const visitsState: Signal<Visit[]> = signal<Visit[]>([]);
export const medicinesState: Signal<Medicine[]> = signal<Medicine[]>([]);
export const clinicStatsState: Signal<ClinicStats> = signal<ClinicStats>({
  totalPatientsToday: 0,
  totalRevenue: 0,
  lowStockCount: 0,
});