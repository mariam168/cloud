import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import {Link} from "react-router-dom";

const TopBar = () => {
  const { t, toggleLanguage } = useLanguage();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [dark]);

  return (
    <div className="bg-slate-900 text-white text-xs dark:bg-gray-800 py-4">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span>{t.currency}</span>
          <button onClick={toggleLanguage}>{t.language} </button>
        </div>
        <div className="flex gap-5 items-center">
          <a href="/" className="hover:text-gray-300">{t.home}</a>
          <Link to="/shop" className="hover:text-gray-300">{t.shop}</Link>
         <a href="/about" className="hover:text-gray-300">{t.aboutUs}</a>
          <a href="/contact" className="hover:text-gray-300">{t.contactUs}</a>
          <a href="/dashboard" className="hover:text-gray-300">{t.dashboard}</a>
        </div>


        <div className="flex items-center gap-2">
          <span className="text-gray-400 px-2">{t.helloGuest}</span>
          <a href="#" className="hover:text-gray-300">{t.signIn}</a>
          <span className="text-gray-400">|</span>
          <a href="#" className="hover:text-gray-300">{t.register}</a>
          <button
            className="px-3 py-1 rounded bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 text-white"
            onClick={() => setDark(!dark)}
          >
            {dark ? `☀️ ${t.light}` : `🌙 ${t.dark}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;