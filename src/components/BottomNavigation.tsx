/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  House, 
  Users, 
  TrendingUp, 
  MoreHorizontal
} from 'lucide-react';

interface BottomNavigationProps {
  activeTab: 'dashboard' | 'subscribers' | 'earnings' | 'notifications' | 'settings' | 'more';
  setActiveTab: (tab: any) => void;
  onAddClick: () => void;
}

export default function BottomNavigation({ activeTab, setActiveTab, onAddClick }: BottomNavigationProps) {
  // Let's identify the active tab index for the slide indicators
  // Indices mapping:
  // 0: Home/Dashboard
  // 1: Subscribers
  // 2: ADD (special, non-index indicator)
  // 3: Earnings
  // 4: More (includes more, settings, notifications)
  
  const getActiveIndex = () => {
    switch (activeTab) {
      case 'dashboard':
        return 0;
      case 'subscribers':
        return 1;
      case 'earnings':
        return 3;
      case 'more':
      case 'settings':
      case 'notifications':
        return 4;
      default:
        return 0;
    }
  };

  const activeIndex = getActiveIndex();

  const handleTabClick = (tab: any, index: number) => {
    setActiveTab(tab);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-45 bg-white dark:bg-slate-900 border-t border-gray-150 dark:border-slate-800 rounded-t-[20px] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] h-[70px] sm:h-[80px] px-4 pb-safe transition-colors duration-200">
      <div className="max-w-xl mx-auto w-full grid grid-cols-5 h-full relative items-center">
        
        {/* Tab 1: HOME */}
        <button
          onClick={() => handleTabClick('dashboard', 0)}
          className="flex flex-col items-center justify-center h-full relative group cursor-pointer"
        >
          <div className="relative flex flex-col items-center">
            <House 
              size={24} 
              className={`transition-all duration-300 ${
                activeIndex === 0 
                  ? 'text-red-650 scale-110' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'
              }`} 
              fill={activeIndex === 0 ? 'currentColor' : 'none'}
              style={{ fillOpacity: activeIndex === 0 ? 0.15 : 0 }}
            />
            <span className={`text-[11px] sm:text-[12px] mt-1 transition-all duration-300 tracking-tight ${
              activeIndex === 0 ? 'text-red-650 font-bold' : 'text-gray-400 dark:text-gray-500 font-medium'
            }`}>
              Home
            </span>
            
            {activeIndex === 0 && (
              <motion.div
                layoutId="activeDot"
                className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-red-650"
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              />
            )}
          </div>
        </button>

        {/* Tab 2: SUBSCRIBERS */}
        <button
          onClick={() => handleTabClick('subscribers', 1)}
          className="flex flex-col items-center justify-center h-full relative group cursor-pointer"
        >
          <div className="relative flex flex-col items-center">
            <Users 
              size={24} 
              className={`transition-all duration-300 ${
                activeIndex === 1 
                  ? 'text-red-650 scale-110' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'
              }`} 
              fill={activeIndex === 1 ? 'currentColor' : 'none'}
              style={{ fillOpacity: activeIndex === 1 ? 0.15 : 0 }}
            />
            <span className={`text-[11px] sm:text-[12px] mt-1 transition-all duration-300 tracking-tight ${
              activeIndex === 1 ? 'text-red-650 font-bold' : 'text-gray-400 dark:text-gray-500 font-medium'
            }`}>
              Subscribers
            </span>

            {activeIndex === 1 && (
              <motion.div
                layoutId="activeDot"
                className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-red-650"
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              />
            )}
          </div>
        </button>

        {/* Tab 3: ADD (Center Special Floating Button) */}
        <div className="flex justify-center h-full relative">
          <div className="absolute -top-5 flex flex-col items-center">
            <button
              onClick={onAddClick}
              className="w-14 h-14 bg-gradient-to-br from-[#E50914] to-[#B91C1C] text-white rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(229,9,20,0.4)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              title="Add Subscriber"
            >
              <Plus size={28} strokeWidth={2.5} />
            </button>
            <span className="text-[11px] sm:text-[12px] mt-1.5 font-bold text-red-650 dark:text-red-500">
              Add
            </span>
          </div>
        </div>

        {/* Tab 4: EARNINGS */}
        <button
          onClick={() => handleTabClick('earnings', 3)}
          className="flex flex-col items-center justify-center h-full relative group cursor-pointer"
        >
          <div className="relative flex flex-col items-center">
            <TrendingUp 
              size={24} 
              className={`transition-all duration-300 ${
                activeIndex === 3 
                  ? 'text-red-650 scale-110' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'
              }`} 
            />
            <span className={`text-[11px] sm:text-[12px] mt-1 transition-all duration-300 tracking-tight ${
              activeIndex === 3 ? 'text-red-650 font-bold' : 'text-gray-400 dark:text-gray-500 font-medium'
            }`}>
              Earnings
            </span>

            {activeIndex === 3 && (
              <motion.div
                layoutId="activeDot"
                className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-red-650"
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              />
            )}
          </div>
        </button>

        {/* Tab 5: MORE */}
        <button
          onClick={() => handleTabClick('more', 4)}
          className="flex flex-col items-center justify-center h-full relative group cursor-pointer"
        >
          <div className="relative flex flex-col items-center">
            <MoreHorizontal 
              size={24} 
              className={`transition-all duration-300 ${
                activeIndex === 4 
                  ? 'text-red-650 scale-110' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'
              }`} 
            />
            <span className={`text-[11px] sm:text-[12px] mt-1 transition-all duration-300 tracking-tight ${
              activeIndex === 4 ? 'text-red-650 font-bold' : 'text-gray-400 dark:text-gray-500 font-medium'
            }`}>
              More
            </span>

            {activeIndex === 4 && (
              <motion.div
                layoutId="activeDot"
                className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-red-650"
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              />
            )}
          </div>
        </button>

      </div>
    </div>
  );
}
