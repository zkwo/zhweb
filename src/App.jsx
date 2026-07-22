import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  return (
    <>
      {currentPage === 'landing' ? (
        <LandingPage onOpenAdmin={() => setCurrentPage('admin')} />
      ) : (
        <AdminPanel onBack={() => setCurrentPage('landing')} />
      )}
    </>
  );
}
