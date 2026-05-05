import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB-pYnUBYHH9IBiZQb2qz8BG9_RRiW8Z2k",
  authDomain: "campusapp-e9e04.firebaseapp.com",
  projectId: "campusapp-e9e04",
  storageBucket: "campusapp-e9e04.firebasestorage.app",
  messagingSenderId: "928852938067",
  appId: "1:928852938067:web:a18e3edf4cb9a0bf4ae5a6"
};

const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);