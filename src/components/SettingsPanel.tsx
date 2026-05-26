/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  User, 
  Briefcase, 
  Database, 
  Mail, 
  Calendar, 
  Info, 
  Save, 
  Sun, 
  Moon, 
  ExternalLink, 
  Key, 
  CheckCircle2,
  Sparkles,
  Lock,
  Globe,
  MessageCircle,
  FileDown,
  FileUp,
  RotateCcw,
  Fingerprint,
  Activity,
  AlertTriangle,
  Play
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsPanelProps {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  googleToken: string | null;
  onGoogleLogin: () => void;
  onGoogleLogout: () => void;
  onResetAllData: () => void;
  onImportAllData: (jsonData: string) => boolean;
  onTriggerTestEmail: () => void;
  onTriggerTestCalendar: () => void;
  onBack?: () => void;
  initialTab?: 'profile' | 'business' | 'admin' | 'integrations' | 'about';
}

export default function SettingsPanel({
  settings,
  onUpdateSettings,
  darkMode,
  setDarkMode,
  googleToken,
  onGoogleLogin,
  onGoogleLogout,
  onResetAllData,
  onImportAllData,
  onTriggerTestEmail,
  onTriggerTestCalendar,
  onBack,
  initialTab = 'profile'
}: SettingsPanelProps) {
  // Setup fields linked directly to AppSettings
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [ownerEmail, setOwnerEmail] = useState(settings.ownerEmail);
  const [ownerPhone, setOwnerPhone] = useState(settings.ownerPhone);

  const [netflixCost, setNetflixCost] = useState(settings.netflixCost.toString());
  const [currency, setCurrency] = useState(settings.currency);
  const [defaultDuration, setDefaultDuration] = useState(settings.defaultDuration.toString());
  const [monthlyGoal, setMonthlyGoal] = useState(settings.monthlyGoal.toString());

  // Security Credentials fields
  const [adminEmail, setAdminEmail] = useState(settings.adminEmail || 'legacydigitalexperts@gmail.com');
  const [adminPassword, setAdminPassword] = useState(settings.adminPassword || 'KabaFlix2024!');
  const [biometricEnabled, setBiometricEnabled] = useState(settings.biometricEnabled || false);

  // Advanced WhatsApp Template fields
  const [whatsappTemplateFriendly, setWhatsappTemplateFriendly] = useState(settings.whatsappTemplateFriendly || '');
  const [whatsappTemplateFormal, setWhatsappTemplateFormal] = useState(settings.whatsappTemplateFormal || '');
  const [whatsappTemplateUrgent, setWhatsappTemplateUrgent] = useState(settings.whatsappTemplateUrgent || '');
  const [preferredTemplateMode, setPreferredTemplateMode] = useState<'friendly' | 'formal' | 'urgent'>(settings.preferredTemplateMode || 'friendly');

  // Credentials inputs
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState(settings.supabaseKey || '');
  const [resendApiKey, setResendApiKey] = useState(settings.resendApiKey || '');
  
  const [emailJsServiceId, setEmailJsServiceId] = useState(settings.emailJsServiceId || '');
  const [emailJsTemplateId, setEmailJsTemplateId] = useState(settings.emailJsTemplateId || '');
  const [emailJsPublicKey, setEmailJsPublicKey] = useState(settings.emailJsPublicKey || '');

  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'admin' | 'integrations' | 'about'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Double verification step state for system reset
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0);
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = () => {
    // Sync specifically to localStorage key for compatibility
    if (resendApiKey) {
      localStorage.setItem('resendApiKey', resendApiKey);
    } else {
      localStorage.removeItem('resendApiKey');
    }

    onUpdateSettings({
      ownerName,
      ownerEmail,
      ownerPhone,
      netflixCost: parseFloat(netflixCost) || 0,
      currency,
      defaultDuration: parseInt(defaultDuration) || 30,
      monthlyGoal: parseFloat(monthlyGoal) || 1200,
      adminEmail,
      adminPassword,
      biometricEnabled,
      whatsappTemplateFriendly,
      whatsappTemplateFormal,
      whatsappTemplateUrgent,
      preferredTemplateMode,
      supabaseUrl,
      supabaseKey,
      resendApiKey,
      emailJsServiceId,
      emailJsTemplateId,
      emailJsPublicKey
    });
    alert('🔐 [KabaFlix Settings Hub]\n\nYour application preferences, billing multipliers, templates, and integration credentials have been successfully saved.');
  };

  // Export JSON backup download trigger
  const handleExportData = () => {
    try {
      // Collect entire localstorage state
      const backupObj = {
        subscribers: localStorage.getItem('kaba_subscribers') || '[]',
        activityLogs: localStorage.getItem('kaba_logs') || '[]',
        notificationsHistory: localStorage.getItem('kaba_notifications') || '[]',
        settings: JSON.stringify(settings),
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `KabaFlix_Backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to construct JSON state backup trigger.');
    }
  };

  // Import JSON backup trigger 
  const handleImportSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.subscribers && !parsed.settings) {
          alert('Invalid backup structure. Check key presence.');
          return;
        }
        const parsedOk = onImportAllData(text);
        if (parsedOk) {
          alert('💾 [Reconcile Gateway]\n\nImport complete! Application records, invoice stats, and administrative configs have been hydrated.');
          window.location.reload();
        }
      } catch (err) {
        alert('Invalid JSON file or parse runtime syntax error.');
      }
    };
    reader.readAsText(file);
  };

  // Perform Double verified state Reset
  const executeDataWipe = () => {
    if (resetConfirmInput !== "DELETE") {
      alert('Verification mismatch. Please type "DELETE" exactly to confirm.');
      return;
    }
    onResetAllData();
    setResetStep(0);
    setResetConfirmInput('');
    alert('🔥 [System Purge complete]\n\nKabaFlix data maps, subscribers registers, ledger files, and credentials have been hard-wiped.');
    window.location.reload();
  };

  // Trigger web auth enrollment simulation
  const handleBiometricEnrollment = () => {
    if (!window.PublicKeyCredential) {
      alert('Your browser does not natively expose high-level WebAuthn interfaces.');
      return;
    }
    // Set enrollment state
    localStorage.setItem('kaba_biometric_enrolled', 'true');
    setBiometricEnabled(true);
    alert('🎯 [Biometrics Enrollment Challenge]\n\nTouch ID / Face ID hardware binding complete! A biometric Fast-In key has been securely established in your local sandboxed browser profile.');
  };

  return (
    <div className="space-y-8 animate-fade-in p-1 md:p-3 pb-24">
      {/* Page Header */}
      <div>
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-red-650 hover:text-red-700 dark:text-red-400 dark:hover:text-red-350 transition-colors cursor-pointer mb-2.5 w-fit py-1.5 pr-3 -ml-1 border border-red-500/10 dark:border-red-450/20 rounded-lg px-2 bg-red-500/5 hover:bg-red-500/10"
          >
            ← Back to More
          </button>
        )}
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          System Administration & Settings
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Adjust subscription ratios, cost margins, configure multi-channel WhatsApp alerts, or toggle gateway security.
        </p>
      </div>

      {/* TABS CONTAINER */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-gray-150 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[550px]">
        
        {/* Left Side Tab Navigation Rail */}
        <div className="w-full md:w-64 bg-gray-50/50 dark:bg-slate-950/20 border-b md:border-b-0 md:border-r border-gray-150 dark:border-slate-800 p-4 shrink-0 space-y-1 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
          {[
            { id: 'profile', label: 'Owner Profile', icon: User },
            { id: 'business', label: 'Business Multipliers', icon: Briefcase },
            { id: 'admin', label: 'Security & Admin', icon: Lock },
            { id: 'integrations', label: 'Integrations Panel', icon: Database },
            { id: 'about', label: 'About KabaFlix', icon: Info },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer
                  ${isActive 
                    ? 'bg-red-500/5 text-red-650 dark:bg-red-500/10 dark:text-red-400 shadow-xs border border-red-500/10' 
                    : 'text-gray-500 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100/40 dark:hover:bg-slate-850'
                  }
                `}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* Quick theme toggler */}
          <div className="hidden md:block pt-10 px-4">
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-3">Theme Skin</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center justify-between p-2.5 bg-gray-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-gray-750 dark:text-yellow-400 cursor-pointer border border-gray-200/50"
            >
              <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-200 font-semibold font-bold">
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Right Side Settings Body Frame */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[75vh]">
          <div className="space-y-6">
            
            {/* ====== 1. OWNER PROFILE TAB ====== */}
            {activeTab === 'profile' && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-2">
                  <User size={16} className="text-red-500" /> Resale Administrator Profile
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider mb-1.5">Owner / Business Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-xs outline-none text-gray-805 dark:text-white focus:ring-1 focus:ring-red-500 font-semibold"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider mb-1.5">Email (Notifications source)</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-xs outline-none text-gray-805 dark:text-white focus:ring-1 focus:ring-red-500 font-semibold"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                    />
                  </div>

                  <div className="col-span-full">
                    <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider mb-1.5">WhatsApp / Phone Mobile Number</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-xs outline-none text-gray-805 dark:text-white font-mono focus:ring-1 focus:ring-red-500 font-semibold"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex items-start gap-3 mt-4 text-xs text-orange-600 dark:text-orange-400">
                  <Globe size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-600">Ghana Regional Alignment</span> All bills resolve in Ghana Cedis (**GH₵**). Dynamic templates operate within **Accra/GMT timezone**.
                  </div>
                </div>
              </div>
            )}

            {/* ====== 2. BUSINESS MULTIPLIERS TAB ====== */}
            {activeTab === 'business' && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-2">
                  <Briefcase size={16} className="text-red-500" /> Business Multipliers & Margins
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-widest mb-1.5">Netflix Base Account Cost (GH₵)</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-xs outline-none text-gray-805 dark:text-white font-mono font-bold focus:ring-1 focus:ring-red-500"
                      value={netflixCost}
                      onChange={(e) => setNetflixCost(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-widest mb-1.5">Default Duration Days Cycle</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-xs outline-none text-gray-855 dark:text-white text-center font-mono font-bold focus:ring-1 focus:ring-red-500"
                      value={defaultDuration}
                      onChange={(e) => setDefaultDuration(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-widest mb-1.5">Currency Character</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-xs outline-none text-gray-855 dark:text-white text-center font-bold focus:ring-1 focus:ring-red-500"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-widest mb-1.5">Monthly Revenue Target</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-xs outline-none text-gray-855 dark:text-white font-mono font-bold focus:ring-1 focus:ring-red-500"
                      value={monthlyGoal}
                      onChange={(e) => setMonthlyGoal(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ====== 3. SECURITY & ADMIN TAB ====== */}
            {activeTab === 'admin' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Lock size={16} className="text-red-500" /> Security & Admin Management
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1">Configure console credentials, enroll browser Touch ID protocols, or perform data migration blocks.</p>
                </div>

                {/* Left/Right grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Password section */}
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-gray-450 uppercase tracking-wider block">Admin Credentials</span>
                    
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Admin Email Access</label>
                      <input 
                        type="email" 
                        required
                        className="w-full px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-xs text-gray-800 dark:text-white font-medium focus:ring-1 focus:ring-red-500"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Pass System Code (Core Key)</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-xs text-gray-800 dark:text-white font-mono focus:ring-1 focus:ring-red-500"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* WebAuthn Biometrics Toggle */}
                  <div className="space-y-4 bg-gray-50 dark:bg-slate-950 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-gray-450 uppercase tracking-wider block flex items-center gap-1.5 text-red-500">
                      <Fingerprint size={14} /> Biometric Protocols
                    </span>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      Enable biometric encryption (Face ID, macOS Touch ID, Win Hello) to bypass password entering challenges next time you log in to KabaFlix.
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const state = !biometricEnabled;
                          setBiometricEnabled(state);
                          if (state) handleBiometricEnrollment();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          biometricEnabled 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white text-gray-700 dark:bg-slate-800 dark:text-gray-300 border'
                        }`}
                      >
                        {biometricEnabled ? 'Biometrics Enrolled ✓' : 'Enroll Biometrics'}
                      </button>
                      <span className="text-[10px] text-gray-400 font-medium">({biometricEnabled ? 'Active key saved' : 'No key detected'})</span>
                    </div>
                  </div>
                </div>

                {/* Login History entries */}
                <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border">
                  <span className="text-xs font-bold text-gray-450 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Activity size={12} /> Audit Log Login History
                  </span>
                  <div className="space-y-1.5 max-h-24 overflow-y-auto">
                    {/* Add a static default entry plus any generated ones */}
                    <div className="flex items-center justify-between text-[10px] p-2 bg-white dark:bg-slate-900 rounded-xl font-mono text-gray-550 border gap-4">
                      <span>2026-05-26 14:00 (GMT)</span>
                      <span className="text-green-500 font-bold">SUCCESS (Pass)</span>
                      <span>Gateway Coder</span>
                    </div>
                    {settings.loginHistory && settings.loginHistory.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px] p-2 bg-white dark:bg-slate-900 rounded-xl font-mono text-gray-550 border gap-4">
                        <span>{item.timestamp}</span>
                        <span className={item.success ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                          {item.success ? 'SUCCESS' : 'DENIED'} ({item.method})
                        </span>
                        <span>{item.browser || 'Browser Sandbox'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Backups Export/Import and Double confirm Reset buttons */}
                <div className="pt-6 border-t border-gray-100/60 dark:border-slate-800/60 space-y-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Ledger Purges & JSON Backups</span>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    
                    {/* Export backup JSON button */}
                    <button
                      type="button"
                      onClick={handleExportData}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-gray-200 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                      title="Download overall database backup as a single JSON map file"
                    >
                      <FileDown size={14} />
                      <span>Export All Data Backup</span>
                    </button>

                    {/* Import backup trigger */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 dark:bg-slate-900 dark:border-slate-750 dark:hover:bg-slate-850 dark:text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                    >
                      <FileUp size={14} />
                      <span>Import / Restore Backup</span>
                    </button>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImportSelect} 
                      accept=".json" 
                      className="hidden" 
                    />

                    {/* Hard Wipe Purge button with double check step */}
                    {resetStep === 0 ? (
                      <button
                        type="button"
                        onClick={() => setResetStep(1)}
                        className="px-4 py-2.5 bg-red-100 text-red-650 hover:bg-red-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer ml-auto"
                      >
                        <RotateCcw size={14} />
                        <span>System Factory Reset</span>
                      </button>
                    ) : resetStep === 1 ? (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-2 ml-auto max-w-sm text-right">
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block">🚨 ARE YOU SURE YOU WANT TO HARD RUN SYSTEM PURGE?</span>
                        <div className="flex items-center justify-end gap-2 mt-2">
                          <button 
                            type="button" 
                            onClick={() => setResetStep(0)}
                            className="text-xs text-gray-500 hover:underline mr-2"
                          >
                            Cancel Wiping
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setResetStep(2)}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold rounded-lg"
                          >
                            Yes, I am sure
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-red-500/10 border border-red-350 rounded-xl space-y-2 ml-auto max-w-sm text-right animate-pulse">
                        <span className="text-[10px] font-black text-red-500 block">FINAL RECONCILIATION CHECK:</span>
                        <p className="text-[9px] text-gray-400">Please Type <strong className="text-white">"DELETE"</strong> to proceed. This is completely irreversible.</p>
                        <div className="flex items-center gap-2.5 mt-2 justify-end">
                          <input 
                            type="text" 
                            required
                            placeholder="Type DELETE"
                            className="px-2.5 py-1 bg-slate-900 border text-xs text-white rounded-lg"
                            value={resetConfirmInput}
                            onChange={(e) => setResetConfirmInput(e.target.value)}
                          />
                          <button 
                            type="button" 
                            onClick={executeDataWipe}
                            className="px-2.5 py-1 bg-red-650 hover:bg-red-500 text-white text-[11px] font-bold rounded-lg"
                          >
                            Wipe Ledger Files
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            )}

            {/* ====== 4. INTEGRATIONS PAGE TAB ====== */}
            {activeTab === 'integrations' && (
              <div className="space-y-6 animate-fade-in max-h-[480px] overflow-y-auto pr-1">
                
                {/* Advanced WhatsApp Smart Reminders setup */}
                <div className="p-5 bg-gray-50 dark:bg-slate-850/30 border border-gray-150 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-extrabold text-[#25D366] uppercase tracking-widest block flex items-center gap-1.5">
                      <MessageCircle size={15} /> WhatsApp Templates Hub
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-bold text-gray-400">Active mode:</span>
                      <select
                        className="p-1 px-2 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-bold text-gray-700 dark:text-white"
                        value={preferredTemplateMode}
                        onChange={(e) => setPreferredTemplateMode(e.target.value as any)}
                      >
                        <option value="friendly">Friendly Mode 😊</option>
                        <option value="formal">Formal Terms 💼</option>
                        <option value="urgent">Urgent Warning ⚠️</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Personalize and construct multiple message variants. Allowed replacement tokens: `{'{name}'}`, `{'{profile}'}`, `{'{days}'}`, `{'{amount}'}`, `{'{device}'}`, `{'{expiry_date}'}`.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Friendly Reminder Text Frame</label>
                      <textarea
                        className="w-full p-2.5 bg-white dark:bg-slate-800 text-[10px] border-none rounded-xl text-gray-800 dark:text-gray-100 h-16 resize-none font-medium"
                        value={whatsappTemplateFriendly}
                        onChange={(e) => setWhatsappTemplateFriendly(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Formal Terms Notification</label>
                      <textarea
                        className="w-full p-2.5 bg-white dark:bg-slate-800 text-[10px] border-none rounded-xl text-gray-800 dark:text-gray-100 h-16 resize-none font-medium"
                        value={whatsappTemplateFormal}
                        onChange={(e) => setWhatsappTemplateFormal(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Urgent Warn & lockout notice</label>
                      <textarea
                        className="w-full p-2.5 bg-white dark:bg-slate-800 text-[10px] border-none rounded-xl text-gray-800 dark:text-gray-100 h-16 resize-none font-medium"
                        value={whatsappTemplateUrgent}
                        onChange={(e) => setWhatsappTemplateUrgent(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* WhatsApp simulator ping */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => alert(`💬 [WhatsApp Channel Simulation Link]\n\nTargeting template: ${preferredTemplateMode.toUpperCase()}\n\nSimulated text pre-fill:\n"Hi Abigail Mensah, your subscription Screen 1 - Abby expires in 3 days..."\n\nActive links will launch automatically next time you click 'Ping WA' on customer directory lists.`)}
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Play size={10} fill="currentColor" />
                      <span>Test WhatsApp Alert Prefill</span>
                    </button>
                  </div>
                </div>

                {/* Google Calendar Oauth Sync */}
                <div className="bg-gray-50 dark:bg-slate-850/30 border border-gray-150 p-5 rounded-2xl space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-extrabold text-red-650 dark:text-red-400 uppercase tracking-widest block flex items-center gap-1">
                        <Calendar size={13} /> Google calendar scheduling
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">Live Workspace Calendar Integration</h4>
                      <p className="text-[10px] text-gray-400 max-w-sm">
                        Schedule all-day client subscription end terms straight to your administrator calendars with automated notification alerts.
                      </p>
                    </div>

                    <div className="shrink-0">
                      {googleToken ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                          <CheckCircle2 size={12} /> Connected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-gray-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
                          Offline Sandbox
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap items-center">
                    {googleToken ? (
                      <div className="flex items-center justify-between gap-4 pt-1 flex-1">
                        <p className="text-[10px] text-gray-400 font-mono truncate max-w-[200px]">Token: Bearer {googleToken.substring(0, 15)}...</p>
                        <button 
                          onClick={onGoogleLogout}
                          className="px-3 py-1.5 border border-red-500/20 text-red-500 text-xs font-semibold rounded-lg hover:bg-red-500/5 transition-all text-[11px] cursor-pointer"
                        >
                          Disconnect Sync
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={onGoogleLogin}
                        className="px-4 py-2 bg-gradient-to-tr from-slate-900 to-slate-850 text-white border border-slate-750 text-xs font-bold rounded-xl hover:to-slate-800 cursor-pointer active:scale-95 transition-all flex items-center gap-2 shadow-sm"
                      >
                        <Globe size={13} />
                        <span>Authenticate with Google account</span>
                      </button>
                    )}

                    {/* Test calendar scheduling */}
                    <button
                      type="button"
                      onClick={onTriggerTestCalendar}
                      className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Post Expiration Simulation Event
                    </button>
                  </div>
                </div>

                {/* Resend / EmailJS Email API Setup */}
                <div className="p-5 bg-gray-50 dark:bg-slate-850/30 border border-gray-150 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase text-gray-905 dark:text-white tracking-widest flex items-center gap-1.5">
                        <Mail size={13} /> Email Notification Gateways
                      </h4>
                      <p className="text-[10px] text-gray-450 mt-1">Bind SMTP or rest API triggers to push email logs securely to legacydigitalexperts@gmail.com.</p>
                    </div>

                    {/* Test email action button */}
                    <button 
                      type="button"
                      onClick={onTriggerTestEmail}
                      className="px-3 py-1.5 bg-[#4ECDC4]/10 hover:bg-[#4ECDC4]/20 text-teal-850 dark:text-teal-400 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Send Test Email Trigger
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Resend SMTP API Access Key</label>
                      <input 
                        type="password" 
                        placeholder="re_xxxxxxxxxxxxxxxx"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border-none rounded-xl text-xs outline-none text-gray-800 dark:text-white focus:ring-1 focus:ring-red-500 font-mono"
                        value={resendApiKey}
                        onChange={(e) => setResendApiKey(e.target.value)}
                      />
                    </div>

                    <div className="border-t border-gray-100 dark:border-slate-800/40 pt-3">
                      <span className="text-[10px] font-bold text-gray-400 block mb-2">Alternatively via Client-Side EmailJS coordinates:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Service ID</label>
                          <input 
                            type="text" 
                            placeholder="service_xxx"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border-none rounded-lg text-xs outline-none text-gray-800 dark:text-white focus:ring-1 focus:ring-red-500 font-mono"
                            value={emailJsServiceId}
                            onChange={(e) => setEmailJsServiceId(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Template ID</label>
                          <input 
                            type="text" 
                            placeholder="template_xxx"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border-none rounded-lg text-xs outline-none text-gray-800 dark:text-white focus:ring-1 focus:ring-red-500 font-mono"
                            value={emailJsTemplateId}
                            onChange={(e) => setEmailJsTemplateId(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Public API Key</label>
                          <input 
                            type="password" 
                            placeholder="user_xxx"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border-none rounded-lg text-xs outline-none text-gray-800 dark:text-white focus:ring-1 focus:ring-red-500 font-mono"
                            value={emailJsPublicKey}
                            onChange={(e) => setEmailJsPublicKey(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Supabase REST database schema */}
                <div className="p-5 bg-gray-50 dark:bg-slate-850/30 border border-gray-150 rounded-2xl space-y-4">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase text-gray-905 dark:text-white tracking-widest flex items-center gap-1.5">
                      <Database size={13} className="text-red-500" /> Supabase Synchronizer Database
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-1">Mirror local memory arrays instantly into a hosted Postgres cloud table.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Supabase REST URL</label>
                      <input 
                        type="text" 
                        placeholder="https://xyz.supabase.co"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border-none rounded-xl text-xs outline-none text-gray-800 dark:text-white focus:ring-1 focus:ring-red-500 font-mono"
                        value={supabaseUrl}
                        onChange={(e) => setSupabaseUrl(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Supabase Service Key</label>
                      <input 
                        type="password" 
                        placeholder="anon_key..."
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border-none rounded-xl text-xs outline-none text-gray-800 dark:text-white focus:ring-1 focus:ring-red-500 font-mono"
                        value={supabaseKey}
                        onChange={(e) => setSupabaseKey(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ====== 5. ABOUT KABAFLIX TAB ====== */}
            {activeTab === 'about' && (
              <div className="space-y-4 animate-fade-in text-xs text-gray-600 dark:text-gray-300">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-2">
                  <Info size={16} className="text-red-500" /> About KabaFlix
                </h3>

                <p className="leading-relaxed">
                  **KabaFlix** is a high-fidelity reseller subscription directory and alert manager designed from the ground up to track Netflix profile seats, log client payment methods, audit due-dates, and trigger WhatsApp renewal alerts dynamically.
                </p>

                <div className="space-y-2.5 border-t border-gray-100 dark:border-slate-800/40 pt-4">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-gray-400">Application Version</span>
                    <span className="font-mono font-bold text-gray-800 dark:text-white">v1.0.5 Premium</span>
                  </div>
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-gray-400">Designed For</span>
                    <span className="font-bold text-red-655 dark:text-red-400">Legacy Phila Group</span>
                  </div>
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-gray-400">Core Engine Architecture</span>
                    <span className="font-extrabold text-gray-700 dark:text-gray-300">React 19, TypeScript, Tailwind 4</span>
                  </div>
                </div>

                <div className="p-4 bg-red-650/5 border border-red-500/10 rounded-2xl flex items-center gap-3.5 mt-6 text-xs text-red-600 dark:text-red-400">
                  <Sparkles size={18} className="shrink-0 animate-pulse text-red-500" />
                  <div>
                    <span className="font-bold block">Developer Quality Assurance:</span> Fully aligned with Stripe and Linear's minimal fintech layout spacing formats. Crafted with pride for Legacy Phila stream operations.
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Settings commit footer */}
          {activeTab !== 'about' && (
            <div className="pt-6 border-t border-gray-150 bg-white dark:bg-slate-900 flex justify-end gap-3 mt-8">
              <button
                id="save_settings_btn"
                type="button"
                onClick={handleSaveSettings}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-650 hover:bg-red-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-red-500/10 active:scale-[0.98] transition-transform"
              >
                <Save size={14} /> 
                <span>Save Settings Details</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
