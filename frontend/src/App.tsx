import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';

import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { KhasraMapPage } from './pages/KhasraMapPage';
import { RMDPage } from './pages/RMDPage';
import { HelpGlossaryPage } from './pages/HelpGlossaryPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { TransactionDetailPage } from './pages/TransactionDetailPage';
import { ParcelHistoryPage } from './pages/ParcelHistoryPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Explorer3DPage } from './pages/Explorer3DPage';
import { LoginPage } from './pages/LoginPage';

// Configure TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

const RootHandler: React.FC = () => {
  const hasEntered = typeof window !== 'undefined' && localStorage.getItem('landguard_has_entered') === 'true';
  if (!hasEntered) {
    return <Navigate to="/welcome" replace />;
  }
  return <HomePage />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Standalone Full-Screen Login & Onboarding (Matching user screenshot) */}
            <Route path="/welcome" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<LoginPage />} />

            {/* Main Application with Greenfield Layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<RootHandler />} />
              <Route path="home" element={<HomePage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="khasra-map" element={<KhasraMapPage />} />
              <Route path="rmd" element={<RMDPage />} />
              <Route path="help" element={<HelpGlossaryPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="explorer-3d" element={<Explorer3DPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="transactions/:id" element={<TransactionDetailPage />} />
              <Route path="parcels/:id" element={<ParcelHistoryPage />} />
              <Route path="parcels/:id/history" element={<ParcelHistoryPage />} />
              <Route path="assess/:id" element={<AssessmentPage />} />
              <Route path="reviews" element={<ReviewQueuePage />} />
              <Route path="review-cases" element={<ReviewQueuePage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
