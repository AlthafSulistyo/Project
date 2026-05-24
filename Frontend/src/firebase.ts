import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAgho4OT1AgeqyoTuuFJv653UD43l78k6A",
  authDomain: "schoolguard-648f4.firebaseapp.com",
  projectId: "schoolguard-648f4",
  storageBucket: "schoolguard-648f4.firebasestorage.app",
  messagingSenderId: "449748222715",
  appId: "1:449748222715:web:5e69f892e0232250c7265e",
  measurementId: "G-6H22G3JZJS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
