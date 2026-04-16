// Firebase SDK initialization - shared across all seating pages

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // Make Firebase functions available globally
  window.firebaseDB = db;
  window.firebaseDoc = doc;
  window.firebaseGetDoc = getDoc;
  window.firebaseSetDoc = setDoc;
  window.firebaseCollection = collection;
  window.firebaseGetDocs = getDocs;
  window.firebaseInitialized = true;

  (window.devLog || console.log)("✓ Firebase initialized successfully");
} catch (error) {
  (window.devError || console.error)("❌ Firebase initialization error:", error);
  (window.devError || console.error)("Stack trace:", error.stack);
  window.firebaseInitialized = false;
}
