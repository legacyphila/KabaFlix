/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Smartphone, User, Phone, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';
import { Subscriber } from '../types';
import { addDays } from '../utils/data';

interface AddSubscriberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscriber: Omit<Subscriber, 'id'> & { id?: string }) => void;
  editingSubscriber: Subscriber | null;
}

export default function AddSubscriberModal({
  isOpen,
  onClose,
  onSave,
  editingSubscriber
}: AddSubscriberModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [netflixProfile, setNetflixProfile] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [amount, setAmount] = useState('120');
  const [paymentMethod, setPaymentMethod] = useState<'MoMo' | 'Cash' | 'Bank Transfer'>('MoMo');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [durationDays, setDurationDays] = useState(30);
  const [notes, setNotes] = useState('');
  const [contactMethod, setContactMethod] = useState<'WhatsApp' | 'Email' | 'Phone'>('WhatsApp');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid'>('Paid');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Auto-calculated field shown in modal
  const [expiryDateCalculated, setExpiryDateCalculated] = useState('');
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);

  // Initialize fields if editing
  useEffect(() => {
    if (editingSubscriber) {
      setName(editingSubscriber.name);
      setPhone(editingSubscriber.phone);
      setEmail(editingSubscriber.email || '');
      setNetflixProfile(editingSubscriber.netflixProfile);
      setDeviceName(editingSubscriber.deviceName);
      setAmount(editingSubscriber.amount.toString());
      setPaymentMethod(editingSubscriber.paymentMethod);
      setStartDate(editingSubscriber.startDate);
      setDurationDays(editingSubscriber.durationDays);
      setNotes(editingSubscriber.notes || '');
      setContactMethod(editingSubscriber.contactMethod || 'WhatsApp');
      setPaymentStatus(editingSubscriber.paymentStatus || 'Paid');
      setPaymentDate(editingSubscriber.paymentDate || editingSubscriber.startDate);
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setNetflixProfile('');
      setDeviceName('');
      setAmount('120');
      setPaymentMethod('MoMo');
      setStartDate(new Date().toISOString().split('T')[0]);
      setDurationDays(30);
      setNotes('');
      setContactMethod('WhatsApp');
      setPaymentStatus('Paid');
      setPaymentDate(new Date().toISOString().split('T')[0]);
    }
  }, [editingSubscriber, isOpen]);

  // Recalculate expiry whenever start date or duration changes
  useEffect(() => {
    if (startDate) {
      const calculatedStr = addDays(startDate, durationDays);
      setExpiryDateCalculated(calculatedStr);
    }
  }, [startDate, durationDays]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !netflixProfile || !deviceName || !amount) {
      alert('Please fill out all required fields.');
      return;
    }

    // Validate phone length
    const normalizedPhone = phone.replace(/\s+/g, '');
    if (normalizedPhone.length < 9) {
      alert('Phone number must contain a valid subscriber code (e.g. 0540635752).');
      return;
    }

    const payload: Omit<Subscriber, 'id'> & { id?: string } = {
      name: name.trim(),
      phone: normalizedPhone,
      email: email.trim() || undefined,
      netflixProfile: netflixProfile.trim(),
      deviceName: deviceName.trim(),
      amount: parseFloat(amount),
      paymentMethod,
      startDate,
      durationDays: Number(durationDays),
      notes: notes.trim() || undefined,
      expiryDate: expiryDateCalculated,
      status: 'Active', // updated dynamically by helper in App.tsx
      contactMethod,
      paymentStatus,
      paymentDate: paymentStatus === 'Paid' ? paymentDate : undefined,
      renewalHistory: editingSubscriber?.renewalHistory || []
    };

    if (editingSubscriber) {
      payload.id = editingSubscriber.id;
    }

    // Success validation microanimation
    setShowSuccessAnim(true);
    setTimeout(() => {
      setShowSuccessAnim(false);
      onSave(payload);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Black glass overlay with fade transition */}
      <div 
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
      />

      {/* Success Animation Stage */}
      {showSuccessAnim ? (
        <div className="relative bg-white dark:bg-slate-900 rounded-[28px] p-10 flex flex-col items-center justify-center text-center shadow-2xl z-10 w-full max-w-sm border border-gray-100 dark:border-slate-800 animate-zoom-in">
          <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center text-green-500 mb-4 animate-bounce">
            <CheckCircle2 size={44} />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white">
            {editingSubscriber ? 'Record Synchronized!' : 'Subscriber Secured!'}
          </h3>
          <p className="text-xs text-gray-400 mt-2">
            Accounts reconciliation complete. Adding payment value to {paymentMethod} ledgers.
          </p>
          <div className="flex items-center gap-1.5 mt-4 px-3 py-1 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
            <Sparkles size={11} /> Ledger Updated
          </div>
        </div>
      ) : (
        /* Actual Form Modal */
        <div className="relative bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl z-10 w-full max-w-lg border border-gray-100 dark:border-slate-800 overflow-hidden animate-zoom-in flex flex-col max-h-[90vh]">
          {/* Header section */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800 shrink-0">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                {editingSubscriber ? 'Edit Subscriber Record' : 'Add Netflix Subscriber'}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Calculate durations and auto-verify billing statuses.
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Scroll Container */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-slate-800/40 pb-1.5">
              Client Profile Details
            </h3>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5 flex items-center gap-1">
                <User size={12} className="text-gray-400" /> Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                id="form_name"
                type="text"
                required
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 text-sm border-none rounded-xl text-gray-850 dark:text-white outline-none focus:ring-1 focus:ring-red-500 transition-all font-semibold"
                placeholder="e.g. Abigail Mensah"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Row: Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5 flex items-center gap-1">
                  <Phone size={12} className="text-gray-400" /> Phone Number (Ghana) <span className="text-red-500">*</span>
                </label>
                <input
                  id="form_phone"
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 text-sm border-none rounded-xl text-gray-850 dark:text-white font-mono placeholder-gray-400 outline-none focus:ring-1 focus:ring-red-500 transition-all"
                  placeholder="e.g. 0540635752"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                  Email Address (Optional)
                </label>
                <input
                  id="form_email"
                  type="email"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 text-sm border-none rounded-xl text-gray-850 dark:text-white outline-none focus:ring-1 focus:ring-red-500 transition-all font-medium"
                  placeholder="e.g. customer@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Contact Method */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                Preferred Contact Method
              </label>
              <select
                id="form_contact_method"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 text-sm border-none rounded-xl text-gray-850 dark:text-white outline-none focus:ring-1 focus:ring-red-500 transition-all font-semibold"
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value as any)}
              >
                <option value="WhatsApp">WhatsApp Message</option>
                <option value="Email">Email Notification</option>
                <option value="Phone">Direct Voice Call</option>
              </select>
            </div>

            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-slate-800/40 pb-1.5 pt-2">
              Netflix Subscriptions Parameters
            </h3>

            {/* Row: Netflix Profile & Device */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Netflix Profile Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                  Netflix Profile Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="form_profile"
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 text-sm border-none rounded-xl text-gray-850 dark:text-white outline-none focus:ring-1 focus:ring-red-500 transition-all font-medium"
                  placeholder="e.g. Screen 1 - Abby"
                  value={netflixProfile}
                  onChange={(e) => setNetflixProfile(e.target.value)}
                />
              </div>

              {/* Device Model Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5 flex items-center gap-1">
                  <Smartphone size={12} className="text-gray-400" /> Device Model <span className="text-red-500">*</span>
                </label>
                <input
                  id="form_device"
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 text-sm border-none rounded-xl text-gray-850 dark:text-white outline-none focus:ring-1 focus:ring-red-500 transition-all"
                  placeholder="e.g. Apple iPhone 15 Pro"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                />
              </div>
            </div>

            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-slate-800/40 pb-1.5 pt-2">
              Financial ledger & Cycle duration
            </h3>

            {/* Row: Amount Paid, Payment Method & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Amount paid */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5 flex items-center gap-1">
                  <DollarSign size={12} className="text-gray-400" /> Amount (GH₵) <span className="text-red-500">*</span>
                </label>
                <input
                  id="form_amount"
                  type="number"
                  required
                  min="1"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 text-sm border-none rounded-xl text-gray-850 dark:text-white outline-none focus:ring-1 focus:ring-red-500 transition-all font-mono font-bold"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                  Method
                </label>
                <select
                  id="form_method"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 text-sm border-none rounded-xl text-gray-850 dark:text-white outline-none focus:ring-1 focus:ring-red-500 transition-all font-semibold"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                >
                  <option value="MoMo">MoMo (Mobile Money)</option>
                  <option value="Cash">Cash Ledger</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              {/* Duration Days */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                  Cycle Days
                </label>
                <input
                  id="form_duration"
                  type="number"
                  required
                  min="1"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 text-sm border-none rounded-xl text-gray-850 dark:text-white outline-none focus:ring-1 focus:ring-red-500 transition-all font-mono text-center font-bold"
                  value={durationDays}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > 0) setDurationDays(val);
                  }}
                />
              </div>
            </div>

            {/* Payment Tracking Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                  Payment Balance Status
                </label>
                <select
                  id="form_payment_status"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 text-sm border-none rounded-xl text-gray-850 dark:text-white outline-none focus:ring-1 focus:ring-red-500 transition-all font-semibold"
                  value={paymentStatus}
                  onChange={(e) => {
                    const val = e.target.value as 'Paid' | 'Unpaid';
                    setPaymentStatus(val);
                  }}
                >
                  <option value="Paid">Fully Paid (Settled)</option>
                  <option value="Unpaid">Unpaid / Owed Renewal</option>
                </select>
              </div>

              {paymentStatus === "Paid" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                    Settlement Date
                  </label>
                  <input
                    id="form_payment_date"
                    type="date"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 text-sm border-none rounded-xl text-gray-850 dark:text-white outline-none focus:ring-1 focus:ring-red-500 transition-all font-mono font-semibold"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Cycle Dates mapping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5 flex items-center gap-1">
                  <Calendar size={12} className="text-gray-400" /> Start Date
                </label>
                <input
                  id="form_start_date"
                  type="date"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 text-sm border-none rounded-xl text-gray-850 dark:text-white outline-none focus:ring-1 focus:ring-red-500 transition-all font-mono font-semibold"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {/* Calculated Expiry */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-500 uppercase mb-1.5">
                  Calculated Expiry Date 🚀
                </label>
                <div className="w-full px-4 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-mono font-bold text-sm border border-red-200/50 dark:border-red-500/20 rounded-xl leading-relaxed select-all">
                  {expiryDateCalculated || 'Calculating...'}
                </div>
              </div>
            </div>

            {/* Notes Textarea */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                Special Client Notes & Preferences
              </label>
              <textarea
                id="form_notes"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 text-xs border-none rounded-xl text-gray-850 dark:text-white outline-none focus:ring-1 focus:ring-red-500 transition-all h-20 resize-none"
                placeholder="Include custom terms, MoMo transaction reference numbers, or security PIN indicators..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </form>

          {/* Form Actions footer */}
          <div className="p-6 bg-gray-55 dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              id="form_cancel_btn"
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-bold text-gray-600 dark:text-gray-400 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="form_submit_btn"
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-red-650 hover:bg-red-500 text-white text-xs font-bold rounded-xl active:scale-[0.98] cursor-pointer"
            >
              {editingSubscriber ? 'Update Record' : 'Commit Subscriber'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
