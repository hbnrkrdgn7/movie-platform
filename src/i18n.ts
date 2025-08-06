import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Çeviri dosyaları
const resources = {
  tr: {
    translation: {
      // Genel
      welcome: 'HOŞ GELDİNİZ!',
      loading: 'Yükleniyor...',
      back: 'Geri Dön',
      save: 'Kaydet',
      cancel: 'İptal',
      edit: 'Düzenle',
      delete: 'Sil',
      search: 'Ara',
      
      // Navigasyon
      home: 'Anasayfa',
      movies: 'Filmler',
      series: 'Diziler',
      popular: 'Popüler',
      favorites: 'Favoriler',
      settings: 'Ayarlar',
      logout: 'Çıkış Yap',
      
      // Giriş/Kayıt
      login: 'Giriş Yap',
      register: 'Kayıt Ol',
      email: 'Email',
      password: 'Şifre',
      confirmPassword: 'Şifre Tekrarı',
      firstName: 'İsim',
      lastName: 'Soyisim',
      username: 'Kullanıcı Adı',
      oldPassword: 'Eski Şifre',
      newPassword: 'Yeni Şifre',
      newPasswordConfirm: 'Yeni Şifre (Tekrar)',
      
      // Form placeholder'ları
      emailPlaceholder: 'Email adresinizi girin',
      passwordPlaceholder: 'Şifrenizi girin',
      confirmPasswordPlaceholder: 'Şifrenizi tekrar girin',
      firstNamePlaceholder: 'İsminizi girin',
      lastNamePlaceholder: 'Soyisminizi girin',
      usernamePlaceholder: 'Kullanıcı adınızı girin',
      oldPasswordPlaceholder: 'Eski şifrenizi girin',
      newPasswordPlaceholder: 'Yeni şifrenizi girin',
      newPasswordConfirmPlaceholder: 'Yeni şifreyi tekrar girin',
      searchPlaceholder: 'Dizi veya film ara...',
      
      // Form açıklamaları
      firstNameDescription: 'Adınızı girin',
      lastNameDescription: 'Soyadınızı girin',
      usernameDescription: 'Benzersiz bir kullanıcı adı seçin',
      emailDescription: 'Geçerli bir email adresi girin',
      passwordDescription: 'En az 6 karakterli güçlü bir şifre oluşturun',
      
      // Hata mesajları
      emailNotFound: 'Bu email adresi bulunamadı. Kayıtlı değilseniz lütfen önce kayıt olun.',
      wrongPassword: 'Hatalı şifre. Lütfen şifrenizi tekrar deneyin.',
      invalidEmail: 'Geçersiz email adresi.',
      weakPassword: 'Şifre çok zayıf. En az 6 karakter kullanın.',
      emailInUse: 'Bu email adresi zaten kullanımda.',
      usernameInUse: 'Bu kullanıcı adı zaten kullanılmakta. Lütfen farklı bir kullanıcı adı seçin.',
      passwordMismatch: 'Yeni şifre ve şifre tekrarı eşleşmiyor.',
      samePassword: 'Yeni şifre eski şifre ile aynı olamaz.',
      emptyUsername: 'Kullanıcı adı boş olamaz.',
      userNotFound: 'Kullanıcı bulunamadı.',
      networkError: 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.',
      tooManyRequests: 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.',
      userDisabled: 'Bu kullanıcı hesabı devre dışı bırakılmış.',
      invalidCredentials: 'Email adresi veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.',
      missingPassword: 'Lütfen şifre alanını doldurun.',
      missingEmail: 'Lütfen email alanını doldurun.',
      missingFields: 'Lütfen tüm alanları doldurun.',
      
      // Başarı mesajları
      registrationSuccess: 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.',
      loginSuccess: 'Giriş başarılı!',
      passwordUpdateSuccess: 'Şifre başarıyla güncellendi.',
      usernameUpdateSuccess: 'Kullanıcı adı başarıyla güncellendi.',
      logoutSuccess: 'Çıkış yapıldı.',
      registrationError: 'Kayıt sırasında bir hata oluştu: {{error}}',
      
      // Form validasyon mesajları
      pleaseFillField: 'Lütfen bu alanı doldurun.',
      
      // İçerik mesajları
      noContent: 'Gösterilecek içerik yok.',
      emptyFavorites: 'Favoriler listeniz boş.',
      noPoster: 'Resim yok',
      releaseDate: 'Çıkış Tarihi',
      unknown: 'Bilinmiyor',
      noTitle: 'Başlıksız',
      
      // Ayarlar
      userInfo: 'Kullanıcı Bilgileri',
      passwordUpdate: 'Şifre Güncelleme',
      languageSelection: 'Dil Seçimi',
      currentLanguage: 'Mevcut Dil',
      updatePassword: 'Şifreyi Güncelle',
      editUsername: 'Kullanıcı adını düzenle',
      languageChangeInfo: 'Dil değişikliği anında uygulanır ve tüm sayfalarda geçerli olur.',
      
      // Butonlar
      loginButton: 'Giriş Yap',
      registerButton: 'Kayıt Ol',
      updateButton: 'Güncelle',
      saveButton: 'Kaydet',
      cancelButton: 'İptal',
      editButton: 'Düzenle',
      deleteButton: 'Sil',
      addToFavorites: '🤍 Favorilere Ekle',
      removeFromFavorites: '❤️ Favoriden Çıkar',
      
      // Etiketler
      searchLabel: 'Ne aramıştınız?',
      nameLabel: 'İsim:',
      lastNameLabel: 'Soyisim:',
      usernameLabel: 'Kullanıcı Adı:',
      emailLabel: 'Email:',
      oldPasswordLabel: 'Eski Şifre:',
      newPasswordLabel: 'Yeni Şifre:',
      newPasswordConfirmLabel: 'Yeni Şifre (Tekrar):',
      
      // Google Hesabı
      googleAccountLogin: 'Google Hesabı ile Giriş',
      googlePasswordChangeDisabled: 'Google hesabınızla giriş yaptığınız için şifre değiştirme özelliği kullanılamamaktadır. Şifrenizi değiştirmek için Google hesabınızın ayarlarından şifre değişikliği yapabilirsiniz.',
      googlePasswordFormDisabled: 'Google hesabınızla giriş yaptığınız için şifre değiştirme formu devre dışıdır.',
      googleLoginButton: 'Google ile Giriş Yap',
    }
  },
  en: {
    translation: {
      // General
      welcome: 'WELCOME',
      loading: 'Loading...',
      back: 'Back',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      search: 'Search',
      
      // Navigation
      home: 'Home',
      movies: 'Movies',
      series: 'Series',
      popular: 'Popular',
      favorites: 'Favorites',
      settings: 'Settings',
      logout: 'Logout',
      
      // Login/Register
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      username: 'Username',
      oldPassword: 'Old Password',
      newPassword: 'New Password',
      newPasswordConfirm: 'New Password (Confirm)',
      
      // Form placeholders
      emailPlaceholder: 'Enter your email',
      passwordPlaceholder: 'Enter your password',
      confirmPasswordPlaceholder: 'Confirm your password',
      firstNamePlaceholder: 'Enter your first name',
      lastNamePlaceholder: 'Enter your last name',
      usernamePlaceholder: 'Enter your username',
      oldPasswordPlaceholder: 'Enter your old password',
      newPasswordPlaceholder: 'Enter your new password',
      newPasswordConfirmPlaceholder: 'Confirm your new password',
      searchPlaceholder: 'Search for movies or series...',
      
      // Form descriptions
      firstNameDescription: 'Enter your first name',
      lastNameDescription: 'Enter your last name',
      usernameDescription: 'Choose a unique username',
      emailDescription: 'Enter a valid email address',
      passwordDescription: 'Create a strong password with at least 6 characters',
      
      // Error messages
      emailNotFound: 'Email address not found. Please register first if you are not registered.',
      wrongPassword: 'Wrong password. Please try again.',
      invalidEmail: 'Invalid email address.',
      weakPassword: 'Password is too weak. Use at least 6 characters.',
      emailInUse: 'This email address is already in use.',
      usernameInUse: 'This username is already in use. Please choose a different username.',
      passwordMismatch: 'New password and confirmation do not match.',
      samePassword: 'New password cannot be the same as the old password.',
      emptyUsername: 'Username cannot be empty.',
      userNotFound: 'User not found.',
      networkError: 'Network connection error. Please check your internet connection.',
      tooManyRequests: 'Too many failed login attempts. Please try again later.',
      userDisabled: 'This user account has been disabled.',
      invalidCredentials: 'Email address or password is incorrect. Please check your credentials.',
      missingPassword: 'Please fill in the password field.',
      missingEmail: 'Please fill in the email field.',
      missingFields: 'Please fill in all fields.',
      registrationError: 'An error occurred during registration: {{error}}',
      
      // Success messages
      registrationSuccess: 'Registration successful! You can now login.',
      loginSuccess: 'Login successful!',
      passwordUpdateSuccess: 'Password updated successfully.',
      usernameUpdateSuccess: 'Username updated successfully.',
      logoutSuccess: 'Logged out successfully.',
      
      // Form validation messages
      pleaseFillField: 'Please fill in this field.',
      
      // Content messages
      noContent: 'No content to display.',
      emptyFavorites: 'Your favorites list is empty.',
      noPoster: 'No Image',
      releaseDate: 'Release Date',
      unknown: 'Unknown',
      noTitle: 'Untitled',
      
      // Settings
      userInfo: 'User Information',
      passwordUpdate: 'Password Update',
      languageSelection: 'Language Selection',
      currentLanguage: 'Current Language',
      updatePassword: 'Update Password',
      editUsername: 'Edit username',
      languageChangeInfo: 'Language change is applied immediately and is valid on all pages.',
      
      // Buttons
      loginButton: 'Login',
      registerButton: 'Register',
      updateButton: 'Update',
      saveButton: 'Save',
      cancelButton: 'Cancel',
      editButton: 'Edit',
      deleteButton: 'Delete',
      addToFavorites: '🤍 Add to Favorites',
      removeFromFavorites: '❤️ Remove from Favorites',
      
      // Labels
      searchLabel: 'What are you looking for?',
      nameLabel: 'Name:',
      lastNameLabel: 'Last Name:',
      usernameLabel: 'Username:',
      emailLabel: 'Email:',
      oldPasswordLabel: 'Old Password:',
      newPasswordLabel: 'New Password:',
      newPasswordConfirmLabel: 'New Password (Confirm):',
      
      // Google Account
      googleAccountLogin: 'Login with Google Account',
      googlePasswordChangeDisabled: 'Password change feature is not available because you logged in with your Google account. You can change your password from your Google account settings.',
      googlePasswordFormDisabled: 'Password change form is disabled because you logged in with your Google account.',
      googleLoginButton: 'Login with Google',
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'tr',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n; 