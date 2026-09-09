/**
 * Mobile Bottom Navigation Component for Client Portal
 * Ergonomic thumb-friendly navigation bar on mobile devices.
 */

import { gymStore } from '../store/gymStore.js';

export function renderMobileBottomNav() {
  const currentUser = gymStore.getCurrentUser();
  const currentTab = gymStore.clientTab;

  // Only render on client mode
  if (currentUser.role === 'ADMIN') {
    return '';
  }

  return `
    <div class="flex items-center justify-around max-w-md mx-auto">
      ${[
        { id: 'workout', label: 'Workout', icon: 'dumbbell' },
        { id: 'diet', label: 'Diet Plan', icon: 'utensils' },
        { id: 'fee', label: 'Fee Status', icon: 'receipt' },
        { id: 'profile', label: 'Pass', icon: 'user' }
      ].map(tab => {
        const isActive = currentTab === tab.id;
        return `
          <button data-client-tab="${tab.id}" class="flex-1 flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${isActive ? 'text-brand-accent' : 'text-slate-400 hover:text-slate-200'}">
            <div class="relative p-1 rounded-lg ${isActive ? 'bg-brand-500/20 shadow-glow-emerald' : ''}">
              <i data-lucide="${tab.icon}" class="w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}"></i>
            </div>
            <span class="text-[10px] font-bold mt-0.5 tracking-tight">${tab.label}</span>
          </button>
        `;
      }).join('')}
    </div>
  `;
}
