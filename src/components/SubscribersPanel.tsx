/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  RefreshCcw, 
  Smartphone, 
  Phone, 
  Clock, 
  Mail,
  SlidersHorizontal,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Ban,
  DollarSign,
  AlertCircle,
  History,
  Check,
  ToggleLeft,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { Subscriber, AppSettings } from '../types';
import { getDaysRemaining, getStatus, getInitials, getWhatsAppLink, compileTemplate } from '../utils/data';

interface SubscribersPanelProps {
  subscribers: Subscriber[];
  settings: AppSettings;
  onAddClick: () => void;
  onEditSubscriber: (subscriber: Subscriber) => void;
  onRenewSubscriber: (subscriberId: string) => void;
  onDeleteSubscriber: (subscriberId: string) => void;
  onToggleSuspendSubscriber: (subscriberId: string) => void;
  onMarkPaymentStatus: (subscriberId: string, status: 'Paid' | 'Unpaid') => void;
}

export default function SubscribersPanel({
  subscribers,
  settings,
  onAddClick,
  onEditSubscriber,
  onRenewSubscriber,
  onDeleteSubscriber,
  onToggleSuspendSubscriber,
  onMarkPaymentStatus
}: SubscribersPanelProps) {
  const [filterTab, setFilterTab] = useState<'All' | 'Active' | 'Expiring' | 'Expired' | 'Suspended'>('All');
  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Paid' | 'Unpaid'>('All');
  const [methodFilter, setMethodFilter] = useState<'All' | 'MoMo' | 'Cash' | 'Bank Transfer'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'expiry' | 'amount' | 'name'>('expiry');
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);

  // Compute status on the fly
  const enrichedSubscribers = subscribers.map(s => {
    const daysLeft = getDaysRemaining(s.expiryDate);
    // Use manual suspension if they are suspended, else get dynamic status
    const calculatedStatus = s.status === 'Suspended' ? 'Suspended' : getStatus(s.expiryDate);
    return {
      ...s,
      daysLeft,
      calculatedStatus
    };
  });

  // Filter conditions
  const filteredSubscribers = enrichedSubscribers.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.netflixProfile.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery);

    const matchesStatus = 
      filterTab === 'All' || 
      (filterTab === 'Active' && s.calculatedStatus === 'Active') ||
      (filterTab === 'Expiring' && s.calculatedStatus === 'Expiring') ||
      (filterTab === 'Expired' && s.calculatedStatus === 'Expired') ||
      (filterTab === 'Suspended' && s.calculatedStatus === 'Suspended');

    const matchesPayment = 
      paymentFilter === 'All' || 
      s.paymentStatus === paymentFilter;

    const matchesMethod = 
      methodFilter === 'All' || 
      s.paymentMethod === methodFilter;

    return matchesSearch && matchesStatus && matchesPayment && matchesMethod;
  });

  // Sorting
  const sortedSubscribers = [...filteredSubscribers].sort((a, b) => {
    if (sortBy === 'expiry') {
      return a.daysLeft - b.daysLeft;
    }
    if (sortBy === 'amount') {
      return b.amount - a.amount;
    }
    return a.name.localeCompare(b.name);
  });

  // Count grids
  const countAll = enrichedSubscribers.length;
  const countActive = enrichedSubscribers.filter(s => s.calculatedStatus === 'Active').length;
  const countExpiring = enrichedSubscribers.filter(s => s.calculatedStatus === 'Expiring').length;
  const countExpired = enrichedSubscribers.filter(s => s.calculatedStatus === 'Expired').length;
  const countSuspended = enrichedSubscribers.filter(s => s.calculatedStatus === 'Suspended').length;

  return (
    <div className="space-y-6 animate-fade-in p-1 md:p-3 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Subscriber Directory
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Reconcile seat licenses, mark pending payments, review customer historic notes.
          </p>
        </div>

        <button
          id="add_new_subscriber_sub_btn"
          onClick={onAddClick}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-red-650 hover:bg-red-500 text-white font-bold rounded-2xl cursor-pointer shadow-lg shadow-red-500/10 active:scale-95 transition-all text-xs uppercase"
        >
          <Plus size={16} />
          <span>Add New Subscriber</span>
        </button>
      </div>

      {/* FILTER BUTTONS & QUICK CONTROLS */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] p-5 border border-gray-150 dark:border-slate-800 shadow-xs space-y-4">
        
        {/* Row 1: Status Tab Switches */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 bg-gray-50 dark:bg-slate-950 p-1 rounded-2xl">
            {([
              { key: 'All', count: countAll },
              { key: 'Active', count: countActive },
              { key: 'Expiring', count: countExpiring },
              { key: 'Expired', count: countExpired },
              { key: 'Suspended', count: countSuspended }
            ] as const).map(({ key, count }) => {
              const isActive = filterTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setFilterTab(key as any)}
                  className={`
                    px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer
                    ${isActive 
                      ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-xs border border-gray-200/40 dark:border-slate-700/60' 
                      : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <span>{key}</span>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-gray-150 dark:bg-slate-900 text-gray-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Sorting dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sort by:</span>
            <select
              className="px-3 py-1.5 bg-gray-50 dark:bg-slate-950 border-none rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="expiry">Term Expiry</option>
              <option value="amount">Amount High-Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        {/* Row 2: Secondary Advanced Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-gray-50 dark:border-slate-800/40">
          
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Filter names, profiles, devices, numbers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-950 border-none rounded-xl text-xs text-gray-800 dark:text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-red-500 transition-all font-medium"
            />
          </div>

          {/* Payment Status filter */}
          <div>
            <select
              className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border-none rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 outline-none"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
            >
              <option value="All">All Balance Statuses</option>
              <option value="Paid">Fully Paid (Settled)</option>
              <option value="Unpaid">Owed / Unpaid Balance</option>
            </select>
          </div>

          {/* Payment Method filter */}
          <div>
            <select
              className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border-none rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 outline-none"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as any)}
            >
              <option value="All">All Methods</option>
              <option value="MoMo">Mobile Money (MoMo)</option>
              <option value="Cash">Cash Ledger</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

        </div>
      </div>

      {/* DIRECTORY GRID CARDS */}
      {sortedSubscribers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[28px] p-12 text-center border border-dashed border-gray-150 dark:border-slate-800 flex flex-col items-center justify-center max-w-2xl mx-auto shadow-xs">
          <div className="w-14 h-14 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4 animate-pulse">
            <MessageSquare size={24} />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">No subscribers match criteria</h3>
          <p className="text-xs text-slate-400 mt-2 max-w-sm">
            Try resetting your advanced filters or search query to list active Ghana streaming seats.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSubscribers.map((sub) => {
            const initials = getInitials(sub.name);
            const daysLeft = sub.daysLeft;
            const status = sub.calculatedStatus;
            const isSuspended = status === 'Suspended';

            // Status colors Mapping
            let badgeStyle = '';
            let indicator = '';
            if (isSuspended) {
              badgeStyle = 'bg-gray-100 text-gray-500 dark:bg-slate-800 border border-gray-200/30';
              indicator = '⚪ Suspended';
            } else if (status === 'Active') {
              badgeStyle = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/10';
              indicator = '🟢 Active Screen';
            } else if (status === 'Expiring') {
              badgeStyle = 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-500/15';
              indicator = '🟡 Expiring soon';
            } else {
              badgeStyle = 'bg-red-50 text-red-700 dark:bg-red-500/5 dark:text-red-400 border border-red-500/10';
              indicator = '🔴 Expired Seat';
            }

            // Generate WhatsApp text according to Mode
            const templateMode = settings.preferredTemplateMode || 'friendly';
            let formattedTpl = settings.whatsappTemplate;
            if (templateMode === 'friendly') formattedTpl = settings.whatsappTemplateFriendly;
            else if (templateMode === 'formal') formattedTpl = settings.whatsappTemplateFormal;
            else if (templateMode === 'urgent') formattedTpl = settings.whatsappTemplateUrgent;

            const finalWhatsAppMsg = compileTemplate(formattedTpl, sub, daysLeft);

            const isNotesExpanded = expandedNotesId === sub.id;

            return (
              <div 
                key={sub.id}
                className={`bg-white dark:bg-slate-900 rounded-[24px] p-5 md:p-6 border transition-all flex flex-col justify-between ${
                  isSuspended 
                    ? 'border-gray-100 dark:border-slate-800/50 opacity-75' 
                    : 'border-gray-150/50 dark:border-slate-800 shadow-xs hover:shadow-md hover:translate-y-[-2.5px]'
                }`}
              >
                <div>
                  {/* Card Section Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg bg-gray-50 dark:bg-slate-850 flex items-center justify-center font-bold text-slate-800 dark:text-white text-xs">
                        {initials}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white max-w-[130px] truncate" title={sub.name}>
                          {sub.name}
                        </h4>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold block uppercase tracking-wider truncate max-w-[110px]">
                          {sub.netflixProfile}
                        </span>
                      </div>
                    </div>

                    {/* Expiry Badge */}
                    <div className={`px-2.5 py-0.5 rounded-full text-[9px] font-black shrink-0 ${badgeStyle}`}>
                      {isSuspended ? (
                        'SUSPENDED'
                      ) : daysLeft < 0 ? (
                        'EXPIRED'
                      ) : daysLeft === 0 ? (
                        'EXPIRES TODAY'
                      ) : (
                        `${daysLeft}d left`
                      )}
                    </div>
                  </div>

                  {/* Seat Detail properties */}
                  <div className="space-y-2.5 py-4 border-y border-gray-100/60 dark:border-slate-800/50 my-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                    
                    {/* Device Mapping */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 shrink-0">
                        <Smartphone size={13} className="text-gray-400" /> Device Model
                      </span>
                      <span className="text-gray-800 dark:text-slate-200 truncate max-w-[140px] font-bold" title={sub.deviceName}>
                        {sub.deviceName}
                      </span>
                    </div>

                    {/* Customer Phone Connection */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 shrink-0">
                        <Phone size={13} className="text-gray-400" /> Phone Info
                      </span>
                      <a 
                        href={`tel:${sub.phone}`} 
                        className="text-gray-800 dark:text-slate-200 font-mono font-bold hover:text-red-600 focus:underline"
                      >
                        {sub.phone}
                      </a>
                    </div>

                    {/* Accounting ledger properties */}
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-400">Ledger Bill</span>
                      <span className="text-gray-800 dark:text-white font-extrabold font-mono">
                        {settings.currency}{sub.amount} <span className="text-[9px] text-gray-400 font-normal">({sub.paymentMethod})</span>
                      </span>
                    </div>

                    {/* Balance Payment status tracker */}
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-400">Balance Status</span>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className={`px-2 py-0.5 rounded-full font-black uppercase text-[9px] ${
                          sub.paymentStatus === 'Paid' 
                            ? 'bg-green-150 text-green-700 dark:bg-green-500/10 dark:text-green-400' 
                            : 'bg-red-50 text-red-700 dark:bg-red-500/5 dark:text-red-400 animate-pulse'
                        }`}>
                          {sub.paymentStatus || 'Paid'}
                        </span>
                        
                        {/* Toggle Payment Balance Status */}
                        <button
                          onClick={() => {
                            const toggled = sub.paymentStatus === 'Paid' ? 'Unpaid' : 'Paid';
                            onMarkPaymentStatus(sub.id, toggled);
                          }}
                          className="text-[10px] text-red-650 hover:underline cursor-pointer"
                        >
                          Mark as {sub.paymentStatus === 'Paid' ? 'Owed' : 'Paid'}
                        </button>
                      </div>
                    </div>

                    {/* Date Mapping */}
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>Term Cycle</span>
                      <span className="font-mono">
                        {sub.startDate} → <span className="font-extrabold text-gray-600 dark:text-slate-200">{sub.expiryDate}</span>
                      </span>
                    </div>

                    {/* Indicator lines */}
                    <div className="text-[9px] font-extrabold tracking-uppercase text-gray-400 flex items-center justify-between select-none">
                      <span>Status indicator:</span>
                      <span>{indicator}</span>
                    </div>

                  </div>
                </div>

                {/* EXPANDABLE SECTION FOR CUSTOMER NOTES & RENEWAL HISTORY */}
                <div className="mb-4">
                  <button
                    onClick={() => {
                      setExpandedNotesId(isNotesExpanded ? null : sub.id);
                    }}
                    className="w-full flex items-center justify-between py-1.5 text-[11px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1">
                      <History size={11} />
                      <span>Preferences & Renewal History ({sub.renewalHistory?.length || 0})</span>
                    </span>
                    {isNotesExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  {isNotesExpanded && (
                    <div className="mt-2.5 p-3.5 bg-gray-50 dark:bg-slate-950 rounded-2xl space-y-3 border border-gray-100/50 dark:border-slate-800 text-xs animate-zoom-in">
                      {/* Customer Notes */}
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1">
                          Client Notes & Reference
                        </span>
                        <p className="text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-2.5 rounded-xl text-[11px] leading-relaxed break-words font-medium">
                          {sub.notes || 'No custom memo notes yet. Edit customer details to add transactions, references, etc.'}
                        </p>
                      </div>

                      {/* Renewal Records history list */}
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1">
                          Settled History Log
                        </span>
                        {(!sub.renewalHistory || sub.renewalHistory.length === 0) ? (
                          <span className="text-[10px] text-gray-400 italic block">No historical cycles recorded yet.</span>
                        ) : (
                          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                            {sub.renewalHistory.map((h, hIdx) => (
                              <div key={hIdx} className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-900 rounded-lg text-[10px] font-medium border border-gray-105">
                                <span className="font-mono text-gray-500">{h.date}</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                  +{settings.currency}{h.amount} <span className="text-[8px] text-gray-400">({h.paymentMethod})</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* CARD CTA ACTIONS CHANNELS */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-50 dark:border-slate-800/40">
                  {/* WhatsApp ping Deep Link */}
                  {!isSuspended ? (
                    <a
                      href={getWhatsAppLink(sub.phone, finalWhatsAppMsg)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 min-w-[75px] py-2 bg-[#25D366] hover:bg-[#20ba56] text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs text-center duration-150"
                      title="Send Expiry Alert via WhatsApp Web deep link"
                    >
                      <span>Ping WA</span>
                      <ExternalLink size={10} />
                    </a>
                  ) : (
                    <div className="flex-1 min-w-[75px] py-2 bg-gray-100 dark:bg-slate-800 text-gray-400 text-[11px] font-bold rounded-xl text-center select-none">
                      Suspended
                    </div>
                  )}

                  {/* Renew Action button */}
                  <button
                    onClick={() => onRenewSubscriber(sub.id)}
                    className="flex-1 min-w-[75px] py-2 bg-slate-950 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all duration-150"
                    title="Renew subscriber for another 30 day cycle"
                  >
                    <RefreshCcw size={10} />
                    <span>Renew</span>
                  </button>

                  {/* Suspension toggle */}
                  <button
                    onClick={() => onToggleSuspendSubscriber(sub.id)}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      isSuspended 
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-700' 
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-amber-500 dark:bg-slate-800 dark:hover:bg-slate-705'
                    }`}
                    title={isSuspended ? 'Unsuspend Subscriber Access' : 'Suspend Subscriber temporarily'}
                  >
                    <Ban size={12} />
                  </button>

                  {/* Edit button */}
                  <button
                    onClick={() => onEditSubscriber(sub)}
                    className="p-2 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
                    title="Edit Record Parameters"
                  >
                    <Edit3 size={12} />
                  </button>

                  {/* Detach / Delete row */}
                  <button
                    onClick={() => onDeleteSubscriber(sub.id)}
                    className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors cursor-pointer"
                    title="Remove Subscriber row completely with double audit checks"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Extreme back-to-top layout buffer floating button */}
      <button
        onClick={onAddClick}
        className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 flex items-center gap-2 p-4 bg-red-650 text-white rounded-full hover:bg-red-500 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-150 z-30 cursor-pointer"
        title="Add Subscriber Details"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
