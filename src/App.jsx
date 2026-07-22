import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setPathname(path);
  };

  if (pathname === '/admin' || pathname === '/admin/') {
    return <AdminPanel onBack={() => navigateTo('/')} />;
  }

  return <LandingPage />;
}
