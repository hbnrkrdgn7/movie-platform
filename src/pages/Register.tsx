import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { db } from "../firebaseConfig";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import "../style/Register.css";
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setError, clearError } from '../features/auth/authSlice';
import { useTranslation } from 'react-i18next';

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

  // Kullanıcı adı kontrolü
  const checkUsernameExists = async (username: string) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
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

      // Firebase Authentication ile kullanıcı oluşturma
      console.log("Firebase Authentication başlatılıyor...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Firebase Authentication başarılı:", userCredential);
      const user = userCredential.user;

      // Firestore'a kullanıcı bilgilerini kaydetme
      try {
        console.log("Firestore'a kayıt başlatılıyor...");
        await setDoc(doc(db, "users", user.uid), {
          firstName,
          lastName,
          username,
          email,
          createdAt: new Date(),
        });
        console.log("Firestore kayıt başarılı");
      } catch (firestoreError: any) {
        console.error("Firestore kayıt hatası:", firestoreError);
        // Firestore hatası olsa bile kullanıcı oluşturuldu, devam et
      }

      // Kullanıcıyı çıkış yaptır (otomatik giriş yapmasın)
      await auth.signOut();

      alert(t('registrationSuccess'));
      navigate("/login");
    } catch (error: any) {
      console.error("Kayıt hatası:", error);
      console.error("Hata kodu:", error.code);
      console.error("Hata mesajı:", error.message);
      
      let errorMessage = t('registrationError', { error: error.message });
      
      // Firebase hata kodlarını çevir
      if (error.code === "auth/email-already-in-use") {
        errorMessage = t('emailInUse');
      } else if (error.code === "auth/weak-password") {
        errorMessage = t('weakPassword');
      } else if (error.code === "auth/invalid-email") {
        errorMessage = t('invalidEmail');
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = t('networkError');
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage = t('operationNotAllowed');
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = t('tooManyRequests');
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = t('invalidCredentials');
      } else if (error.code === "auth/missing-password") {
        errorMessage = t('missingPassword');
      } else if (error.code === "auth/missing-email") {
        errorMessage = t('missingEmail');
      } else {
        errorMessage = t('missingFields');
      }
      
      dispatch(setError(errorMessage));
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
