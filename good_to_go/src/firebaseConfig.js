import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD33Ik9B3tQY7StFn80t-if4GPeEiKGFqI",
  authDomain: "goodtogo-eae56.firebaseapp.com",
  projectId: "goodtogo-eae56",
  storageBucket: "goodtogo-eae56.appspot.com",
  messagingSenderId: "697845875378",
  appId: "1:697845875378:web:cb513352d484c116f6bfab",
  measurementId: "G-K6FMG4R0Z0"
};

export const app = initializeApp(firebaseConfig);
export const database = getFirestore(app);