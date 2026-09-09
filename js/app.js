/**
 * Main Application Controller - Body Engineers Fit Club
 * Integrates Store, Components, Modals, Rest Timer, Confetti, and Event Listeners
 */

import { gymStore } from './store/gymStore.js';
import { renderHeader } from './components/Header.js';
import { renderAdminUrgentFeeAlerts } from './components/FeeAlertBanner.js';
import { renderAdminPortal } from './components/AdminPortal.js';
import { renderClientPortal } from './components/ClientPortal.js';
import { renderMobileBottomNav } from './components/MobileBottomNav.js';
import { sounds } from './utils/soundEffects.js';
import { generateWhatsAppReminderUrl } from './utils/whatsapp.js';

// Timer State
let timerInterval = null;
let timerSecondsLeft = 0;

// Application Initialization
class AppController {
  constructor() {
    this.headerEl = document.getElementById('main-header');
    this.alertsContainerEl = document.getElementById('urgent-alerts-container');
    this.mainContentEl = document.getElementById('main-content');
    this.modalContainerEl = document.getElementById('modal-container');
    this.toastContainerEl = document.getElementById('toast-container');
    this.bottomNavEl = document.getElementById('mobile-bottom-nav');

    // Subscribe to store updates
    gymStore.subscribe(() => this.render());
    
    // Global Event Delegation
    this.bindEvents();
    
    // Initial Render
    this.render();
  }

  render() {
    const currentUser = gymStore.getCurrentUser();
    const isClient = currentUser.role === 'CLIENT';
    const viewMode = gymStore.viewMode;

    // 1. Render Header
    this.headerEl.innerHTML = renderHeader();

    // 2. Render Global Urgent Fee Alert Banner for Admin
    if (!isClient) {
      this.alertsContainerEl.innerHTML = renderAdminUrgentFeeAlerts();
    } else {
      this.alertsContainerEl.innerHTML = '';
    }

    // 3. Render Main View (with optional Mobile Device Simulator Frame)
    let contentHtml = isClient ? renderClientPortal() : renderAdminPortal();

    if (viewMode === 'mobile-frame' && isClient) {
      this.mainContentEl.innerHTML = `
        <div class="py-6 px-2 flex justify-center items-center w-full min-h-screen bg-dark-950">
          <div class="mobile-device-frame relative w-full max-w-[430px] rounded-[44px] border-[10px] border-slate-800 bg-dark-950 shadow-2xl overflow-hidden pb-16">
            <!-- Simulated Phone Notch / Dynamic Island -->
            <div class="mobile-notch"></div>
            <!-- Status Bar Simulation -->
            <div class="flex justify-between items-center px-6 pt-3 pb-1 text-[11px] font-bold text-slate-400">
              <span>9:41</span>
              <div class="flex items-center gap-1.5">
                <i data-lucide="wifi" class="w-3 h-3"></i>
                <i data-lucide="battery" class="w-3.5 h-3.5"></i>
              </div>
            </div>
            <!-- Mobile Screen Inner Content -->
            <div class="overflow-y-auto max-h-[800px] p-2">
              ${contentHtml}
            </div>
          </div>
        </div>
      `;
    } else {
      this.mainContentEl.innerHTML = contentHtml;
    }

    // 4. Render Mobile Bottom Nav for Client
    if (isClient && viewMode !== 'mobile-frame') {
      this.bottomNavEl.classList.remove('hidden');
      this.bottomNavEl.innerHTML = renderMobileBottomNav();
    } else {
      this.bottomNavEl.classList.add('hidden');
      this.bottomNavEl.innerHTML = '';
    }

    // 5. Initialize Lucide Icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const isSuccess = type === 'success';
    const isError = type === 'error';
    const isAmber = type === 'amber';

    toast.className = `toast-animation pointer-events-auto flex items-center gap-3 p-4 rounded-2xl ${
      isSuccess ? 'bg-dark-900 border border-emerald-500/50 text-emerald-300 shadow-glow-emerald' :
      isError ? 'bg-dark-900 border border-rose-500/50 text-rose-300 shadow-glow-rose' :
      'bg-dark-900 border border-amber-500/50 text-amber-300 shadow-glow-amber'
    } shadow-2xl text-xs font-bold max-w-sm`;

    toast.innerHTML = `
      <div class="w-7 h-7 rounded-lg ${
        isSuccess ? 'bg-emerald-500/20 text-emerald-400' :
        isError ? 'bg-rose-500/20 text-rose-400' :
        'bg-amber-500/20 text-amber-400'
      } flex items-center justify-center shrink-0">
        <i data-lucide="${isSuccess ? 'check-circle' : isError ? 'alert-octagon' : 'bell'}" class="w-4 h-4"></i>
      </div>
      <div class="flex-1 text-slate-200">${message}</div>
    `;

    this.toastContainerEl.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  openModal(modalHtml) {
    this.modalContainerEl.innerHTML = `
      <div class="relative w-full max-w-xl bg-dark-900 border border-slate-700 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button id="close-modal-btn" class="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
        ${modalHtml}
      </div>
    `;
    this.modalContainerEl.classList.remove('hidden');
    this.modalContainerEl.classList.add('flex');
    if (window.lucide) window.lucide.createIcons();
  }

  closeModal() {
    this.modalContainerEl.classList.add('hidden');
    this.modalContainerEl.classList.remove('flex');
    this.modalContainerEl.innerHTML = '';
  }

  // --- REST TIMER ENGINE ---
  startRestTimer(seconds) {
    if (timerInterval) clearInterval(timerInterval);
    timerSecondsLeft = seconds;
    sounds.playTick();

    const updateDisplay = () => {
      const displayEl = document.getElementById('timer-display');
      if (displayEl) {
        const mins = Math.floor(timerSecondsLeft / 60).toString().padStart(2, '0');
        const secs = (timerSecondsLeft % 60).toString().padStart(2, '0');
        displayEl.textContent = `${mins}:${secs}`;
      }
    };

    updateDisplay();

    timerInterval = setInterval(() => {
      timerSecondsLeft--;
      if (timerSecondsLeft <= 3 && timerSecondsLeft > 0) {
        sounds.playTick();
      }

      if (timerSecondsLeft <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        sounds.playTimerFinished();
        this.showToast("⏱️ Rest Time Finished! Get ready for your next set!", "amber");
        updateDisplay();
      } else {
        updateDisplay();
      }
    }, 1000);
  }

  stopRestTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    timerSecondsLeft = 0;
    const displayEl = document.getElementById('timer-display');
    if (displayEl) displayEl.textContent = "00:00";
  }

  // --- GLOBAL EVENT BINDING ---
  bindEvents() {
    document.addEventListener('click', (e) => {
      const target = e.target;

      // 1. Role switcher dropdown toggle
      if (target.closest('#role-switcher-btn')) {
        const dropdown = document.getElementById('role-switcher-dropdown');
        if (dropdown) dropdown.classList.toggle('hidden');
        return;
      }
      if (!target.closest('#role-switcher-btn') && !target.closest('#role-switcher-dropdown')) {
        const dropdown = document.getElementById('role-switcher-dropdown');
        if (dropdown) dropdown.classList.add('hidden');
      }

      // 2. Notification dropdown toggle
      if (target.closest('#notif-btn')) {
        const notifDropdown = document.getElementById('notif-dropdown');
        if (notifDropdown) notifDropdown.classList.toggle('hidden');
        return;
      }
      if (!target.closest('#notif-btn') && !target.closest('#notif-dropdown')) {
        const notifDropdown = document.getElementById('notif-dropdown');
        if (notifDropdown) notifDropdown.classList.add('hidden');
      }

      // 3. Switch Persona User
      const switchBtn = target.closest('[data-switch-user-id]');
      if (switchBtn) {
        const userId = switchBtn.getAttribute('data-switch-user-id');
        gymStore.setActiveUser(userId);
        const user = gymStore.getCurrentUser();
        this.showToast(`Switched persona to ${user.fullName} (${user.role})`, "success");
        return;
      }

      // 4. Viewport Toggle
      if (target.closest('#view-mode-responsive-btn')) {
        gymStore.setViewMode('responsive');
        return;
      }
      if (target.closest('#view-mode-phone-btn')) {
        gymStore.setViewMode('mobile-frame');
        return;
      }

      // 5. Admin Tabs
      const adminTabBtn = target.closest('[data-admin-tab]');
      if (adminTabBtn) {
        const tab = adminTabBtn.getAttribute('data-admin-tab');
        gymStore.setAdminTab(tab);
        return;
      }

      // 6. Client Tabs
      const clientTabBtn = target.closest('[data-client-tab]');
      if (clientTabBtn) {
        const tab = clientTabBtn.getAttribute('data-client-tab');
        gymStore.setClientTab(tab);
        return;
      }

      // 7. Reset DB seed data
      if (target.closest('#reset-db-btn')) {
        if (confirm("Reset all gym database records to initial seed data?")) {
          gymStore.resetToSeedData();
          this.showToast("Database restored to initial seed dataset!", "success");
        }
        return;
      }

      // 8. Close Modal
      if (target.closest('#close-modal-btn') || target === this.modalContainerEl) {
        this.closeModal();
        return;
      }

      // 9. Admin: Add Client Modal Trigger
      if (target.closest('#admin-add-client-btn')) {
        this.openAddClientModal();
        return;
      }

      // 10. Admin: Log Payment Modal Trigger
      if (target.closest('#admin-log-payment-modal-btn') || target.closest('#admin-quick-add-fee-btn')) {
        this.openLogPaymentModal();
        return;
      }

      // 11. Quick Pay for specific member
      const quickPayBtn = target.closest('[data-quick-pay-user-id]');
      if (quickPayBtn) {
        const userId = quickPayBtn.getAttribute('data-quick-pay-user-id');
        this.openLogPaymentModal(userId);
        return;
      }

      // 12. Client Hero Quick Pay button
      if (target.closest('#client-quick-pay-btn')) {
        const currentUser = gymStore.getCurrentUser();
        this.openLogPaymentModal(currentUser.id);
        return;
      }

      // 13. Client View Invoices button
      if (target.closest('#client-view-invoices-btn')) {
        gymStore.setClientTab('fee');
        return;
      }

      // 14. View Receipt Modal
      const viewReceiptBtn = target.closest('[data-view-receipt-id]');
      if (viewReceiptBtn) {
        const paymentId = viewReceiptBtn.getAttribute('data-view-receipt-id');
        this.openReceiptModal(paymentId);
        return;
      }

      // 15. View Client Details Drawer
      const viewClientBtn = target.closest('[data-view-client-id]');
      if (viewClientBtn) {
        const clientId = viewClientBtn.getAttribute('data-view-client-id');
        this.openClientDetailModal(clientId);
        return;
      }

      // 16. Edit Client Profile
      const editClientBtn = target.closest('[data-edit-client-id]');
      if (editClientBtn) {
        const clientId = editClientBtn.getAttribute('data-edit-client-id');
        this.openEditClientModal(clientId);
        return;
      }

      // 17. Toggle Exercise Checkbox in Client View
      const toggleExBtn = target.closest('[data-toggle-exercise-id]');
      if (toggleExBtn) {
        const exId = toggleExBtn.getAttribute('data-toggle-exercise-id');
        const dayId = toggleExBtn.getAttribute('data-day-id');
        const currentUser = gymStore.getCurrentUser();
        const newState = gymStore.toggleExercise(currentUser.id, dayId, exId);
        if (newState) {
          sounds.playCheck();
        }
        return;
      }

      // 18. Complete Daily Workout Celebration Confetti
      if (target.closest('#complete-workout-btn')) {
        const currentUser = gymStore.getCurrentUser();
        gymStore.completeDailyWorkout(currentUser.id);
        sounds.playSuccess();

        if (window.confetti) {
          window.confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
          setTimeout(() => {
            window.confetti({
              particleCount: 80,
              angle: 60,
              spread: 55,
              origin: { x: 0 }
            });
            window.confetti({
              particleCount: 80,
              angle: 120,
              spread: 55,
              origin: { x: 1 }
            });
          }, 250);
        }

        this.showToast("🏆 Workout Crushed! Streak updated to " + (currentUser.attendanceStreakDays || 1) + " days! 🔥", "success");
        return;
      }

      // 19. Rest Timer Quick Start Buttons
      const timerBtn = target.closest('[data-timer-set]');
      if (timerBtn) {
        const secs = parseInt(timerBtn.getAttribute('data-timer-set'));
        this.startRestTimer(secs);
        return;
      }
      const exRestBtn = target.closest('[data-start-rest-seconds]');
      if (exRestBtn) {
        const secs = parseInt(exRestBtn.getAttribute('data-start-rest-seconds'));
        this.startRestTimer(secs);
        return;
      }
      if (target.closest('#timer-stop-btn')) {
        this.stopRestTimer();
        return;
      }

      // 20. Hydration Tracker +250ml
      if (target.closest('#add-water-glass-btn')) {
        const currentUser = gymStore.getCurrentUser();
        const count = gymStore.incrementWater(currentUser.id);
        sounds.playCheck();
        this.showToast(`💧 Added 250ml! Today: ${(count * 0.25).toFixed(1)}L`, "success");
        return;
      }
      if (target.closest('#reset-water-btn')) {
        const currentUser = gymStore.getCurrentUser();
        currentUser.waterGlassesToday = 0;
        gymStore.saveState();
        this.showToast("Hydration counter reset.", "amber");
        return;
      }

      // 21. Add Exercise Modal to Workout Day
      const addExDayBtn = target.closest('[data-add-exercise-day-idx]');
      if (addExDayBtn) {
        const dayIdx = parseInt(addExDayBtn.getAttribute('data-add-exercise-day-idx'));
        this.openAddExerciseModal(dayIdx);
        return;
      }

      // 22. Remove Exercise from Day
      const removeExBtn = target.closest('[data-remove-exercise]');
      if (removeExBtn) {
        const [dIdx, eIdx] = removeExBtn.getAttribute('data-remove-exercise').split('-').map(Number);
        const selectedClientId = gymStore.editingWorkoutClientId || gymStore.getClients()[0]?.id;
        const plan = gymStore.getWorkoutPlanForUser(selectedClientId);
        if (plan && plan.days[dIdx]) {
          plan.days[dIdx].exercises.splice(eIdx, 1);
          gymStore.saveState();
          this.showToast("Exercise removed.", "amber");
        }
        return;
      }

      // 23. Save Workout Plan & Sync
      const saveWorkoutBtn = target.closest('[data-save-workout-plan-user-id]');
      if (saveWorkoutBtn) {
        const userId = saveWorkoutBtn.getAttribute('data-save-workout-plan-user-id');
        const plan = gymStore.getWorkoutPlanForUser(userId);
        gymStore.saveWorkoutPlan(userId, plan);
        sounds.playSuccess();
        this.showToast("Workout routine synced to member's mobile app!", "success");
        return;
      }

      // 24. Customize Diet Chart Modal
      const editDietBtn = target.closest('[data-edit-diet-modal-user-id]');
      if (editDietBtn) {
        const userId = editDietBtn.getAttribute('data-edit-diet-modal-user-id');
        this.openEditDietModal(userId);
        return;
      }

      // 25. Copy SQL DDL
      if (target.closest('#copy-sql-ddl-btn')) {
        const sql = document.querySelector('pre code')?.innerText;
        if (sql) {
          navigator.clipboard.writeText(sql);
          this.showToast("SQL DDL copied to clipboard!", "success");
        }
        return;
      }

      // 26. Export JSON DB
      if (target.closest('#download-json-db-btn')) {
        const json = gymStore.exportJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `body_engineers_fit_club_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast("Database exported successfully!", "success");
        return;
      }

      // 27. Client Filter in CRM
      const filterBtn = target.closest('.client-filter-btn');
      if (filterBtn) {
        const status = filterBtn.getAttribute('data-filter-status');
        document.querySelectorAll('.client-filter-btn').forEach(b => {
          b.className = 'client-filter-btn px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-850 text-slate-300 hover:text-white border border-slate-800';
        });
        filterBtn.className = 'client-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-500 text-dark-950';

        const clients = gymStore.getClients();
        const filtered = status === 'ALL' ? clients : clients.filter(c => c.feeStatus === status);
        const tbody = document.getElementById('clients-table-body');
        if (tbody) {
          const gym = gymStore.getGymProfile();
          tbody.innerHTML = filtered.map(c => renderClientTableRow(c, gym)).join('');
          if (window.lucide) window.lucide.createIcons();
        }
        return;
      }

      // 28. Print Receipt Action
      if (target.closest('#print-receipt-btn')) {
        window.print();
        return;
      }
    });

    // Handle Dropdown Change Events (Workout & Diet member pickers)
    document.addEventListener('change', (e) => {
      if (e.target.id === 'workout-client-selector') {
        gymStore.editingWorkoutClientId = e.target.value;
        this.render();
      }
      if (e.target.id === 'diet-client-selector') {
        gymStore.editingDietClientId = e.target.value;
        this.render();
      }
    });

    // Handle Client Search Input in CRM
    document.addEventListener('input', (e) => {
      if (e.target.id === 'client-search-input') {
        const query = e.target.value.toLowerCase().trim();
        const clients = gymStore.getClients();
        const filtered = clients.filter(c => 
          c.fullName.toLowerCase().includes(query) ||
          c.phone.includes(query) ||
          c.memberCode.toLowerCase().includes(query)
        );
        const tbody = document.getElementById('clients-table-body');
        if (tbody) {
          const gym = gymStore.getGymProfile();
          tbody.innerHTML = filtered.map(c => renderClientTableRow(c, gym)).join('');
          if (window.lucide) window.lucide.createIcons();
        }
      }
    });
  }

  // --- MODAL: ADD NEW MEMBER ---
  openAddClientModal() {
    const gym = gymStore.getGymProfile();
    const modalHtml = `
      <div class="space-y-5">
        <div>
          <h3 class="font-outfit text-xl font-bold text-white flex items-center gap-2">
            <i data-lucide="user-plus" class="w-5 h-5 text-brand-400"></i>
            <span>Add New Club Member</span>
          </h3>
          <p class="text-xs text-slate-400">Enroll member, assign initial plan, and generate first billing cycle</p>
        </div>

        <form id="add-client-form" class="space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Full Name *</label>
              <input type="text" name="fullName" required placeholder="e.g. Vikramaditya Singh" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Phone Number (WhatsApp) *</label>
              <input type="tel" name="phone" required placeholder="+91 98765 43210" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Email Address *</label>
              <input type="email" name="email" required placeholder="member@example.com" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Membership Tier *</label>
              <select name="membershipTier" id="new-client-tier" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
                <option value="Monthly Pro Plan" data-fee="2500" data-days="30">Monthly Pro Plan (₹2,500 / 30 Days)</option>
                <option value="Quarterly Pro" data-fee="6500" data-days="90">Quarterly Pro (₹6,500 / 90 Days)</option>
                <option value="Half-Yearly Elite" data-fee="11000" data-days="180">Half-Yearly Elite (₹11,000 / 180 Days)</option>
                <option value="Annual VIP Elite" data-fee="18000" data-days="365">Annual VIP Elite (₹18,000 / 365 Days)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Admission Fee (₹) *</label>
              <input type="number" name="monthlyFee" id="new-client-fee" value="2500" required class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-brand-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Join Date</label>
              <input type="date" name="joinDate" value="2026-09-09" required class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Next Due Date *</label>
              <input type="date" name="nextFeeDueDate" id="new-client-due-date" value="2026-10-09" required class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-brand-500">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Current Weight (kg)</label>
              <input type="number" step="0.5" name="currentWeightKg" value="72.0" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Target Weight (kg)</label>
              <input type="number" step="0.5" name="targetWeightKg" value="68.0" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Height (cm)</label>
              <input type="number" name="heightCm" value="175" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Fitness Goal</label>
              <input type="text" name="fitnessGoal" value="Lean Muscle & Strength" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Payment Method</label>
              <select name="paymentMethod" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
                <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="NetBanking">NetBanking</option>
              </select>
            </div>
          </div>

          <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button type="button" id="close-modal-btn" class="px-4 py-2 rounded-xl bg-dark-950 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 font-black flex items-center gap-2 shadow-glow-emerald">
              <i data-lucide="check" class="w-4 h-4"></i>
              <span>Enroll Member</span>
            </button>
          </div>
        </form>
      </div>
    `;

    this.openModal(modalHtml);

    // Auto-calculate fee & due date on plan change
    const tierSelect = document.getElementById('new-client-tier');
    const feeInput = document.getElementById('new-client-fee');
    const dueInput = document.getElementById('new-client-due-date');

    tierSelect?.addEventListener('change', () => {
      const selectedOption = tierSelect.options[tierSelect.selectedIndex];
      const fee = selectedOption.getAttribute('data-fee');
      const days = parseInt(selectedOption.getAttribute('data-days')) || 30;

      if (feeInput) feeInput.value = fee;
      
      const nextDate = new Date("2026-09-09");
      nextDate.setDate(nextDate.getDate() + days);
      if (dueInput) dueInput.value = nextDate.toISOString().split('T')[0];
    });

    // Form submit
    const form = document.getElementById('add-client-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(form).entries());
      const newClient = gymStore.addClient(formData);
      sounds.playSuccess();
      this.closeModal();
      this.showToast(`🎉 Enrolled ${newClient.fullName}! Member Code: ${newClient.memberCode}`, "success");
    });
  }

  // --- MODAL: LOG FEE PAYMENT ---
  openLogPaymentModal(preselectedUserId = null) {
    const clients = gymStore.getClients();
    const gym = gymStore.getGymProfile();
    const initialUser = preselectedUserId ? gymStore.getClientById(preselectedUserId) : clients[0];

    const modalHtml = `
      <div class="space-y-5">
        <div>
          <h3 class="font-outfit text-xl font-bold text-white flex items-center gap-2">
            <i data-lucide="credit-card" class="w-5 h-5 text-amber-400"></i>
            <span>Log Membership Fee Payment</span>
          </h3>
          <p class="text-xs text-slate-400">Record fee collection, update next renewal due date, and issue official receipt</p>
        </div>

        <form id="log-payment-form" class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Select Member *</label>
            <select name="userId" id="payment-user-select" required class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white font-bold focus:outline-none focus:border-brand-500">
              ${clients.map(c => `
                <option value="${c.id}" ${c.id === (initialUser?.id) ? 'selected' : ''} data-fee="${c.monthlyFee}" data-tier="${c.membershipTier}">
                  ${c.fullName} (${c.memberCode}) - Due: ${c.nextFeeDueDate} [${c.feeStatus}]
                </option>
              `).join('')}
            </select>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Amount Paid (₹) *</label>
              <input type="number" name="amount" id="payment-amount" value="${initialUser ? initialUser.monthlyFee : 2500}" required class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-brand-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Plan Duration *</label>
              <select name="planDuration" id="payment-plan-duration" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
                <option value="1 Month Renewal" data-days="30">1 Month Renewal (+30 Days)</option>
                <option value="3 Months Package" data-days="90">3 Months Package (+90 Days)</option>
                <option value="6 Months Package" data-days="180">6 Months Package (+180 Days)</option>
                <option value="12 Months Annual VIP" data-days="365">12 Months Annual VIP (+365 Days)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Payment Date</label>
              <input type="date" name="paymentDate" value="2026-09-09" required class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">New Next Due Date *</label>
              <input type="date" name="dueDate" id="payment-due-date" value="2026-10-09" required class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-brand-500">
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1">Payment Method</label>
            <select name="paymentMethod" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
              <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
              <option value="Cash">Cash at Reception</option>
              <option value="Credit Card">Credit Card (POS Terminal)</option>
              <option value="Debit Card">Debit Card</option>
              <option value="NetBanking">NetBanking / Bank Transfer</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1">Notes / Transaction Reference</label>
            <input type="text" name="notes" placeholder="e.g. Received via PhonePe UPI Txn #92810" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500">
          </div>

          <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button type="button" id="close-modal-btn" class="px-4 py-2 rounded-xl bg-dark-950 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-dark-950 font-black flex items-center gap-2 shadow-glow-amber">
              <i data-lucide="check-circle" class="w-4 h-4"></i>
              <span>Confirm & Generate Receipt</span>
            </button>
          </div>
        </form>
      </div>
    `;

    this.openModal(modalHtml);

    // Dynamic Due Date calculation
    const durationSelect = document.getElementById('payment-plan-duration');
    const dueDateInput = document.getElementById('payment-due-date');

    durationSelect?.addEventListener('change', () => {
      const days = parseInt(durationSelect.options[durationSelect.selectedIndex].getAttribute('data-days')) || 30;
      const nextDate = new Date("2026-09-09");
      nextDate.setDate(nextDate.getDate() + days);
      if (dueDateInput) dueDateInput.value = nextDate.toISOString().split('T')[0];
    });

    // Form submit
    const form = document.getElementById('log-payment-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(form).entries());
      const newPayment = gymStore.logPayment(formData);
      sounds.playSuccess();
      this.closeModal();
      this.showToast(`✅ Payment of ₹${formData.amount} logged! Next Due Date: ${formData.dueDate}`, "success");
      // Open receipt automatically
      setTimeout(() => this.openReceiptModal(newPayment.id), 300);
    });
  }

  // --- MODAL: TAX INVOICE & RECEIPT ---
  openReceiptModal(paymentId) {
    const payment = gymStore.getAllPayments().find(p => p.id === paymentId);
    if (!payment) return;
    const user = gymStore.getClientById(payment.userId);
    const gym = gymStore.getGymProfile();

    const modalHtml = `
      <div class="space-y-6">
        <!-- Printable Area Wrapper -->
        <div id="printable-receipt-area" class="p-6 rounded-2xl bg-dark-950 border border-slate-800 text-slate-200 space-y-6">
          
          <!-- Header -->
          <div class="flex items-start justify-between border-b border-slate-800 pb-4">
            <div>
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-black text-dark-950 text-sm">BE</div>
                <h4 class="font-outfit font-black text-lg text-white">${gym.name}</h4>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">${gym.address}</p>
              <p class="text-[11px] text-slate-400">Phone: ${gym.phone} • UPI: ${gym.upiId}</p>
            </div>
            <div class="text-right">
              <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-400 block">OFFICIAL RECEIPT</span>
              <span class="font-mono font-bold text-white text-sm">${payment.invoiceNumber}</span>
              <span class="text-[11px] text-slate-400 block mt-0.5">Date: ${payment.paymentDate}</span>
            </div>
          </div>

          <!-- Billed To -->
          <div class="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-bold">Billed To Member</span>
              <div class="font-bold text-white text-sm mt-0.5">${user ? user.fullName : 'Member'}</div>
              <div class="text-slate-400 font-mono">${user ? user.memberCode : ''}</div>
              <div class="text-slate-400">${user ? user.phone : ''}</div>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-slate-400 uppercase font-bold">Membership Validity</span>
              <div class="font-bold text-emerald-400 text-sm mt-0.5">${payment.planDuration}</div>
              <div class="text-slate-300">Valid Till: <b class="text-white">${payment.dueDate}</b></div>
              <div class="text-slate-400">Paid via ${payment.paymentMethod}</div>
            </div>
          </div>

          <!-- Line Items Table -->
          <div class="border border-slate-800 rounded-xl overflow-hidden text-xs">
            <div class="bg-dark-900 px-4 py-2 font-bold text-slate-400 flex justify-between">
              <span>Item Description</span>
              <span>Amount</span>
            </div>
            <div class="px-4 py-3 flex justify-between border-t border-slate-800">
              <div>
                <span class="font-bold text-white">${payment.planDuration} - Gym & Training Access</span>
                <p class="text-[11px] text-slate-400">Includes workout charts, custom diet schedule, and locker facility.</p>
              </div>
              <span class="font-mono font-bold text-white">${gym.currency}${payment.amount.toLocaleString('en-IN')}</span>
            </div>
            <div class="bg-dark-900/80 px-4 py-2.5 font-bold text-white flex justify-between border-t border-slate-800">
              <span>Total Paid</span>
              <span class="text-base text-brand-400">${gym.currency}${payment.amount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <!-- Footer Seal -->
          <div class="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            <span>Status: <b class="text-emerald-400">PAID & VERIFIED</b></span>
            <span>Authorized by Body Engineers Fit Club</span>
          </div>

        </div>

        <!-- Print & Close Actions -->
        <div class="flex items-center justify-between gap-3">
          ${user ? `
            <a href="${generateWhatsAppReminderUrl(user, gym)}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-2 rounded-xl bg-dark-850 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <i data-lucide="share-2" class="w-4 h-4"></i>
              <span>WhatsApp to Member</span>
            </a>
          ` : '<div></div>'}

          <div class="flex items-center gap-2">
            <button id="close-modal-btn" class="px-4 py-2 rounded-xl bg-dark-950 hover:bg-slate-800 text-slate-400 text-xs font-semibold">Close</button>
            <button id="print-receipt-btn" class="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 text-xs font-black flex items-center gap-1.5 shadow-glow-emerald">
              <i data-lucide="printer" class="w-4 h-4"></i>
              <span>Print Tax Invoice</span>
            </button>
          </div>
        </div>

      </div>
    `;

    this.openModal(modalHtml);
  }

  // --- MODAL: VIEW CLIENT FULL PROFILE ---
  openClientDetailModal(clientId) {
    const client = gymStore.getClientById(clientId);
    if (!client) return;
    const gym = gymStore.getGymProfile();
    const workoutPlan = gymStore.getWorkoutPlanForUser(clientId);
    const dietPlan = gymStore.getDietPlanForUser(clientId);
    const payments = gymStore.getPaymentsForUser(clientId);

    const isOverdue = client.feeStatus === 'OVERDUE';
    const isDueSoon = client.feeStatus === 'DUE_SOON';

    const modalHtml = `
      <div class="space-y-5">
        <!-- Client Profile Header -->
        <div class="flex items-start gap-4 pb-4 border-b border-slate-800">
          <img src="${client.avatarUrl}" alt="${client.fullName}" class="w-16 h-16 rounded-2xl object-cover ring-2 ${isOverdue ? 'ring-rose-500' : isDueSoon ? 'ring-amber-500' : 'ring-emerald-500'}">
          <div class="flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-outfit text-xl font-bold text-white">${client.fullName}</h3>
              <span class="text-xs font-mono font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">${client.memberCode}</span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">${client.membershipTier} • Joined ${client.joinDate}</p>
            <div class="mt-2 flex items-center gap-2 flex-wrap text-xs">
              <span class="px-2 py-0.5 rounded-full font-bold ${isOverdue ? 'bg-rose-500/20 text-rose-300' : isDueSoon ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}">
                Fee: ${client.feeStatus} (Due: ${client.nextFeeDueDate})
              </span>
              <span class="text-slate-400">•</span>
              <span class="text-brand-300 font-semibold">${client.fitnessGoal}</span>
            </div>
          </div>
        </div>

        <!-- Key Metrics Cards -->
        <div class="grid grid-cols-3 gap-2.5 text-center text-xs">
          <div class="p-3 rounded-xl bg-dark-950 border border-slate-800">
            <span class="text-[10px] text-slate-400 font-bold uppercase">Weight</span>
            <div class="font-bold text-white text-sm mt-0.5">${client.currentWeightKg} kg</div>
          </div>
          <div class="p-3 rounded-xl bg-dark-950 border border-slate-800">
            <span class="text-[10px] text-slate-400 font-bold uppercase">Target</span>
            <div class="font-bold text-brand-400 text-sm mt-0.5">${client.targetWeightKg} kg</div>
          </div>
          <div class="p-3 rounded-xl bg-dark-950 border border-slate-800">
            <span class="text-[10px] text-slate-400 font-bold uppercase">Streak</span>
            <div class="font-bold text-amber-400 text-sm mt-0.5">${client.attendanceStreakDays || 1} Days</div>
          </div>
        </div>

        <!-- Assigned Split & Diet Summary -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="p-3.5 rounded-xl bg-dark-950 border border-slate-800 space-y-1">
            <span class="text-brand-400 font-bold flex items-center gap-1">
              <i data-lucide="dumbbell" class="w-3.5 h-3.5"></i> Workout Plan
            </span>
            <div class="font-bold text-white">${workoutPlan.title}</div>
            <p class="text-slate-400 text-[11px]">${workoutPlan.days.length} Days Split (${workoutPlan.splitType})</p>
          </div>

          <div class="p-3.5 rounded-xl bg-dark-950 border border-slate-800 space-y-1">
            <span class="text-emerald-400 font-bold flex items-center gap-1">
              <i data-lucide="utensils" class="w-3.5 h-3.5"></i> Nutrition Plan
            </span>
            <div class="font-bold text-white">${dietPlan.dailyCalories} kcal • ${dietPlan.targetProteinG}g Prot</div>
            <p class="text-slate-400 text-[11px]">${dietPlan.meals.length} Meals • ${dietPlan.dietaryType}</p>
          </div>
        </div>

        <!-- Quick Actions Footer -->
        <div class="pt-4 flex items-center justify-between gap-3 border-t border-slate-800">
          <a href="${generateWhatsAppReminderUrl(client, gym)}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-2 rounded-xl bg-dark-850 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors">
            <i data-lucide="message-circle" class="w-4 h-4"></i>
            <span>WhatsApp Chat</span>
          </a>

          <div class="flex items-center gap-2">
            <button data-quick-pay-user-id="${client.id}" class="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 text-xs font-black shadow-glow-emerald">
              Log Payment
            </button>
            <button id="close-modal-btn" class="px-4 py-2 rounded-xl bg-dark-950 hover:bg-slate-800 text-slate-400 text-xs font-semibold">
              Close
            </button>
          </div>
        </div>

      </div>
    `;

    this.openModal(modalHtml);
  }

  // --- MODAL: EDIT CLIENT PROFILE ---
  openEditClientModal(clientId) {
    const client = gymStore.getClientById(clientId);
    if (!client) return;

    const modalHtml = `
      <div class="space-y-5">
        <div>
          <h3 class="font-outfit text-xl font-bold text-white flex items-center gap-2">
            <i data-lucide="pencil" class="w-5 h-5 text-brand-400"></i>
            <span>Edit Member Profile: ${client.fullName}</span>
          </h3>
          <p class="text-xs text-slate-400">Update contact info, goals, or subscription fee</p>
        </div>

        <form id="edit-client-form" class="space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Full Name</label>
              <input type="text" name="fullName" value="${client.fullName}" required class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Phone Number</label>
              <input type="tel" name="phone" value="${client.phone}" required class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Monthly Fee (₹)</label>
              <input type="number" name="monthlyFee" value="${client.monthlyFee}" required class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-brand-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Next Due Date</label>
              <input type="date" name="nextFeeDueDate" value="${client.nextFeeDueDate}" required class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-brand-500">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Weight (kg)</label>
              <input type="number" step="0.5" name="currentWeightKg" value="${client.currentWeightKg}" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Target Weight (kg)</label>
              <input type="number" step="0.5" name="targetWeightKg" value="${client.targetWeightKg}" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Height (cm)</label>
              <input type="number" name="heightCm" value="${client.heightCm}" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1">Fitness Goal</label>
            <input type="text" name="fitnessGoal" value="${client.fitnessGoal}" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
          </div>

          <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button type="button" id="close-modal-btn" class="px-4 py-2 rounded-xl bg-dark-950 hover:bg-slate-800 text-slate-400 font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 font-black shadow-glow-emerald">Save Changes</button>
          </div>
        </form>
      </div>
    `;

    this.openModal(modalHtml);

    const form = document.getElementById('edit-client-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(form).entries());
      gymStore.updateClient(clientId, formData);
      sounds.playSuccess();
      this.closeModal();
      this.showToast("Member profile updated!", "success");
    });
  }

  // --- MODAL: ADD EXERCISE TO WORKOUT ---
  openAddExerciseModal(dayIdx) {
    const selectedClientId = gymStore.editingWorkoutClientId || gymStore.getClients()[0]?.id;
    const plan = gymStore.getWorkoutPlanForUser(selectedClientId);
    if (!plan || !plan.days[dayIdx]) return;
    const day = plan.days[dayIdx];

    const modalHtml = `
      <div class="space-y-5">
        <div>
          <h3 class="font-outfit text-xl font-bold text-white flex items-center gap-2">
            <i data-lucide="plus-circle" class="w-5 h-5 text-brand-400"></i>
            <span>Add Exercise to ${day.dayName} (${day.routineTitle})</span>
          </h3>
          <p class="text-xs text-slate-400">Configure exercise targets, sets, reps, and rest duration</p>
        </div>

        <form id="add-exercise-form" class="space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Exercise Name *</label>
              <input type="text" name="name" required placeholder="e.g. Standing Overhead Press" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Muscle Group *</label>
              <select name="muscleGroup" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
                <option value="Chest">Chest</option>
                <option value="Back">Back</option>
                <option value="Legs">Legs / Quads</option>
                <option value="Shoulders">Shoulders</option>
                <option value="Biceps">Biceps</option>
                <option value="Triceps">Triceps</option>
                <option value="Hamstrings/Glutes">Hamstrings / Glutes</option>
                <option value="Core">Core / Abs</option>
                <option value="Cardio">Cardio / HIIT</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Target Sets</label>
              <input type="number" name="targetSets" value="3" required class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Target Reps</label>
              <input type="text" name="targetReps" value="8 - 12" required class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Weight (kg)</label>
              <input type="number" name="targetWeightKg" value="20" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Rest Duration (Sec)</label>
              <input type="number" name="restSeconds" value="60" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Video Guide Link</label>
              <input type="url" name="videoGuideUrl" placeholder="https://youtube.com/..." class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1">Form Cue / Notes</label>
            <input type="text" name="notes" placeholder="e.g. Keep spine neutral, squeeze at peak contraction" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
          </div>

          <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button type="button" id="close-modal-btn" class="px-4 py-2 rounded-xl bg-dark-950 hover:bg-slate-800 text-slate-400 font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 font-black shadow-glow-emerald">Add Exercise</button>
          </div>
        </form>
      </div>
    `;

    this.openModal(modalHtml);

    const form = document.getElementById('add-exercise-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      day.exercises.push({
        id: `ex_${Date.now()}`,
        name: data.name,
        muscleGroup: data.muscleGroup,
        targetSets: parseInt(data.targetSets) || 3,
        targetReps: data.targetReps || "8-12",
        targetWeightKg: parseFloat(data.targetWeightKg) || 0,
        restSeconds: parseInt(data.restSeconds) || 60,
        notes: data.notes || "",
        videoGuideUrl: data.videoGuideUrl || "",
        completed: false
      });
      gymStore.saveState();
      sounds.playSuccess();
      this.closeModal();
      this.showToast(`Added ${data.name} to ${day.dayName}!`, "success");
    });
  }

  // --- MODAL: EDIT DIET CHART & MACROS ---
  openEditDietModal(userId) {
    const dietPlan = gymStore.getDietPlanForUser(userId);

    const modalHtml = `
      <div class="space-y-5">
        <div>
          <h3 class="font-outfit text-xl font-bold text-white flex items-center gap-2">
            <i data-lucide="utensils" class="w-5 h-5 text-emerald-400"></i>
            <span>Customize Diet & Macronutrient Targets</span>
          </h3>
          <p class="text-xs text-slate-400">Set daily calorie goal, protein, carbs, fats, and hydration</p>
        </div>

        <form id="edit-diet-form" class="space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Diet Title</label>
              <input type="text" name="title" value="${dietPlan.title}" required class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Dietary Type</label>
              <select name="dietaryType" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
                <option value="Non-Vegetarian" ${dietPlan.dietaryType === 'Non-Vegetarian' ? 'selected' : ''}>Non-Vegetarian</option>
                <option value="Vegetarian" ${dietPlan.dietaryType === 'Vegetarian' ? 'selected' : ''}>Vegetarian</option>
                <option value="Eggetarian" ${dietPlan.dietaryType === 'Eggetarian' ? 'selected' : ''}>Eggetarian</option>
                <option value="Vegan" ${dietPlan.dietaryType === 'Vegan' ? 'selected' : ''}>Vegan</option>
                <option value="Keto" ${dietPlan.dietaryType === 'Keto' ? 'selected' : ''}>Keto</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Calories (kcal)</label>
              <input type="number" name="dailyCalories" value="${dietPlan.dailyCalories}" required class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-brand-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Protein (g)</label>
              <input type="number" name="targetProteinG" value="${dietPlan.targetProteinG}" required class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-brand-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Carbs (g)</label>
              <input type="number" name="targetCarbsG" value="${dietPlan.targetCarbsG}" required class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-brand-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Fats (g)</label>
              <input type="number" name="targetFatsG" value="${dietPlan.targetFatsG}" required class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-brand-500">
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1">Daily Water Target (Liters)</label>
            <input type="number" step="0.5" name="dailyWaterLiters" value="${dietPlan.dailyWaterLiters || 3.5}" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1">Coach Notes & Dietary Rules</label>
            <textarea name="notes" rows="3" class="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500">${dietPlan.notes || ''}</textarea>
          </div>

          <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button type="button" id="close-modal-btn" class="px-4 py-2 rounded-xl bg-dark-950 hover:bg-slate-800 text-slate-400 font-semibold">Cancel</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 font-black shadow-glow-emerald">Save Diet Targets</button>
          </div>
        </form>
      </div>
    `;

    this.openModal(modalHtml);

    const form = document.getElementById('edit-diet-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(form).entries());
      formData.meals = dietPlan.meals; // Preserve meal schedule
      gymStore.saveDietPlan(userId, formData);
      sounds.playSuccess();
      this.closeModal();
      this.showToast("Diet targets customized and saved!", "success");
    });
  }
}

// Instantiate and attach to window
window.app = new AppController();
