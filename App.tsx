
import React, { lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { QueryClientProvider } from '@tanstack/react-query';
import { GlobalStyle } from './src/styles/GlobalStyle';
import { theme } from './src/styles/theme';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ToastProvider } from './src/contexts/ToastContext';
import LazyLoad from './src/components/ui/LazyLoad';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { queryClient } from './src/lib/queryClient';

// Lazy loading das páginas para melhor performance
const BookingPage = lazy(() => import('./src/pages/BookingPage'));

// Platform Pages (Para você - administrador da plataforma)
const PlatformLayout = lazy(() => import('./src/pages/PlatformLayout'));
const PlatformDashboardPage = lazy(() => import('./src/pages/PlatformDashboardPage'));
const PlatformBarbershopsPage = lazy(() => import('./src/pages/PlatformBarbershopsPage'));
const PlatformAnalyticsPage = lazy(() => import('./src/pages/PlatformAnalyticsPage'));
const PlatformSupportPage = lazy(() => import('./src/pages/PlatformSupportPage'));
const PlatformSettingsPage = lazy(() => import('./src/pages/PlatformSettingsPage'));

// Barbershop Pages (Para cada barbearia)
const DashboardLayout = lazy(() => import('./src/pages/DashboardLayout'));
const DashboardPage = lazy(() => import('./src/pages/DashboardPage'));
const SchedulePage = lazy(() => import('./src/pages/SchedulePage'));
const ClientsPage = lazy(() => import('./src/pages/ClientsPage'));
const ServicesPage = lazy(() => import('./src/pages/ServicesPage'));
const ProfessionalsPage = lazy(() => import('./src/pages/ProfessionalsPage'));
const SettingsPage = lazy(() => import('./src/pages/SettingsPage'));

// Auth & Public Pages
const LoginPage = lazy(() => import('./src/pages/LoginPage'));
const BarbershopRegistrationPage = lazy(() => import('./src/pages/BarbershopRegistrationPage'));
const LandingPage = lazy(() => import('./src/pages/LandingPage'));
const PricingPage = lazy(() => import('./src/pages/PricingPage'));

// Protected Route Components
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

const PlatformAdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Verificar se é platform admin
  const isPlatformAdmin = user.role === 'platform_admin';

  if (!isPlatformAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ThemeProvider theme={theme}>
            <GlobalStyle />
            <HashRouter>
              <AuthProvider>
                <LazyLoad>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<BarbershopRegistrationPage />} />
                    <Route path="/book/:barbershopSlug" element={<BookingPage />} />

                    {/* Platform Admin Routes (SEU dashboard para gerenciar todas as barbearias) */}
                    <Route
                      path="/platform"
                      element={
                        <PlatformAdminRoute>
                          <PlatformLayout />
                        </PlatformAdminRoute>
                      }
                    >
                      <Route index element={<Navigate to="overview" replace />} />
                      <Route path="overview" element={<PlatformDashboardPage />} />
                      <Route path="barbershops" element={<PlatformBarbershopsPage />} />
                      <Route path="analytics" element={<PlatformAnalyticsPage />} />
                      <Route path="support" element={<PlatformSupportPage />} />
                      <Route path="settings" element={<PlatformSettingsPage />} />
                    </Route>

                    {/* Barbershop Dashboard Routes (Para cada barbearia individual) */}
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
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
