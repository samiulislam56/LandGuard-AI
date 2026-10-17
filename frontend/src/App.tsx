import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';

// Eagerly loaded public and core pages
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';

// Lazy-loaded heavy pages for performance and code splitting (SECTION 13)
const SearchPage = lazy(() => import('./pages/SearchPage').then(m => ({ default: m.SearchPage })));
const KhasraMapPage = lazy(() => import('./pages/KhasraMapPage').then(m => ({ default: m.KhasraMapPage })));
const RMDPage = lazy(() => import('./pages/RMDPage').then(m => ({ default: m.RMDPage })));
const HelpGlossaryPage = lazy(() => import('./pages/HelpGlossaryPage').then(m => ({ default: m.HelpGlossaryPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage').then(m => ({ default: m.TransactionsPage })));
const TransactionDetailPage = lazy(() => import('./pages/TransactionDetailPage').then(m => ({ default: m.TransactionDetailPage })));
const ParcelHistoryPage = lazy(() => import('./pages/ParcelHistoryPage').then(m => ({ default: m.ParcelHistoryPage })));
const AssessmentPage = lazy(() => import('./pages/AssessmentPage').then(m => ({ default: m.AssessmentPage })));
const ReviewQueuePage = lazy(() => import('./pages/ReviewQueuePage').then(m => ({ default: m.ReviewQueuePage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const Explorer3DPage = lazy(() => import('./pages/Explorer3DPage').then(m => ({ default: m.Explorer3DPage })));

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

// Accessible Loading Fallback for Suspense
const PageLoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
    <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
    <p className="text-xs font-semibold text-slate-500 dark:text-emerald-400">
      লোড হচ্ছে... (Loading module...)
    </p>
  </div>
);

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* =================================================================== */}
            {/* 1. CANONICAL PUBLIC LANDING PAGE (Inspired by Reference Image 1)   */}
            {/* =================================================================== */}
            <Route path="/" element={<LandingPage />} />

            {/* =================================================================== */}
            {/* 2. AUTHENTICATION PAGES (Matching Reference Image 2, 3 & 4)        */}
            {/* =================================================================== */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<LoginPage />} />
            <Route path="/signup" element={<Navigate to="/register" replace />} />
            <Route path="/welcome" element={<Navigate to="/login" replace />} />

            {/* =================================================================== */}
            {/* 3. UNIFIED MAIN APPLICATION LAYOUT (Retaining Screenshot 5 Features) */}
            {/* =================================================================== */}
            <Route element={<Layout />}>
              {/* Core Main Hub */}
              <Route path="/home" element={<HomePage />} />

              {/* Functional LandTech Modules with Suspense Code Splitting */}
              <Route
                path="/search"
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <SearchPage />
                  </Suspense>
                }
              />
              <Route
                path="/map"
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <KhasraMapPage />
                  </Suspense>
                }
              />
              <Route
                path="/khasra-map"
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <KhasraMapPage />
                  </Suspense>
                }
              />
              <Route
                path="/rmd"
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <RMDPage />
                  </Suspense>
                }
              />
              <Route
                path="/3d"
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <Explorer3DPage />
                  </Suspense>
                }
              />
              <Route
                path="/explorer-3d"
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <Explorer3DPage />
                  </Suspense>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <DashboardPage />
                  </Suspense>
                }
              />
              <Route
                path="/transactions"
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <TransactionsPage />
                  </Suspense>
                }
              />
              <Route
                path="/transactions/:id"
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <TransactionDetailPage />
                  </Suspense>
                }
              />
              <Route
                path="/parcels/:id"
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <ParcelHistoryPage />
                  </Suspense>
                }
              />
              <Route
                path="/parcels/:id/history"
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <ParcelHistoryPage />
                  </Suspense>
                }
              />
              <Route
                path="/assess/:id"
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <AssessmentPage />
                  </Suspense>
                }
              />
              <Route
                path="/reviews"
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <ReviewQueuePage />
                  </Suspense>
                }
              />
              <Route
                path="/review-cases"
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <ReviewQueuePage />
                  </Suspense>
                }
              />
              <Route
                path="/reports"
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <ReportsPage />
                  </Suspense>
                }
              />
              <Route
                path="/settings"
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <SettingsPage />
                  </Suspense>
                }
              />
              <Route
                path="/admin"
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <ReviewQueuePage />
                  </Suspense>
                }
              />
              <Route
                path="/help"
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <HelpGlossaryPage />
                  </Suspense>
                }
              />

              {/* Catch-all redirect to /home */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
