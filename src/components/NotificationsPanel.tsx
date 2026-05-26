/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Bell, 
  Settings, 
  MessageSquare, 
  Mail, 
  Calendar, 
  Smartphone, 
  CheckCircle2, 
  Save, 
  AlertTriangle,
  Send,
  Loader2
} from 'lucide-react';
import { NotificationLog, Subscriber, AppSettings } from '../types';

interface NotificationsPanelProps {
  notifications: NotificationLog[];
  subscribers: Subscriber[];
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onTriggerSendSimulation: (subId: string, type: '3-day-warning' | 'expiry-day') => void;
  onBack?: () => void;
}

export default function NotificationsPanel({
  notifications,
  subscribers,
  settings,
  onUpdateSettings,
  onTriggerSendSimulation,
  onBack
}: NotificationsPanelProps) {
  // Local state for template alteration
  const [whatsappTemplate, setWhatsappTemplate] = useState(settings.whatsappTemplate);
  const [emailEnabled, setEmailEnabled] = useState(settings.enableEmailNotif);
  const [daysBefore, setDaysBefore] = useState(settings.daysBeforeExpiry);
  const [calendarSync, setCalendarSync] = useState(settings.googleCalendarSync);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const handleSavePreferences = () => {
    onUpdateSettings({
      whatsappTemplate,
      enableEmailNotif: emailEnabled,
      daysBeforeExpiry: Number(daysBefore),
      googleCalendarSync: calendarSync
    });
    alert('✅ [KabaFlix Alert Center]\n\nYour message template preferences, expiry triggers, and email sync states have been securely committed.');
  };

  const handleSendTest = (subId: string, type: '3-day-warning' | 'expiry-day') => {
    setSendingId(subId + '-' + type);
    setTimeout(() => {
      onTriggerSendSimulation(subId, type);
      setSendingId(null);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-fade-in p-1 md:p-3">
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
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Alert Triggers & Reminders
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure automated email, WhatsApp, and Google Calendar expirations matching Legacy Phila's templates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Dynamic Preference Toggles - Col Span 2 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Controls card */}
          <div className="bg-white dark:bg-slate-900 rounded-[20px] p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-md font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings size={18} className="text-red-500" /> Reminder Preference Control
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Enable alerts toggle */}
              <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-slate-800/40 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-gray-800 dark:text-white block">Email Alerts via API</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Automate email dispatch to legacydigitalexperts@gmail.com</span>
                </div>
                <input 
                  type="checkbox"
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer mt-1"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                />
              </div>

              {/* Google Calendar Toggle */}
              <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-slate-800/40 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-gray-800 dark:text-white block">Google Calendar Sync</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Post an all-day event automatically for new sales</span>
                </div>
                <input 
                  type="checkbox"
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer mt-1"
                  checked={calendarSync}
                  onChange={(e) => setCalendarSync(e.target.checked)}
                />
              </div>

              {/* Days before alert dropdown */}
              <div className="col-span-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 dark:bg-slate-800/40 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-gray-800 dark:text-white block">Early Warning Timeline</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Days before expiry to issue the warning notice</span>
                </div>
                <select 
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 text-xs font-semibold rounded-lg text-gray-700 dark:text-white border-none outline-none focus:ring-1 focus:ring-red-500"
                  value={daysBefore}
                  onChange={(e) => setDaysBefore(Number(e.target.value))}
                >
                  <option value="1">1 day prior</option>
                  <option value="2">2 days prior</option>
                  <option value="3">3 days prior (Recommended)</option>
                  <option value="5">5 days prior</option>
                  <option value="7">7 days prior</option>
                </select>
              </div>
            </div>

            {/* Template editing Textarea */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                WhatsApp Dynamic Reminder Draft (Deep Link)
              </label>
              <textarea
                className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-xs text-gray-800 dark:text-white font-medium outline-none h-28 focus:ring-1 focus:ring-red-500 transition-all font-mono"
                value={whatsappTemplate}
                onChange={(e) => setWhatsappTemplate(e.target.value)}
              />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-400 font-bold">
                <span>Available macros:</span>
                <span className="text-red-500 font-extrabold">&#123;name&#125;</span>
                <span className="text-red-500 font-extrabold">&#123;profile&#125;</span>
                <span className="text-red-500 font-extrabold">&#123;days&#125;</span>
                <span className="text-red-500 font-extrabold">&#123;expiry_date&#125;</span>
              </div>
            </div>

            <button
              onClick={handleSavePreferences}
              className="flex items-center gap-2 px-4 py-2 bg-red-650 hover:bg-red-500 text-white font-bold rounded-xl text-xs cursor-pointer ml-auto transition-transform active:scale-[0.98] shadow-sm"
            >
              <Save size={14} /> Commit Alert Rules
            </button>
          </div>

          {/* Test Simulation Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-[20px] p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-md font-bold text-gray-900 dark:text-white">Simulate Alert Expirations</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Force trigger live alerts to verify Email template delivery & WhatsApp hooks</p>
            </div>

            <div className="divide-y divide-gray-50 dark:divide-slate-800/40 text-xs">
              {subscribers.slice(0, 3).map((sub) => (
                <div key={sub.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-gray-800 dark:text-white block">{sub.name}</span>
                    <span className="text-[10px] text-gray-400 block">{sub.netflixProfile} • Expiry: {sub.expiryDate}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Send 3 days warning */}
                    <button
                      disabled={sendingId === `${sub.id}-3-day-warning`}
                      onClick={() => handleSendTest(sub.id, '3-day-warning')}
                      className="px-2.5 py-1.5 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {sendingId === `${sub.id}-3-day-warning` ? (
                        <Loader2 className="animate-spin" size={12} />
                      ) : (
                        <Send size={10} />
                      )}
                      <span>3-day Warning</span>
                    </button>

                    {/* Send expiry day */}
                    <button
                      disabled={sendingId === `${sub.id}-expiry-day`}
                      onClick={() => handleSendTest(sub.id, 'expiry-day')}
                      className="px-2.5 py-1.5 bg-red-650 text-white font-semibold rounded-lg hover:bg-red-500 text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {sendingId === `${sub.id}-expiry-day` ? (
                        <Loader2 className="animate-spin" size={12} />
                      ) : (
                        <Send size={10} />
                      )}
                      <span>Expiry Day</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Alerts History Log - Col Span 1 */}
        <div className="bg-white dark:bg-slate-900 rounded-[20px] p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-md font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <Bell size={16} className="text-amber-500" /> Dispatch Registry
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-6 font-medium">Auto-recorded chronological timeline of sent notifications</p>

          <div className="flex-1 space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400 dark:text-gray-500">No dispatch history logs registered yet.</div>
            ) : (
              notifications.map((notif) => {
                const isWarning = notif.type === '3-day-warning';
                return (
                  <div key={notif.id} className="p-3 bg-gray-50 dark:bg-slate-800/40 rounded-xl space-y-1 border border-gray-100/50 dark:border-slate-800/20">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        isWarning 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-550/20 dark:text-red-350'
                      }`}>
                        {isWarning ? '3-day Pre-warning' : 'Expiry Day Alert'}
                      </span>
                      <span className="text-gray-400 block shrink-0">{notif.date}</span>
                    </div>

                    <p className="text-xs font-bold text-gray-900 dark:text-white mt-1.5">
                      Recipient: <span className="underline">{notif.subscriberName}</span>
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold pt-1">
                      <span className="flex items-center gap-1 uppercase">
                        {notif.channel === 'email' ? <Mail size={10} /> : <MessageSquare size={10} />} {notif.channel} Gateway
                      </span>
                      <span className="text-green-500 flex items-center gap-0.5 font-extrabold uppercase text-[9px]">
                        <CheckCircle2 size={10} /> SUCCESS
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
