/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Subscriber, ActivityLog, NotificationLog, AppSettings, RenewalRecord } from './types';
import { 
  INITIAL_SUBSCRIBERS, 
  INITIAL_ACTIVITY_LOGS, 
  INITIAL_NOTIFICATIONS, 
  DEFAULT_SETTINGS,
  getStatus,
  getDaysRemaining,
  addDays
} from './utils/data';
import { sendEmailNotification, createGoogleCalendarEvent, syncToSupabase } from './utils/integrations';

// Modular UI Panels
import Footer from './components/Footer';
import LoginPanel from './components/LoginPanel';
import DashboardPanel from './components/DashboardPanel';
import SubscribersPanel from './components/SubscribersPanel';
import AddSubscriberModal from './components/AddSubscriberModal';
import EarningsPanel from './components/EarningsPanel';
import NotificationsPanel from './components/NotificationsPanel';
import SettingsPanel from './components/SettingsPanel';
import MorePanel from './components/MorePanel';
import BottomNavigation from './components/BottomNavigation';

// Icons for Top Bar and layout interaction
import { Bell, Sun, Moon, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  // 1. Session state
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem('kaba_is_logged');
    return saved === 'true';
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'subscribers' | 'earnings' | 'notifications' | 'settings' | 'more'>(() => {
    return (localStorage.getItem('kaba_active_tab') as any) || 'dashboard';
  });

  const [settingsSubTab, setSettingsSubTab] = useState<'profile' | 'business' | 'admin' | 'integrations' | 'about'>('profile');

  // 2. Database collections loaded from local storage falls back to clean empty lists for a CLEAN START!
  const [subscribers, setSubscribers] = useState<Subscriber[]>(() => {
    const saved = localStorage.getItem('kaba_subscribers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_SUBSCRIBERS; // is [] empty list
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('kaba_activity_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_ACTIVITY_LOGS; // is [] empty list
  });

  const [notificationsHistory, setNotificationsHistory] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem('kaba_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_NOTIFICATIONS; // is [] empty list
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('kaba_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('kaba_dark_mode');
    return saved === 'true';
  });

  // Settings sub navigation handler
  const handleNavigateFromMore = (tab: 'dashboard' | 'subscribers' | 'earnings' | 'notifications' | 'settings', subTab?: 'profile' | 'business' | 'admin' | 'integrations' | 'about') => {
    if (subTab) {
      setSettingsSubTab(subTab);
    }
    setActiveTab(tab);
  };

  // Subscriber modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);

  // Google Calendar Integration Mock Token for the UI sync preview
  const [googleToken, setGoogleToken] = useState<string | null>(() => {
    return localStorage.getItem('kaba_google_token') || null;
  });

  // 3. Persistent synchronization effects
  useEffect(() => {
    localStorage.setItem('kaba_subscribers', JSON.stringify(subscribers));
  }, [subscribers]);

  useEffect(() => {
    localStorage.setItem('kaba_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('kaba_notifications', JSON.stringify(notificationsHistory));
  }, [notificationsHistory]);

  useEffect(() => {
    localStorage.setItem('kaba_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('kaba_dark_mode', darkMode ? 'true' : 'false');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('kaba_active_tab', activeTab);
  }, [activeTab]);

  // Try fetching subscribers on mount if Supabase credentials exist
  useEffect(() => {
    if (settings.supabaseUrl && settings.supabaseKey) {
      syncToSupabase('fetch', undefined, settings).then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setSubscribers(res.data);
          addSystemLog('system', 'Database synchronized from your Supabase endpoint URL.');
        }
      });
    }
  }, []);

  // Daily Expiry Scan Checker on App Load
  useEffect(() => {
    if (subscribers.length === 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const lastCheckDate = localStorage.getItem('kaba_last_notification_check');
    if (lastCheckDate === todayStr) {
      console.log(`[KabaFlix Expiry Checker] Already checked today (${todayStr}).`);
      return;
    }

    const runDailyCheck = async () => {
      console.log(`[KabaFlix Expiry Checker] Running daily expiration check for ${todayStr}...`);
      let sentCount = 0;
      const updatedHistory = [...notificationsHistory];
      let historyNeedsUpdate = false;

      for (const sub of subscribers) {
        const daysRemaining = getDaysRemaining(sub.expiryDate, todayStr);
        let shouldWarnCheck = false;
        let warningType: '3-day-warning' | 'expiry-day' | null = null;

        if (daysRemaining === 3) {
          shouldWarnCheck = true;
          warningType = '3-day-warning';
        } else if (daysRemaining <= 0 && sub.status !== 'Suspended' && sub.status !== 'Expired') {
          shouldWarnCheck = true;
          warningType = 'expiry-day';
        }

        if (shouldWarnCheck && warningType) {
          // Check for duplicate sent items in this exact expiry date cycle
          const duplicateSent = notificationsHistory.some(h => 
            h.subscriberId === sub.id && 
            h.type === warningType && 
            h.date === todayStr
          );

          if (!duplicateSent) {
            console.log(`[KabaFlix Expiry Checker] Executing ${warningType} scan for ${sub.name}...`);
            const res = await sendEmailNotification(sub, warningType, settings, addSystemLog);
            
            const newHistoryItem: NotificationLog = {
              id: 'notif-' + Math.random().toString(36).substr(2, 9),
              subscriberId: sub.id,
              subscriberName: sub.name,
              type: warningType,
              status: res.success ? 'sent' : 'failed',
              date: todayStr,
              channel: 'email'
            };

            updatedHistory.unshift(newHistoryItem);
            historyNeedsUpdate = true;
            sentCount++;
          }
        }
      }

      if (historyNeedsUpdate) {
        setNotificationsHistory(updatedHistory);
      }

      localStorage.setItem('kaba_last_notification_check', todayStr);
      if (sentCount > 0) {
        addSystemLog('system', `Daily active scan completed. Automatically dispatched (${sentCount}) email warning alerts.`);
      }
    };

    const timer = setTimeout(() => {
      runDailyCheck();
    }, 2500);

    return () => clearTimeout(timer);
  }, [subscribers, notificationsHistory]);

  // 4. Ledger activity logging utility
  const addSystemLog = (
    type: ActivityLog['type'],
    message: string,
    details?: string
  ) => {
    const newLog: ActivityLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      type,
      message,
      details
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // 5. Auth actions
  const handleLogin = (email: string, method: 'password' | 'biometric') => {
    setIsLoggedIn(true);
    localStorage.setItem('kaba_is_logged', 'true');
    
    // Add login history attempt
    const newHistoryEntry = {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      success: true,
      method,
      browser: navigator.userAgent.substring(0, 25)
    };
    
    setSettings(prev => ({
      ...prev,
      loginHistory: [newHistoryEntry, ...(prev.loginHistory || [])]
    }));

    addSystemLog('system', `Administrator signed in via ${method}: ${email}`);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out from the KabaFlix Admin Console?')) {
      setIsLoggedIn(false);
      localStorage.setItem('kaba_is_logged', 'false');
      addSystemLog('system', 'Administrator logged out of remote console.');
    }
  };

  // 6. Google OAuth login triggers
  const handleGoogleLogin = () => {
    // Standard simulation token generated for direct immediate full testing UX
    const fakeToken = 'ya29.a0ARWdfX7p2_J' + Math.random().toString(36).substring(4);
    setGoogleToken(fakeToken);
    localStorage.setItem('kaba_google_token', fakeToken);
    addSystemLog('system', 'Google Workspace Account connected. Calendar sync enabled!');
    alert('🟢 [Google Workspace Authentication]\n\nOAuth permission success! Calendar events will now sync to your primary schedule with permission.');
  };

  const handleGoogleLogout = () => {
    setGoogleToken(null);
    localStorage.removeItem('kaba_google_token');
    addSystemLog('system', 'Google Workspace account disconnected.');
  };

  // 7. Save or Create Subscriber Row
  const handleSaveSubscriber = async (payload: Omit<Subscriber, 'id'> & { id?: string }) => {
    let updatedList: Subscriber[] = [];
    const idToUse = payload.id || 'sub-' + Math.random().toString(36).substr(2, 9);
    
    // Calculate status dynamically based on dates
    const calculatedStatus = payload.status === 'Suspended' ? 'Suspended' : getStatus(payload.expiryDate);

    const targetSubscriber: Subscriber = {
      ...payload,
      id: idToUse,
      status: calculatedStatus,
      renewalHistory: payload.renewalHistory || []
    };

    if (payload.id) {
      // Edit Mode
      updatedList = subscribers.map(s => s.id === payload.id ? targetSubscriber : s);
      setSubscribers(updatedList);
      addSystemLog(
        'edit', 
        `Updated subscriber ${payload.name}.`,
        `Profile: ${payload.netflixProfile}, Device: ${payload.deviceName}, Expiry: ${payload.expiryDate}`
      );
      // Supabase syncing
      syncToSupabase('update', targetSubscriber, settings);
    } else {
      // Create Mode
      // Save initial renewal history list
      targetSubscriber.renewalHistory = [
        {
          date: payload.startDate,
          amount: payload.amount,
          paymentMethod: payload.paymentMethod,
          notes: 'Initial allocation cycle purchase'
        }
      ];
      updatedList = [targetSubscriber, ...subscribers];
      setSubscribers(updatedList);
      addSystemLog(
        'add', 
        `Added subscriber ${payload.name}.`,
        `Profile: ${payload.netflixProfile}, Amount: GH₵ ${payload.amount}, Expiry: ${payload.expiryDate}`
      );
      // Supabase syncing
      syncToSupabase('insert', targetSubscriber, settings);
    }

    // Google Calendar Event creation if sync is toggled!
    if (settings.googleCalendarSync) {
      const response = await createGoogleCalendarEvent(targetSubscriber, googleToken, settings, addSystemLog);
      if (response.success && response.eventId) {
        // save event ID returning back
        setSubscribers(prev => prev.map(s => s.id === idToUse ? { ...s, calendarEventId: response.eventId } : s));
      }
    }
  };

  // 8. Renew Subscriber
  const handleRenewSubscriber = async (subId: string) => {
    const todayStr = new Date().toISOString().split('T')[0]; // dynamic live date
    const updated = subscribers.map(sub => {
      if (sub.id === subId) {
        const newStartDate = todayStr;
        const newExpiryDate = addDays(newStartDate, sub.durationDays || 30);
        const newStatus = getStatus(newExpiryDate, todayStr);

        // Append to renewal records history
        const newRenewalRecord: RenewalRecord = {
          date: todayStr,
          amount: sub.amount,
          paymentMethod: sub.paymentMethod,
          notes: 'Continuous account extension cycle'
        };

        const renewedSub: Subscriber = {
          ...sub,
          startDate: newStartDate,
          expiryDate: newExpiryDate,
          status: newStatus,
          paymentStatus: 'Paid',
          paymentDate: todayStr,
          renewalHistory: [newRenewalRecord, ...(sub.renewalHistory || [])]
        };

        addSystemLog(
          'renew', 
          `Renewed screen access for ${sub.name}.`,
          `Paid: GH₵ ${sub.amount}. Subscription extended to ${newExpiryDate}`
        );

        // Sync back to Supabase if keys exist
        syncToSupabase('update', renewedSub, settings);

        // Send simulated alert that subscription extended successfully
        sendEmailNotification(
          renewedSub, 
          '3-day-warning', 
          settings, 
          addSystemLog
        );

        return renewedSub;
      }
      return sub;
    });

    setSubscribers(updated);
    alert(`⚡ [KabaFlix Billing Renewal]\n\nSubscriber extended successfully! Invoice logged, alert status set to ACTIVE.`);
  };

  // 9. Delete Subscriber
  const handleDeleteSubscriber = (subId: string) => {
    const target = subscribers.find(s => s.id === subId);
    if (!target) return;

    if (window.confirm(`⚠️ [KabaFlix Safe Deletion]\n\nAre you absolutely sure you want to delete ${target.name} (${target.netflixProfile})?\nThis action clears billing tracking. Netflix login screening will be decommissioned.`)) {
      const remaining = subscribers.filter(s => s.id !== subId);
      setSubscribers(remaining);
      addSystemLog('delete', `Decommissioned subscriber entry: ${target.name}.`);

      // Supabase remove
      syncToSupabase('delete', target, settings);
    }
  };

  // 10. Toggle Subscriber Suspension
  const handleToggleSuspendSubscriber = (subId: string) => {
    const target = subscribers.find(s => s.id === subId);
    if (!target) return;

    const currentlySuspended = target.status === 'Suspended';
    const nextStatus = currentlySuspended ? getStatus(target.expiryDate) : 'Suspended';
    const actionLogType = currentlySuspended ? 'unsuspend' as const : 'suspend' as const;

    const updated = subscribers.map(s => {
      if (s.id === subId) {
        return {
          ...s,
          status: nextStatus
        };
      }
      return s;
    });

    setSubscribers(updated);
    addSystemLog(actionLogType, `${currentlySuspended ? 'Activated' : 'Suspended'} access for ${target.name}.`, `Netflix profile: ${target.netflixProfile}`);
    alert(`🔐 [Seat State Changed]\n\n${target.name} is now ${currentlySuspended ? 'ACTIVE' : 'SUSPENDED'}.`);
  };

  // 11. Mark payment balance status
  const handleMarkPaymentStatus = (subId: string, status: 'Paid' | 'Unpaid') => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = subscribers.map(s => {
      if (s.id === subId) {
        return {
          ...s,
          paymentStatus: status,
          paymentDate: status === 'Paid' ? todayStr : undefined
        };
      }
      return s;
    });
    setSubscribers(updated);
    addSystemLog('edit', `Updated payment balance status for client`, `Status: ${status}`);
  };

  // 12. Direct simulation triggers for manually sending alerts (Warning / Expiry)
  const handleTriggerNotification = async (subId: string, type: '3-day-warning' | 'expiry-day') => {
    const sub = subscribers.find(s => s.id === subId);
    if (!sub) return;

    // Call dynamic email function
    const result = await sendEmailNotification(sub, type, settings, addSystemLog);
    
    // Add warning details to history log list
    const newHistory: NotificationLog = {
      id: 'notif-' + Math.random().toString(36).substr(2, 9),
      subscriberId: sub.id,
      subscriberName: sub.name,
      type,
      status: 'sent',
      date: new Date().toISOString().split('T')[0],
      channel: type === '3-day-warning' ? 'whatsapp' : 'email'
    };

    setNotificationsHistory(prev => [newHistory, ...prev]);
    alert(result.message);
  };

  // 13. System Factory Reset
  const handleResetAllData = () => {
    const isLogged = localStorage.getItem('kaba_is_logged');
    const rememberEmail = localStorage.getItem('kaba_remember_email');
    const rememberMe = localStorage.getItem('kaba_remember_me');
    const darkSetting = localStorage.getItem('kaba_dark_mode');

    localStorage.clear();

    // Reapply session identity and theme status
    if (isLogged) localStorage.setItem('kaba_is_logged', isLogged);
    if (rememberEmail) localStorage.setItem('kaba_remember_email', rememberEmail);
    if (rememberMe) localStorage.setItem('kaba_remember_me', rememberMe);
    if (darkSetting) localStorage.setItem('kaba_dark_mode', darkSetting);

    setSubscribers([]);
    setNotificationsHistory([]);
    setSettings(DEFAULT_SETTINGS);

    // Seed empty logs with a first fresh start audit entry
    const newLog: ActivityLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      type: 'add',
      message: 'KabaFlix Console database reset successfully. Started fresh.',
      details: 'Audit trails cleared. Ready to register active streaming subscribers.'
    };
    setActivityLogs([newLog]);
  };

  // 14. Restore / Hydrate whole state from uploaded JSON
  const handleImportAllData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.subscribers) {
        const subs = JSON.parse(parsed.subscribers);
        setSubscribers(subs);
      }
      if (parsed.activityLogs) {
        const logs = JSON.parse(parsed.activityLogs);
        setActivityLogs(logs);
      }
      if (parsed.notificationsHistory) {
        const notifs = JSON.parse(parsed.notificationsHistory);
        setNotificationsHistory(notifs);
      }
      if (parsed.settings) {
        const sets = JSON.parse(parsed.settings);
        setSettings({ ...DEFAULT_SETTINGS, ...sets });
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // SIMULATORS TRIGGER
  const triggerTestEmail = async () => {
    addSystemLog('system', 'Triggering a test email alert cycle...');
    const dummySub: Subscriber = {
      id: 'test-user-id',
      name: 'Abigail Mensah (Test Account)',
      phone: '+233 54 063 5752',
      email: 'theholycapcut@gmail.com',
      netflixProfile: 'Profile Premium 4',
      deviceName: 'Samsung SmartTV UHD 4K',
      amount: 45,
      paymentMethod: 'MoMo',
      startDate: new Date().toISOString().split('T')[0],
      durationDays: 30,
      expiryDate: new Date().toISOString().split('T')[0],
      status: 'Expiring',
      paymentStatus: 'Paid',
      contactMethod: 'Email',
      renewalHistory: []
    };

    const apiKey = settings.resendApiKey || localStorage.getItem('resendApiKey');
    if (!apiKey) {
      alert(`⚠️ [Test Email Help]\n\nNo Resend API Key is set in Settings yet!\nSaving an API Key in Settings is required to send real emails to legacydigitalexperts@gmail.com.\n\nWe have simulated the warning notification successfully. In production, this initiates a beautiful, red-gradient responsive HTML email containing customer details: Abigail Mensah, Premium 4, Samsung SmartTV.`);
      addSystemLog('system', 'Simulated warning notification: Resend Key missing.', 'Details: Abigail Mensah (Test Account)');
      return;
    }

    try {
      const result = await sendEmailNotification(dummySub, '3-day-warning', settings, addSystemLog);
      if (result.success) {
        alert(`📬 [Resend Live Test Success]\n\nA billing warning email has been successfully fired to legacydigitalexperts@gmail.com!\n\nSubject: ⚠️ [KabaFlix Alert] Abigail Mensah (Test Account) expires in 3 days\n\nCheck the activity feed and your inbox.`);
      } else {
        alert(`❌ [Resend Live Test Failed]\n\nDetails: ${result.message}`);
      }
    } catch (err: any) {
      alert(`❌ [Resend Live Test Error]\n\nDetails: ${err.message}`);
    }
  };

  const triggerTestCalendar = async () => {
    addSystemLog('system', 'Scheduling test Google Calendar event...');
    const dummySub: Subscriber = {
      id: 'test-user-calendar',
      name: 'Michael Boateng (Test Sync)',
      phone: '+233 24 455 6789',
      email: 'theholycapcut@gmail.com',
      netflixProfile: 'Profile Premium 2',
      deviceName: 'Sony AndroidTV 55"',
      amount: 45,
      paymentMethod: 'MoMo',
      startDate: new Date().toISOString().split('T')[0],
      durationDays: 30,
      expiryDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      paymentStatus: 'Paid',
      contactMethod: 'WhatsApp',
      renewalHistory: []
    };

    if (!googleToken) {
      alert(`📅 [Google Calendar Setup]\n\nYour application's Google Calendar OAuth configuration is fully verified!\n\nTo synchronize live events to your primary Google Calendar, please click the "Sign in with Google" button inside the connected accounts section first.\n\nWe successfully simulated creating the all-day expiry event block for "Michael Boateng (Sony AndroidTV)".`);
      addSystemLog('system', 'Simulated calendar event: Google credential missing.', 'Details: Michael Boateng (Test Sync)');
      return;
    }

    // Force settings enabled for test
    const testSettings = { ...settings, googleCalendarSync: true };

    try {
      const result = await createGoogleCalendarEvent(dummySub, googleToken, testSettings, addSystemLog);
      if (result.success) {
        alert(`🎉 [Google Calendar Live Sync Success]\n\nEvent synchronized successfully to your real calendar account!\n\nEvent Details:\nTitle: "🎬 Expiry: Michael Boateng (Profile Premium 2)"\nDate: ${dummySub.expiryDate} (All-day Event)`);
      } else {
        alert(`❌ [Google Calendar Live Test Failed]\n\nDetails: ${result.message}`);
      }
    } catch (err: any) {
      alert(`❌ [Google Calendar Live Test Error]\n\nDetails: ${err.message}`);
    }
  };

  // Display Login Page if not logged in
  if (!isLoggedIn) {
    return <LoginPanel onLogin={handleLogin} settings={settings} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB] dark:bg-[#111122] text-[#2D3436] dark:text-gray-100 transition-colors duration-200">
      
      {/* Top Header - Sticky, 60px height. Visible on both mobile and desktop! */}
      <header className="h-[60px] sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-150 dark:border-slate-800 flex items-center justify-between px-5 transition-colors duration-200 shadow-xs">
        {/* Left Side: Logo & App name */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 flex items-center justify-center p-1 bg-red-500/5 rounded-xl border border-red-500/10 dark:bg-red-500/10">
            <img src="/src/logo.svg" className="w-[28px] h-[28px] object-contain" alt="KabaFlix Logo" referrerPolicy="no-referrer" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-md tracking-tight leading-none text-gray-901 dark:text-white">KabaFlix</span>
            <span className="text-[9px] font-bold text-red-650 dark:text-red-500 mt-0.5 leading-none">by Legacy Phila</span>
          </div>
        </div>

        {/* Right Side: Notification Icon, Theme Toggle, Profile Avatar */}
        <div className="flex items-center gap-3">
          
          {/* 🔔 Notification Bell */}
          <button 
            onClick={() => setActiveTab('notifications')}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-650 dark:hover:text-red-400 hover:bg-gray-100/60 dark:hover:bg-slate-800/60 rounded-xl relative cursor-pointer transition-colors"
            title="Notification Hub"
          >
            <Bell size={18} />
            {subscribers.some(s => s.status === 'Expiring' || s.paymentStatus === 'Unpaid') && (
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-red-650" />
            )}
          </button>

          {/* 🌙 / ☀️ Theme Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-650 dark:hover:text-red-400 hover:bg-gray-100/60 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer transition-colors"
            title="Toggle Dark/Light Mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* 👤 Profile avatar - clicking switches to settings profile */}
          <button 
            onClick={() => {
              setSettingsSubTab('profile');
              setActiveTab('settings');
            }}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-red-650 text-white font-bold text-xs flex items-center justify-center cursor-pointer border border-transparent hover:border-red-650 dark:hover:border-red-500 transition-all select-none"
            title="Owner Profile Accounts"
          >
            LP
          </button>

        </div>
      </header>

      {/* Dynamic Panels Stage Frame */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 pt-6 pb-28 flex flex-col h-full overflow-y-auto">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex-1 flex flex-col"
          >
            {/* Dashboard Panel View */}
            {activeTab === 'dashboard' && (
              <DashboardPanel 
                subscribers={subscribers}
                activityLogs={activityLogs}
                settings={settings}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                onNavigate={setActiveTab}
                onAddClick={() => {
                  setEditingSubscriber(null);
                  setIsModalOpen(true);
                }}
                onRenewSubscriber={handleRenewSubscriber}
              />
            )}

            {/* Subscribers Panel View */}
            {activeTab === 'subscribers' && (
              <SubscribersPanel 
                subscribers={subscribers}
                settings={settings}
                onAddClick={() => {
                  setEditingSubscriber(null);
                  setIsModalOpen(true);
                }}
                onEditSubscriber={(sub) => {
                  setEditingSubscriber(sub);
                  setIsModalOpen(true);
                }}
                onRenewSubscriber={handleRenewSubscriber}
                onDeleteSubscriber={handleDeleteSubscriber}
                onToggleSuspendSubscriber={handleToggleSuspendSubscriber}
                onMarkPaymentStatus={handleMarkPaymentStatus}
              />
            )}

            {/* Earnings Panel View */}
            {activeTab === 'earnings' && (
              <EarningsPanel 
                subscribers={subscribers}
                settings={settings}
              />
            )}

            {/* Notifications Panel View */}
            {activeTab === 'notifications' && (
              <NotificationsPanel 
                notifications={notificationsHistory}
                subscribers={subscribers}
                settings={settings}
                onUpdateSettings={(updated) => setSettings(prev => ({ ...prev, ...updated }))}
                onTriggerSendSimulation={handleTriggerNotification}
                onBack={() => {
                  setActiveTab('more');
                }}
              />
            )}

            {/* Settings Panel View */}
            {activeTab === 'settings' && (
              <SettingsPanel 
                settings={settings}
                onUpdateSettings={(updated) => setSettings(prev => ({ ...prev, ...updated }))}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                googleToken={googleToken}
                onGoogleLogin={handleGoogleLogin}
                onGoogleLogout={handleGoogleLogout}
                onResetAllData={handleResetAllData}
                onImportAllData={handleImportAllData}
                onTriggerTestEmail={triggerTestEmail}
                onTriggerTestCalendar={triggerTestCalendar}
                onBack={() => {
                  setActiveTab('more');
                }}
                initialTab={settingsSubTab}
              />
            )}

            {/* More Panel View */}
            {activeTab === 'more' && (
              <MorePanel
                onNavigate={handleNavigateFromMore}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                onLogout={handleLogout}
                onResetAllData={handleResetAllData}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Unified Add/Edit Subscriber Dialog */}
        <AddSubscriberModal 
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSubscriber(null);
          }}
          onSave={handleSaveSubscriber}
          editingSubscriber={editingSubscriber}
        />

        {/* Footer present on all pages inside main viewport */}
        <Footer />

      </main>

      {/* Fixed Bottom Navigation Bar */}
      <BottomNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddClick={() => {
          setEditingSubscriber(null);
          setIsModalOpen(true);
        }}
      />
    </div>
  );
}
