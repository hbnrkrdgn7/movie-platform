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
import './i18n'; // i18n konfigürasyonunu import et

function AppContent() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // LocalStorage'dan token varsa kullanıcıyı set et
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      const userData = JSON.parse(storedUser);
      dispatch(setUser(userData));
    } else {
      dispatch(clearUser());
    }
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
