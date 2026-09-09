/**
 * Fee Alert Banner Component
 * Delivers visual alerts for upcoming or overdue fees for both Admin and Client portals.
 */

import { gymStore } from '../store/gymStore.js';
import { generateWhatsAppReminderUrl } from '../utils/whatsapp.js';

export function renderAdminUrgentFeeAlerts() {
  const clients = gymStore.getClients();
  const gymProfile = gymStore.getGymProfile();
  const overdueClients = clients.filter(c => c.feeStatus === 'OVERDUE');
  const dueSoonClients = clients.filter(c => c.feeStatus === 'DUE_SOON');

  if (overdueClients.length === 0 && dueSoonClients.length === 0) {
    return '';
  }

  return `
    <div class="bg-gradient-to-r from-rose-950/90 via-dark-900 to-amber-950/80 border-y border-rose-500/30 px-4 py-2.5 shadow-lg">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        
        <!-- Left: Alert Summary -->
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
            <i data-lucide="alert-triangle" class="w-4 h-4"></i>
          </div>
          <div>
            <span class="font-bold text-white text-sm">Action Required:</span>
            <span class="text-rose-300 font-semibold ml-1">${overdueClients.length} Overdue Fees</span>
            <span class="text-slate-400 mx-1">•</span>
            <span class="text-amber-300 font-semibold">${dueSoonClients.length} Expiring This Week</span>
          </div>
        </div>

        <!-- Right: Overdue Client Quick Chips & Reminder Actions -->
        <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
          ${overdueClients.slice(0, 2).map(c => `
            <div class="flex items-center gap-2 bg-dark-950/80 border border-rose-500/40 rounded-lg px-2.5 py-1 text-[11px]">
              <span class="text-rose-300 font-bold">${c.fullName}</span>
              <span class="text-slate-400">(${gymProfile.currency}${c.monthlyFee})</span>
              <a href="${generateWhatsAppReminderUrl(c, gymProfile)}" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5 hover:underline" title="Send WhatsApp Payment Link">
                <i data-lucide="message-circle" class="w-3 h-3"></i> Remind
              </a>
              <button data-quick-pay-user-id="${c.id}" class="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-0.5 ml-1 hover:underline">
                <i data-lucide="check-circle-2" class="w-3 h-3"></i> Log
              </button>
            </div>
          `).join('')}

          ${dueSoonClients.slice(0, 1).map(c => `
            <div class="hidden lg:flex items-center gap-2 bg-dark-950/80 border border-amber-500/40 rounded-lg px-2.5 py-1 text-[11px]">
              <span class="text-amber-300 font-bold">${c.fullName}</span>
              <span class="text-slate-400">(Due ${c.nextFeeDueDate.slice(5)})</span>
              <a href="${generateWhatsAppReminderUrl(c, gymProfile)}" target="_blank" rel="noopener noreferrer" class="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-0.5" title="Send WhatsApp Due Notice">
                <i data-lucide="message-circle" class="w-3 h-3"></i> Remind
              </a>
            </div>
          `).join('')}

          <button id="admin-view-all-dues-btn" class="ml-auto md:ml-2 px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/50 text-[11px] font-bold transition-all">
            View All Pending Dues &rarr;
          </button>
        </div>

      </div>
    </div>
  `;
}

/**
 * Client Portal Hero Fee Banner
 */
export function renderClientHeroFeeBanner(client) {
  const gymProfile = gymStore.getGymProfile();
  const isOverdue = client.feeStatus === 'OVERDUE';
  const isDueSoon = client.feeStatus === 'DUE_SOON';
  const isPaid = client.feeStatus === 'PAID';

  const today = new Date("2026-09-09");
  const due = new Date(client.nextFeeDueDate);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let containerClass = "glass-emerald shadow-glow-emerald";
  let statusBadge = `
    <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      <span>ACTIVE MEMBERSHIP</span>
    </div>
  `;
  let countdownText = `Valid for next ${diffDays} days`;
  let alertHeadline = "Membership Active & In Good Standing";

  if (isOverdue) {
    containerClass = "glass-rose shadow-glow-rose border-rose-500/50";
    statusBadge = `
      <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/50 text-rose-300 text-xs font-bold animate-pulse">
        <span class="w-2 h-2 rounded-full bg-rose-500"></span>
        <span>MEMBERSHIP OVERDUE</span>
      </div>
    `;
    countdownText = `Expired ${Math.abs(diffDays)} days ago`;
    alertHeadline = "Urgent: Fee Payment Pending";
  } else if (isDueSoon) {
    containerClass = "glass-amber shadow-glow-amber border-amber-500/50";
    statusBadge = `
      <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold">
        <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        <span>RENEWAL DUE SOON</span>
      </div>
    `;
    countdownText = diffDays === 0 ? "Due Today" : `Expires in ${diffDays} days`;
    alertHeadline = "Upcoming Renewal Notice";
  }

  return `
    <div class="relative overflow-hidden rounded-3xl p-5 sm:p-6 ${containerClass} transition-all duration-300">
      
      <!-- Background Ambient Glow -->
      <div class="absolute -right-10 -bottom-10 w-44 h-44 rounded-full ${isOverdue ? 'bg-rose-500/10' : isDueSoon ? 'bg-amber-500/10' : 'bg-emerald-500/10'} blur-3xl pointer-events-none"></div>

      <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        
        <!-- Left Details -->
        <div class="space-y-3">
          <div class="flex flex-wrap items-center gap-2.5">
            ${statusBadge}
            <span class="text-xs font-medium text-slate-400">${client.membershipTier}</span>
          </div>

          <div>
            <p class="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Next Fee Due Date</p>
            <div class="flex items-baseline gap-3">
              <h2 class="font-outfit text-2xl sm:text-3xl font-black text-white tracking-tight">
                ${new Date(client.nextFeeDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </h2>
              <span class="text-xs font-bold px-2 py-0.5 rounded ${isOverdue ? 'bg-rose-500/20 text-rose-300' : isDueSoon ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}">
                ${countdownText}
              </span>
            </div>
            <p class="text-xs text-slate-300 mt-1">${alertHeadline} • ${gymProfile.currency}${client.monthlyFee.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <!-- Right: Action Buttons -->
        <div class="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0 border-t border-slate-800 md:border-t-0">
          <button id="client-quick-pay-btn" class="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl ${isOverdue ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-glow-rose' : 'bg-brand-500 hover:bg-brand-400 text-dark-950 shadow-glow-emerald'} font-bold text-xs flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5">
            <i data-lucide="credit-card" class="w-4 h-4"></i>
            <span>${isOverdue ? 'Pay Overdue Fee' : isDueSoon ? 'Renew Membership' : 'Pay in Advance'}</span>
          </button>

          <button id="client-view-invoices-btn" class="px-3.5 py-2.5 rounded-xl bg-dark-850/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors">
            <i data-lucide="receipt" class="w-4 h-4 text-slate-400"></i>
            <span>Receipts</span>
          </button>

          <a href="${generateWhatsAppReminderUrl(client, gymProfile)}" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-xl bg-dark-850/90 hover:bg-slate-800 text-emerald-400 border border-slate-700 transition-colors" title="Message Gym Desk on WhatsApp">
            <i data-lucide="message-circle" class="w-4 h-4"></i>
          </a>
        </div>

      </div>

    </div>
  `;
}
