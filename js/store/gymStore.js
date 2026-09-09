/**
 * Central Reactive State Store — Body Engineers Fit Club
 * Backed by SQLite via Express REST API (http://localhost:3001/api)
 * Maintains the same synchronous getter interface for UI compatibility.
 */

import { api } from '../utils/api.js';

class GymStore {
  constructor() {
    this.listeners = new Set();

    // In-memory cache — populated by initFromAPI()
    this.state = {
      users: [],
      workoutPlans: [],
      dietPlans: [],
      payments: [],
      notifications: [],
      gymProfile: {
        name: 'Body Engineers Fit Club',
        tagline: 'Precision Training & Science-Backed Nutrition',
        currency: '₹',
        logoText: 'BODY ENGINEERS',
        subText: 'FIT CLUB',
        address: '',
        phone: '',
        email: '',
        upiId: '',
      },
    };

    // UI Session State (not persisted)
    this.activeUserId = 'usr_admin_01';
    this.adminTab = 'dashboard';
    this.clientTab = 'workout';
    this.viewMode = 'responsive';
    this.selectedClientDetailId = null;
    this.editingWorkoutClientId = null;
    this.editingDietClientId = null;

    // Loading / error state for app bootstrap
    this.isLoading = true;
    this.loadError = null;
  }

  // ─────────────────────────────────────────────
  // BOOTSTRAP — load all data from API once
  // ─────────────────────────────────────────────
  async initFromAPI() {
    try {
      this.isLoading = true;
      const [users, workoutPlans, dietPlans, payments, notifications, gymProfile] = await Promise.all([
        api.getUsers(),
        api.getWorkoutPlans(),
        api.getDietPlans(),
        api.getPayments(),
        api.getNotifications(),
        api.getGymProfile(),
      ]);

      this.state.users = users;
      this.state.workoutPlans = workoutPlans;
      this.state.dietPlans = dietPlans;
      this.state.payments = payments;
      this.state.notifications = notifications;
      this.state.gymProfile = gymProfile;

      // Set active user to the ADMIN
      const admin = users.find(u => u.role === 'ADMIN');
      if (admin) this.activeUserId = admin.id;

      this.isLoading = false;
      this.loadError = null;
    } catch (err) {
      this.isLoading = false;
      this.loadError = err.message;
      console.error('❌ Failed to connect to API server:', err);
      throw err;
    }
  }

  // ─────────────────────────────────────────────
  // REACTIVE SUBSCRIPTION
  // ─────────────────────────────────────────────
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  /** Save state is now a no-op for localStorage, but notifies listeners */
  saveState() {
    this.notify();
  }

  // ─────────────────────────────────────────────
  // GETTERS (synchronous — reads from cache)
  // ─────────────────────────────────────────────
  getCurrentUser() {
    return this.state.users.find(u => u.id === this.activeUserId) || this.state.users[0];
  }

  getAllUsers() {
    return this.state.users;
  }

  getClients() {
    return this.state.users.filter(u => u.role === 'CLIENT');
  }

  getClientById(id) {
    return this.state.users.find(u => u.id === id);
  }

  getWorkoutPlanForUser(userId) {
    let plan = this.state.workoutPlans.find(wp => wp.userId === userId);
    if (!plan) {
      // Fallback: auto plan (will be replaced once API creates one for new member)
      plan = {
        id: `wp_auto_${userId}`,
        userId,
        title: 'Standard 4-Day Strength & Conditioning',
        splitType: 'Upper-Lower Split',
        lastUpdated: new Date().toISOString().split('T')[0],
        days: [
          {
            id: `wd_${userId}_1`,
            dayName: 'Today',
            routineTitle: 'Full Body Foundation',
            estimatedMinutes: 50,
            muscleGroups: 'Chest, Back, Legs, Core',
            isToday: true,
            exercises: [
              { id: 'ex_auto_1', name: 'Goblet Squats', muscleGroup: 'Legs', targetSets: 3, targetReps: '12', targetWeightKg: 16, restSeconds: 60, completed: false, notes: 'Focus on deep range.' },
              { id: 'ex_auto_2', name: 'Push-ups / Incline DB Press', muscleGroup: 'Chest', targetSets: 3, targetReps: '10 - 12', targetWeightKg: 14, restSeconds: 60, completed: false, notes: 'Keep core tight.' },
              { id: 'ex_auto_3', name: 'Lat Pulldown / Band Pulls', muscleGroup: 'Back', targetSets: 3, targetReps: '12', targetWeightKg: 45, restSeconds: 60, completed: false, notes: 'Drive elbows down.' },
              { id: 'ex_auto_4', name: 'Plank Hold', muscleGroup: 'Core', targetSets: 3, targetReps: '45 sec', targetWeightKg: 0, restSeconds: 45, completed: false, notes: 'Flat back.' },
            ],
          },
        ],
      };
    }
    return plan;
  }

  getDietPlanForUser(userId) {
    let plan = this.state.dietPlans.find(dp => dp.userId === userId);
    if (!plan) {
      plan = {
        id: `dp_auto_${userId}`,
        userId,
        title: 'Standard High-Protein Lifestyle Diet',
        dailyCalories: 2100,
        targetProteinG: 140,
        targetCarbsG: 220,
        targetFatsG: 55,
        dailyWaterLiters: 3.0,
        dietaryType: 'Balanced Fitness',
        lastUpdated: new Date().toISOString().split('T')[0],
        notes: 'Stay hydrated and space meals 3-4 hours apart.',
        meals: [
          { id: 'm_auto_1', name: 'Nutritious Breakfast', timeString: '08:30 AM', notes: 'High protein starter', items: [
            { id: 'fi_a1', name: 'Eggs / Tofu Scramble', portion: '3 Eggs / 120g Tofu', calories: 210, proteinG: 18, carbsG: 2, fatsG: 14 },
            { id: 'fi_a2', name: 'Oatmeal with Almonds', portion: '50g Oats + Nuts', calories: 220, proteinG: 7, carbsG: 38, fatsG: 5 },
          ]},
          { id: 'm_auto_2', name: 'Power Lunch', timeString: '01:00 PM', notes: 'Lean protein with complex carbohydrates', items: [
            { id: 'fi_a3', name: 'Grilled Protein (Chicken / Paneer)', portion: '150g Portion', calories: 260, proteinG: 35, carbsG: 2, fatsG: 8 },
            { id: 'fi_a4', name: 'Brown Rice & Green Veggies', portion: '1 Cup Rice + 1 Cup Greens', calories: 230, proteinG: 5, carbsG: 45, fatsG: 2 },
          ]},
        ],
      };
    }
    return plan;
  }

  getPaymentsForUser(userId) {
    return this.state.payments.filter(p => p.userId === userId).sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
  }

  getAllPayments() {
    return [...this.state.payments].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
  }

  getGymProfile() {
    return this.state.gymProfile;
  }

  getNotifications(userId) {
    return this.state.notifications.filter(n => !n.recipientId || n.recipientId === userId);
  }

  // ─────────────────────────────────────────────
  // UI TAB / SESSION MUTATIONS (sync — no API)
  // ─────────────────────────────────────────────
  setActiveUser(userId) {
    this.activeUserId = userId;
    const user = this.getCurrentUser();
    if (user?.role === 'CLIENT') {
      this.clientTab = 'workout';
    } else {
      this.adminTab = 'dashboard';
    }
    this.notify();
  }

  setAdminTab(tab)   { this.adminTab = tab;   this.notify(); }
  setClientTab(tab)  { this.clientTab = tab;  this.notify(); }
  setViewMode(mode)  { this.viewMode = mode;  this.notify(); }

  // Fee status is now computed server-side; this is kept for compatibility
  recalculateFeeStatuses(save = true) {
    const today = new Date();
    this.state.users.forEach(user => {
      if (user.role !== 'CLIENT') return;
      const due = new Date(user.nextFeeDueDate);
      const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      if (diffDays < 0)       user.feeStatus = 'OVERDUE';
      else if (diffDays <= 7) user.feeStatus = 'DUE_SOON';
      else                    user.feeStatus = 'PAID';
    });
    if (save) this.notify();
  }

  // ─────────────────────────────────────────────
  // ASYNC MUTATIONS — write to API then refresh cache
  // ─────────────────────────────────────────────

  async addClient(formData) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const memberCode = `BE-2026-${randomSuffix}`;
    const joinDate = formData.joinDate || new Date().toISOString().split('T')[0];
    const nextFeeDueDate = formData.nextFeeDueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const monthlyFee = parseFloat(formData.monthlyFee) || 2500;

    const newClient = await api.createUser({
      role: 'CLIENT',
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      avatarUrl: formData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName)}&background=10b981&color=06090e&size=150`,
      memberCode,
      membershipTier: formData.membershipTier || 'Monthly Pro Plan',
      joinDate,
      nextFeeDueDate,
      monthlyFee,
      trainerId: formData.trainerId || 'usr_admin_01',
      currentWeightKg: parseFloat(formData.currentWeightKg) || 70,
      targetWeightKg: parseFloat(formData.targetWeightKg) || 68,
      heightCm: parseInt(formData.heightCm) || 175,
      fitnessGoal: formData.fitnessGoal || 'General Fitness & Toning',
      emergencyContact: formData.emergencyContact || '+91 99000 11223',
    });

    // Also create the initial payment record
    const initialPayment = await api.createPayment({
      userId: newClient.id,
      invoiceNumber: `INV-${memberCode}`,
      amount: monthlyFee,
      planDuration: formData.membershipTier || '1 Month',
      paymentDate: joinDate,
      dueDate: nextFeeDueDate,
      paymentMethod: formData.paymentMethod || 'UPI',
      transactionRef: `INIT-${Date.now().toString().slice(-6)}`,
      status: 'PAID',
      notes: 'Joining admission and initial membership fee.',
    });

    // Update local cache
    this.state.users.unshift(newClient);
    this.state.payments.unshift(initialPayment);
    // Fetch newly created workout + diet plans
    const [wps, dps] = await Promise.all([
      api.getWorkoutPlans(newClient.id),
      api.getDietPlans(newClient.id),
    ]);
    this.state.workoutPlans.push(...wps);
    this.state.dietPlans.push(...dps);

    this.notify();
    return newClient;
  }

  async updateClient(id, updates) {
    const updated = await api.updateUser(id, updates);
    const idx = this.state.users.findIndex(u => u.id === id);
    if (idx !== -1) this.state.users[idx] = updated;
    this.recalculateFeeStatuses(false);
    this.notify();
    return updated;
  }

  async deleteClient(id) {
    await api.deleteUser(id);
    this.state.users        = this.state.users.filter(u => u.id !== id);
    this.state.payments     = this.state.payments.filter(p => p.userId !== id);
    this.state.workoutPlans = this.state.workoutPlans.filter(wp => wp.userId !== id);
    this.state.dietPlans    = this.state.dietPlans.filter(dp => dp.userId !== id);
    this.notify();
  }

  async logPayment({ userId, amount, planDuration, paymentMethod, paymentDate, dueDate, notes }) {
    const user = this.getClientById(userId);
    if (!user) return false;

    const invoiceNumber = `INV-BE-${Date.now().toString().slice(-6)}`;
    const newPayment = await api.createPayment({
      userId,
      invoiceNumber,
      amount: parseFloat(amount),
      planDuration: planDuration || '1 Month Pro',
      paymentDate: paymentDate || new Date().toISOString().split('T')[0],
      dueDate,
      paymentMethod: paymentMethod || 'UPI',
      transactionRef: `TXN-${Date.now().toString().slice(-8)}`,
      status: 'PAID',
      notes: notes || 'Membership renewal fee logged by Admin.',
    });

    // Update local payment cache
    this.state.payments.unshift(newPayment);

    // Update user's due date in cache (the server already updated the DB)
    const userIdx = this.state.users.findIndex(u => u.id === userId);
    if (userIdx !== -1) {
      this.state.users[userIdx].nextFeeDueDate = dueDate;
      this.recalculateFeeStatuses(false);
    }

    // Create notification
    const notif = await api.createNotification({
      recipientId: userId,
      type: 'payment_receipt',
      title: 'Fee Payment Received!',
      message: `Payment of ${this.state.gymProfile.currency}${amount} received successfully. Next due date: ${dueDate}.`,
    });
    this.state.notifications.unshift(notif);

    this.notify();
    return newPayment;
  }

  async toggleExercise(userId, dayId, exerciseId) {
    const plan = this.getWorkoutPlanForUser(userId);
    if (!plan) return;

    let toggled = false;
    for (const day of plan.days) {
      if (day.id === dayId || !dayId) {
        const ex = day.exercises.find(e => e.id === exerciseId);
        if (ex) {
          ex.completed = !ex.completed;
          toggled = ex.completed;
          break;
        }
      }
    }

    // Persist updated days blob to API
    await api.updateWorkoutPlan(plan.id, { days: plan.days });
    this.notify();
    return toggled;
  }

  async completeDailyWorkout(userId) {
    const user = this.getClientById(userId);
    const plan = this.getWorkoutPlanForUser(userId);
    if (plan) {
      plan.days.forEach(day => {
        if (day.isToday) day.exercises.forEach(e => { e.completed = true; });
      });
      await api.updateWorkoutPlan(plan.id, { days: plan.days });
    }
    if (user) {
      user.attendanceStreakDays = (user.attendanceStreakDays || 0) + 1;
      await api.updateUser(userId, { attendanceStreakDays: user.attendanceStreakDays });
    }
    this.notify();
  }

  async incrementWater(userId) {
    const user = this.getClientById(userId);
    if (user) {
      user.waterGlassesToday = (user.waterGlassesToday || 0) + 1;
      await api.updateUser(userId, { waterGlassesToday: user.waterGlassesToday });
      this.notify();
      return user.waterGlassesToday;
    }
    return 0;
  }

  async decrementWater(userId) {
    const user = this.getClientById(userId);
    if (user && user.waterGlassesToday > 0) {
      user.waterGlassesToday -= 1;
      await api.updateUser(userId, { waterGlassesToday: user.waterGlassesToday });
      this.notify();
      return user.waterGlassesToday;
    }
    return 0;
  }

  async saveWorkoutPlan(userId, planData) {
    const existingPlan = this.state.workoutPlans.find(wp => wp.userId === userId);
    let saved;
    if (existingPlan) {
      saved = await api.updateWorkoutPlan(existingPlan.id, {
        title: planData.title,
        splitType: planData.splitType || 'Push-Pull-Legs',
        days: planData.days,
      });
      const idx = this.state.workoutPlans.findIndex(wp => wp.id === existingPlan.id);
      if (idx !== -1) this.state.workoutPlans[idx] = saved;
    } else {
      saved = await api.createWorkoutPlan({ userId, ...planData });
      this.state.workoutPlans.push(saved);
    }

    const notif = await api.createNotification({
      recipientId: userId,
      type: 'workout_updated',
      title: 'Workout Plan Updated!',
      message: `Your coach has updated your ${planData.title} routine. Check your Today's Workout tab.`,
    });
    this.state.notifications.unshift(notif);
    this.notify();
  }

  async saveDietPlan(userId, dietData) {
    const existingPlan = this.state.dietPlans.find(dp => dp.userId === userId);
    let saved;
    const payload = {
      title: dietData.title,
      dailyCalories: parseInt(dietData.dailyCalories) || 2200,
      targetProteinG: parseInt(dietData.targetProteinG) || 150,
      targetCarbsG: parseInt(dietData.targetCarbsG) || 200,
      targetFatsG: parseInt(dietData.targetFatsG) || 60,
      dailyWaterLiters: parseFloat(dietData.dailyWaterLiters) || 3.5,
      dietaryType: dietData.dietaryType || 'Non-Vegetarian',
      notes: dietData.notes || '',
      meals: dietData.meals,
    };

    if (existingPlan) {
      saved = await api.updateDietPlan(existingPlan.id, payload);
      const idx = this.state.dietPlans.findIndex(dp => dp.id === existingPlan.id);
      if (idx !== -1) this.state.dietPlans[idx] = saved;
    } else {
      saved = await api.createDietPlan({ userId, ...payload });
      this.state.dietPlans.push(saved);
    }

    const notif = await api.createNotification({
      recipientId: userId,
      type: 'diet_updated',
      title: 'Diet Chart Updated!',
      message: `Your coach customized your nutrition plan (${dietData.dailyCalories} kcal / ${dietData.targetProteinG}g Protein).`,
    });
    this.state.notifications.unshift(notif);
    this.notify();
  }

  // ─────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────
  exportJSON() {
    return JSON.stringify(this.state, null, 2);
  }

  async resetToSeedData() {
    // Reload everything fresh from the API (server already has seed data)
    await this.initFromAPI();
    this.activeUserId = this.state.users.find(u => u.role === 'ADMIN')?.id || 'usr_admin_01';
    this.adminTab = 'dashboard';
    this.clientTab = 'workout';
    this.notify();
  }
}

export const gymStore = new GymStore();
