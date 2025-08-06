import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { updatePassword,reauthenticateWithCredential,EmailAuthProvider,signOut,} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import "../style/Settings.css";
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { setError, clearError } from '../features/auth/authSlice';
import { useTranslation } from 'react-i18next';

const Settings: React.FC = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
  }>({});
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [secretInput, setSecretInput] = useState("");
  const [showLoveMessage, setShowLoveMessage] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const reduxUser = useAppSelector(state => state.auth.user);
  
  // Hangi bölümün gösterileceğini belirle
  const [activeSection, setActiveSection] = useState(() => {
    const section = location.state?.section;
    return section || "userInfo"; // Varsayılan olarak kullanıcı bilgileri
  });

  const { t, i18n } = useTranslation();

  // Google hesabı kontrolü
  const isGoogleAccount = () => {
    const user = auth.currentUser;
    return user && user.providerData.some(provider => provider.providerId === 'google.com');
  };

  // Bölüm değiştiğinde mesajları temizle
  useEffect(() => {
    setMessage("");
    setIsError(false);
  }, [activeSection]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.log("Kullanıcı giriş yapmamış");
        return;
      }

      console.log("Kullanıcı bilgileri çekiliyor...");
      console.log("User UID:", user.uid);
      console.log("Redux User:", reduxUser);

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Firestore'dan gelen veri:", data);
          setUserInfo(data as typeof userInfo);
        } else {
          console.log("Firestore'da kullanıcı bilgisi bulunamadı");
        }
      } catch (error) {
        console.error("Kullanıcı bilgisi alınırken hata:", error);
      }
    };

    fetchUserInfo();
  }, [reduxUser]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mesaj ve hataları sıfırla
    dispatch(clearError());
    setMessage("");

    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage(t('passwordMismatch'));
      return;
    }

    if (oldPassword === newPassword) {
      setIsError(true);
      setMessage(t('samePassword'));
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      setIsError(true);
      setMessage(t('userNotFound'));
      return;
    }

    try {
      // Kullanıcıyı eski şifre ile yeniden doğrula
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);

      // Şifreyi güncelle
      await updatePassword(user, newPassword);

      setIsError(false);
      setMessage(t('passwordUpdateSuccess'));
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setIsError(true);
      setMessage("Şifre güncelleme başarısız: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Çıkış yapılırken hata:", error);
    }
  };

  // Kullanıcı adı düzenleme fonksiyonu
  const handleUsernameEdit = () => {
    setIsEditingUsername(true);
    setNewUsername(userInfo.username || "");
  };

  // Kullanıcı adı kontrolü
  const checkUsernameExists = async (username: string, currentUserId: string) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      
      // Mevcut kullanıcının kendi kullanıcı adını değiştirmesine izin ver
      const existingUser = querySnapshot.docs.find(doc => doc.id !== currentUserId);
      return !!existingUser;
    } catch (error) {
      console.error("Kullanıcı adı kontrolü hatası:", error);
      return false;
    }
  };

  const handleUsernameSave = async () => {
    if (!newUsername.trim()) {
      setMessage(t('emptyUsername'));
      setIsError(true);
      return;
    }

    // Kullanıcı adında değişiklik yapılmadıysa işlemi iptal et
    if (newUsername.trim() === userInfo.username) {
      setIsEditingUsername(false);
      setNewUsername("");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setMessage(t('userNotFound'));
      setIsError(true);
      return;
    }

    try {
      // Kullanıcı adı benzersizlik kontrolü
      const usernameExists = await checkUsernameExists(newUsername.trim(), user.uid);
      if (usernameExists) {
        setMessage(t('usernameInUse'));
        setIsError(true);
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        username: newUsername.trim()
      });

      setUserInfo(prev => ({ ...prev, username: newUsername.trim() }));
      setIsEditingUsername(false);
      setMessage(t('usernameUpdateSuccess'));
      setIsError(false);
    } catch (error: any) {
      setMessage("Kullanıcı adı güncellenirken hata: " + error.message);
      setIsError(true);
    }
  };

  // Kullanıcı adı iptal etme fonksiyonu
  const handleUsernameCancel = () => {
    setIsEditingUsername(false);
    setNewUsername("");
  };

  return (
    <div className="settings-container">
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h2>{t('settings')}</h2>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500"
          }}
          title={t('logout')}
        >
          🚪 {t('logout')}
        </button>
      </div>

      {/* Bölüm seçim butonları */}
      <div style={{ 
        display: "flex", 
        gap: "10px", 
        marginBottom: "20px",
        borderBottom: "1px solid #eee",
        paddingBottom: "10px"
      }}>
        <button
          style={{
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            backgroundColor: activeSection === "userInfo" ? "#007bff" : "#f8f9fa",
            color: activeSection === "userInfo" ? "white" : "#333"
          }}
          onClick={() => setActiveSection("userInfo")}
        >
          👤 {t('userInfo')}
        </button>
        <button
          style={{
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            backgroundColor: activeSection === "password" ? "#007bff" : "#f8f9fa",
            color: activeSection === "password" ? "white" : "#333"
          }}
          onClick={() => setActiveSection("password")}
        >
          🔒 {t('passwordUpdate')}
        </button>
        <button
          style={{
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            backgroundColor: activeSection === "language" ? "#007bff" : "#f8f9fa",
            color: activeSection === "language" ? "white" : "#333"
          }}
          onClick={() => setActiveSection("language")}
        >
          🌐 {t('languageSelection')}
        </button>
      </div>

      {/* Kullanıcı Bilgileri Bölümü */}
      {activeSection === "userInfo" && (
        <>
          <div className="user-info-box">
            <h3>{t('userInfo')}</h3>
            <p><b>{t('nameLabel')}</b> {userInfo.firstName || reduxUser?.displayName?.split(" ")[0] || "-"}</p>
            <p><b>{t('lastNameLabel')}</b> {userInfo.lastName || reduxUser?.displayName?.split(" ")[1] || "-"}</p>
            
            {/* Kullanıcı Adı - Düzenlenebilir */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <p style={{ margin: 0 }}><b>{t('usernameLabel')}</b></p>
              {isEditingUsername ? (
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                     <input
                     type="text"
                     value={newUsername}
                     onChange={(e) => setNewUsername(e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                         e.preventDefault();
                         handleUsernameSave();
                       }
                     }}
                     style={{
                       padding: "4px 8px",
                       border: "1px solid #ccc",
                       borderRadius: "4px",
                       fontSize: "14px"
                     }}
                     placeholder={t('usernamePlaceholder')}
                   />
                  <button
                    onClick={handleUsernameSave}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    ✅
                  </button>
                  <button
                    onClick={handleUsernameCancel}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    ❌
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span>{userInfo.username || "-"}</span>
                  <button
                    onClick={handleUsernameEdit}
                    style={{
                      padding: "2px 4px",
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                    title={t('editUsername')}
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>
            
            <p><b>{t('emailLabel')}:</b> {userInfo.email || reduxUser?.email || auth.currentUser?.email || "-"}</p>
          </div>

          {/* Geri Dön Butonu */}
          <div style={{ marginTop: "20px" }}>
            <button
              type="button"
              className="back-btn"
              onClick={() => navigate("/homepage")}
            >
              {t('back')}
            </button>
          </div>
        </>
      )}

      {/* Şifre Güncelleme Bölümü */}
      {activeSection === "password" && (
        <>
          <h3 className="section-title">{t('passwordUpdate')}</h3>

                     {/* Google hesabı uyarısı */}
           {isGoogleAccount() && (
             <div style={{
               padding: "15px",
               backgroundColor: "#fff3cd",
               border: "1px solid #ffeaa7",
               borderRadius: "6px",
               marginBottom: "20px",
               color: "#856404"
             }}>
               <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                 <span style={{ fontSize: "18px" }}>⚠️</span>
                 <div>
                   <strong>{t('googleAccountLogin')}</strong>
                   <p style={{ margin: "5px 0 0 0", fontSize: "14px" }}>
                     {t('googlePasswordChangeDisabled')}
                   </p>
                 </div>
               </div>
             </div>
           )}

          {!isGoogleAccount() ? (
            <form className="password-form" onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>{t('oldPasswordLabel')}</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder={t('oldPasswordPlaceholder')}
                />
              </div>

              <div className="form-group">
                <label>{t('newPasswordLabel')}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder={t('newPasswordPlaceholder')}
                />
              </div>

              <div className="form-group">
                <label>{t('newPasswordConfirmLabel')}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder={t('newPasswordConfirmPlaceholder')}
                />
              </div>

              <div className="button-group">
                <button type="submit" className="save-btn">
                  {t('updatePassword')}
                </button>
                <button
                  type="button"
                  className="back-btn"
                  onClick={() => navigate("/homepage")}
                >
                  {t('back')}
                </button>
              </div>
            </form>
          ) : (
                         <div style={{
               padding: "20px",
               backgroundColor: "#f8f9fa",
               border: "1px solid #dee2e6",
               borderRadius: "6px",
               textAlign: "center",
               color: "#6c757d"
             }}>
               <p style={{ margin: "0 0 15px 0" }}>
                 {t('googlePasswordFormDisabled')}
               </p>
              <button
                type="button"
                className="back-btn"
                onClick={() => navigate("/homepage")}
              >
                {t('back')}
              </button>
            </div>
          )}
        </>
      )}

      {/* Dil Seçimi Bölümü */}
      {activeSection === "language" && (
        <>
          <h3 className="section-title">{t('languageSelection')}</h3>
          
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            maxWidth: "400px"
          }}>
            <div style={{
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              backgroundColor: "#f8f9fa"
            }}>
              <h4 style={{ margin: "0 0 15px 0", color: "#333" }}>{t('currentLanguage')}</h4>
              <p style={{ margin: "0", fontSize: "16px", fontWeight: "bold" }}>
                {i18n.language === 'tr' ? '🇹🇷 Türkçe' : '🇺🇸 English'}
              </p>
            </div>
            
            <div style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap"
            }}>
              <button
                onClick={() => i18n.changeLanguage('tr')}
                style={{
                  padding: "12px 20px",
                  border: "1px solid #007bff",
                  borderRadius: "6px",
                  backgroundColor: i18n.language === 'tr' ? "#007bff" : "white",
                  color: i18n.language === 'tr' ? "white" : "#007bff",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.3s"
                }}
                onMouseEnter={(e) => {
                  if (i18n.language !== 'tr') {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }
                }}
                onMouseLeave={(e) => {
                  if (i18n.language !== 'tr') {
                    e.currentTarget.style.backgroundColor = "white";
                  }
                }}
              >
                🇹🇷 Türkçe
              </button>
              
              <button
                onClick={() => i18n.changeLanguage('en')}
                style={{
                  padding: "12px 20px",
                  border: "1px solid #007bff",
                  borderRadius: "6px",
                  backgroundColor: i18n.language === 'en' ? "#007bff" : "white",
                  color: i18n.language === 'en' ? "white" : "#007bff",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.3s"
                }}
                onMouseEnter={(e) => {
                  if (i18n.language !== 'en') {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }
                }}
                onMouseLeave={(e) => {
                  if (i18n.language !== 'en') {
                    e.currentTarget.style.backgroundColor = "white";
                  }
                }}
              >
                🇺🇸 English
              </button>
            </div>
            
            <p style={{
              margin: "10px 0 0 0",
              fontSize: "14px",
              color: "#666",
              fontStyle: "italic"
            }}>
              {t('languageChangeInfo')}
            </p>
          </div>

          {/* Geri Dön Butonu */}
          <div style={{ marginTop: "20px" }}>
            <button
              type="button"
              className="back-btn"
              onClick={() => navigate("/homepage")}
            >
              {t('back')}
            </button>
          </div>
        </>
      )}

      {message && (
        <p className={isError ? "error-text" : "success-text"}>{message}</p>
      )}
    </div>
  );
};

export default Settings;
