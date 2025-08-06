import { initializeApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// YENİ PROJE İÇİN: Firebase Console'dan yeni proje bilgilerini buraya girin
const firebaseConfig = {
  apiKey: "AIzaSyAJA6rPoMHP0XbEdxEkZI51St3GIuS2ThY",
  authDomain: "movie-platform-cc79f.firebaseapp.com",
  projectId: "movie-platform-cc79f",
  storageBucket: "movie-platform-cc79f.firebasestorage.app",
  messagingSenderId: "572919544627",
  appId: "1:572919544627:web:e1f3f7901f229a92d09c46",
  measurementId: "G-884RTBKJW3"
};

// YENİ PROJE İÇİN: Yukarıdaki bilgileri yeni projenizin bilgileriyle değiştirin
// Firebase Console > Project Settings > General > Your apps > Web app > Config

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth: Auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider };
