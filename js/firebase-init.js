// Firebase SDK initialization - shared across all seating pages

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCnsqsedAD_xPFWS7SZYq28CAItMe95p5E",
  authDomain: "telu-wedding-website.firebaseapp.com",
  projectId: "telu-wedding-website",
  storageBucket: "telu-wedding-website.firebasestorage.app",
  messagingSenderId: "656223267446",
  appId: "1:656223267446:web:c25ac288b3c08fcfc58d57",
  measurementId: "G-TBY7P9NZXW"
};

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
