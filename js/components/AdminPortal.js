/**
 * Admin Portal Component for Body Engineers Fit Club
 * Comprehensive hub for Gym Owners & Trainers:
 * - Executive Dashboard & Urgent Alerts
 * - Client CRM with Fee Statuses
 * - Workout Plan Builder & Assigner
 * - Personalized Diet Chart Builder
 * - Payment Ledger, Invoicing & WhatsApp Reminders
 * - Relational Database Schema & ERD Visualizer
 */

import { gymStore } from '../store/gymStore.js';
import { DATABASE_SCHEMA } from '../data/schema.js';
import { generateWhatsAppReminderUrl, generateDietShareUrl } from '../utils/whatsapp.js';

export function renderAdminPortal() {
  const currentTab = gymStore.adminTab;
  const gym = gymStore.getGymProfile();
  const clients = gymStore.getClients();
  const payments = gymStore.getAllPayments();

  // Metrics
  const totalClients = clients.length;
  const overdueClients = clients.filter(c => c.feeStatus === 'OVERDUE');
  const dueSoonClients = clients.filter(c => c.feeStatus === 'DUE_SOON');
  const activePaidClients = clients.filter(c => c.feeStatus === 'PAID');
  const totalRevenue = payments.reduce((acc, p) => acc + (p.status === 'PAID' ? p.amount : 0), 0);

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      <!-- Top Sub-Navigation Bar -->
      <div class="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-800">
        <div class="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
          ${[
            { id: 'dashboard', label: 'Overview', icon: 'layout-dashboard' },
            { id: 'clients', label: `Members (${totalClients})`, icon: 'users' },
            { id: 'workouts', label: 'Workout Builder', icon: 'dumbbell' },
            { id: 'diets', label: 'Diet Charts', icon: 'utensils' },
            { id: 'payments', label: 'Fee Billing', icon: 'credit-card', badge: overdueClients.length > 0 ? overdueClients.length : null },
            { id: 'schema', label: 'DB Schema & ERD', icon: 'database' }
          ].map(tab => `
            <button data-admin-tab="${tab.id}" class="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${currentTab === tab.id ? 'bg-brand-500 text-dark-950 shadow-glow-emerald' : 'bg-dark-850 hover:bg-slate-800 text-slate-300 border border-slate-800'}">
              <i data-lucide="${tab.icon}" class="w-4 h-4"></i>
              <span>${tab.label}</span>
              ${tab.badge ? `<span class="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold shadow-glow-rose">${tab.badge}</span>` : ''}
            </button>
          `).join('')}
        </div>

        <!-- Quick Add Member Action -->
        <button id="admin-add-client-btn" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-dark-950 font-extrabold text-xs flex items-center gap-2 shadow-glow-emerald transition-all transform hover:-translate-y-0.5">
          <i data-lucide="user-plus" class="w-4 h-4"></i>
          <span>Add New Member</span>
        </button>
      </div>

      <!-- Tab Content Area -->
      ${renderTabContent(currentTab, { clients, payments, totalClients, overdueClients, dueSoonClients, activePaidClients, totalRevenue, gym })}

    </div>
  `;
}

function renderTabContent(tab, data) {
  switch (tab) {
    case 'dashboard':
      return renderDashboardTab(data);
    case 'clients':
      return renderClientsTab(data);
    case 'workouts':
      return renderWorkoutsTab(data);
    case 'diets':
      return renderDietsTab(data);
    case 'payments':
      return renderPaymentsTab(data);
    case 'schema':
      return renderSchemaTab(data);
    default:
      return renderDashboardTab(data);
  }
}

// -------------------------------------------------------------
// 1. DASHBOARD TAB
// -------------------------------------------------------------
function renderDashboardTab({ clients, payments, totalClients, overdueClients, dueSoonClients, activePaidClients, totalRevenue, gym }) {
  return `
    <div class="space-y-6">
      
      <!-- Top KPI Metric Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Total Active Members -->
        <div class="glass-panel p-5 rounded-2xl relative overflow-hidden hover-lift">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Members</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-brand-400 flex items-center justify-center border border-emerald-500/20">
              <i data-lucide="users" class="w-4 h-4"></i>
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="font-outfit text-3xl font-black text-white">${totalClients}</span>
            <span class="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <i data-lucide="trending-up" class="w-3 h-3"></i> 100% Retained
            </span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">${activePaidClients.length} in full good standing</p>
        </div>

        <!-- Overdue Fees Alert Card -->
        <div class="glass-panel ${overdueClients.length > 0 ? 'border-rose-500/40 bg-rose-950/10 shadow-glow-rose' : ''} p-5 rounded-2xl relative overflow-hidden hover-lift">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Overdue Fees</span>
            <div class="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 animate-pulse">
              <i data-lucide="alert-circle" class="w-4 h-4"></i>
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="font-outfit text-3xl font-black ${overdueClients.length > 0 ? 'text-rose-400' : 'text-white'}">${overdueClients.length}</span>
            <span class="text-xs font-semibold text-rose-400">Needs Follow-up</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Direct WhatsApp reminders ready</p>
        </div>

        <!-- Expiring Soon Card -->
        <div class="glass-panel p-5 rounded-2xl relative overflow-hidden hover-lift">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Due in < 7 Days</span>
            <div class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <i data-lucide="clock" class="w-4 h-4"></i>
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="font-outfit text-3xl font-black text-amber-400">${dueSoonClients.length}</span>
            <span class="text-xs font-semibold text-amber-300">Upcoming</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Automatic alerts dispatched</p>
        </div>

        <!-- Total Revenue Card -->
        <div class="glass-panel p-5 rounded-2xl relative overflow-hidden hover-lift">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Collected</span>
            <div class="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20">
              <i data-lucide="wallet" class="w-4 h-4"></i>
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="font-outfit text-2xl sm:text-3xl font-black text-white">${gym.currency}${totalRevenue.toLocaleString('en-IN')}</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Verified via UPI, Cash & Card</p>
        </div>

      </div>

      <!-- Main Dual Column: Urgent Fee Follow-up & Quick Client Roster -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left 2 Cols: Urgent Retention & Fee Management Queue -->
        <div class="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-outfit text-lg font-bold text-white flex items-center gap-2">
                <i data-lucide="bell-ring" class="w-5 h-5 text-amber-400"></i>
                <span>Member Retention & Payment Queue</span>
              </h3>
              <p class="text-xs text-slate-400">Prioritized list of members requiring fee renewal or routine check-in</p>
            </div>
            <button data-admin-tab="payments" class="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1">
              Billing Ledger &rarr;
            </button>
          </div>

          <div class="space-y-3 mt-4">
            ${clients.map(client => {
              const isOverdue = client.feeStatus === 'OVERDUE';
              const isDueSoon = client.feeStatus === 'DUE_SOON';
              
              return `
                <div class="p-3.5 rounded-2xl border transition-all ${isOverdue ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500' : isDueSoon ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500' : 'bg-dark-850/50 border-slate-800 hover:border-slate-700'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  
                  <!-- Member Info -->
                  <div class="flex items-center gap-3">
                    <img src="${client.avatarUrl}" alt="${client.fullName}" class="w-10 h-10 rounded-xl object-cover ring-1 ${isOverdue ? 'ring-rose-500' : isDueSoon ? 'ring-amber-500' : 'ring-emerald-500'}">
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-white text-sm">${client.fullName}</span>
                        <span class="text-[10px] font-semibold px-2 py-0.5 rounded ${isOverdue ? 'bg-rose-500/20 text-rose-300' : isDueSoon ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}">
                          ${isOverdue ? '🔴 Overdue' : isDueSoon ? '🟡 Due Soon' : '🟢 Paid'}
                        </span>
                      </div>
                      <div class="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Due: <b class="text-slate-200">${client.nextFeeDueDate}</b></span>
                        <span>•</span>
                        <span>Fee: <b class="text-slate-200">${gym.currency}${client.monthlyFee}</b></span>
                        <span>•</span>
                        <span class="text-brand-400">${client.fitnessGoal}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <a href="${generateWhatsAppReminderUrl(client, gym)}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1.5 rounded-lg bg-dark-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors" title="Send WhatsApp Message">
                      <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
                      <span>WhatsApp</span>
                    </a>
                    <button data-quick-pay-user-id="${client.id}" class="px-3 py-1.5 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-500/40 text-xs font-bold flex items-center gap-1.5 transition-all">
                      <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
                      <span>Log Fee</span>
                    </button>
                    <button data-view-client-id="${client.id}" class="p-1.5 rounded-lg bg-dark-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors" title="View Full Details">
                      <i data-lucide="eye" class="w-4 h-4"></i>
                    </button>
                  </div>

                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Right 1 Col: Quick Actions & Club Summary -->
        <div class="space-y-6">
          
          <!-- Club QR Code Check-in Desk -->
          <div class="glass-panel p-6 rounded-3xl space-y-4">
            <h4 class="font-outfit font-bold text-white text-sm flex items-center gap-2">
              <i data-lucide="qr-code" class="w-4 h-4 text-brand-400"></i>
              <span>Member Check-in Station</span>
            </h4>
            <div class="flex items-center justify-center p-4 bg-white rounded-2xl border-2 border-dashed border-slate-700 max-w-[180px] mx-auto">
              <!-- QR Code visual -->
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BODY_ENGINEERS_FIT_CLUB_DESK_CHECKIN" alt="Gym Check-in QR" class="w-36 h-36">
            </div>
            <p class="text-center text-xs text-slate-400">Scan at turnstile for instant digital attendance check-in & fee validation.</p>
          </div>

          <!-- Quick Trainer Toolkit -->
          <div class="glass-panel p-6 rounded-3xl space-y-3">
            <h4 class="font-outfit font-bold text-white text-sm flex items-center gap-2">
              <i data-lucide="zap" class="w-4 h-4 text-brand-accent"></i>
              <span>Quick Actions</span>
            </h4>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <button data-admin-tab="workouts" class="p-3 rounded-xl bg-dark-850 hover:bg-slate-800 border border-slate-800 flex flex-col items-center text-center gap-1.5 transition-colors">
                <i data-lucide="dumbbell" class="w-5 h-5 text-brand-400"></i>
                <span class="font-semibold text-slate-200">Assign Workout</span>
              </button>
              <button data-admin-tab="diets" class="p-3 rounded-xl bg-dark-850 hover:bg-slate-800 border border-slate-800 flex flex-col items-center text-center gap-1.5 transition-colors">
                <i data-lucide="utensils" class="w-5 h-5 text-emerald-400"></i>
                <span class="font-semibold text-slate-200">Edit Diet Plan</span>
              </button>
              <button id="admin-quick-add-fee-btn" class="p-3 rounded-xl bg-dark-850 hover:bg-slate-800 border border-slate-800 flex flex-col items-center text-center gap-1.5 transition-colors">
                <i data-lucide="receipt" class="w-5 h-5 text-amber-400"></i>
                <span class="font-semibold text-slate-200">Log Payment</span>
              </button>
              <button data-admin-tab="schema" class="p-3 rounded-xl bg-dark-850 hover:bg-slate-800 border border-slate-800 flex flex-col items-center text-center gap-1.5 transition-colors">
                <i data-lucide="database" class="w-5 h-5 text-purple-400"></i>
                <span class="font-semibold text-slate-200">Export SQL/DB</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  `;
}

// -------------------------------------------------------------
// 2. CLIENT MANAGEMENT TAB (CRM)
// -------------------------------------------------------------
function renderClientsTab({ clients, gym }) {
  return `
    <div class="space-y-6">
      
      <!-- Search & Filters -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
        <div class="relative w-full sm:w-80">
          <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
          <input type="text" id="client-search-input" placeholder="Search by name, phone or code..." class="w-full pl-9 pr-4 py-2 rounded-xl bg-dark-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500">
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button data-filter-status="ALL" class="client-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-500 text-dark-950">All (${clients.length})</button>
          <button data-filter-status="PAID" class="client-filter-btn px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-850 text-slate-300 hover:text-white border border-slate-800">Paid</button>
          <button data-filter-status="DUE_SOON" class="client-filter-btn px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-850 text-slate-300 hover:text-white border border-slate-800">Due Soon</button>
          <button data-filter-status="OVERDUE" class="client-filter-btn px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-850 text-slate-300 hover:text-white border border-slate-800">Overdue</button>
        </div>
      </div>

      <!-- Clients Table -->
      <div class="glass-panel rounded-3xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-dark-900/90 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th class="px-6 py-4">Member</th>
                <th class="px-6 py-4">Membership Plan</th>
                <th class="px-6 py-4">Next Due Date</th>
                <th class="px-6 py-4">Fee Status</th>
                <th class="px-6 py-4">Monthly Fee</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="clients-table-body" class="divide-y divide-slate-800/80">
              ${clients.map(c => renderClientTableRow(c, gym)).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}

function renderClientTableRow(c, gym) {
  const isOverdue = c.feeStatus === 'OVERDUE';
  const isDueSoon = c.feeStatus === 'DUE_SOON';

  return `
    <tr class="hover:bg-slate-800/40 transition-colors">
      <!-- Member Identity -->
      <td class="px-6 py-4">
        <div class="flex items-center gap-3">
          <img src="${c.avatarUrl}" alt="${c.fullName}" class="w-10 h-10 rounded-xl object-cover ring-1 ${isOverdue ? 'ring-rose-500' : isDueSoon ? 'ring-amber-500' : 'ring-emerald-500'}">
          <div>
            <div class="font-bold text-white text-sm">${c.fullName}</div>
            <div class="text-[11px] text-slate-400 flex items-center gap-2">
              <span class="font-mono text-brand-400">${c.memberCode}</span>
              <span>•</span>
              <span>${c.phone}</span>
            </div>
          </div>
        </div>
      </td>

      <!-- Tier -->
      <td class="px-6 py-4">
        <div class="font-semibold text-slate-200">${c.membershipTier}</div>
        <div class="text-[11px] text-slate-400">Joined ${c.joinDate}</div>
      </td>

      <!-- Next Due Date -->
      <td class="px-6 py-4">
        <div class="font-mono font-bold ${isOverdue ? 'text-rose-400' : isDueSoon ? 'text-amber-300' : 'text-slate-200'}">
          ${c.nextFeeDueDate}
        </div>
        <div class="text-[10px] text-slate-500">Auto-recurring alert</div>
      </td>

      <!-- Fee Status Pill -->
      <td class="px-6 py-4">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${isOverdue ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : isDueSoon ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}">
          <span class="w-1.5 h-1.5 rounded-full ${isOverdue ? 'bg-rose-500' : isDueSoon ? 'bg-amber-400' : 'bg-emerald-400'}"></span>
          ${isOverdue ? 'OVERDUE' : isDueSoon ? 'DUE SOON' : 'PAID'}
        </span>
      </td>

      <!-- Monthly Fee -->
      <td class="px-6 py-4 font-bold text-white">
        ${gym.currency}${c.monthlyFee.toLocaleString('en-IN')}
      </td>

      <!-- Actions -->
      <td class="px-6 py-4 text-right">
        <div class="flex items-center justify-end gap-2">
          <a href="${generateWhatsAppReminderUrl(c, gym)}" target="_blank" rel="noopener noreferrer" class="p-2 rounded-lg bg-dark-900 hover:bg-slate-800 text-emerald-400 border border-slate-700 transition-colors" title="Send WhatsApp Reminder">
            <i data-lucide="message-circle" class="w-4 h-4"></i>
          </a>
          <button data-quick-pay-user-id="${c.id}" class="p-2 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 transition-colors" title="Log Payment">
            <i data-lucide="receipt" class="w-4 h-4"></i>
          </button>
          <button data-view-client-id="${c.id}" class="p-2 rounded-lg bg-dark-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors" title="View Full Profile">
            <i data-lucide="user-check" class="w-4 h-4"></i>
          </button>
          <button data-edit-client-id="${c.id}" class="p-2 rounded-lg bg-dark-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors" title="Edit Client">
            <i data-lucide="pencil" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
}

// -------------------------------------------------------------
// 3. WORKOUT PLAN BUILDER & ASSIGNER
// -------------------------------------------------------------
function renderWorkoutsTab({ clients }) {
  const selectedClientId = gymStore.editingWorkoutClientId || clients[0]?.id;
  const selectedClient = gymStore.getClientById(selectedClientId) || clients[0];
  const workoutPlan = gymStore.getWorkoutPlanForUser(selectedClient.id);

  return `
    <div class="space-y-6">
      
      <!-- Top Member Selector -->
      <div class="glass-panel p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 class="font-outfit text-lg font-bold text-white flex items-center gap-2">
            <i data-lucide="dumbbell" class="w-5 h-5 text-brand-400"></i>
            <span>Interactive Workout Plan Assigner</span>
          </h3>
          <p class="text-xs text-slate-400">Customize target splits, sets, reps, and weights for each member</p>
        </div>

        <!-- Select Active Client -->
        <div class="flex items-center gap-3 w-full md:w-auto">
          <label class="text-xs font-semibold text-slate-400 whitespace-nowrap">Selected Member:</label>
          <select id="workout-client-selector" class="px-3.5 py-2 rounded-xl bg-dark-900 border border-slate-700 text-xs text-white font-bold focus:outline-none focus:border-brand-500 w-full sm:w-64">
            ${clients.map(c => `
              <option value="${c.id}" ${c.id === selectedClient.id ? 'selected' : ''}>${c.fullName} (${c.memberCode})</option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Plan Info Card -->
      <div class="glass-panel p-6 rounded-3xl space-y-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-brand-400">Assigned Routine</span>
            <h4 class="font-outfit text-xl font-bold text-white mt-0.5">${workoutPlan.title}</h4>
            <p class="text-xs text-slate-400">Split Type: <span class="text-slate-200 font-semibold">${workoutPlan.splitType}</span> • Last Updated: ${workoutPlan.lastUpdated}</p>
          </div>

          <div class="flex items-center gap-2">
            <button id="add-workout-day-btn" class="px-3 py-2 rounded-xl bg-dark-850 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <i data-lucide="calendar-plus" class="w-4 h-4 text-brand-400"></i>
              <span>Add Day</span>
            </button>
            <button data-save-workout-plan-user-id="${selectedClient.id}" class="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 font-black text-xs flex items-center gap-1.5 shadow-glow-emerald transition-all">
              <i data-lucide="save" class="w-4 h-4"></i>
              <span>Save & Sync to Member App</span>
            </button>
          </div>
        </div>

        <!-- Days & Exercise Accordion -->
        <div class="space-y-4" id="workout-days-container">
          ${workoutPlan.days.map((day, dIdx) => `
            <div class="p-5 rounded-2xl bg-dark-900/80 border border-slate-800 space-y-4">
              
              <!-- Day Header -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div class="flex items-center gap-3">
                  <span class="px-3 py-1 rounded-lg bg-brand-500/20 text-brand-300 font-bold text-xs border border-brand-500/30">
                    ${day.dayName}
                  </span>
                  <h5 class="font-bold text-white text-sm">${day.routineTitle}</h5>
                  <span class="text-xs text-slate-400">(${day.estimatedMinutes || 60} mins)</span>
                </div>
                <div class="flex items-center gap-2">
                  <button data-add-exercise-day-idx="${dIdx}" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-300 text-[11px] font-semibold flex items-center gap-1">
                    <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Exercise
                  </button>
                </div>
              </div>

              <!-- Exercise List -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                ${day.exercises.map((ex, eIdx) => `
                  <div class="p-3.5 rounded-xl bg-dark-950 border border-slate-800/80 hover:border-slate-700 space-y-2 text-xs">
                    <div class="flex items-start justify-between gap-2">
                      <div>
                        <span class="font-bold text-white text-sm">${ex.name}</span>
                        <span class="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">${ex.muscleGroup}</span>
                      </div>
                      <button data-remove-exercise="${dIdx}-${eIdx}" class="text-slate-500 hover:text-rose-400 transition-colors p-1" title="Remove">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      </button>
                    </div>

                    <div class="grid grid-cols-3 gap-2 bg-dark-900 p-2 rounded-lg text-slate-400 font-mono text-[11px]">
                      <div>Sets: <b class="text-white">${ex.targetSets}</b></div>
                      <div>Reps: <b class="text-brand-300">${ex.targetReps}</b></div>
                      <div>Weight: <b class="text-white">${ex.targetWeightKg || 0} kg</b></div>
                    </div>

                    ${ex.notes ? `<p class="text-[11px] text-slate-400 italic">💡 ${ex.notes}</p>` : ''}
                  </div>
                `).join('')}
              </div>

            </div>
          `).join('')}
        </div>

      </div>

    </div>
  `;
}

// -------------------------------------------------------------
// 4. DIET CHART BUILDER
// -------------------------------------------------------------
function renderDietsTab({ clients, gym }) {
  const selectedClientId = gymStore.editingDietClientId || clients[0]?.id;
  const selectedClient = gymStore.getClientById(selectedClientId) || clients[0];
  const dietPlan = gymStore.getDietPlanForUser(selectedClient.id);

  // Calculate Macro Percentages
  const proteinCals = dietPlan.targetProteinG * 4;
  const carbsCals = dietPlan.targetCarbsG * 4;
  const fatsCals = dietPlan.targetFatsG * 9;
  const totalCalculated = proteinCals + carbsCals + fatsCals;

  const proteinPct = Math.round((proteinCals / totalCalculated) * 100) || 30;
  const carbsPct = Math.round((carbsCals / totalCalculated) * 100) || 45;
  const fatsPct = Math.round((fatsCals / totalCalculated) * 100) || 25;

  return `
    <div class="space-y-6">
      
      <!-- Top Member Selector -->
      <div class="glass-panel p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 class="font-outfit text-lg font-bold text-white flex items-center gap-2">
            <i data-lucide="utensils" class="w-5 h-5 text-emerald-400"></i>
            <span>Personalized Nutrition & Diet Chart Builder</span>
          </h3>
          <p class="text-xs text-slate-400">Tailor daily calories, macronutrient targets, and timed meals</p>
        </div>

        <!-- Select Active Client -->
        <div class="flex items-center gap-3 w-full md:w-auto">
          <label class="text-xs font-semibold text-slate-400 whitespace-nowrap">Selected Member:</label>
          <select id="diet-client-selector" class="px-3.5 py-2 rounded-xl bg-dark-900 border border-slate-700 text-xs text-white font-bold focus:outline-none focus:border-brand-500 w-full sm:w-64">
            ${clients.map(c => `
              <option value="${c.id}" ${c.id === selectedClient.id ? 'selected' : ''}>${c.fullName} (${c.memberCode})</option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Macro Target Card -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        <!-- Daily Calories -->
        <div class="glass-panel p-5 rounded-2xl">
          <span class="text-xs font-bold text-slate-400 uppercase">Target Daily Energy</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="font-outfit text-3xl font-black text-white">${dietPlan.dailyCalories}</span>
            <span class="text-xs text-brand-400 font-bold">kcal/day</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">${dietPlan.dietaryType}</p>
        </div>

        <!-- Protein Target -->
        <div class="glass-panel p-5 rounded-2xl border-l-4 border-l-blue-500">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase">Target Protein</span>
            <span class="text-xs font-bold text-blue-400">${proteinPct}%</span>
          </div>
          <div class="mt-2 flex items-baseline gap-1">
            <span class="font-outfit text-3xl font-black text-white">${dietPlan.targetProteinG}</span>
            <span class="text-xs text-blue-300 font-bold">grams</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">${proteinCals} kcal</p>
        </div>

        <!-- Carbs Target -->
        <div class="glass-panel p-5 rounded-2xl border-l-4 border-l-amber-500">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase">Target Carbs</span>
            <span class="text-xs font-bold text-amber-400">${carbsPct}%</span>
          </div>
          <div class="mt-2 flex items-baseline gap-1">
            <span class="font-outfit text-3xl font-black text-white">${dietPlan.targetCarbsG}</span>
            <span class="text-xs text-amber-300 font-bold">grams</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">${carbsCals} kcal</p>
        </div>

        <!-- Fats & Hydration -->
        <div class="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase">Fats & Water</span>
            <span class="text-xs font-bold text-emerald-400">${fatsPct}%</span>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="font-outfit text-2xl font-black text-white">${dietPlan.targetFatsG}g</span>
            <span class="text-xs text-slate-400">/</span>
            <span class="font-outfit text-2xl font-black text-sky-400">${dietPlan.dailyWaterLiters}L</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">${fatsCals} kcal fat</p>
        </div>

      </div>

      <!-- Meal Schedule Builder -->
      <div class="glass-panel p-6 rounded-3xl space-y-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h4 class="font-outfit text-xl font-bold text-white">${dietPlan.title}</h4>
            <p class="text-xs text-slate-400">${dietPlan.notes || 'Strict adherence to timings advised.'}</p>
          </div>

          <div class="flex items-center gap-2">
            <a href="${generateDietShareUrl(selectedClient, dietPlan, gym)}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-2 rounded-xl bg-dark-850 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors">
              <i data-lucide="share-2" class="w-4 h-4"></i>
              <span>WhatsApp Chart</span>
            </a>
            <button data-edit-diet-modal-user-id="${selectedClient.id}" class="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 font-black text-xs flex items-center gap-1.5 shadow-glow-emerald transition-all">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
              <span>Customize Diet & Meals</span>
            </button>
          </div>
        </div>

        <!-- Meals Display -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${dietPlan.meals.map((meal, mIdx) => `
            <div class="p-4 rounded-2xl bg-dark-900/90 border border-slate-800 space-y-3">
              <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                <span class="font-bold text-white text-sm">${meal.name}</span>
                <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">${meal.timeString}</span>
              </div>

              <div class="space-y-2">
                ${meal.items.map(item => `
                  <div class="p-2.5 rounded-xl bg-dark-950 border border-slate-800/80 text-xs">
                    <div class="font-semibold text-slate-200">${item.foodName}</div>
                    <div class="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                      <span>${item.portion}</span>
                      <span class="font-mono text-emerald-400 font-bold">${item.proteinG}g Prot • ${item.calories} kcal</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

      </div>

    </div>
  `;
}

// -------------------------------------------------------------
// 5. PAYMENTS & INVOICING TAB
// -------------------------------------------------------------
function renderPaymentsTab({ payments, clients, gym }) {
  return `
    <div class="space-y-6">
      
      <!-- Top Action Bar -->
      <div class="glass-panel p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 class="font-outfit text-lg font-bold text-white flex items-center gap-2">
            <i data-lucide="credit-card" class="w-5 h-5 text-amber-400"></i>
            <span>Fee Billing Ledger & Invoice System</span>
          </h3>
          <p class="text-xs text-slate-400">Log membership payments, print tax invoices, and track revenue</p>
        </div>

        <button id="admin-log-payment-modal-btn" class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-dark-950 font-black text-xs flex items-center gap-2 shadow-glow-amber transition-all">
          <i data-lucide="plus-circle" class="w-4 h-4"></i>
          <span>Log New Fee Payment</span>
        </button>
      </div>

      <!-- Payment Ledger Table -->
      <div class="glass-panel rounded-3xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-dark-900/90 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th class="px-6 py-4">Invoice #</th>
                <th class="px-6 py-4">Member Name</th>
                <th class="px-6 py-4">Amount</th>
                <th class="px-6 py-4">Plan Duration</th>
                <th class="px-6 py-4">Payment Date</th>
                <th class="px-6 py-4">Valid Due Date</th>
                <th class="px-6 py-4">Method</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/80">
              ${payments.map(p => {
                const user = gymStore.getClientById(p.userId);
                const isOverdue = p.status === 'OVERDUE';
                const isDueSoon = p.status === 'DUE_SOON';
                
                return `
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="px-6 py-4 font-mono font-bold text-brand-300">${p.invoiceNumber}</td>
                    <td class="px-6 py-4">
                      <div class="font-bold text-white">${user ? user.fullName : 'Member'}</div>
                      <div class="text-[10px] text-slate-500 font-mono">${user ? user.memberCode : ''}</div>
                    </td>
                    <td class="px-6 py-4 font-bold text-white text-sm">${gym.currency}${p.amount.toLocaleString('en-IN')}</td>
                    <td class="px-6 py-4 text-slate-300">${p.planDuration}</td>
                    <td class="px-6 py-4 text-slate-400 font-mono">${p.paymentDate}</td>
                    <td class="px-6 py-4 font-mono font-bold ${isOverdue ? 'text-rose-400' : 'text-slate-200'}">${p.dueDate}</td>
                    <td class="px-6 py-4">
                      <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold">${p.paymentMethod}</span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold ${isOverdue ? 'bg-rose-500/20 text-rose-300' : isDueSoon ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}">
                        ${p.status}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <button data-view-receipt-id="${p.id}" class="px-2.5 py-1.5 rounded-lg bg-dark-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors">
                        <i data-lucide="receipt" class="w-3.5 h-3.5 text-brand-400"></i>
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}

// -------------------------------------------------------------
// 6. DATABASE SCHEMA & ERD TAB
// -------------------------------------------------------------
function renderSchemaTab() {
  const schema = DATABASE_SCHEMA;
  const rawJSON = gymStore.exportJSON();
  const sqlDDL = schema.getSQLDDL();

  return `
    <div class="space-y-6">
      
      <!-- Top Overview Card -->
      <div class="glass-panel p-6 rounded-3xl space-y-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-outfit text-xl font-bold text-white flex items-center gap-2">
                <i data-lucide="database" class="w-5 h-5 text-purple-400"></i>
                <span>${schema.name}</span>
              </h3>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">v${schema.version}</span>
            </div>
            <p class="text-xs text-slate-400 mt-1">${schema.description}</p>
          </div>

          <div class="flex items-center gap-2">
            <button id="copy-sql-ddl-btn" class="px-3.5 py-2 rounded-xl bg-dark-850 hover:bg-slate-800 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors">
              <i data-lucide="copy" class="w-4 h-4"></i>
              <span>Copy SQL DDL</span>
            </button>
            <button id="download-json-db-btn" class="px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 text-xs font-black flex items-center gap-1.5 shadow-glow-emerald transition-all">
              <i data-lucide="download" class="w-4 h-4"></i>
              <span>Export Database (JSON)</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Relational Tables Breakdown -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${schema.tables.map(table => `
          <div class="glass-panel p-5 rounded-3xl space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-slate-800">
              <div class="flex items-center gap-2">
                <i data-lucide="table" class="w-4 h-4 text-brand-400"></i>
                <span class="font-mono font-bold text-white text-sm">${table.name}</span>
              </div>
              <span class="text-[11px] text-slate-400">${table.columns.length} columns</span>
            </div>
            <p class="text-[11px] text-slate-400">${table.description}</p>

            <div class="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              ${table.columns.map(col => `
                <div class="p-2 rounded-xl bg-dark-900/90 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    ${col.primaryKey ? '<span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">PK</span>' : ''}
                    ${col.foreignKey ? '<span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono">FK</span>' : ''}
                    <span class="font-mono text-slate-200 font-semibold">${col.name}</span>
                  </div>
                  <span class="font-mono text-[10px] text-slate-400">${col.type}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Live SQL DDL Viewer -->
      <div class="glass-panel p-6 rounded-3xl space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="font-outfit font-bold text-white text-sm flex items-center gap-2">
            <i data-lucide="code" class="w-4 h-4 text-purple-400"></i>
            <span>Production SQL DDL Code</span>
          </h4>
          <span class="text-xs text-slate-400">PostgreSQL / MySQL compatible</span>
        </div>
        <pre class="p-4 rounded-2xl bg-dark-950 border border-slate-800 text-slate-300 text-xs font-mono overflow-x-auto max-h-72 leading-relaxed"><code>${sqlDDL}</code></pre>
      </div>

    </div>
  `;
}
