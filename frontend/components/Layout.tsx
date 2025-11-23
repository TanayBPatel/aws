
import React from 'react';
import { Home, BarChart2, PieChart, Settings, Calendar, Users } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show nav on Auth pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return <div className="min-h-screen bg-bgDark text-textPrimary">{children}</div>;
  }

  // Check if we are on a stock detail page
  const isStockDetail = location.pathname.startsWith('/stock/');

  const navItems = [
    { icon: <Home size={22} />, label: 'Home', path: '/' },
    { icon: <BarChart2 size={22} />, label: 'Markets', path: '/markets' },
    { icon: <PieChart size={22} />, label: 'Portfolio', path: '/portfolio' },
    { icon: <Users size={22} />, label: 'Social', path: '/social' },
    { icon: <Calendar size={22} />, label: 'History', path: '/history' },
    { icon: <Settings size={22} />, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-bgDark text-textPrimary pb-24 md:pb-0 md:pl-20 relative overflow-hidden transition-colors duration-300">
      {/* Desktop Sidebar (Hidden on mobile) */}
      <div className="hidden md:flex fixed left-0 top-0 h-full w-20 bg-cardDark border-r border-borderBase flex-col items-center py-8 z-50 transition-colors duration-300">
        <div className="mb-10">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">TI</div>
        </div>
        <div className="flex flex-col space-y-8">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`p-3 rounded-xl transition-all duration-300 ${
                location.pathname === item.path 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : 'text-textSecondary hover:text-textPrimary hover:bg-surfaceLight'
              }`}
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <main className="max-w-lg mx-auto md:max-w-4xl p-4 pt-6 md:p-8 min-h-screen">
        {children}
      </main>

      {/* Mobile Bottom Nav - Hidden on StockDetail to avoid overlay issues */}
      {!isStockDetail && (
        <div className="md:hidden fixed bottom-6 left-4 right-4 h-[72px] bg-glassBg backdrop-blur-xl border border-borderBase rounded-[32px] flex items-center justify-between px-4 shadow-2xl z-50 transition-colors duration-300 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center justify-center transition-all duration-300 shrink-0 ${
                        isActive 
                        ? 'bg-accentLime text-bgDark px-4 py-2.5 rounded-full shadow-[0_0_15px_rgba(164,227,103,0.3)]' 
                        : 'w-10 h-10 text-textSecondary hover:text-textPrimary mx-1'
                    }`}
                >
                    {item.icon}
                    {isActive && <span className="ml-2 font-semibold text-sm">{item.label}</span>}
                </button>
                );
            })}
        </div>
      )}
    </div>
  );
};
