import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
// "firebase/auth"-ul public expune tipuri doar pentru web — getReactNativePersistence
// există doar în build-ul RN (@firebase/auth/dist/rn), care rulează corect, dar tipurile
// din pachetul wrapper nu-l declară. Bug cunoscut al pachetului, nu o greșeală aici.
// @ts-expect-error - vezi comentariul de mai sus
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Cheile vin din variabile de mediu — vezi .env. Nu hardcoda niciodată chei aici.
// Trebuie prefixate EXPO_PUBLIC_ ca Expo să le includă în bundle-ul de client.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
// getAuth() presupune persistență web (window/localStorage), care nu există pe
// React Native — de-acolo eroarea "Component auth has not been registered yet".
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);
export const storage = getStorage(app);
