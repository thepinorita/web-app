import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

import NameEntry from './components/NameEntry';
import Calendar from './components/Calendar';

const App: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'de'>('en');

  useEffect(() => {
    const savedUser = localStorage.getItem('shift_user');
    if (savedUser) setUserName(savedUser);
    const savedLang = localStorage.getItem('shift_lang') as 'en' | 'de';
    if (savedLang) setLang(savedLang);
  }, []);

  const handleLogin = (name: string) => {
    setUserName(name);
    localStorage.setItem('shift_user', name);
  };

  const handleLogout = () => {
    setUserName(null);
    localStorage.removeItem('shift_user');
  };

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'de' : 'en';
    setLang(newLang);
    localStorage.setItem('shift_lang', newLang);
  };

  if (!userName) return <NameEntry onEnter={handleLogin} />;

  const translations = {
    en: { logout: 'Logout', langBtn: 'Deutsch' },
    de: { logout: 'Abmelden', langBtn: 'English' }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="bottom-right" />
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-xl text-blue-600">TeamShift</span>
          <button onClick={toggleLang} className="text-xs bg-gray-100 px-2 py-1 rounded border hover:bg-gray-200 transition">
            {translations[lang].langBtn}
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 font-medium">{userName}</span>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition">
            {translations[lang].logout}
          </button>
        </div>
      </nav>
      <Calendar userName={userName} lang={lang} setLang={setLang} />
    </div>
  );
};

export default App;
