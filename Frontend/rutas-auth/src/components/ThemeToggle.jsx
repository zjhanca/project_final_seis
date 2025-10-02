// src/components/ThemeToggle.jsx
import { useState, useEffect } from 'react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className="theme-toggle-container">
      <button className="theme-toggle" onClick={toggleTheme}>
        <div className="theme-toggle-icon">
          <span className="sun">☀️</span>
          <span className="moon">🌙</span>
        </div>
      </button>
    </div>
  );
};

export default ThemeToggle;