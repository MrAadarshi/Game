import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9teyosr5RvRBSvz77V4EazqjW0z3NEGo",
  authDomain: "crypto-mining-d42ae.firebaseapp.com",
  projectId: "crypto-mining-d42ae",
  storageBucket: "crypto-mining-d42ae.firebasestorage.app",
  messagingSenderId: "366875847032",
  appId: "1:366875847032:web:f53100c1e1b69f54f0008d",
  measurementId: "G-41Y3ZXM5R3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Offline support functions
export const enableOfflineSupport = async () => {
  try {
    await enableNetwork(db);
    console.log('🟢 Firebase offline support enabled');
  } catch (error) {
    console.warn('⚠️ Could not enable Firebase network:', error.message);
  }
};

export const disableOfflineSupport = async () => {
  try {
    await disableNetwork(db);
    console.log('🔴 Firebase offline support disabled');
  } catch (error) {
    console.warn('⚠️ Could not disable Firebase network:', error.message);
  }
};

// Network status utilities
export const isFirebaseOnline = () => {
  return navigator.onLine;
};

// Error handling utility for Firebase operations
export const handleFirebaseError = (error, fallbackData = null) => {
  console.error('🔥 Firebase Error:', error);
  
  if (error.code === 'unavailable' || error.message.includes('offline')) {
    console.warn('📱 App is offline - using fallback data');
    return {
      success: false,
      offline: true,
      data: fallbackData,
      message: 'You are currently offline. Some features may be limited.'
    };
  }
  
  return {
    success: false,
    offline: false,
    data: fallbackData,
    message: error.message || 'An error occurred. Please try again.'
  };
};

export default app; 