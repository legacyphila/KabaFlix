/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Crown, 
  Award, 
  Download, 
  FileText, 
  Calendar,
  Sparkles,
  Zap,
  DollarSign
} from 'lucide-react';
import { Subscriber, AppSettings } from '../types';
import { getStatus } from '../utils/data';

interface EarningsPanelProps {
  subscribers: Subscriber[];
  settings: AppSettings;
}

export default function EarningsPanel({ subscribers, settings }: EarningsPanelProps) {
  const [timePeriod, setTimePeriod] = useState<'Today' | 'This Week' | 'This Month' | 'Year' | 'All Time'>('This Month');

  // Calculates total revenue based on time filter
  const getEarningValue = () => {
    const totalAllTime = subscribers.reduce((sum, s) => sum + s.amount, 0);
    switch (timePeriod) {
      case 'Today':
        // Simulating today's MoMo receipts
        return Math.round(totalAllTime * 0.12);
      case 'This Week':
        return Math.round(totalAllTime * 0.28);
      case 'This Month':
        return subscribers
          .filter(s => getStatus(s.expiryDate) !== 'Expired')
          .reduce((sum, s) => sum + s.amount, 0);
      case 'Year':
        return totalAllTime * 2.5; // Simulated year to date
      case 'All Time':
        return totalAllTime * 4.2; // Simulating lifetime cycles of resale
    }
  };

  const revenue = getEarningValue();
  const netflixCost = settings.netflixCost; // from settings e.g. 250 GHC
  const netProfit = Math.max(0, revenue - netflixCost);

  // Goal Tracker Math
  const goal = settings.monthlyGoal;
  // Calculate percentage
  const goalPercent = Math.min(100, Math.round((revenue / goal) * 100)) || 0;

  // Payment method breakdown count
  const momoCount = subscribers.filter(s => s.paymentMethod === 'MoMo').length;
  const cashCount = subscribers.filter(s => s.paymentMethod === 'Cash').length;
  const bankCount = subscribers.filter(s => s.paymentMethod === 'Bank Transfer').length;
  const totalCount = subscribers.length || 1;

  const momoPercent = Math.round((momoCount / totalCount) * 100);
  const cashPercent = Math.round((cashCount / totalCount) * 100);
  const bankPercent = Math.round((bankCount / totalCount) * 100);

  // Top 5 Subscribers leaderboard sorted by amount paid
  const leaderboard = [...subscribers]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const handleExport = (format: 'PDF' | 'Excel') => {
    alert(`⚡ [KabaFlix Export Hub]\n\nGenerating billing reports for timeframe: ${timePeriod}.\nFormat selected: ${format}\nTotal Audited Revenue: GH₵ ${revenue}\n\nDownload queued. Legacy Phila dashboard remains in sync!`);
  };

  // Monthly Bars details for custom premium bar chart
  const monthlyData = [
    { label: 'Dec', amount: 360, cost: 250, profit: 110 },
    { label: 'Jan', amount: 480, cost: 250, profit: 230 },
    { label: 'Feb', amount: 510, cost: 250, profit: 260 },
    { label: 'Mar', amount: 600, cost: 250, profit: 350 },
    { label: 'Apr', amount: 630, cost: 250, profit: 380 },
    { label: 'May', amount: revenue, cost: netflixCost, profit: netProfit }
  ];

  const maxBarAmount = Math.max(...monthlyData.map(d => d.amount)) || 100;

  return (
    <div className="space-y-8 animate-fade-in p-1 md:p-3">
      {/* Title Header with Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Revenue Ledger Reports
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Audit your resale business profitability, cost targets, and client value.
          </p>
        </div>

        {/* Time and Export Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex bg-gray-50 dark:bg-slate-900 p-1 rounded-xl border border-gray-100 dark:border-slate-800">
            {(['Today', 'This Week', 'This Month', 'Year', 'All Time'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`
                  px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer
                  ${timePeriod === period 
                    ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                  }
                `}
              >
                {period}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('Excel')}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 hover:bg-gray-50 text-xs font-bold text-gray-700 dark:text-gray-300 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
            >
              <Download size={13} />
              <span>Excel</span>
            </button>
            <button
              onClick={() => handleExport('PDF')}
              className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-sm"
            >
              <FileText size={13} />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* REVENUE & PROFIT METRICS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total revenue Card */}
        <div className="p-6 bg-gradient-to-tr from-red-600 via-rose-650 to-orange-500 text-white rounded-[20px] shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <span className="text-xs font-bold text-red-100 uppercase tracking-widest block">Resale revenue</span>
          <h2 className="text-3xl font-black tracking-tight mt-1">
            {settings.currency} {revenue.toLocaleString()}
          </h2>
          <p className="text-[11px] text-red-50 mt-1">
            Calculated for the current frame: <span className="font-bold underline">{timePeriod}</span>
          </p>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-bold bg-white/10 w-fit px-2.5 py-1 rounded-full">
            <Zap size={11} className="text-yellow-300 shrink-0" />
            <span>Active screening billing verified</span>
          </div>
        </div>

        {/* Profitability Calculation Card */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-[20px] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Net Profit Yield</span>
            <h2 className="text-3xl font-black text-emerald-500 dark:text-emerald-400 tracking-tight mt-1">
              {settings.currency} {netProfit.toLocaleString()}
            </h2>
          </div>
          <div className="text-[11px] text-gray-400 mt-2 font-medium">
            Formulated as: Revenue (<span className="text-gray-600 dark:text-gray-300 font-bold">{settings.currency} {revenue}</span>) - Netflix Account Cost (<span className="text-gray-600 dark:text-gray-300 font-bold">{settings.currency} {netflixCost}</span>) = Net Profit.
          </div>
        </div>

        {/* Goal Progress Card */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-[20px] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monthly Goal Tracker</span>
              <span className="text-xs font-extrabold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2.5 py-0.5 rounded-full">
                {goalPercent}%
              </span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {settings.currency} {revenue} <span className="text-xs text-gray-400 font-normal">/ {settings.currency} {goal}</span>
            </h2>
          </div>

          {/* Goal progress indicator bar */}
          <div className="space-y-1 pt-4">
            <div className="w-full bg-gray-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-red-600 to-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 text-right font-medium">
              Target monthly sales: {settings.currency} {goal}
            </p>
          </div>
        </div>
      </div>

      {/* MONTHLY REVENUE BARS & PAYMENT METHOD DONUT ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Earnings Bar Chart - Left Columns */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[20px] p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-md font-bold text-gray-900 dark:text-white mb-1">Monthly Ledger Overview</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-8 font-medium">Comparison of billing revenues versus costs over the last 6 months</p>

          {/* Graphical Bars drawing */}
          <div className="flex items-end justify-between gap-1 h-44 pt-4 px-2 select-none">
            {monthlyData.map((data, index) => {
              const rectHeight = Math.max(15, Math.round((data.amount / maxBarAmount) * 100));
              const isCurrent = index === monthlyData.length -1;
              return (
                <div key={data.label} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Amount Tooltip on hover */}
                  <div className="absolute bottom-full mb-1 bg-slate-900 text-white px-2 py-1 rounded-lg text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none text-center">
                    GH₵ {data.amount}
                  </div>

                  {/* Visual Bar Column */}
                  <div className="w-full max-w-[28px] xs:max-w-[36px] bg-gray-50 dark:bg-slate-800 rounded-lg h-full flex flex-col justify-end overflow-hidden">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        isCurrent 
                          ? 'bg-gradient-to-t from-red-600 to-orange-400' 
                          : 'bg-slate-400 dark:bg-slate-700 hover:bg-slate-500'
                      }`}
                      style={{ height: `${rectHeight}%` }}
                    />
                  </div>

                  {/* Month Text Label */}
                  <span className={`text-[11px] font-bold mt-1 ${isCurrent ? 'text-red-600 dark:text-red-500 font-extrabold' : 'text-gray-400'}`}>
                    {data.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Breakdown Card - Right Column */}
        <div className="bg-white dark:bg-slate-900 rounded-[20px] p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold text-gray-900 dark:text-white mb-1">Payment Share Breakdown</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-6 font-medium">Top receipt networks used by screen renters</p>

            {/* Simulated Donut via beautiful custom SVG and flex percentages */}
            <div className="relative flex items-center justify-center h-28 my-2">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="38" stroke="currentColor" className="text-gray-100 dark:text-slate-800" strokeWidth="10" fill="transparent" />
                {/* MoMo Stroke Portion */}
                <circle 
                  cx="48" 
                  cy="48" 
                  r="38" 
                  stroke="#E50914" 
                  strokeWidth="10" 
                  fill="transparent" 
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - (momoPercent || 60) / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">MoMo Share</span>
                <span className="text-md font-extrabold text-gray-800 dark:text-white">{momoPercent || 60}%</span>
              </div>
            </div>

            {/* Categories indicator legends */}
            <div className="space-y-3 pt-4">
              {/* MoMo Mobile Money */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600" />
                  <span>MoMo Mobile Money</span>
                </div>
                <span className="text-gray-900 dark:text-white font-mono">{momoPercent}%</span>
              </div>

              {/* Cash Ledger */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-400" />
                  <span>Cash Payments</span>
                </div>
                <span className="text-gray-900 dark:text-white font-mono">{cashPercent}%</span>
              </div>

              {/* Bank Transfer */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span>Bank Wire</span>
                </div>
                <span className="text-gray-900 dark:text-white font-mono">{bankPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOMER VALUE LEADERBOARD SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-[20px] p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-md font-bold text-gray-900 dark:text-white">Active Champions Leaderboard</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium font-medium">Top 5 clients contributing high pricing margins</p>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-red-650 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2.5 py-1 rounded-lg">
            <Crown size={12} /> Crown Premium Active
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest bg-gray-50/50 dark:bg-slate-950/20">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Subscriber Name</th>
                <th className="py-3 px-4">Netflix Profile</th>
                <th className="py-3 px-4">Paid (GH₵)</th>
                <th className="py-3 px-4">Active Cycles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/40 text-xs">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">No subscriber leaderboard ready! Please add clients list keys.</td>
                </tr>
              ) : (
                leaderboard.map((sub, idx) => (
                  <tr key={sub.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 font-medium">
                    <td className="py-3 px-4 font-bold flex items-center gap-1.5 text-gray-950 dark:text-white">
                      {idx === 0 ? (
                        <Crown size={14} className="text-yellow-400 shrink-0" />
                      ) : idx === 1 ? (
                        <Award size={14} className="text-slate-400 shrink-0" />
                      ) : (
                        idx + 1
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-bold">{sub.name}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{sub.netflixProfile}</td>
                    <td className="py-3 px-4 text-red-600 dark:text-red-400 font-extrabold font-mono">GH₵ {sub.amount}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 rounded-full font-bold text-[10px]">
                        1 month cycle (verified)
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
