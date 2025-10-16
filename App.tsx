
import React, { lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme } from './styles/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LazyLoad from './components/ui/LazyLoad';

// Lazy loading das páginas para melhor performance
const BookingPage = lazy(() => import('./pages/BookingPage'));
const DashboardLayout = lazy(() => import('./pages/DashboardLayout'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SchedulePage = lazy(() => import('./pages/SchedulePage'));
const ClientsPage = lazy(() => import('./pages/ClientsPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ProfessionalsPage = lazy(() => import('./pages/ProfessionalsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const BarbershopRegistrationPage = lazy(() => import('./pages/BarbershopRegistrationPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <HashRouter>
        <AuthProvider>
          <LazyLoad>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<BarbershopRegistrationPage />} />
              <Route path="/book/:barbershopSlug" element={<BookingPage />} />
              
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="overview" replace />} />
                <Route path="overview" element={<DashboardPage />} />
                <Route path="schedule" element={<SchedulePage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="services" element={<AdminRoute><ServicesPage /></AdminRoute>} />
                <Route path="professionals" element={<AdminRoute><ProfessionalsPage /></AdminRoute>} />
                <Route path="settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
              </Route>
            </Routes>
          </LazyLoad>
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { user } = useAuth();
    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard/schedule" />;
    }
    return children;
};


export default App;
