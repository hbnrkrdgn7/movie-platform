// src/utils/auth.ts
import { auth, googleProvider } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  User
} from "firebase/auth";

// Giriş yap
export const login = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Google ile giriş yap
export const loginWithGoogle = async () => {
  return signInWithPopup(auth, googleProvider);
};

// Kayıt ol
export const register = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Çıkış yap
export const logout = () => {
  return signOut(auth);
};

// Kullanıcı durumunu izle
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
