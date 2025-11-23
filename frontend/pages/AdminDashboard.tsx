
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Shield, CreditCard, PieChart, Activity, ArrowUpRight, ArrowDownRight, LogOut, CheckCircle, Ban, Server, Database } from 'lucide-react';
import { MOCK_ADMIN_USERS } from '../services/mockData';
import { AdminUser, SystemStats } from '../types';
import { api } from '../services/api';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<'holdings' | 'history'>('holdings');
  const [viewMode, setViewMode] = useState<'users' | 'system'>('users');
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    if (viewMode === 'system') {
      api.getSystemHealth().then(setSystemStats);
    }
  }, [viewMode]);

  const filteredUsers = MOCK_ADMIN_USERS.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
      navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bgDark text-textPrimary font-sans flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-cardDark border-b md:border-b-0 md:border-r border-borderBase p-4 flex flex-col">
          <div className="flex items-center gap-3 mb-8 px-2">
              <div className="w-10 h-10 bg-error/20 rounded-lg flex items-center justify-center text-error">
                  <Shield size={24} />
              </div>
              <div>
                  <h1 className="font-bold text-lg leading-tight">Admin</h1>
                  <p className="text-xs text-textSecondary">Dashboard</p>
              </div>
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <button 
              onClick={() => setViewMode('users')}
              className={`p-3 rounded-xl flex items-center gap-3 transition-all ${viewMode === 'users' ? 'bg-primary text-white' : 'text-textSecondary hover:bg-surfaceLight'}`}
            >
              <Users size={18} />
              <span className="font-medium text-sm">User Management</span>
            </button>
            {/* UC15: System Monitor Link */}
            <button 
              onClick={() => setViewMode('system')}
              className={`p-3 rounded-xl flex items-center gap-3 transition-all ${viewMode === 'system' ? 'bg-primary text-white' : 'text-textSecondary hover:bg-surfaceLight'}`}
            >
              <Activity size={18} />
              <span className="font-medium text-sm">System Monitor</span>
            </button>
          </div>

          {viewMode === 'users' && (
            <>
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={18} />
                <input 
                    type="text" 
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surfaceLight border border-borderBase rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
                  {filteredUsers.map(user => (
                      <button
                        key={user.id}
                        onClick={() => {
                            setSelectedUser(user);
                            setActiveTab('holdings');
                        }}
                        className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${
                            selectedUser?.id === user.id 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'hover:bg-surfaceLight border border-transparent'
                        }`}
                      >
                          <div className="w-8 h-8 rounded-full bg-surfaceLighter flex items-center justify-center text-xs font-bold">
                              {user.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${selectedUser?.id === user.id ? 'text-primary' : 'text-textPrimary'}`}>{user.name}</p>
                              <p className="text-xs text-textSecondary truncate">{user.email}</p>
                          </div>
                      </button>
                  ))}
              </div>
            </>
          )}

          <button 
            onClick={handleLogout}
            className="mt-auto flex items-center gap-2 p-3 text-sm font-medium text-textSecondary hover:text-error hover:bg-surfaceLight rounded-xl transition-colors"
          >
              <LogOut size={18} />
              Log Out
          </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 bg-bgDark overflow-y-auto">
          {/* UC15 View */}
          {viewMode === 'system' ? (
            <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right">
              <h2 className="text-2xl font-semibold mb-4">System Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-cardDark p-6 rounded-2xl border border-borderBase">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-textSecondary font-medium">Server Load</h3>
                    <Server className="text-primary" />
                  </div>
                  <div className="text-3xl font-bold">{systemStats?.cpuLoad || '...'}</div>
                  <div className="w-full bg-surfaceLight h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: systemStats?.cpuLoad }}></div>
                  </div>
                </div>
                
                <div className="bg-cardDark p-6 rounded-2xl border border-borderBase">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-textSecondary font-medium">Memory Usage</h3>
                    <Database className="text-accentPurple" />
                  </div>
                  <div className="text-3xl font-bold">{systemStats?.memoryUsage || '...'}</div>
                   <div className="w-full bg-surfaceLight h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-accentPurple h-full" style={{ width: systemStats?.memoryUsage }}></div>
                  </div>
                </div>

                <div className="bg-cardDark p-6 rounded-2xl border border-borderBase">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-textSecondary font-medium">Active Users</h3>
                    <Users className="text-accentLime" />
                  </div>
                  <div className="text-3xl font-bold">{systemStats?.activeUsers || '...'}</div>
                  <p className="text-xs text-textSecondary mt-2">Currently logged in</p>
                </div>

                <div className="bg-cardDark p-6 rounded-2xl border border-borderBase">
                   <div className="flex items-center justify-between mb-4">
                    <h3 className="text-textSecondary font-medium">DB Latency</h3>
                    <Activity className="text-error" />
                  </div>
                  <div className="text-3xl font-bold">{systemStats?.dbLatency || '...'}</div>
                  <p className="text-xs text-textSecondary mt-2">Response time</p>
                </div>
              </div>
            </div>
          ) : selectedUser ? (
              <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right duration-300">
                  <div className="flex justify-between items-start bg-cardDark p-6 rounded-2xl border border-borderBase shadow-sm">
                      <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-white">
                              {selectedUser.name.charAt(0)}
                          </div>
                          <div>
                              <h2 className="text-2xl font-semibold text-textPrimary">{selectedUser.name}</h2>
                              <p className="text-textSecondary">{selectedUser.email}</p>
                              <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs px-2 py-0.5 rounded-md bg-surfaceLight border border-borderBase text-textSecondary">ID: {selectedUser.id}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                      selectedUser.status === 'active' 
                                      ? 'bg-accentLime/10 text-accentLime border border-accentLime/20' 
                                      : 'bg-error/10 text-error border border-error/20'
                                  }`}>
                                      {selectedUser.status === 'active' ? <CheckCircle size={10} /> : <Ban size={10} />}
                                      <span className="capitalize">{selectedUser.status}</span>
                                  </span>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-cardDark p-6 rounded-2xl border border-borderBase shadow-sm">
                          <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-surfaceLight rounded-lg text-textSecondary">
                                  <CreditCard size={20} />
                              </div>
                              <span className="text-sm font-medium text-textSecondary">Wallet Balance</span>
                          </div>
                          <p className="text-3xl font-semibold text-textPrimary">₹{selectedUser.walletBalance.toLocaleString('en-IN')}</p>
                      </div>

                      <div className="bg-cardDark p-6 rounded-2xl border border-borderBase shadow-sm">
                          <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-surfaceLight rounded-lg text-textSecondary">
                                  <PieChart size={20} />
                              </div>
                              <span className="text-sm font-medium text-textSecondary">Total Holdings Value</span>
                          </div>
                          <p className="text-3xl font-semibold text-textPrimary">
                              ₹{selectedUser.holdings.reduce((acc, curr) => acc + curr.totalValue, 0).toLocaleString('en-IN')}
                          </p>
                      </div>
                  </div>
              </div>
          ) : (
              <div className="h-full flex flex-col items-center justify-center text-textSecondary">
                  <div className="w-16 h-16 bg-surfaceLight rounded-full flex items-center justify-center mb-4">
                      <Users size={32} />
                  </div>
                  <h2 className="text-xl font-semibold text-textPrimary mb-2">Select a User</h2>
                  <p className="max-w-xs text-center">Select a user from the list to view their portfolio, funds, and transaction activity.</p>
              </div>
          )}
      </div>
    </div>
  );
};
