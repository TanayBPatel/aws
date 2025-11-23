import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, ChevronRight, User, Shield, CreditCard, PieChart, Activity, ArrowUpRight, ArrowDownRight, LogOut, CheckCircle, Ban } from 'lucide-react';
import { AdminUser } from '../types';
import { api } from '../frontend/services/api';
import { useAuth } from '../contexts/AuthContext';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'holdings' | 'history'>('holdings');
  const [users, setUsers] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchSystemStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStats = async () => {
    try {
      const stats = await api.getSystemHealth();
      setSystemStats(stats);
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const userData = await api.getUserById(userId);
      setSelectedUser(userData);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgDark">
        <div className="text-textPrimary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgDark text-textPrimary font-sans flex flex-col md:flex-row">
      
      {/* Admin Sidebar (Desktop) / Header (Mobile) */}
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

          {/* System Stats */}
          {systemStats && (
            <div className="bg-surfaceLight p-4 rounded-xl mb-6 border border-borderBase">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-textSecondary">Status</span>
                <span className={`text-xs px-2 py-1 rounded-full ${systemStats.status === 'Operational' ? 'bg-accentLime/20 text-accentLime' : 'bg-error/20 text-error'}`}>
                  {systemStats.status}
                </span>
              </div>
              <div className="text-sm text-textPrimary font-medium">
                {systemStats.activeUsers} Active Users
              </div>
              <div className="text-xs text-textSecondary mt-1">
                Total AUM: ₹{(systemStats.totalAUM || 0).toLocaleString('en-IN')}
              </div>
            </div>
          )}

          <div className="mb-6 relative">
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
              <h3 className="text-xs font-semibold text-textSecondary uppercase mb-2 px-2">Users ({filteredUsers.length})</h3>
              {filteredUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                        fetchUserDetails(u.id);
                        setActiveTab('holdings');
                    }}
                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${
                        selectedUser?.user?.id === u.id 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-surfaceLight border border-transparent'
                    }`}
                  >
                      <div className="w-8 h-8 rounded-full bg-surfaceLighter flex items-center justify-center text-xs font-bold">
                          {u.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${selectedUser?.user?.id === u.id ? 'text-primary' : 'text-textPrimary'}`}>{u.name || 'Unknown'}</p>
                          <p className="text-xs text-textSecondary truncate">{u.email || ''}</p>
                      </div>
                      {u.status === 'suspended' && <div className="w-2 h-2 rounded-full bg-error"></div>}
                  </button>
              ))}
          </div>

          <button 
            onClick={handleLogout}
            className="mt-4 flex items-center gap-2 p-3 text-sm font-medium text-textSecondary hover:text-error hover:bg-surfaceLight rounded-xl transition-colors"
          >
              <LogOut size={18} />
              Log Out
          </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-8 bg-bgDark overflow-y-auto">
          {selectedUser ? (
              <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right duration-300">
                  {/* User Header */}
                  <div className="flex justify-between items-start bg-cardDark p-6 rounded-2xl border border-borderBase shadow-sm">
                      <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-white">
                              {selectedUser.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                              <h2 className="text-2xl font-semibold text-textPrimary">{selectedUser.user?.name || 'Unknown'}</h2>
                              <p className="text-textSecondary">{selectedUser.user?.email || ''}</p>
                              <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs px-2 py-0.5 rounded-md bg-surfaceLight border border-borderBase text-textSecondary">ID: {selectedUser.user?.id}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                      selectedUser.user?.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-accentLime/20 text-accentLime'
                                  }`}>
                                      <CheckCircle size={12} />
                                      {selectedUser.user?.role || 'investor'}
                                  </span>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-4 border-b border-borderBase">
                      <button
                          onClick={() => setActiveTab('holdings')}
                          className={`pb-3 px-4 font-medium transition-colors ${
                              activeTab === 'holdings' 
                              ? 'text-primary border-b-2 border-primary' 
                              : 'text-textSecondary hover:text-textPrimary'
                          }`}
                      >
                          Holdings
                      </button>
                      <button
                          onClick={() => setActiveTab('history')}
                          className={`pb-3 px-4 font-medium transition-colors ${
                              activeTab === 'history' 
                              ? 'text-primary border-b-2 border-primary' 
                              : 'text-textSecondary hover:text-textPrimary'
                          }`}
                      >
                          Transaction History
                      </button>
                  </div>

                  {/* Holdings Tab */}
                  {activeTab === 'holdings' && (
                      <div className="space-y-4">
                          {selectedUser.portfolio?.positions && selectedUser.portfolio.positions.length > 0 ? (
                              selectedUser.portfolio.positions.map((position: any) => (
                                  <div key={position.id} className="bg-cardDark p-4 rounded-xl border border-borderBase">
                                      <div className="flex justify-between items-center">
                                          <div>
                                              <h4 className="font-medium text-textPrimary">{position.symbol}</h4>
                                              <p className="text-sm text-textSecondary">Qty: {position.quantity} @ ₹{position.avgPrice}</p>
                                          </div>
                                          <div className="text-right">
                                              <p className="font-medium text-textPrimary">
                                                  ₹{(position.currentPrice * position.quantity).toLocaleString('en-IN')}
                                              </p>
                                          </div>
                                      </div>
                                  </div>
                              ))
                          ) : (
                              <div className="text-center py-12 text-textSecondary">
                                  <p>No holdings</p>
                              </div>
                          )}

                          {selectedUser.portfolio && (
                              <div className="bg-cardDark p-6 rounded-xl border border-borderBase">
                                  <div className="grid grid-cols-2 gap-4">
                                      <div>
                                          <p className="text-xs text-textSecondary mb-1">Balance</p>
                                          <p className="text-2xl font-semibold text-textPrimary">
                                              ₹{selectedUser.portfolio.balance?.toLocaleString('en-IN') || '0'}
                                          </p>
                                      </div>
                                      <div>
                                          <p className="text-xs text-textSecondary mb-1">Total Invested</p>
                                          <p className="text-2xl font-semibold text-textPrimary">
                                              ₹{selectedUser.portfolio.totalInvested?.toLocaleString('en-IN') || '0'}
                                          </p>
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>
                  )}

                  {/* History Tab */}
                  {activeTab === 'history' && (
                      <div className="space-y-3">
                          {selectedUser.transactions && selectedUser.transactions.length > 0 ? (
                              selectedUser.transactions.map((tx: any) => (
                                  <div key={tx.id} className="bg-cardDark p-4 rounded-xl border border-borderBase">
                                      <div className="flex justify-between items-center">
                                          <div>
                                              <p className="text-sm font-medium capitalize text-textPrimary">{tx.type} {tx.stockSymbol || ''}</p>
                                              <p className="text-xs text-textSecondary">{new Date(tx.date).toLocaleString()}</p>
                                          </div>
                                          <div className="text-right">
                                              <p className={`font-medium ${tx.type === 'deposit' || tx.type === 'sell' ? 'text-accentLime' : 'text-error'}`}>
                                                  {tx.type === 'deposit' || tx.type === 'sell' ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN')}
                                              </p>
                                              <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                                                  tx.status === 'completed' ? 'bg-accentLime/20 text-accentLime' : 'bg-error/20 text-error'
                                              }`}>
                                                  {tx.status}
                                              </span>
                                          </div>
                                      </div>
                                  </div>
                              ))
                          ) : (
                              <div className="text-center py-12 text-textSecondary">
                                  <p>No transactions</p>
                              </div>
                          )}
                      </div>
                  )}
              </div>
          ) : (
              <div className="max-w-4xl mx-auto text-center py-20">
                  <Users size={64} className="mx-auto text-textSecondary mb-4 opacity-50" />
                  <h2 className="text-2xl font-semibold text-textPrimary mb-2">Select a User</h2>
                  <p className="text-textSecondary">Choose a user from the sidebar to view their details</p>
              </div>
          )}
      </div>
    </div>
  );
};
