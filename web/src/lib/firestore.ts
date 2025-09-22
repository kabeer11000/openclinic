import {
  patientsCollection,
  visitsCollection,
  medicinesCollection,
  firestoreHelpers
} from './firebase';
import { where, orderBy } from 'firebase/firestore';
import type { Patient, Visit, Medicine } from '../store/clinic';

// Patient operations
export const patientService = {
  // Get all patients
  getAll: async (): Promise<Patient[]> => {
    const snapshot = await firestoreHelpers.getAll(patientsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
  },

  // Add new patient
  add: async (patient: Omit<Patient, 'id'>): Promise<string> => {
    const docRef = await firestoreHelpers.add(patientsCollection, {
      ...patient,
      createdAt: new Date()
    });
    return docRef.id;
  },

  // Get patient by ID
  getById: async (id: string): Promise<Patient | null> => {
    const doc = await firestoreHelpers.getById('patients', id);
    return doc.exists() ? { id: doc.id, ...doc.data() } as Patient : null;
  },

  // Update patient
  update: async (id: string, data: Partial<Patient>): Promise<void> => {
    await firestoreHelpers.update('patients', id, data);
  },

  // Delete patient
  delete: async (id: string): Promise<void> => {
    await firestoreHelpers.delete('patients', id);
  }
};

// Visit operations
export const visitService = {
  // Get all visits
  getAll: async (): Promise<Visit[]> => {
    const snapshot = await firestoreHelpers.getAll(visitsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Visit));
  },

  // Get visits by patient ID
  getByPatientId: async (patientId: string): Promise<Visit[]> => {
    const snapshot = await firestoreHelpers.query(
      visitsCollection,
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    );
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Visit));
  },

  // Add new visit
  add: async (visit: Omit<Visit, 'id'>): Promise<string> => {
    const docRef = await firestoreHelpers.add(visitsCollection, {
      ...visit,
      date: new Date()
    });
    return docRef.id;
  },

  // Update visit
  update: async (id: string, data: Partial<Visit>): Promise<void> => {
    await firestoreHelpers.update('visits', id, data);
  },

  // Delete visit
  delete: async (id: string): Promise<void> => {
    await firestoreHelpers.delete('visits', id);
  }
};

// Medicine operations
export const medicineService = {
  // Get all medicines
  getAll: async (): Promise<Medicine[]> => {
    const snapshot = await firestoreHelpers.getAll(medicinesCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medicine));
  },

  // Add new medicine
  add: async (medicine: Omit<Medicine, 'id'>): Promise<string> => {
    const docRef = await firestoreHelpers.add(medicinesCollection, medicine);
    return docRef.id;
  },

  // Get medicine by ID
  getById: async (id: string): Promise<Medicine | null> => {
    const doc = await firestoreHelpers.getById('medicines', id);
    return doc.exists() ? { id: doc.id, ...doc.data() } as Medicine : null;
  },

  // Update medicine
  update: async (id: string, data: Partial<Medicine>): Promise<void> => {
    await firestoreHelpers.update('medicines', id, data);
  },

  // Delete medicine
  delete: async (id: string): Promise<void> => {
    await firestoreHelpers.delete('medicines', id);
  },

  // Get low stock medicines
  getLowStock: async (): Promise<Medicine[]> => {
    const medicines = await medicineService.getAll();
    return medicines.filter(medicine => medicine.quantity <= medicine.lowStockThreshold);
  }
};

// Initialize Firestore with sample data (run once)
export const initializeFirestore = async () => {
  try {
    // Check if data already exists
    const patients = await patientService.getAll();
    if (patients.length > 0) {
      console.log('Firestore already has data');
      return;
    }

    console.log('Initializing Firestore with sample data...');

    // Add sample patients
    const samplePatients = [
      {
        name: 'John Smith',
        age: 35,
        gender: 'male' as const,
        contact: '+1-555-0123',
        address: '123 Main St, City, State 12345',
        notes: 'Regular checkups, no known allergies',
      },
      {
        name: 'Sarah Johnson',
        age: 28,
        gender: 'female' as const,
        contact: '+1-555-0456',
        address: '456 Oak Ave, City, State 12345',
        notes: 'Diabetic, requires regular monitoring',
      },
      {
        name: 'Michael Brown',
        age: 45,
        gender: 'male' as const,
        contact: '+1-555-0789',
        address: '789 Pine Rd, City, State 12345',
        notes: 'Hypertension patient',
      }
    ];

    for (const patient of samplePatients) {
      await patientService.add(patient);
    }

    // Add sample medicines
    const sampleMedicines = [
      {
        name: 'Paracetamol 500mg',
        category: 'Painkiller',
        quantity: 150,
        unitPrice: 0.50,
        expiryDate: new Date('2025-12-31'),
        lowStockThreshold: 20,
      },
      {
        name: 'Amoxicillin 250mg',
        category: 'Antibiotic',
        quantity: 8,
        unitPrice: 2.75,
        expiryDate: new Date('2025-06-30'),
        lowStockThreshold: 10,
      },
      {
        name: 'Metformin 500mg',
        category: 'Diabetes',
        quantity: 75,
        unitPrice: 1.20,
        expiryDate: new Date('2025-09-15'),
        lowStockThreshold: 15,
      }
    ];

    for (const medicine of sampleMedicines) {
      await medicineService.add(medicine);
    }

    console.log('Firestore initialized successfully');
  } catch (error) {
    console.error('Error initializing Firestore:', error);
  }
};