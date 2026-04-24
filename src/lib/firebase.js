import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
    apiKey: "AIzaSyC8pSsJ7pedjQ12s77_rwWSDWyYDMJwgAk",
    authDomain: "la-boutique-de-la-elegancia.firebaseapp.com",
    projectId: "la-boutique-de-la-elegancia",
    storageBucket: "la-boutique-de-la-elegancia.firebasestorage.app",
    messagingSenderId: "1037411928146",
    appId: "1:1037411928146:web:5fced4145039b5e5a8f78b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const firebaseApp = app;
