/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RenewalRecord {
  date: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
}

export interface Subscriber {
  id: string;
  name: string;
  phone: string;
  email?: string;
  netflixProfile: string;
  deviceName: string;
  amount: number;
  paymentMethod: 'MoMo' | 'Cash' | 'Bank Transfer';
  startDate: string;
  durationDays: number;
  notes?: string;
  expiryDate: string;
  status: 'Active' | 'Expiring' | 'Expired' | 'Suspended';
  paymentStatus: 'Paid' | 'Unpaid';
  paymentDate?: string;
  contactMethod: 'WhatsApp' | 'Email' | 'Phone';
  renewalHistory: RenewalRecord[];
  calendarEventId?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'add' | 'renew' | 'edit' | 'delete' | 'notification_sent' | 'system' | 'suspend' | 'unsuspend' | 'backup';
  message: string;
  details?: string;
}

export interface NotificationLog {
  id: string;
  subscriberId: string;
  subscriberName: string;
  type: '3-day-warning' | 'expiry-day';
  status: 'sent' | 'pending' | 'failed';
  date: string;
  channel: 'email' | 'whatsapp';
}

export interface LoginHistoryEntry {
  timestamp: string;
  ip?: string;
  browser?: string;
  success: boolean;
  method: 'password' | 'biometric';
}

export interface AppSettings {
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  netflixCost: number;
  currency: string;
  defaultDuration: number;
  monthlyGoal: number;
  enableEmailNotif: boolean;
  daysBeforeExpiry: number;
  googleCalendarSync: boolean;
  whatsappTemplate: string;
  whatsappTemplateFriendly: string;
  whatsappTemplateFormal: string;
  whatsappTemplateUrgent: string;
  preferredTemplateMode: 'friendly' | 'formal' | 'urgent';
  // Admin credentials and settings
  adminEmail: string;
  adminPassword: string;
  biometricEnabled: boolean;
  loginHistory: LoginHistoryEntry[];
  // Dynamic credentials for real integrations
  supabaseUrl: string;
  supabaseKey: string;
  resendApiKey: string;
  emailJsServiceId: string;
  emailJsTemplateId: string;
  emailJsPublicKey: string;
}

export interface MonthlyEarning {
  month: string;
  amount: number;
  cost: number;
  profit: number;
}
