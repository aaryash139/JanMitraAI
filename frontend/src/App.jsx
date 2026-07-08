import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CitizenPortal from './pages/CitizenPortal';
import MpLogin from './pages/MpLogin';
import MpDashboard from './pages/MpDashboard';
import LandingPage from './pages/LandingPage';
import { ThemeLangProvider } from './contexts/ThemeLangContext';
import { ErrorBoundary } from './ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ThemeLangProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/jan-sunwai" element={<CitizenPortal />} />
            <Route path="/mp/login" element={<MpLogin />} />
            <Route path="/mp/dashboard" element={<MpDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeLangProvider>
    </ErrorBoundary>
  );
}

export default App;
