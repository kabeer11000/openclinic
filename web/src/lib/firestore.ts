import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Patient, Medicine, Visit, PrescribedMedicine } from '@/store/clinic';

// Collections
const PATIENTS_COLLECTION = 'patients';
const MEDICINES_COLLECTION = 'medicines';
const VISITS_COLLECTION = 'visits';

// Patient Services
export const createPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const now = new Date();
    const docRef = await addDoc(collection(db, PATIENTS_COLLECTION), {
      ...patientData,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    });
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const getPatients = async () => {
  try {
    const q = query(collection(db, PATIENTS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const patients: Patient[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Patient[];
    return { patients, error: null };
  } catch (error: any) {
    return { patients: [], error: error.message };
  }
};

export const getPatient = async (id: string) => {
  try {
    const docRef = doc(db, PATIENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const patient = {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt.toDate(),
        updatedAt: docSnap.data().updatedAt.toDate()
      } as Patient;
      return { patient, error: null };
    } else {
      return { patient: null, error: 'Patient not found' };
    }
  } catch (error: any) {
    return { patient: null, error: error.message };
  }
};

export const updatePatient = async (id: string, updates: Partial<Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>>) => {
  try {
    const docRef = doc(db, PATIENTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deletePatient = async (id: string) => {
  try {
    await deleteDoc(doc(db, PATIENTS_COLLECTION, id));
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const searchPatients = async (searchTerm: string) => {
  try {
    const q = query(
      collection(db, PATIENTS_COLLECTION),
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff'),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    const patients: Patient[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Patient[];
    return { patients, error: null };
  } catch (error: any) {
    return { patients: [], error: error.message };
  }
};

// Medicine Services
export const createMedicine = async (medicineData: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const now = new Date();
    const docRef = await addDoc(collection(db, MEDICINES_COLLECTION), {
      ...medicineData,
      expiryDate: Timestamp.fromDate(medicineData.expiryDate),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    });
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const getMedicines = async () => {
  try {
    const q = query(collection(db, MEDICINES_COLLECTION), orderBy('name'));
    const querySnapshot = await getDocs(q);
    const medicines: Medicine[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      expiryDate: doc.data().expiryDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Medicine[];
    return { medicines, error: null };
  } catch (error: any) {
    return { medicines: [], error: error.message };
  }
};

export const getMedicine = async (id: string) => {
  try {
    const docRef = doc(db, MEDICINES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const medicine = {
        id: docSnap.id,
        ...docSnap.data(),
        expiryDate: docSnap.data().expiryDate.toDate(),
        createdAt: docSnap.data().createdAt.toDate(),
        updatedAt: docSnap.data().updatedAt.toDate()
      } as Medicine;
      return { medicine, error: null };
    } else {
      return { medicine: null, error: 'Medicine not found' };
    }
  } catch (error: any) {
    return { medicine: null, error: error.message };
  }
};

export const updateMedicine = async (id: string, updates: Partial<Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>>) => {
  try {
    const docRef = doc(db, MEDICINES_COLLECTION, id);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    };

    if (updates.expiryDate) {
      updateData.expiryDate = Timestamp.fromDate(updates.expiryDate);
    }

    await updateDoc(docRef, updateData);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteMedicine = async (id: string) => {
  try {
    await deleteDoc(doc(db, MEDICINES_COLLECTION, id));
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const searchMedicines = async (searchTerm: string) => {
  try {
    const q = query(
      collection(db, MEDICINES_COLLECTION),
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff'),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    const medicines: Medicine[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      expiryDate: doc.data().expiryDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Medicine[];
    return { medicines, error: null };
  } catch (error: any) {
    return { medicines: [], error: error.message };
  }
};

export const getLowStockMedicines = async (threshold: number = 10) => {
  try {
    const q = query(
      collection(db, MEDICINES_COLLECTION),
      where('quantity', '<=', threshold),
      orderBy('quantity')
    );
    const querySnapshot = await getDocs(q);
    const medicines: Medicine[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      expiryDate: doc.data().expiryDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Medicine[];
    return { medicines, error: null };
  } catch (error: any) {
    return { medicines: [], error: error.message };
  }
};

// Visit Services
export const createVisit = async (visitData: Omit<Visit, 'id' | 'createdAt'>) => {
  try {
    const batch = writeBatch(db);

    // Create visit
    const visitRef = doc(collection(db, VISITS_COLLECTION));
    batch.set(visitRef, {
      ...visitData,
      date: Timestamp.fromDate(visitData.date),
      createdAt: Timestamp.fromDate(new Date())
    });

    // Update medicine quantities
    for (const prescribed of visitData.prescribedMedicines) {
      const medicineRef = doc(db, MEDICINES_COLLECTION, prescribed.medicineId);
      const medicineSnap = await getDoc(medicineRef);

      if (medicineSnap.exists()) {
        const currentQuantity = medicineSnap.data().quantity;
        const newQuantity = Math.max(0, currentQuantity - prescribed.quantity);
        batch.update(medicineRef, {
          quantity: newQuantity,
          updatedAt: Timestamp.fromDate(new Date())
        });
      }
    }

    await batch.commit();
    return { id: visitRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const getVisits = async (patientId?: string) => {
  try {
    let q;
    if (patientId) {
      q = query(
        collection(db, VISITS_COLLECTION),
        where('patientId', '==', patientId),
        orderBy('date', 'desc')
      );
    } else {
      q = query(collection(db, VISITS_COLLECTION), orderBy('date', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    const visits: Visit[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate()
    })) as Visit[];
    return { visits, error: null };
  } catch (error: any) {
    return { visits: [], error: error.message };
  }
};

export const getVisit = async (id: string) => {
  try {
    const docRef = doc(db, VISITS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const visit = {
        id: docSnap.id,
        ...docSnap.data(),
        date: docSnap.data().date.toDate(),
        createdAt: docSnap.data().createdAt.toDate()
      } as Visit;
      return { visit, error: null };
    } else {
      return { visit: null, error: 'Visit not found' };
    }
  } catch (error: any) {
    return { visit: null, error: error.message };
  }
};

export const getTodayStats = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's visits
    const visitsQuery = query(
      collection(db, VISITS_COLLECTION),
      where('date', '>=', Timestamp.fromDate(today)),
      where('date', '<', Timestamp.fromDate(tomorrow))
    );
    const visitsSnapshot = await getDocs(visitsQuery);
    const todayVisits = visitsSnapshot.size;

    // Get unique patients today
    const patientIds = new Set();
    visitsSnapshot.docs.forEach(doc => {
      patientIds.add(doc.data().patientId);
    });
    const todayPatients = patientIds.size;

    // Get low stock medicines
    const lowStockResult = await getLowStockMedicines(20);
    const lowStockCount = lowStockResult.medicines.length;

    // Calculate revenue (this would be based on consultation fees and medicine prices)
    let revenue = 0;
    visitsSnapshot.docs.forEach(doc => {
      const visit = doc.data();
      revenue += 50; // Base consultation fee
      visit.prescribedMedicines?.forEach((med: PrescribedMedicine) => {
        revenue += med.quantity * 10; // Estimated medicine cost
      });
    });

    return {
      stats: {
        patients: todayPatients,
        visits: todayVisits,
        revenue,
        lowStock: lowStockCount
      },
      error: null
    };
  } catch (error: any) {
    return {
      stats: { patients: 0, visits: 0, revenue: 0, lowStock: 0 },
      error: error.message
    };
  }
};