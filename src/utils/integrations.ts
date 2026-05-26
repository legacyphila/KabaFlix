/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Subscriber, AppSettings } from '../types';

/**
 * Sends an email notification using Resend API or EmailJS or falls back to system logs
 */
export async function sendEmailNotification(
  subscriber: Subscriber,
  type: '3-day-warning' | 'expiry-day',
  settings: AppSettings,
  addSystemLog: (msg: string, details?: string) => void
): Promise<{ success: boolean; message: string }> {
  const subject = type === '3-day-warning'
    ? `⚠️ [KabaFlix Alert] ${subscriber.name} expires in 3 days`
    : `🔴 ACTION NEEDED: Sign out [${subscriber.name}] today`;

  const body = type === '3-day-warning'
    ? `Hi Legacy Phila,\n\nYour customer ${subscriber.name} with profile "${subscriber.netflixProfile}" on device "${subscriber.deviceName}" expires on ${subscriber.expiryDate}.\n\nContact them at ${subscriber.phone} for renewal.`
    : `${subscriber.name}'s subscription expired today (${subscriber.expiryDate}).\n\nPlease sign out device "${subscriber.deviceName}" from Netflix (Profile: "${subscriber.netflixProfile}") if they have not renewed. Phone: ${subscriber.phone}`;

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; padding: 40px 20px; color: #f8fafc; border-radius: 16px; max-width: 600px; margin: 0 auto; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5);">
      <div style="background: linear-gradient(135deg, #e50914 0%, #7c0207 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; border-bottom: 3px solid #fbc913;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">KabaFlix</h1>
        <p style="color: #fda4af; margin: 4px 0 0 0; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;">by Legacy Phila</p>
      </div>
      <div style="background-color: #1e293b; padding: 30px; border-radius: 0 0 12px 12px; border-left: 1px solid #334155; border-right: 1px solid #334155; border-bottom: 1px solid #334155;">
        <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #334155; padding-bottom: 10px;">
          ${type === '3-day-warning' ? '⚠️ Subscription Expiry Warning (3 Days)' : '🔴 Subscription Expired (Action Required)'}
        </h2>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          ${type === '3-day-warning' 
            ? `Attention Legacy Phila! Customer <strong>${subscriber.name}</strong> will reach the end of their subscription period in 3 days. Below are the details to prepare for renewal:`
            : `Customer <strong>${subscriber.name}</strong> subscription has officially expired today. Immediate action is required to either verify renewal or sign out the device from the Netflix household.`}
        </p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; background-color: #0f172a; border-radius: 8px; overflow: hidden;">
          <tbody>
            <tr style="border-bottom: 1px solid #334155;">
              <td style="padding: 12px 15px; font-size: 13px; font-weight: 600; color: #94a3b8; width: 40%;">Customer Name:</td>
              <td style="padding: 12px 15px; font-size: 13px; font-weight: 600; color: #ffffff;">${subscriber.name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #334155;">
              <td style="padding: 12px 15px; font-size: 13px; font-weight: 600; color: #94a3b8;">Netflix Profile:</td>
              <td style="padding: 12px 15px; font-size: 13px; font-weight: 700; color: #e50914;">${subscriber.netflixProfile}</td>
            </tr>
            <tr style="border-bottom: 1px solid #334155;">
              <td style="padding: 12px 15px; font-size: 13px; font-weight: 600; color: #94a3b8;">Registered Device:</td>
              <td style="padding: 12px 15px; font-size: 13px; color: #e2e8f0;">${subscriber.deviceName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #334155;">
              <td style="padding: 12px 15px; font-size: 13px; font-weight: 600; color: #94a3b8;">Expiry Date:</td>
              <td style="padding: 12px 15px; font-size: 13px; font-weight: 700; color: ${type === '3-day-warning' ? '#f59e0b' : '#ef4444'};">${subscriber.expiryDate}</td>
            </tr>
            <tr style="border-bottom: 1px solid #334155;">
              <td style="padding: 12px 15px; font-size: 13px; font-weight: 600; color: #94a3b8;">Amount Paid:</td>
              <td style="padding: 12px 15px; font-size: 13px; color: #e2e8f0;">GH₵ ${subscriber.amount}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; font-size: 13px; font-weight: 600; color: #94a3b8;">Phone:</td>
              <td style="padding: 12px 15px; font-size: 13px; color: #38bdf8; font-family: monospace;">${subscriber.phone}</td>
            </tr>
          </tbody>
        </table>

        <div style="background-color: #0f172a; padding: 20px; border-radius: 8px; border-left: 4px solid #e50914; margin-bottom: 25px;">
          <h3 style="color: #ffffff; font-size: 14px; margin-top: 0; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em;">Recommended Action Items:</h3>
          <ol style="color: #cbd5e1; font-size: 13px; padding-left: 20px; line-height: 1.6; margin: 0;">
            ${type === '3-day-warning'
              ? `<li>Click WhatsApp icon in the KabaFlix dashboard to fire a pre-filled template message to <strong>${subscriber.name}</strong>.</li>
                 <li>Send payment request for GH₵ ${subscriber.amount} to lock in renewal.</li>
                 <li>No remote de-registration required at this stage.</li>`
              : `<li><strong>⚠️ SUSPEND / REMOVE ACCESS:</strong> If renewal is not paid, sign out of the Netflix account on device <strong>"${subscriber.deviceName}"</strong>.</li>
                 <li>Notify customer via phone: <a href="tel:${subscriber.phone}" style="color: #38bdf8; text-decoration: none;">${subscriber.phone}</a>.</li>
                 <li>Mark subscriber as Expired/Suspended inside KabaFlix Panel.</li>`}
          </ol>
        </div>

        <div style="border-top: 1px solid #334155; padding-top: 15px; text-align: center;">
          <p style="color: #64748b; font-size: 11px; margin: 0;">
            KabaFlix Administrator Notification &bull; Ghana Premium Subscriptions Portal
          </p>
          <p style="color: #64748b; font-size: 10px; margin-top: 5px;">
            Owner: Legacy Phila &bull; +233 54 063 5752 &bull; legacydigitalexperts@gmail.com
          </p>
        </div>
      </div>
    </div>
  `;

  // 1. Try Resend if API Key is configured
  const apiKey = settings.resendApiKey || localStorage.getItem('resendApiKey') || '';
  if (apiKey) {
    try {
      addSystemLog('System', `Initiating Email via Resend for ${subscriber.name}...`);
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'KabaFlix <onboarding@resend.dev>',
          to: ['legacydigitalexperts@gmail.com'],
          subject: subject,
          html: htmlBody,
        }),
      });

      if (response.ok) {
        addSystemLog('system', `Email sent successfully via Resend for ${subscriber.name}.`);
        return { success: true, message: 'Email sent successfully via Resend API!' };
      } else {
        const errData = await response.json();
        throw new Error(errData?.message || 'Resend response error');
      }
    } catch (err: any) {
      console.error('Resend error:', err);
      addSystemLog('system', `Resend Email failed: ${err.message}. Saving to alerts feed.`);
    }
  }

  // 2. Try EmailJS if Configured
  if (settings.emailJsServiceId && settings.emailJsTemplateId && settings.emailJsPublicKey) {
    try {
      addSystemLog('system', `Initiating Email via EmailJS for ${subscriber.name}...`);
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: settings.emailJsServiceId,
          template_id: settings.emailJsTemplateId,
          user_id: settings.emailJsPublicKey,
          template_params: {
            subject: subject,
            to_email: settings.ownerEmail,
            customer_name: subscriber.name,
            profile_name: subscriber.netflixProfile,
            device_name: subscriber.deviceName,
            expiry_date: subscriber.expiryDate,
            phone: subscriber.phone,
            message: body,
          },
        }),
      });

      if (response.ok) {
        addSystemLog('system', `Email sent successfully via EmailJS for ${subscriber.name}.`);
        return { success: true, message: 'Email sent successfully via EmailJS!' };
      } else {
        throw new Error('EmailJS sending failed');
      }
    } catch (err: any) {
      console.error('EmailJS error:', err);
      addSystemLog('system', `EmailJS sending failed: ${err.message}`);
    }
  }

  // 3. Fallback (Simulation Sandbox)
  addSystemLog(
    'notification_sent',
    `Notification simulated: "${subject}" to ${settings.ownerEmail}. Connect Resend or EmailJS in Settings for real emails.`
  );
  return {
    success: true,
    message: `[Simulated Alert] Email captured in System Activity: "${subject}"`
  };
}

/**
 * Creates Google Calendar Event for Subscriber Expiry
 */
export async function createGoogleCalendarEvent(
  subscriber: Subscriber,
  accessToken: string | null,
  settings: AppSettings,
  addSystemLog: (msg: string, details?: string) => void
): Promise<{ success: boolean; eventId?: string; message: string }> {
  if (!settings.googleCalendarSync) {
    return { success: false, message: 'Google Calendar Sync is disabled in Settings.' };
  }

  // Calculate 3 days before the expiry date for the reminder event
  let reminderDate = subscriber.expiryDate;
  try {
    const d = new Date(subscriber.expiryDate);
    if (!isNaN(d.getTime())) {
      d.setDate(d.getDate() - 3);
      reminderDate = d.toISOString().split('T')[0];
    }
  } catch (e) {
    console.error('Failed to calculate 3-day reminder date', e);
  }

  const title = `🎬 Reminder: ${subscriber.name} Netflix Renewal (Expiry ${subscriber.expiryDate})`;
  const description = `KabaFlix Resale Subscription Expiration Reminder\nCustomer: ${subscriber.name}\nPhone: ${subscriber.phone}\nDevice: ${subscriber.deviceName}\nAmount Paid: GH₵ ${subscriber.amount}\nPayment Method: ${subscriber.paymentMethod}\n\nPlease contact user to confirm renewal before full expiration on ${subscriber.expiryDate}.`;

  // 1. If we have a real OAuth Access Token (authenticated via Google Sign-In)
  if (accessToken) {
    try {
      addSystemLog('system', `Syncing reminder event (set for ${reminderDate}, 3 days before expiry) to Google Calendar for ${subscriber.name}...`);
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: title,
          description: description,
          start: {
            date: reminderDate,
          },
          end: {
            date: reminderDate, // All-day event
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'popup', minutes: 24 * 60 }, // 1 day before
              { method: 'email', minutes: 2 * 24 * 60 }, // 2 days before
            ],
          },
        }),
      });

      if (response.ok) {
        const eventData = await response.json();
        addSystemLog('system', `Google Calendar Event synchronized for ${subscriber.name}.`);
        return { success: true, eventId: eventData.id, message: 'Synchronized event to Google Calendar!' };
      } else {
        const errorText = await response.text();
        throw new Error(`Google API: ${errorText}`);
      }
    } catch (err: any) {
      console.error('Google Calendar Error:', err);
      addSystemLog('system', `Google Calendar synchronization failed: ${err.message}. Falling back to sandbox.`);
    }
  }

  // 2. Playful simulated Google Calendar Creation
  addSystemLog(
    'system',
    `Event proposed: "${title}" on ${reminderDate} (Simulation Sandbox: Sign In with Google via settings to push to your real Google Calendar account).`
  );
  return {
    success: true,
    eventId: 'simulated-event-' + Date.now(),
    message: 'Added event to local Calendar queue! Sign in with Google to push to live Calendar.'
  };
}

/**
 * Supabase synchronization client logic
 * Operates client-side, using keys provided by the user dynamically.
 * If Supabase is not configured, it syncs safely with localStorage.
 */
export async function syncToSupabase(
  action: 'insert' | 'update' | 'delete' | 'fetch',
  subscriber?: Subscriber,
  settings?: AppSettings
): Promise<{ success: boolean; data?: Subscriber[]; error?: string }> {
  if (!settings || !settings.supabaseUrl || !settings.supabaseKey) {
    return { success: false, error: 'Supabase credentials not set.' };
  }

  try {
    const tableUrl = `${settings.supabaseUrl}/rest/v1/subscribers`;
    const headers: HeadersInit = {
      'apikey': settings.supabaseKey,
      'Authorization': `Bearer ${settings.supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    if (action === 'insert' && subscriber) {
      const res = await fetch(tableUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(subscriber),
      });
      if (!res.ok) throw new Error(await res.text());
      return { success: true };
    }

    if (action === 'update' && subscriber) {
      const res = await fetch(`${tableUrl}?id=eq.${subscriber.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(subscriber),
      });
      if (!res.ok) throw new Error(await res.text());
      return { success: true };
    }

    if (action === 'delete' && subscriber) {
      const res = await fetch(`${tableUrl}?id=eq.${subscriber.id}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error(await res.text());
      return { success: true };
    }

    if (action === 'fetch') {
      const res = await fetch(`${tableUrl}?select=*&order=name.asc`, {
        method: 'GET',
        headers,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return { success: true, data };
    }

    return { success: false, error: 'Invalid action' };
  } catch (error: any) {
    console.error('Supabase integration error:', error);
    return { success: false, error: error.message };
  }
}
