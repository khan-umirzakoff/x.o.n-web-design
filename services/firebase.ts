// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD3kU2HJeBDMNjQcJVxkUoSn9pFIvccZ4s",
  authDomain: "xon-apk.firebaseapp.com",
  projectId: "xon-apk",
  storageBucket: "xon-apk.firebasestorage.app",
  messagingSenderId: "189342048017",
  appId: "1:189342048017:web:dd257066607128f73b76b0",
  measurementId: "G-35173NE2H6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
