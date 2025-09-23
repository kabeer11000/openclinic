import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyC-qABqQFF-lQnP9XkW4zTdtHVQOy7Ph44",
  authDomain: "openclinic-a02f8.firebaseapp.com",
  projectId: "openclinic-a02f8",
  storageBucket: "openclinic-a02f8.firebasestorage.app",
  messagingSenderId: "421312004286",
  appId: "1:421312004286:web:8395b65d4546aebb845eef",
  measurementId: "G-YBWH0K0J9P"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;