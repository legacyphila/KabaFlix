/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Settings, 
  Bell, 
  Database, 
  TrendingUp, 
  ShieldAlert, 
  Sun, 
  Moon, 
  Info, 
  LogOut, 
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface MorePanelProps {
  onNavigate: (tab: 'dashboard' | 'subscribers' | 'earnings' | 'notifications' | 'settings', subTab?: 'profile' | 'business' | 'admin' | 'integrations' | 'about') => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onLogout: () => void;
  onResetAllData?: () => void;
}

export default function MorePanel({ onNavigate, darkMode, setDarkMode, onLogout, onResetAllData }: MorePanelProps) {
  const [showResetModal, setShowResetModal] = React.useState(false);
  const [resetConfirmText, setResetConfirmText] = React.useState('');

  const menuGroups = [
    {
      title: "Settings & Administration",
      items: [
        {
          id: 'settings-profile',
          label: 'Owner Profile',
          desc: 'Manage your contact details & owner bio',
          icon: UserCheck,
          color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10',
          action: () => onNavigate('settings', 'profile')
        },
        {
          id: 'settings',
          label: 'System Settings',
          desc: 'Adjust subscription rations & cost margins',
          icon: Settings,
          color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10',
          action: () => onNavigate('settings', 'profile')
        },
        {
          id: 'notifications',
          label: 'Notifications Center',
          desc: 'View dispatch history & alert templates',
          icon: Bell,
          color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10',
          action: () => onNavigate('notifications')
        },
        {
          id: 'integrations',
          label: 'Integrations Panel',
          desc: 'Supabase, Resend API & Google Calendar Sync',
          icon: Database,
          color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
          action: () => onNavigate('settings', 'integrations')
        }
      ]
    },
    {
      title: "Data & Reports",
      items: [
        {
          id: 'reports',
          label: 'Business Reports',
          desc: 'Review gross payouts & monthly balance sheets',
          icon: TrendingUp,
          color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10',
          action: () => onNavigate('earnings')
        },
        {
          id: 'backup',
          label: 'Backup & Restore',
          desc: 'Import/export data via JSON schemas',
          icon: ShieldAlert,
          color: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10',
          action: () => onNavigate('settings', 'admin')
        },
        {
          id: 'reset',
          label: 'Reset Account / Start Fresh',
          desc: 'Wipe all records safely to begin adding subscribers fresh',
          icon: ShieldAlert,
          color: 'text-rose-500 bg-rose-100 dark:bg-rose-500/15',
          action: () => setShowResetModal(true)
        }
      ]
    },
    {
      title: "Preferences & System",
      items: [
        {
          id: 'theme',
          label: 'Interface Theme',
          desc: darkMode ? 'Dark Mode Active' : 'Light Mode Active',
          icon: darkMode ? Moon : Sun,
          color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-500/10',
          isTheme: true,
          action: () => setDarkMode(!darkMode)
        },
        {
          id: 'about',
          label: 'About KabaFlix',
          desc: 'Platform updates & technical support',
          icon: Info,
          color: 'text-slate-500 bg-slate-50 dark:bg-slate-500/10',
          action: () => onNavigate('settings', 'about')
        }
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in p-1 md:p-3">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          More Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Explore secondary modules, adjust app settings, toggle themes, or export database snapshots.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-6">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">
                {group.title}
              </h3>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-slate-800">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={item.id}
                      onClick={item.action}
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${item.color}`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                            {item.label}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 block">
                            {item.desc}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.isTheme ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDarkMode(!darkMode);
                            }}
                            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-gray-250 dark:bg-red-650"
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                darkMode ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        ) : (
                          <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:translate-x-0.5 transition-transform" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Logout segment */}
          <button
            onClick={onLogout}
            className="flex items-center justify-between w-full p-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 dark:bg-red-500/10 dark:hover:bg-red-500/15 rounded-2xl text-red-650 dark:text-red-400 transition-all font-bold group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <LogOut size={18} />
              </div>
              <div className="text-left">
                <span className="text-sm block">Sign Out</span>
                <span className="text-xs text-red-500/60 dark:text-red-400/60 block">Exit admin portal session</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-red-400/60 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Brand Meta card */}
        <div className="bg-gradient-to-br from-red-650 to-red-950 text-white rounded-[24px] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[280px]">
          {/* Decorative mesh */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-6 translate-x-6" />
          
          <div className="space-y-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <img src="/src/logo.svg" className="w-9 h-9 object-contain" alt="KabaFlix" />
            </div>
            
            <div>
              <h2 className="text-xl font-bold tracking-tight">KabaFlix Console</h2>
              <p className="text-xs text-red-200">by Legacy Phila</p>
            </div>
          </div>

          <div className="space-y-3 border-t border-white/10 pt-4">
            <div className="flex justify-between text-xs">
              <span className="text-red-300">Environment</span>
              <span className="font-semibold">Production Gateway</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-red-300">System Version</span>
              <span className="font-semibold">v3.2.1-Gold</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-red-300">Support Owner</span>
              <span className="font-semibold">Legacy Phila</span>
            </div>
          </div>
        </div>
      </div>

      {/* Double confirmation Modal for administrative Reset */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 text-red-650 dark:text-red-400 flex items-center justify-center mx-auto">
              <ShieldAlert size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">Hard Purge Database?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This will delete all subscribers, notifications history, customized system costs, and general logs. This is 100% irreversible.
              </p>
            </div>
            <div className="space-y-3 pt-2 text-left">
              <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-widest">
                Type <span className="text-red-650 font-black">"DELETE"</span> to confirm:
              </label>
              <input 
                type="text" 
                placeholder="DELETE" 
                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-red-500 outline-none uppercase font-mono"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmText('');
                }}
                className="flex-1 py-2.5 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-850 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => {
                  if (resetConfirmText !== "DELETE") {
                    alert('Please type "DELETE" exactly to proceed.');
                    return;
                  }
                  if (onResetAllData) {
                    onResetAllData();
                  }
                  setShowResetModal(false);
                  setResetConfirmText('');
                  alert('🔥 [System Purge complete]\n\nAll subscriber registers, logs, and cost configurations have been hard-wiped.');
                  window.location.reload();
                }}
                disabled={resetConfirmText !== "DELETE"}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer ${
                  resetConfirmText === 'DELETE' 
                    ? 'bg-red-650 hover:bg-red-500' 
                    : 'bg-red-650/40 cursor-not-allowed'
                }`}
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
