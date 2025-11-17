// Firebase Configuration - DEMO VERSION
// This demo version has Firebase completely disabled
// All data is stored locally using localStorage with sample/fictional data only

// Firebase is disabled in demo mode
const FIREBASE_ENABLED = false;

// Initialize Firebase - DISABLED FOR DEMO
let firebaseApp = null;
let firestore = null;

// Always disable Firebase in demo version
window.FIREBASE_LOADED = false;
window.firestore = null;

console.log('🎭 DEMO MODE: Firebase disabled. Using localStorage with sample data only.');

