import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { setUser, setError, clearError } from "../features/auth/authSlice";
import { login, loginWithGoogle } from "../utils/auth";
import { RootState } from "../app/store";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useTranslation } from "react-i18next";
import "../style/Login.css";

const Login: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const error = useAppSelector((state: RootState) => state.auth.error);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Sayfa değiştiğinde hata mesajını temizle
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    setIsLoading(true);

    try {
      console.log("Firebase login başlatılıyor...");
      const userCredential = await login(email, password);
      console.log("Firebase login başarılı:", userCredential);
      const user = userCredential.user;

      if (user) {
        // Firestore'dan kullanıcı bilgilerini çek
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let displayName = user.displayName ?? "";

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          // İsim ve soyismi birleştir
          displayName = `${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim();
        }

        dispatch(setUser({
          uid: user.uid,
          email: user.email ?? "",
          displayName: displayName || user.email?.split("@")[0],
        }));

        navigate("/homepage");
      } else {
        dispatch(setError("Kullanıcı bilgisi alınamadı."));
      }
    } catch (err: any) {
      console.error("Giriş hatası:", err);
      console.error("Hata kodu:", err.code);
      console.error("Hata mesajı:", err.message);
      
      let errorMessage = "Giriş başarısız: " + err.message;
      
      // Firebase hata kodlarını çevir
      if (err.code === "auth/user-not-found") {
        errorMessage = t('emailNotFound');
      } else if (err.code === "auth/wrong-password") {
        errorMessage = t('wrongPassword');
      } else if (err.code === "auth/invalid-email") {
        errorMessage = t('invalidEmail');
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = t('tooManyRequests');
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = t('networkError');
      } else if (err.code === "auth/user-disabled") {
        errorMessage = t('userDisabled');
      } else if (err.code === "auth/invalid-credential") {
        errorMessage = t('invalidCredentials');
      } else if (err.code === "auth/operation-not-allowed") {
        errorMessage = "Email/şifre ile giriş Firebase Console'da etkin değil. Lütfen Firebase Console'da Authentication > Sign-in method > Email/Password'ü etkinleştirin.";
      } else if (err.code === "auth/missing-password") {
        errorMessage = t('missingPassword');
      } else if (err.code === "auth/missing-email") {
        errorMessage = t('missingEmail');
      } else {
        errorMessage = t('missingFields');
      }
      
      dispatch(setError(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    dispatch(clearError());
    setIsLoading(true);

    try {
      console.log("Google ile giriş başlatılıyor...");
      const userCredential = await loginWithGoogle();
      console.log("Google giriş başarılı:", userCredential);
      const user = userCredential.user;

      if (user) {
        // Firestore'dan kullanıcı bilgilerini çek
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let displayName = user.displayName ?? "";

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          // İsim ve soyismi birleştir
          displayName = `${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim();
        }

        // Eğer kullanıcı Firestore'da yoksa, Google bilgileriyle oluştur
        if (!userDocSnap.exists()) {
          const firstName = user.displayName?.split(" ")[0] || "";
          const lastName = user.displayName?.split(" ").slice(1).join(" ") || "";
          
          await setDoc(doc(db, "users", user.uid), {
            firstName,
            lastName,
            username: user.displayName || user.email?.split("@")[0] || "",
            email: user.email,
            createdAt: new Date(),
          });
          
          displayName = user.displayName || user.email?.split("@")[0] || "";
        }

        dispatch(setUser({
          uid: user.uid,
          email: user.email ?? "",
          displayName: displayName || user.email?.split("@")[0],
        }));

        navigate("/homepage");
      } else {
        dispatch(setError("Kullanıcı bilgisi alınamadı."));
      }
    } catch (err: any) {
      console.error("Google giriş hatası:", err);
      console.error("Hata kodu:", err.code);
      console.error("Hata mesajı:", err.message);
      
      let errorMessage = "Google ile giriş başarısız: " + err.message;
      
      // Firebase hata kodlarını çevir
      if (err.code === "auth/popup-closed-by-user") {
        errorMessage = "Google giriş penceresi kapatıldı.";
      } else if (err.code === "auth/popup-blocked") {
        errorMessage = "Google giriş penceresi engellendi. Lütfen popup engelleyiciyi kapatın.";
      } else if (err.code === "auth/cancelled-popup-request") {
        errorMessage = "Google giriş işlemi iptal edildi.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.";
      }
      
      dispatch(setError(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  // Dropdown dışına tıklandığında kapatma
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-dropdown')) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "20px"
        }}>
          <h2 style={{ margin: 0 }}>{t('login')}</h2>
          
          {/* Dil Seçimi - Dünya Logosu */}
          <div className="language-dropdown" style={{ position: "relative" }}>
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "50%",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.1)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              🌐
            </button>
            
            {showLanguageDropdown && (
              <div style={{
                position: "absolute",
                top: "100%",
                right: 0,
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                minWidth: "120px",
                zIndex: 1001
              }}>
                <button
                  onClick={() => {
                    i18n.changeLanguage('tr');
                    setShowLanguageDropdown(false);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "12px 16px",
                    border: "none",
                    backgroundColor: i18n.language === 'tr' ? "#007bff" : "transparent",
                    color: i18n.language === 'tr' ? "white" : "#333",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "14px",
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px"
                  }}
                  onMouseEnter={(e) => {
                    if (i18n.language !== 'tr') {
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (i18n.language !== 'tr') {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  🇹🇷 Türkçe
                </button>
                <button
                  onClick={() => {
                    i18n.changeLanguage('en');
                    setShowLanguageDropdown(false);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "12px 16px",
                    border: "none",
                    backgroundColor: i18n.language === 'en' ? "#007bff" : "transparent",
                    color: i18n.language === 'en' ? "white" : "#333",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "14px",
                    borderBottomLeftRadius: "8px",
                    borderBottomRightRadius: "8px",
                    borderTop: "1px solid #eee"
                  }}
                  onMouseEnter={(e) => {
                    if (i18n.language !== 'en') {
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (i18n.language !== 'en') {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  🇺🇸 English
                </button>
              </div>
            )}
          </div>
        </div>
        
        {error && <p className="error-text">{error}</p>}
        
        <div className="form-group">
          <label>{t('email')}:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={t('emailPlaceholder')}
            disabled={isLoading}
            title={t('pleaseFillField')}
            onInvalid={e => (e.target as HTMLInputElement).setCustomValidity(t('pleaseFillField'))}
            onInput={e => (e.target as HTMLInputElement).setCustomValidity('')}
          />
        </div>
        <div className="form-group">
          <label>{t('password')}:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder={t('passwordPlaceholder')}
            disabled={isLoading}
            title={t('pleaseFillField')}
            onInvalid={e => (e.target as HTMLInputElement).setCustomValidity(t('pleaseFillField'))}
            onInput={e => (e.target as HTMLInputElement).setCustomValidity('')}
          />
        </div>
        <button 
          type="submit" 
          className="login-btn"
          disabled={isLoading}
        >
          {isLoading ? t('loading') : t('loginButton')}
        </button>
        
        <button
          type="button"
          className="register-btn"
          onClick={handleRegisterClick}
          disabled={isLoading}
        >
          {t('registerButton')}
        </button>
        
        {/* Google ile Giriş Butonu */}
        <button
          type="button"
          className="google-login-btn"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#fff",
            color: "#333",
            border: "2px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginTop: "10px",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f8f9fa";
            e.currentTarget.style.borderColor = "#007bff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#fff";
            e.currentTarget.style.borderColor = "#ddd";
          }}
        >
          <img 
            src="https://developers.google.com/identity/images/g-logo.png" 
            alt="Google" 
            style={{ width: "18px", height: "18px" }}
          />
          Google ile Giriş Yap
        </button>
      </form>
    </div>
  );
};

export default Login;
