import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import { useAppDispatch } from './app/hooks';
import { setUser, clearUser } from './features/auth/authSlice';
import { subscribeToAuthChanges } from './utils/auth';
import './i18n'; // i18n konfigürasyonunu import et

function AppContent() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      if (user) {
        dispatch(setUser({
          uid: user.uid,
          email: user.email || "",
          displayName: user.displayName || user.email?.split("@")[0],
        }));
      } else {
        dispatch(clearUser());
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
