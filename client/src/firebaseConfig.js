// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD2c8QF65iOUMIcK7B29aPA7Jv-qA5QFiQ",
  authDomain: "undergraduation-admin.firebaseapp.com",
  projectId: "undergraduation-admin",
  storageBucket: "undergraduation-admin.firebasestorage.app",
  messagingSenderId: "688683286206",
  appId: "1:688683286206:web:81a464c944458f151c28ef",
  measurementId: "G-8VHGY53WGG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {auth};