// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Added back
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAT6qWA6o1Pnj_Ncc5Nlp4AgyfdeKVRI_A",
    authDomain: "home-mysite.firebaseapp.com",
    projectId: "home-mysite",
    storageBucket: "home-mysite.firebasestorage.app",
    messagingSenderId: "12355480669",
    appId: "1:12355480669:web:278e2775869e5add7d31b4",
    measurementId: "G-3Z0SM8X1DC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Export auth for usage in app
const analytics = getAnalytics(app);