/**
 * Header Component for Body Engineers Fit Club
 * Includes brand logo, persona/role switcher, viewport frame toggle, and notifications.
 */

import { gymStore } from '../store/gymStore.js';

export function renderHeader() {
  const currentUser = gymStore.getCurrentUser();
  const allUsers = gymStore.getAllUsers();
  const gym = gymStore.getGymProfile();
  const viewMode = gymStore.viewMode;
  const notifications = gymStore.getNotifications(currentUser.id);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 md:h-20">
        
        <!-- Brand Logo & Name -->
        <div class="flex items-center gap-3 cursor-pointer select-none" id="brand-logo-btn">
          <div class="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 p-0.5 shadow-glow-emerald">
            <div class="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
              <i data-lucide="dumbbell" class="w-5 h-5 md:w-6 md:h-6 text-brand-accent transform -rotate-45"></i>
            </div>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-outfit font-black tracking-wider text-base md:text-xl text-white">BODY ENGINEERS</span>
              <span class="text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">FIT CLUB</span>
            </div>
            <p class="text-[10px] md:text-xs text-slate-400 font-medium hidden sm:block">Smart Retention & Gym Management Hub</p>
          </div>
        </div>

        <!-- Center / Right Actions: Viewport Toggle, User Switcher, Notifs -->
        <div class="flex items-center gap-2 sm:gap-3">
          
          <!-- Device Frame Simulator Toggle (Mobile Preview) -->
          <div class="hidden lg:flex items-center bg-dark-850 p-1 rounded-xl border border-slate-800">
            <button id="view-mode-responsive-btn" class="px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${viewMode === 'responsive' ? 'bg-brand-500 text-dark-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'}" title="Full Desktop Width">
              <i data-lucide="monitor" class="w-3.5 h-3.5"></i>
              <span>Desktop</span>
            </button>
            <button id="view-mode-phone-btn" class="px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${viewMode === 'mobile-frame' ? 'bg-brand-500 text-dark-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'}" title="Preview Mobile App Frame">
              <i data-lucide="smartphone" class="w-3.5 h-3.5"></i>
              <span>Mobile Phone</span>
            </button>
          </div>

          <!-- Notification Bell -->
          <div class="relative">
            <button id="notif-btn" class="relative p-2 rounded-xl bg-dark-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all">
              <i data-lucide="bell" class="w-5 h-5"></i>
              ${unreadCount > 0 ? `
                <span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-glow-rose animate-pulse">
                  ${unreadCount}
                </span>
              ` : ''}
            </button>

            <!-- Notifications Dropdown (Hidden by default) -->
            <div id="notif-dropdown" class="hidden absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-dark-900 border border-slate-700 shadow-2xl p-4 z-50">
              <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 class="text-sm font-bold text-white flex items-center gap-2">
                  <i data-lucide="bell" class="w-4 h-4 text-brand-400"></i> Notifications & Alerts
                </h4>
                <span class="text-xs text-slate-400">${notifications.length} alerts</span>
              </div>
              <div class="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                ${notifications.length === 0 ? `
                  <p class="text-xs text-slate-400 text-center py-6">No new notifications</p>
                ` : notifications.map(n => `
                  <div class="p-2.5 rounded-xl ${n.type.includes('overdue') ? 'bg-rose-500/10 border border-rose-500/30' : n.type.includes('fee') ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-800/60 border border-slate-700/50'} text-xs">
                    <div class="flex items-center justify-between font-semibold ${n.type.includes('overdue') ? 'text-rose-400' : n.type.includes('fee') ? 'text-amber-300' : 'text-brand-300'} mb-1">
                      <span>${n.title}</span>
                      <span class="text-[10px] text-slate-500 font-normal">Just now</span>
                    </div>
                    <p class="text-slate-300 leading-relaxed">${n.message}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Persona / Role Switcher Dropdown (Seamless Pair-Programming Testing) -->
          <div class="relative">
            <button id="role-switcher-btn" class="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-dark-850 hover:bg-slate-800 border border-slate-800 transition-all text-left group">
              <img src="${currentUser.avatarUrl}" alt="${currentUser.fullName}" class="w-8 h-8 rounded-lg object-cover ring-2 ${currentUser.role === 'ADMIN' ? 'ring-brand-500' : currentUser.feeStatus === 'OVERDUE' ? 'ring-rose-500' : currentUser.feeStatus === 'DUE_SOON' ? 'ring-amber-500' : 'ring-emerald-500'}">
              <div class="hidden sm:block">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-white group-hover:text-brand-300 transition-colors">${currentUser.fullName.split(' ')[0]}</span>
                  <span class="text-[10px] font-semibold px-1.5 py-0.2 rounded ${currentUser.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'}">
                    ${currentUser.role === 'ADMIN' ? 'ADMIN' : 'CLIENT'}
                  </span>
                </div>
                <div class="text-[10px] text-slate-400">
                  ${currentUser.role === 'ADMIN' ? 'Owner / Trainer' : `Fee: ${currentUser.feeStatus === 'OVERDUE' ? '🔴 Overdue' : currentUser.feeStatus === 'DUE_SOON' ? '🟡 Due Soon' : '🟢 Paid'}`}
                </div>
              </div>
              <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 group-hover:text-white transition-transform"></i>
            </button>

            <!-- Role Selector Dropdown -->
            <div id="role-switcher-dropdown" class="hidden absolute right-0 mt-2 w-72 rounded-2xl bg-dark-900 border border-slate-700 shadow-2xl p-3 z-50">
              <div class="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                Switch Active Persona
              </div>
              <div class="mt-2 space-y-1">
                ${allUsers.map(user => {
                  const isCurrent = user.id === currentUser.id;
                  const isOverdue = user.feeStatus === 'OVERDUE';
                  const isDueSoon = user.feeStatus === 'DUE_SOON';
                  
                  return `
                    <button data-switch-user-id="${user.id}" class="w-full text-left p-2 rounded-xl flex items-center gap-3 transition-colors ${isCurrent ? 'bg-brand-500/20 border border-brand-500/40' : 'hover:bg-slate-800/80'}">
                      <img src="${user.avatarUrl}" alt="${user.fullName}" class="w-8 h-8 rounded-lg object-cover">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                          <span class="text-xs font-bold text-white truncate">${user.fullName}</span>
                          <span class="text-[9px] font-bold px-1.5 py-0.5 rounded ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-300'}">
                            ${user.role}
                          </span>
                        </div>
                        <div class="text-[11px] ${user.role === 'ADMIN' ? 'text-purple-400' : isOverdue ? 'text-rose-400 font-semibold' : isDueSoon ? 'text-amber-400 font-semibold' : 'text-emerald-400'} truncate">
                          ${user.role === 'ADMIN' ? 'Full Control Hub' : isOverdue ? '⚠️ Fee Overdue (4d)' : isDueSoon ? '⏳ Fee Due in 2d' : '✓ Active & Paid'}
                        </div>
                      </div>
                      ${isCurrent ? '<i data-lucide="check" class="w-4 h-4 text-brand-400"></i>' : ''}
                    </button>
                  `;
                }).join('')}
              </div>

              <!-- Quick Reset Database Seed Button -->
              <div class="mt-3 pt-2 border-t border-slate-800">
                <button id="reset-db-btn" class="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors">
                  <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                  <span>Reset Demo Data</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  `;
}
