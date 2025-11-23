
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Shield, HelpCircle, LogOut, ChevronRight, Moon, Globe, Lock, ArrowLeft, Check, Camera, Sun, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { MOCK_ALERTS, MOCK_STOCKS } from '../services/mockData';

type SettingsView = 'main' | 'profile' | 'language' | 'security' | 'alerts';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [activeAlerts, setActiveAlerts] = useState(MOCK_ALERTS);
  const [formData, setFormData] = useState({
    name: 'Sujal Patel',
    email: 'sujal@example.com',
    language: 'English (US)',
  });

  const handleLogout = () => {
    navigate('/login');
  };

  const handleDeleteAlert = (id: string) => {
      setActiveAlerts(activeAlerts.filter(a => a.id !== id));
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <h3 className="text-textSecondary text-xs font-semibold uppercase tracking-wider mb-3 px-2 mt-6">{title}</h3>
  );

  const SettingsItem = ({ icon: Icon, label, value, onClick, toggle }: any) => (
    <button 
        onClick={onClick}
        className="w-full bg-cardDark hover:bg-surfaceLight flex items-center justify-between p-4 mb-2 rounded-2xl border border-borderBase transition-colors group"
    >
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-surfaceLight flex items-center justify-center text-textPrimary group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                <Icon size={20} />
            </div>
            <span className="text-textPrimary font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-3">
            {value && <span className="text-textSecondary text-sm">{value}</span>}
            {toggle !== undefined ? (
              <div className={`w-10 h-6 rounded-full p-1 transition-colors ${toggle ? 'bg-accentLime' : 'bg-surfaceLighter'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${toggle ? 'translate-x-4' : ''}`}></div>
              </div>
            ) : (
              <ChevronRight size={18} className="text-textSecondary" />
            )}
        </div>
    </button>
  );

  // --- Sub Views ---

  const renderProfileView = () => (
    <div className="animate-in slide-in-from-right duration-200">
      <div className="bg-cardDark p-6 rounded-3xl border border-borderBase mb-6 text-center">
        <div className="relative inline-block mb-4">
           <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-primary/20 mx-auto">
              {formData.name.charAt(0)}
           </div>
           <button className="absolute bottom-0 right-0 w-8 h-8 bg-cardDark border border-borderBase rounded-full flex items-center justify-center text-textPrimary hover:text-primary transition-colors">
              <Camera size={14} />
           </button>
        </div>
        <p className="text-textSecondary text-sm">Tap to change profile picture</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-textSecondary uppercase font-medium ml-2 mb-1 block">Full Name</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full bg-cardDark border border-borderBase p-4 rounded-xl text-textPrimary focus:outline-none focus:border-primary/50"
          />
        </div>
        <div>
          <label className="text-xs text-textSecondary uppercase font-medium ml-2 mb-1 block">Email Address</label>
          <input 
            type="email" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full bg-cardDark border border-borderBase p-4 rounded-xl text-textPrimary focus:outline-none focus:border-primary/50"
          />
        </div>
        <div>
          <label className="text-xs text-textSecondary uppercase font-medium ml-2 mb-1 block">Phone Number</label>
          <input 
            type="tel" 
            value="+91 98765 43210"
            className="w-full bg-cardDark border border-borderBase p-4 rounded-xl text-textPrimary focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      <button onClick={() => setCurrentView('main')} className="w-full mt-8 bg-primary text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary/20">
        Save Changes
      </button>
    </div>
  );

  const renderLanguageView = () => (
    <div className="space-y-2 animate-in slide-in-from-right duration-200">
      {['English (US)', 'English (IN)', 'Hindi', 'Spanish', 'French'].map(lang => (
        <button 
          key={lang}
          onClick={() => {
            setFormData({...formData, language: lang});
            setCurrentView('main');
          }}
          className={`w-full p-4 rounded-xl border flex justify-between items-center transition-all ${
            formData.language === lang 
            ? 'bg-primary/10 border-primary text-textPrimary' 
            : 'bg-cardDark border-borderBase text-textSecondary hover:bg-surfaceLight'
          }`}
        >
          <span className="font-medium">{lang}</span>
          {formData.language === lang && <Check size={20} className="text-primary" />}
        </button>
      ))}
    </div>
  );

  const renderSecurityView = () => (
    <div className="animate-in slide-in-from-right duration-200">
      <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl mb-6 flex gap-3 items-start">
        <Shield className="text-primary shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="text-textPrimary font-medium text-sm mb-1">Two-Factor Authentication</h4>
          <p className="text-textSecondary text-xs">Secure your account with 2FA using SMS or Authenticator app.</p>
        </div>
        <div className="w-10 h-6 bg-accentLime rounded-full p-1 ml-auto shrink-0">
             <div className="w-4 h-4 bg-white rounded-full shadow translate-x-4"></div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-textPrimary font-medium">Change Password</h3>
        <input 
          type="password" 
          placeholder="Current Password"
          className="w-full bg-cardDark border border-borderBase p-4 rounded-xl text-textPrimary focus:outline-none focus:border-primary/50"
        />
        <input 
          type="password" 
          placeholder="New Password"
          className="w-full bg-cardDark border border-borderBase p-4 rounded-xl text-textPrimary focus:outline-none focus:border-primary/50"
        />
        <input 
          type="password" 
          placeholder="Confirm New Password"
          className="w-full bg-cardDark border border-borderBase p-4 rounded-xl text-textPrimary focus:outline-none focus:border-primary/50"
        />
      </div>

      <button onClick={() => setCurrentView('main')} className="w-full mt-8 bg-cardDark border border-borderBase text-textPrimary font-semibold py-4 rounded-xl hover:bg-surfaceLight">
        Update Password
      </button>
    </div>
  );

  const renderAlertsView = () => (
      <div className="animate-in slide-in-from-right duration-200 space-y-4">
          <p className="text-textSecondary text-sm mb-4">Manage your active price alerts here.</p>
          
          {activeAlerts.length > 0 ? (
              activeAlerts.map(alert => {
                  const stock = MOCK_STOCKS.find(s => s.id === alert.stockId);
                  if (!stock) return null;
                  return (
                      <div key={alert.id} className="bg-cardDark p-4 rounded-2xl border border-borderBase flex justify-between items-center">
                          <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                                  alert.type === 'above' ? 'bg-accentLime/10 text-accentLime' : 'bg-error/10 text-error'
                              }`}>
                                  {alert.type === 'above' ? '↑' : '↓'}
                              </div>
                              <div>
                                  <h4 className="text-textPrimary font-medium">{stock.symbol}</h4>
                                  <p className="text-xs text-textSecondary">
                                      {alert.type === 'above' ? 'Above' : 'Below'} ₹{alert.price.toLocaleString('en-IN')}
                                  </p>
                              </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="p-2 text-textSecondary hover:text-error transition-colors bg-surfaceLight rounded-lg hover:bg-surfaceLighter"
                          >
                              <Trash2 size={18} />
                          </button>
                      </div>
                  );
              })
          ) : (
              <div className="text-center py-12 text-textSecondary bg-cardDark rounded-2xl border border-borderBase border-dashed">
                  <Bell size={24} className="mx-auto mb-2 opacity-50" />
                  <p>No active alerts.</p>
              </div>
          )}
      </div>
  );

  // --- Main View ---

  return (
    <div className="min-h-screen bg-bgDark pb-24 font-sans px-2 transition-colors duration-300">
      {/* Header */}
      <header className="pt-2 mb-6 flex items-center gap-4">
        {currentView !== 'main' && (
          <button 
            onClick={() => setCurrentView('main')}
            className="w-10 h-10 rounded-full border border-borderBase flex items-center justify-center hover:bg-surfaceLight text-textPrimary"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-2xl font-semibold text-textPrimary">
          {currentView === 'main' ? 'Settings' : 
           currentView === 'profile' ? 'Edit Profile' :
           currentView === 'language' ? 'Language' :
           currentView === 'alerts' ? 'Active Alerts' :
           'Security'}
        </h1>
      </header>

      {currentView === 'main' ? (
        <>
          {/* Profile Card */}
          <div className="bg-gradient-to-r from-primary/10 to-accentPurple/10 p-6 rounded-3xl border border-borderBase flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-primary/30">
                  {formData.name.charAt(0)}
              </div>
              <div>
                  <h2 className="text-xl font-semibold text-textPrimary">{formData.name}</h2>
                  <p className="text-textSecondary text-sm">{formData.email}</p>
              </div>
              <button 
                onClick={() => setCurrentView('profile')}
                className="ml-auto px-4 py-2 bg-surfaceLight rounded-full text-xs font-medium hover:bg-surfaceLighter transition-colors text-textPrimary"
              >
                  Edit
              </button>
          </div>

          {/* Account Settings */}
          <SectionTitle title="General" />
          <SettingsItem icon={User} label="Personal Information" onClick={() => setCurrentView('profile')} />
          <SettingsItem icon={Globe} label="Language" value={formData.language} onClick={() => setCurrentView('language')} />
          <SettingsItem 
            icon={theme === 'dark' ? Moon : Sun} 
            label="Dark Mode" 
            toggle={theme === 'dark'} 
            onClick={toggleTheme} 
          />
          <SettingsItem icon={Bell} label="Active Alerts" onClick={() => setCurrentView('alerts')} value={activeAlerts.length.toString()} />

          <SectionTitle title="Security" />
          <SettingsItem icon={Lock} label="Change Password" onClick={() => setCurrentView('security')} />
          <SettingsItem icon={Shield} label="Face ID" value="Enabled" onClick={() => {}} />

          <SectionTitle title="Support" />
          <SettingsItem icon={HelpCircle} label="Help Center" onClick={() => {}} />

          <button 
            onClick={handleLogout}
            className="w-full mt-8 p-4 rounded-2xl border border-error/20 text-error font-medium hover:bg-error/10 transition-colors flex items-center justify-center gap-2"
          >
              <LogOut size={20} />
              Log Out
          </button>

          <p className="text-center text-textSecondary text-xs mt-8 pb-4">TradeIn App v1.0.2</p>
        </>
      ) : (
        // Render Sub-views
        <div className="pb-10">
          {currentView === 'profile' && renderProfileView()}
          {currentView === 'language' && renderLanguageView()}
          {currentView === 'security' && renderSecurityView()}
          {currentView === 'alerts' && renderAlertsView()}
        </div>
      )}
    </div>
  );
};