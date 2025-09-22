// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-qABqQFF-lQnP9XkW4zTdtHVQOy7Ph44",
  authDomain: "openclinic-a02f8.firebaseapp.com",
  projectId: "openclinic-a02f8",
  storageBucket: "openclinic-a02f8.firebasestorage.app",
  messagingSenderId: "421312004286",
  appId: "1:421312004286:web:8395b65d4546aebb845eef",
  measurementId: "G-YBWH0K0J9P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (optional, only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

// Firestore collection references
export const patientsCollection = collection(db, 'patients');
export const visitsCollection = collection(db, 'visits');
export const medicinesCollection = collection(db, 'medicines');

// Helper functions for Firestore operations
export const firestoreHelpers = {
  // Add document
  add: (collectionRef: any, data: any) => addDoc(collectionRef, data),

  // Get all documents from a collection
  getAll: (collectionRef: any) => getDocs(collectionRef),

  // Get document by ID
  getById: (collectionPath: string, id: string) => getDoc(doc(db, collectionPath, id)),

  // Update document
  update: (collectionPath: string, id: string, data: any) => updateDoc(doc(db, collectionPath, id), data),

  // Delete document
  delete: (collectionPath: string, id: string) => deleteDoc(doc(db, collectionPath, id)),

  // Query with conditions
  query: (collectionRef: any, ...conditions: any[]) => getDocs(query(collectionRef, ...conditions)),
};