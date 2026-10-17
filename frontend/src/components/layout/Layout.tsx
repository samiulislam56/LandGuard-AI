import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DisclaimerBanner } from '../ui/DisclaimerBanner';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileDrawer } from './MobileDrawer';
import { MagnificationDock } from './MagnificationDock';
import { AICopilotModal } from '../copilot/AICopilotModal';
import { MobileBottomNav } from './MobileBottomNav';
import { PWAInstallBanner } from '../pwa/PWAInstallBanner';

export const Layout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBF9] dark:bg-[#0B130E] text-slate-800 dark:text-slate-100 font-sans selection:bg-emerald-600 selection:text-white transition-colors">
      {/* Top Accessible Disclaimer */}
      <DisclaimerBanner />

      {/* Floating AI Copilot Assistant */}
      <AICopilotModal />

      {/* Main App Container */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        {/* Mobile Navigation Drawer */}
        <MobileDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Quick Magnification Dock when sidebar is collapsed */}
        {isSidebarCollapsed && <MagnificationDock />}

        {/* Content Viewport */}
        <div className={`flex-1 flex flex-col min-w-0 overflow-hidden ${isSidebarCollapsed ? 'lg:pl-2' : ''}`}>
          <Navbar
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            isSidebarCollapsed={isSidebarCollapsed}
          />

          <main className="flex-1 overflow-y-auto cadastral-grid p-3 sm:p-4 lg:p-5 pb-20 lg:pb-5">
            <div className="w-full mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* PWA Mobile App Installation Prompt */}
      <PWAInstallBanner />

      {/* Mobile Sticky Thumb Navigation */}
      <MobileBottomNav onOpenMenu={() => setIsMobileMenuOpen(true)} />
    </div>
  );
};

