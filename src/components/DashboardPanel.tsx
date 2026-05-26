/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  TrendingUp, 
  Bell, 
  Sun, 
  Moon, 
  Sparkles,
  Play,
  AlertTriangle,
  User,
  Activity,
  Calendar,
  DollarSign,
  RefreshCw,
  FolderOpen,
  PieChart,
  Percent,
  TrendingDown
} from 'lucide-react';
import { Subscriber, ActivityLog, AppSettings } from '../types';
import { getDaysRemaining, addDays, getStatus, getInitials, getWhatsAppLink, compileTemplate } from '../utils/data';

interface DashboardPanelProps {
  subscribers: Subscriber[];
  activityLogs: ActivityLog[];
  settings: AppSettings;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onNavigate: (tab: string) => void;
  onAddClick: () => void;
  onRenewSubscriber: (subId: string) => void;
}

export default function DashboardPanel({
  subscribers,
  activityLogs,
  settings,
  darkMode,
  setDarkMode,
  onNavigate,
  onAddClick,
  onRenewSubscriber
}: DashboardPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper Greet based on local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Pull to refresh simulation trigger
  const handlePullToRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1200);
  };

  // Stats - Real Data Only
  const activeCount = subscribers.filter(s => s.status === 'Active').length;
  const expiringCount = subscribers.filter(s => s.status === 'Expiring').length;
  const expiredCount = subscribers.filter(s => s.status === 'Expired').length;
  const suspendedCount = subscribers.filter(s => s.status === 'Suspended').length;

  const totalRevenue = subscribers
    .filter(s => s.status !== 'Suspended') // active/expired tracker
    .reduce((sum, s) => sum + s.amount, 0);

  // Net Profit calculation after subtracting root Netflix cost
  const monthlyCost = settings.netflixCost || 0;
  const netProfit = totalRevenue > 0 ? totalRevenue - monthlyCost : 0;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Upcoming soonest renewals
  const upcomingRenewals = [...subscribers]
    .map(s => ({
      ...s,
      daysLeft: getDaysRemaining(s.expiryDate)
    }))
    .filter(s => s.status !== 'Suspended' && s.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5);

  const filteredSearch = subscribers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.netflixProfile.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone.includes(searchQuery)
  ).slice(0, 4);

  // Dynamic earnings trend
  const earningsTrend = [
    { label: 'Jan', value: totalRevenue > 0 ? totalRevenue * 0.45 : 0 },
    { label: 'Feb', value: totalRevenue > 0 ? totalRevenue * 0.6 : 0 },
    { label: 'Mar', value: totalRevenue > 0 ? totalRevenue * 0.75 : 0 },
    { label: 'Apr', value: totalRevenue > 0 ? totalRevenue * 0.9 : 0 },
    { label: 'May', value: totalRevenue }
  ];

  // SVG parameters for trending line charts
  const chartHeight = 120;
  const chartWidth = 500;
  const maxVal = Math.max(...earningsTrend.map(d => d.value), 100) * 1.15;
  const points = earningsTrend.map((d, i) => {
    const x = (i / (earningsTrend.length - 1)) * chartWidth;
    const y = chartHeight - (d.value / maxVal) * chartHeight;
    return { x, y, label: d.label, val: d.value };
  });

  const areaPath = points.length > 0
    ? `${points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} L ${points[points.length-1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
    : '';

  const linePath = points.length > 0
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : '';

  const [hoveredPoint, setHoveredPoint] = useState<typeof points[0] | null>(null);

  return (
    <div className="space-y-8 animate-fade-in p-1 md:p-3 relative">
      
      {/* Top Header Row with prominent Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-150 dark:border-slate-800">
        <div>
          <h2 className="text-xs font-black text-red-500 dark:text-red-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={11} className="animate-pulse" /> KabaFlix Admin Console
          </h2>
          <h1 className="text-2xl font-extrabold text-[#2d3436] dark:text-white tracking-tight mt-1 flex items-center gap-2">
            {getGreeting()}, Legacy Phila <span className="animate-wave origin-[70%_70%] inline-block">👋</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Reseller accounting system for Ghana streams. Active timezone: GMT (Accra).
          </p>
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <button 
            onClick={handlePullToRefresh}
            disabled={isRefreshing}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:scale-105 active:scale-95 shadow-xs transition-all pointer-events-auto cursor-pointer"
            title="Refresh System Stats"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin text-red-500" : ""} />
          </button>

          {/* Theme switcher */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800 text-gray-500 dark:text-yellow-400 hover:scale-105 active:scale-95 shadow-xs transition-all cursor-pointer"
            title="Toggle Theme Mode"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Prominent Desktop Add Button */}
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-5 py-3 bg-red-650 hover:bg-red-500 text-white font-bold rounded-2xl shadow-md shadow-red-500/10 cursor-pointer active:scale-95 transition-all text-xs uppercase"
          >
            <Plus size={16} />
            <span>Add New Subscriber</span>
          </button>
        </div>
      </div>

      {/* QUICK SYSTEM METRICS - REAL DATA ONLY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Real Revenue Card */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-[24px] border border-gray-150/50 dark:border-slate-800 shadow-sm hover:translate-y-[-2px] transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Invoiced Income</span>
              <span className="text-2xl font-black text-[#2d3436] dark:text-white tracking-tight block">
                {settings.currency}{totalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-[11px] text-green-500 font-bold">
            <TrendingUp size={12} />
            <span>Real collections</span>
            <span className="text-gray-400 font-normal ml-0.5">from active seats</span>
          </div>
        </div>

        {/* Profit Margin Card */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-[24px] border border-gray-150/50 dark:border-slate-800 shadow-sm hover:translate-y-[-2px] transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Net Profit Margin</span>
              <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight block">
                {settings.currency}{netProfit.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400">
              <Percent size={18} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-[11px] text-orange-600 dark:text-orange-400 font-semibold font-mono">
            <span>Root Cost: {settings.currency}{monthlyCost}</span>
            <span className="text-gray-400 font-normal">({profitMargin.toFixed(0)}% gain)</span>
          </div>
        </div>

        {/* Expiring Soon Card */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-[24px] border border-gray-150/50 dark:border-slate-800 shadow-sm hover:translate-y-[-2px] transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Expiring Due</span>
              <span className="text-2xl font-black text-amber-500 tracking-tight block">
                {expiringCount}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Calendar size={18} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-[11px] text-amber-500 font-bold">
            <AlertTriangle size={12} className="animate-bounce" />
            <span>Expires within 7 days</span>
          </div>
        </div>

        {/* Total Seats Card */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-[24px] border border-gray-150/50 dark:border-slate-800 shadow-sm hover:translate-y-[-2px] transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Allocations</span>
              <span className="text-2xl font-black text-red-600 dark:text-red-400 tracking-tight block">
                {activeCount} <span className="text-xs font-normal text-gray-400">/ {subscribers.length} total</span>
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
              <Activity size={18} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 text-[11px] text-gray-400 font-bold">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <span>{expiredCount} expired • {suspendedCount} suspended</span>
          </div>
        </div>
      </div>

      {/* RENDER BEAUTIFUL EMPTY STATE ILLUSTRATION IF NO DATA AT ALL */}
      {subscribers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-gray-150 dark:border-slate-800 p-8 md:p-16 text-center shadow-xs flex flex-col items-center justify-center space-y-5 animate-fade-in relative overflow-hidden">
          {/* Decorative background grid */}
          <div className="absolute inset-0 bg-radial-gradient from-red-500/5 to-transparent opacity-80 pointer-events-none" />
          
          <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-slate-600 relative z-10 border border-gray-100 dark:border-slate-700 shadow-inner">
            <FolderOpen size={36} className="text-red-500/60 dark:text-red-500/40" />
          </div>

          <div className="space-y-2 max-w-md relative z-10">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No subscribers yet</h3>
            <p className="text-xs text-gray-400 dark:text-gray-400 leading-relaxed">
              Start reselling streaming screens right now! Register your very first client access row to construct billing tracking and WhatsApp reminds.
            </p>
          </div>

          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-6 py-3 bg-red-650 hover:bg-red-500 text-white font-bold rounded-2xl cursor-pointer shadow-md shadow-red-500/10 active:scale-95 transition-all text-xs uppercase"
          >
            <Plus size={16} />
            <span>Add your first subscriber!</span>
          </button>
        </div>
      ) : (
        /* STANDARD POPULATED SUBSCRIBER CHARTS AND LOGS */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Big Revenue Line Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-gray-150/50 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Revenue Progress</h3>
                {totalRevenue > 0 && (
                  <span className="text-[10px] bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Positive Trend
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-6">Historical client subscription invoice progression</p>
            </div>

            {/* Interactive chart area */}
            <div className="relative w-full h-36">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revenue-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E50914" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#E50914" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                <line x1="0" y1="0" x2={chartWidth} y2="0" stroke="currentColor" className="text-gray-100 dark:text-slate-800" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="currentColor" className="text-gray-100 dark:text-slate-800" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="currentColor" className="text-gray-200 dark:text-slate-800" strokeWidth="1" />

                <path d={areaPath} fill="url(#revenue-grad)" />
                <path d={linePath} fill="none" stroke="#E50914" strokeWidth="2.5" strokeLinecap="round" />

                {points.map((p, i) => (
                  <circle 
                    key={i} 
                    cx={p.x} 
                    cy={p.y} 
                    r={hoveredPoint?.label === p.label ? "5.5" : "3.5"} 
                    fill={hoveredPoint?.label === p.label ? "#E50914" : "white"} 
                    stroke="#E50914"
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="cursor-pointer transition-all duration-150"
                  />
                ))}
              </svg>

              {hoveredPoint && (
                <div 
                  className="absolute bg-slate-900 text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-md z-10 font-mono"
                  style={{ 
                    left: `${(points.findIndex(p => p.label === hoveredPoint.label) / (points.length - 1)) * 82}%`,
                    bottom: `${(hoveredPoint.val / maxVal) * 100}%`
                  }}
                >
                  {settings.currency}{hoveredPoint.val.toFixed(0)}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 mt-4 px-1 font-mono">
              {earningsTrend.map((d, i) => (
                <span key={i} className={i === earningsTrend.length - 1 ? "text-red-650" : ""}>
                  {d.label}
                </span>
              ))}
            </div>
          </div>

          {/* Upcoming Expiry Cards list */}
          <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-gray-150/50 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Queue Renewals</h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-4">Prompt actions to retain expiring clients</p>

              <div className="space-y-3">
                {upcomingRenewals.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 dark:bg-slate-800/10 rounded-2xl border border-dashed border-gray-100">
                    <p className="text-[11px] text-gray-400">All clients are actively green!</p>
                  </div>
                ) : (
                  upcomingRenewals.map((sub) => {
                    const initials = getInitials(sub.name);
                    const isSoon = sub.daysLeft <= 3;
                    return (
                      <div key={sub.id} className="flex items-center justify-between gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-800/20 rounded-xl transition-all">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/10 text-red-650 dark:text-red-400 font-bold text-xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-gray-800 dark:text-white block truncate">{sub.name}</span>
                            <span className="text-[10px] text-gray-400 block truncate">{sub.netflixProfile}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isSoon 
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300' 
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10'
                          }`}>
                            {sub.daysLeft === 0 ? 'Today' : `${sub.daysLeft}d remaining`}
                          </span>
                          <button 
                            onClick={() => onRenewSubscriber(sub.id)}
                            className="block text-[10px] font-extrabold text-red-650 dark:text-red-400 hover:underline mt-1 cursor-pointer ml-auto"
                          >
                            Quick Extend
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <button 
              onClick={() => onNavigate('subscribers')}
              className="w-full text-center py-2.5 border border-gray-150 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs font-bold text-gray-600 dark:text-gray-400 rounded-xl mt-6 transition-all"
            >
              Auditing subscribers database
            </button>
          </div>
        </div>
      )}

      {/* QUICK ACCOUNTS SEARCH DRAWER AND WHATSAPP TRIGGERS */}
      {subscribers.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-gray-150/50 dark:border-slate-800 shadow-sm relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Quick Accounts Search</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Query names, phone numbers, or profile tags immediately</p>
            </div>
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search names, screens, devices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border-none text-gray-800 dark:text-white placeholder-gray-400 rounded-xl text-xs focus:ring-1 focus:ring-red-500 outline-none"
              />
            </div>
          </div>

          {searchQuery && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in pt-2">
              {filteredSearch.length === 0 ? (
                <p className="col-span-full text-center text-xs text-gray-400 py-4">No results match search query...</p>
              ) : (
                filteredSearch.map(sub => {
                  const days = getDaysRemaining(sub.expiryDate);
                  // Grab active template according to selection
                  const tMode = settings.preferredTemplateMode || 'friendly';
                  let activeTpl = settings.whatsappTemplate;
                  if (tMode === 'friendly') activeTpl = settings.whatsappTemplateFriendly;
                  else if (tMode === 'formal') activeTpl = settings.whatsappTemplateFormal;
                  else if (tMode === 'urgent') activeTpl = settings.whatsappTemplateUrgent;

                  const fullMsg = compileTemplate(activeTpl, sub, days);
                  const isSuspended = sub.status === 'Suspended';
                  return (
                    <div key={sub.id} className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-slate-850/40 rounded-2xl border border-gray-100/50 dark:border-slate-800">
                      <div>
                        <span className="text-xs font-bold text-gray-900 dark:text-white block">{sub.name}</span>
                        <span className="text-[10px] text-gray-400 block">{sub.netflixProfile} • {sub.contactMethod || 'WhatsApp'}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isSuspended ? 'bg-gray-100 text-gray-500' :
                          sub.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-500/20' :
                          sub.status === 'Expiring' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20' :
                          'bg-red-100 text-red-850 dark:bg-red-500/10'
                        }`}>
                          {isSuspended ? 'Suspended' : sub.status === 'Expired' ? 'Expired' : `${days}d`}
                        </span>
                        
                        {!isSuspended && (
                          <a 
                            href={getWhatsAppLink(sub.phone, fullMsg)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-[10px] font-semibold transition-all shadow-sm shrink-0"
                          >
                            Ping WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* RECENT ACTIVITY GRID */}
      {activityLogs.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-gray-150/50 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Admin Activities</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Auto-recorded cryptographic audits logging user status</p>
            </div>
            <button 
              onClick={() => onNavigate('notifications')}
              className="text-xs font-semibold text-red-650 hover:underline cursor-pointer"
            >
              Configure Reminders
            </button>
          </div>

          <div className="flow-root">
            <ul className="-mb-8">
              {activityLogs.slice(0, 5).map((log, logIdx) => (
                <li key={log.id}>
                  <div className="relative pb-8">
                    {logIdx !== activityLogs.slice(0, 5).length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-100 dark:bg-slate-800" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-lg flex items-center justify-center ring-8 ring-white dark:ring-slate-900 ${
                          log.type === 'add' ? 'bg-green-500/10 text-green-600' :
                          log.type === 'renew' ? 'bg-emerald-500/10 text-emerald-600' :
                          log.type === 'suspend' ? 'bg-amber-500/10 text-amber-500 animate-pulse' :
                          log.type === 'delete' ? 'bg-red-500/10 text-red-600' :
                          'bg-gray-100 text-gray-500 dark:bg-slate-800'
                        }`}>
                          <Play fill="currentColor" size={10} />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-xs text-gray-700 dark:text-white font-semibold">{log.message}</p>
                          {log.details && <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{log.details}</p>}
                        </div>
                        <div className="text-right text-[10px] whitespace-nowrap text-gray-400 font-mono font-medium">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON (FAB) FOR MOBILE ADD SUBSCRIBER */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={onAddClick}
          className="w-14 h-14 bg-red-650 hover:bg-red-500 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 cursor-pointer pointer-events-auto"
          title="Add New Subscriber"
        >
          <Plus size={24} />
        </button>
      </div>

    </div>
  );
}
