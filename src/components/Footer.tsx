/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto py-8 px-6 border-t border-gray-100 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div>
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Need an app like this? Contact Legacy Phila
          </h4>
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <a 
              href="mailto:legacydigitalexperts@gmail.com" 
              className="hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <Mail size={12} /> legacydigitalexperts@gmail.com
            </a>
            <span className="hidden md:inline text-gray-300 dark:text-gray-700">|</span>
            <a 
              href="tel:+233540635752" 
              className="hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <Phone size={12} /> +233 54 063 5752
            </a>
          </div>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 md:text-right">
          © 2024 KabaFlix by Legacy Phila
        </p>
      </div>
    </footer>
  );
}
