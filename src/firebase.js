// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBUmWOsap0qNkdN6nD8snp86nHr9t2-VX0",
  authDomain: "eventease-539c0.firebaseapp.com",
  projectId: "eventease-539c0",
  storageBucket: "eventease-539c0.appspot.com",
  messagingSenderId: "376599750609",
  appId: "1:376599750609:web:ef221865d3ec8e9e44e2f0",
  measurementId: "G-7B4G342LYM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export {auth, db, storage};