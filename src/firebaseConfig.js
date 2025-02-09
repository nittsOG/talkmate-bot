import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // Add this line
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";


// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDAKsuq66KU7OvIjkhAESEb8-sf6z87jw4",
  authDomain: "talkmate-14e25.firebaseapp.com",
  projectId: "talkmate-14e25",
  storageBucket: "talkmate-14e25.firebasestorage.app",
  messagingSenderId: "401530047572",
  appId: "1:401530047572:web:56726a7a2146ef9b2031c1",
  measurementId: "G-VDVJF22FDJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // Initialize auth

const db = getFirestore(app);  // Add this after initializing Firebase


const analytics = getAnalytics(app);

export { auth , db };  // Export auth to use it in other files
