// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUFLBePb3qXBP-vXFlECtnUOjWIwfrBb0",
  authDomain: "hackton-chainlink.firebaseapp.com",
  projectId: "hackton-chainlink",
  storageBucket: "hackton-chainlink.appspot.com",
  messagingSenderId: "1099238230637",
  appId: "1:1099238230637:web:1ac7639cfac2e913e04d64",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
