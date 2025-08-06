import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      display: 'flex',
      gap: '10px'
    }}>
      <button
        onClick={() => changeLanguage('tr')}
        style={{
          padding: '8px 12px',
          backgroundColor: i18n.language === 'tr' ? '#007bff' : '#f8f9fa',
          color: i18n.language === 'tr' ? 'white' : '#333',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        🇹🇷 TR
      </button>
      <button
        onClick={() => changeLanguage('en')}
        style={{
          padding: '8px 12px',
          backgroundColor: i18n.language === 'en' ? '#007bff' : '#f8f9fa',
          color: i18n.language === 'en' ? 'white' : '#333',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        🇺🇸 EN
      </button>
    </div>
  );
};

export default LanguageSwitcher; 