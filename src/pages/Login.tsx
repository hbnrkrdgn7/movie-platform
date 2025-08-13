import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { setUser, setError, clearError } from "../features/auth/authSlice";
import { RootState } from "../app/store";
import { api } from "../api/client";
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
      // Email/şifre ile giriş yaparken kendi backend endpoint'ini kullan
      console.log("Email/şifre ile giriş başlatılıyor...");
      
      // Backend'den email/şifre ile JWT token al
      const authResponse = await api.post("/auth/login", {
        email: email,
        password: password
      });

      // JWT token'ı localStorage'a kaydet
      localStorage.setItem("token", authResponse.data.token);
      
      // Kullanıcı bilgilerini Redux store'a kaydet
      dispatch(setUser({
        uid: authResponse.data.user.id.toString(), // PostgreSQL ID'yi string olarak kullan
        email: authResponse.data.user.email,
        displayName: authResponse.data.user.first_name + " " + authResponse.data.user.last_name,
      }));

      navigate("/homepage");
    } catch (err: any) {
      console.error("Giriş hatası:", err);
      
      let errorMessage = "Giriş başarısız.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
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
        
      </form>
    </div>
  );
};

export default Login;
