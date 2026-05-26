/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Subscriber, ActivityLog, NotificationLog, AppSettings } from '../types';

// Helper to format/add days to a date string
export function addDays(dateStr: string, days: number): string {
  const date = new ErrorDate(dateStr);
  if (isNaN(date.getTime())) {
    return dateStr;
  }
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// Workaround for date representation
class ErrorDate extends Date {
  constructor(value?: any) {
    if (value) {
      super(value);
    } else {
      super();
    }
  }
}

// Calculate days remaining between today and expiry date
export function getDaysRemaining(expiryDateStr: string, todayStr = '2026-05-26'): number {
  const expiry = new Date(expiryDateStr);
  const today = new Date(todayStr);
  
  // Set times to midnight to calculate pure day differences
  expiry.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Get subscription status based on expiry date
export function getStatus(expiryDateStr: string, todayStr = '2026-05-26'): 'Active' | 'Expiring' | 'Expired' | 'Suspended' {
  const days = getDaysRemaining(expiryDateStr, todayStr);
  if (days < 0) return 'Expired';
  if (days <= 7) return 'Expiring';
  return 'Active';
}

// Generate Initials Avatar
export function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    const p1 = parts[0] ? parts[0][0] : '';
    const p2 = parts[1] ? parts[1][0] : '';
    return (p1 + p2).toUpperCase() || '??';
  }
  return parts[0].substring(0, 2).toUpperCase() || '??';
}

// Generate WhatsApp deep link
export function getWhatsAppLink(phone: string, message: string): string {
  if (!phone || typeof phone !== 'string') {
    return `https://wa.me/?text=${encodeURIComponent(message || '')}`;
  }
  // Clean phone number (keep only digits, ensure country code)
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
    // Standard Ghana local format to international
    cleanPhone = '233' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('233') && cleanPhone.length === 9) {
    cleanPhone = '233' + cleanPhone;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message || '')}`;
}

// Compile WhatsApp message using macros and custom template
export function compileTemplate(
  template: string,
  subscriber: Subscriber,
  daysBefore = 3
): string {
  if (!template || typeof template !== 'string') {
    return '';
  }
  if (!subscriber) {
    return template;
  }
  return template
    .replace(/{name}/g, subscriber.name || '')
    .replace(/{profile}/g, subscriber.netflixProfile || '')
    .replace(/{days}/g, (daysBefore !== undefined && daysBefore !== null) ? daysBefore.toString() : '3')
    .replace(/{expiry_date}/g, subscriber.expiryDate || '')
    .replace(/{amount}/g, subscriber.amount !== undefined && subscriber.amount !== null ? subscriber.amount.toString() : '')
    .replace(/{device}/g, subscriber.deviceName || '');
}

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  ownerName: 'Legacy Phila',
  ownerEmail: 'legacydigitalexperts@gmail.com',
  ownerPhone: '+233 54 063 5752',
  netflixCost: 250, // in GHC per full premium account
  currency: 'GH₵',
  defaultDuration: 30,
  monthlyGoal: 1500,
  enableEmailNotif: false,
  daysBeforeExpiry: 3,
  googleCalendarSync: false,
  
  preferredTemplateMode: 'friendly',
  whatsappTemplate: 'Hi {name}, your Netflix subscription ({profile}) expires on {expiry_date}. Please renew with GH₵{amount} to continue. Thank you! - Legacy Phila',
  whatsappTemplateFriendly: 'Hi {name}! 😊 Just a friendly reminder that your Netflix profile ({profile}) is due for renewal on {expiry_date}. Please renew with GH₵{amount} to keep streaming uninterrupted! Thank you! - Legacy Phila',
  whatsappTemplateFormal: 'Dear {name}, please be advised that your Netflix shared screen subscription ({profile}) will reach its term on {expiry_date}. To ensure continuity of service, kindly remit the renewal sum of GH₵{amount}. Regards, Legacy Phila.',
  whatsappTemplateUrgent: 'ALERT: {name}, your Netflix access ({profile}) is ending on {expiry_date}! ⚠️ To prevent immediate profile lockout and deactivation of device {device}, please submit your payment of GH₵{amount} today. Thanks! - Legacy Phila',

  adminEmail: 'legacydigitalexperts@gmail.com',
  adminPassword: 'KabaFlix2024!',
  biometricEnabled: false,
  loginHistory: [],

  supabaseUrl: '',
  supabaseKey: '',
  resendApiKey: '',
  emailJsServiceId: '',
  emailJsTemplateId: '',
  emailJsPublicKey: '',
};

// Start with empty lists as requested for a CLEAN START!
export const INITIAL_SUBSCRIBERS: Subscriber[] = [];
export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [];
export const INITIAL_NOTIFICATIONS: NotificationLog[] = [];

export const MOCK_EARNINGS = [
  { month: 'Dec', amount: 0, cost: 0, profit: 0 },
  { month: 'Jan', amount: 0, cost: 0, profit: 0 },
  { month: 'Feb', amount: 0, cost: 0, profit: 0 },
  { month: 'Mar', amount: 0, cost: 0, profit: 0 },
  { month: 'Apr', amount: 0, cost: 0, profit: 0 },
  { month: 'May', amount: 0, cost: 0, profit: 0 }, // current month
];
