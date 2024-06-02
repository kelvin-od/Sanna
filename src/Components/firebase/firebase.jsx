import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBodMIz6ov5FGAG0UlSbZ2hY-flkrECrjU",
  authDomain: "sanna-a4434.firebaseapp.com",
  projectId: "sanna-a4434",
  storageBucket: "sanna-a4434.appspot.com",
  messagingSenderId: "170004038709",
  appId: "1:170004038709:web:2c60517adc06a1527f9d7c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, onAuthStateChanged };
