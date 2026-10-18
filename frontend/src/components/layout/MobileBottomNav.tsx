import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Search, 
  Compass, 
  ShieldCheck, 
  Menu
} from 'lucide-react';

interface Props {
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<Props> = ({ onOpenMenu }) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const navItems = [
    {
      to: '/home',
      label_bn: 'হোম',
      label_en: 'Home',
      icon: Home
    },
    {
      to: '/search',
      label_bn: 'জমি খুঁজুন',
      label_en: 'Search',
      icon: Search
    },
    {
      to: '/khasra-map',
      label_bn: 'খসড়া ম্যাপ',
      label_en: 'Khasra',
      icon: Compass
    },
    {
      to: '/assess/TX-002911-2',
      label_bn: 'যাচাই',
      label_en: 'Audit',
      icon: ShieldCheck
    }
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#062B22]/95 backdrop-blur-lg border-t border-emerald-800/40 px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'text-[#C4E8A5] font-bold scale-105' 
                  : 'text-slate-300 hover:text-white font-medium opacity-80'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-800/60 shadow-inner' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] mt-0.5 leading-tight tracking-tight">
                    {isBn ? item.label_bn : item.label_en}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}

        {/* 'আরও' (More / Menu) Button */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl text-slate-300 hover:text-white font-medium opacity-80 transition-all"
        >
          <div className="p-1 rounded-lg">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 leading-tight tracking-tight">
            {isBn ? 'আরও' : 'More'}
          </span>
        </button>
      </div>
    </nav>
  );
};
