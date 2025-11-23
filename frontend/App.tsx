
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Auth } from './pages/Auth';
import { StockDetail } from './pages/StockDetail';
import { Markets } from './pages/Markets';
import { Portfolio } from './pages/Portfolio';
import { Settings } from './pages/Settings';
import { History } from './pages/History';
import { Social } from './pages/Social';
import { AdminDashboard } from './pages/AdminDashboard';
import { RiskAssessment } from './pages/RiskAssessment';
import { ThemeProvider } from './contexts/ThemeContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Layout><Auth /></Layout>} />
          <Route path="/register" element={<Layout><Auth /></Layout>} />
          
          {/* User Routes */}
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/stock/:id" element={<Layout><StockDetail /></Layout>} />
          <Route path="/markets" element={<Layout><Markets /></Layout>} />
          <Route path="/portfolio" element={<Layout><Portfolio /></Layout>} />
          <Route path="/portfolio/risk" element={<Layout><RiskAssessment /></Layout>} />
          <Route path="/social" element={<Layout><Social /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />
          <Route path="/history" element={<Layout><History /></Layout>} />
          
          {/* Admin Route */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
