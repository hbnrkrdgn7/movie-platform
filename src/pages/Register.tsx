import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Register.css";
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setError, clearError } from '../features/auth/authSlice';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Input referansları
  const lastNameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();
  const error = useAppSelector(state => state.auth.error);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Sayfa değiştiğinde hata mesajını temizle
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Kullanıcı adı kontrolü (backend)
  const checkUsernameExists = async (username: string) => {
    try {
      const res = await api.get(`/users/check-username?username=${encodeURIComponent(username)}`);
      return res.data?.exists === true;
    } catch (error) {
      console.error("Kullanıcı adı kontrolü hatası:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    setIsLoading(true);

    // Tüm alanların dolu olup olmadığını kontrol et
    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      dispatch(setError(t('missingFields')));
      setIsLoading(false);
      return;
    }

    try {
      // Kullanıcı adı kontrolü
      const usernameExists = await checkUsernameExists(username);
      if (usernameExists) {
        dispatch(setError(t('usernameInUse')));
        setIsLoading(false);
        return;
      }

      // Backend'e kayıt isteği
      const response = await api.post('/auth/register', {
        first_name: firstName,
        last_name: lastName,
        username,
        email,
        password,
      });

      if (response.data?.user) {
        alert(t('registrationSuccess'));
        navigate('/login');
      } else {
        dispatch(setError(t('registrationError', { error: 'Bilinmeyen hata' })));
      }
    } catch (err: any) {
      console.error('Kayıt hatası:', err);
      if (err.response?.status === 409) {
        const msg = err.response?.data?.message || '';
        if (msg.includes('Email')) {
          dispatch(setError(t('emailInUse')));
        } else if (msg.includes('Kullanıcı adı')) {
          dispatch(setError(t('usernameInUse')));
        } else {
          dispatch(setError(t('registrationError', { error: msg })));
        }
      } else {
        dispatch(setError(t('registrationError', { error: err.message || 'Hata' })));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>{t('register')}</h2>
      {error && <p className="error-text">{error}</p>}
      
      <form onSubmit={handleSubmit} className="register-form" noValidate>
        <div className="form-group">
          <label>{t('firstName')}:</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder={t('firstNamePlaceholder')}
            required
            disabled={isLoading}
            title={t('pleaseFillField')}
            onInvalid={e => (e.target as HTMLInputElement).setCustomValidity(t('pleaseFillField'))}
            onInput={e => (e.target as HTMLInputElement).setCustomValidity('')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                lastNameRef.current?.focus();
              }
            }}
          />
        </div>

        <div className="form-group">
          <label>{t('lastName')}:</label>
          <input
            ref={lastNameRef}
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder={t('lastNamePlaceholder')}
            required
            disabled={isLoading}
            title={t('pleaseFillField')}
            onInvalid={e => (e.target as HTMLInputElement).setCustomValidity(t('pleaseFillField'))}
            onInput={e => (e.target as HTMLInputElement).setCustomValidity('')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                usernameRef.current?.focus();
              }
            }}
          />
        </div>

        <div className="form-group">
          <label>{t('username')}:</label>
          <input
            ref={usernameRef}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('usernamePlaceholder')}
            required
            disabled={isLoading}
            title={t('pleaseFillField')}
            onInvalid={e => (e.target as HTMLInputElement).setCustomValidity(t('pleaseFillField'))}
            onInput={e => (e.target as HTMLInputElement).setCustomValidity('')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                emailRef.current?.focus();
              }
            }}
          />
        </div>

        <div className="form-group">
          <label>{t('email')}:</label>
          <input
            ref={emailRef}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('emailPlaceholder')}
            required
            disabled={isLoading}
            title={t('pleaseFillField')}
            onInvalid={e => (e.target as HTMLInputElement).setCustomValidity(t('pleaseFillField'))}
            onInput={e => (e.target as HTMLInputElement).setCustomValidity('')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                passwordRef.current?.focus();
              }
            }}
          />
        </div>

        <div className="form-group">
          <label>{t('password')}:</label>
          <input
            ref={passwordRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('passwordPlaceholder')}
            required
            disabled={isLoading}
            title={t('pleaseFillField')}
            onInvalid={e => (e.target as HTMLInputElement).setCustomValidity(t('pleaseFillField'))}
            onInput={e => (e.target as HTMLInputElement).setCustomValidity('')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
          />
        </div>

        <div className="button-group">
          <button 
            type="submit" 
            className="register-btn"
            disabled={isLoading}
          >
            {isLoading ? t('loading') : t('registerButton')}
          </button>
          <button
            type="button"
            className="login-btn"
            onClick={() => navigate("/login")}
            disabled={isLoading}
          >
            {t('loginButton')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
