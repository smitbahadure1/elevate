import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDEU_ebNd4a_SwUM1QtYVLLWTW8hxaI9oA",
    authDomain: "elevate-eb4cf.firebaseapp.com",
    projectId: "elevate-eb4cf",
    storageBucket: "elevate-eb4cf.firebasestorage.app",
    messagingSenderId: "580004928206",
    appId: "1:580004928206:web:f4155c0116602da292ce9f",
    measurementId: "G-HK3DX5T17H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { app, auth, db };
