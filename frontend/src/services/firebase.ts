import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || 'AIzaSyAnJb225HkTHNJuBpWeyLnNg9hk82e-wgc',
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || 'elevate-1cf86.firebaseapp.com',
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || 'elevate-1cf86',
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || 'elevate-1cf86.firebasestorage.app',
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '1071242423962',
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '1:1071242423962:web:b0fb744cd4434d5008b923',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain
);

let app: any = null;
let auth: any = null;
let storage: any = null;
let googleProvider: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    console.log('🔥 Firebase initialized successfully for Elevate');
  } catch (err) {
    console.warn('⚠️ Error initializing Firebase SDK:', err);
  }
}

/**
 * Sign in using Firebase Google Auth Popup
 */
export const signInWithFirebaseGoogle = async (): Promise<{
  success: boolean;
  email?: string;
  name?: string;
  avatarUrl?: string;
  uid?: string;
  idToken?: string;
  error?: string;
}> => {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    return {
      success: false,
      error: 'Firebase is not yet configured with API keys. Using built-in demo auth.',
    };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();

    return {
      success: true,
      email: user.email || '',
      name: user.displayName || user.email?.split('@')[0] || 'Google User',
      avatarUrl: user.photoURL || undefined,
      uid: user.uid,
      idToken,
    };
  } catch (err: any) {
    console.error('Firebase Google Sign-In error:', err);
    return {
      success: false,
      error: err.message || 'Google Sign-In failed',
    };
  }
};

export { app, auth, storage };
