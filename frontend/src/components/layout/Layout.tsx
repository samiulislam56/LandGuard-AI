import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DisclaimerBanner } from '../ui/DisclaimerBanner';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileDrawer } from './MobileDrawer';
import { MagnificationDock } from './MagnificationDock';

export const Layout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-atlas-app text-atlas-textPrimary font-sans selection:bg-atlas-cyan selection:text-slate-950 transition-colors">
      {/* Top Accessible Disclaimer */}
      <DisclaimerBanner />

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

          <main className="flex-1 overflow-y-auto cadastral-grid p-3 sm:p-4 lg:p-5">
            <div className="w-full mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

