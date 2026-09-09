/**
 * Central Reactive State & LocalStorage Database Store
 * Body Engineers Fit Club
 */

import { INITIAL_SEED_DATA } from '../data/seedData.js';

const STORAGE_KEY = 'body_engineers_fit_club_v2_db';

class GymStore {
  constructor() {
    this.listeners = new Set();
    this.state = this.loadState();
    
    // UI Session State (not saved in localStorage)
    this.activeUserId = this.state.users.find(u => u.role === 'ADMIN')?.id || 'usr_admin_01';
    this.adminTab = 'dashboard'; // 'dashboard' | 'clients' | 'workouts' | 'diets' | 'payments' | 'schema'
    this.clientTab = 'workout'; // 'workout' | 'diet' | 'fee' | 'profile'
    this.viewMode = 'responsive'; // 'responsive' | 'mobile-frame'
    this.selectedClientDetailId = null; // For modal / drawer view
    this.editingWorkoutClientId = null;
    this.editingDietClientId = null;
    
    // Calculate accurate dynamic fee statuses on initialization
    this.recalculateFeeStatuses(false);
  }

  loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.users && parsed.users.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored gym data, loading seed data.', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  // --- GETTERS ---
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
      // Default fallback routine if none assigned yet
      plan = {
        id: `wp_auto_${userId}`,
        userId,
        title: "Standard 4-Day Strength & Conditioning",
        splitType: "Upper-Lower Split",
        lastUpdated: new Date().toISOString().split('T')[0],
        days: [
          {
            id: `wd_${userId}_1`,
            dayName: "Today",
            routineTitle: "Full Body Foundation",
            estimatedMinutes: 50,
            muscleGroups: "Chest, Back, Legs, Core",
            isToday: true,
            exercises: [
              { id: `ex_auto_1`, name: "Goblet Squats", muscleGroup: "Legs", targetSets: 3, targetReps: "12", targetWeightKg: 16, restSeconds: 60, completed: false, notes: "Focus on deep range." },
              { id: `ex_auto_2`, name: "Push-ups / Incline DB Press", muscleGroup: "Chest", targetSets: 3, targetReps: "10 - 12", targetWeightKg: 14, restSeconds: 60, completed: false, notes: "Keep core tight." },
              { id: `ex_auto_3`, name: "Lat Pulldown / Band Pulls", muscleGroup: "Back", targetSets: 3, targetReps: "12", targetWeightKg: 45, restSeconds: 60, completed: false, notes: "Drive elbows down." },
              { id: `ex_auto_4`, name: "Plank Hold", muscleGroup: "Core", targetSets: 3, targetReps: "45 sec", targetWeightKg: 0, restSeconds: 45, completed: false, notes: "Flat back." }
            ]
          }
        ]
      };
      this.state.workoutPlans.push(plan);
    }
    return plan;
  }

  getDietPlanForUser(userId) {
    let plan = this.state.dietPlans.find(dp => dp.userId === userId);
    if (!plan) {
      plan = {
        id: `dp_auto_${userId}`,
        userId,
        title: "Standard High-Protein Lifestyle Diet",
        dailyCalories: 2100,
        targetProteinG: 140,
        targetCarbsG: 220,
        targetFatsG: 55,
        dailyWaterLiters: 3.0,
        dietaryType: "Balanced Fitness",
        lastUpdated: new Date().toISOString().split('T')[0],
        notes: "Stay hydrated and space meals 3-4 hours apart.",
        meals: [
          {
            id: `m_auto_1`,
            name: "Nutritious Breakfast",
            timeString: "08:30 AM",
            notes: "High protein starter",
            items: [
              { id: `fi_a1`, name: "Eggs / Tofu Scramble", portion: "3 Eggs / 120g Tofu", calories: 210, proteinG: 18, carbsG: 2, fatsG: 14 },
              { id: `fi_a2`, name: "Oatmeal with Almonds", portion: "50g Oats + Nuts", calories: 220, proteinG: 7, carbsG: 38, fatsG: 5 }
            ]
          },
          {
            id: `m_auto_2`,
            name: "Power Lunch",
            timeString: "01:00 PM",
            notes: "Lean protein with complex carbohydrates",
            items: [
              { id: `fi_a3`, name: "Grilled Protein (Chicken / Paneer)", portion: "150g Portion", calories: 260, proteinG: 35, carbsG: 2, fatsG: 8 },
              { id: `fi_a4`, name: "Brown Rice & Green Veggies", portion: "1 Cup Rice + 1 Cup Greens", calories: 230, proteinG: 5, carbsG: 45, fatsG: 2 }
            ]
          },
          {
            id: `m_auto_3`,
            name: "Pre-Workout Fuel",
            timeString: "05:00 PM",
            notes: "Quick digestible energy",
            items: [
              { id: `fi_a5`, name: "Banana + Peanut Butter Toast", portion: "1 Fruit + 1 Toast", calories: 210, proteinG: 6, carbsG: 34, fatsG: 7 }
            ]
          },
          {
            id: `m_auto_4`,
            name: "Light Dinner",
            timeString: "08:30 PM",
            notes: "Easy digestion and muscle recovery",
            items: [
              { id: `fi_a6`, name: "Lentil Soup / Grilled Fish", portion: "1 Bowl / 150g", calories: 240, proteinG: 28, carbsG: 12, fatsG: 6 }
            ]
          }
        ]
      };
      this.state.dietPlans.push(plan);
    }
    return plan;
  }

  getPaymentsForUser(userId) {
    return this.state.payments.filter(p => p.userId === userId).sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
  }

  getAllPayments() {
    return this.state.payments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
  }

  getGymProfile() {
    return this.state.gymProfile;
  }

  getNotifications(userId) {
    return this.state.notifications.filter(n => !n.recipientId || n.recipientId === userId);
  }

  // --- ACTIONS & MUTATIONS ---

  setActiveUser(userId) {
    this.activeUserId = userId;
    const user = this.getCurrentUser();
    if (user.role === 'CLIENT') {
      this.clientTab = 'workout';
    } else {
      this.adminTab = 'dashboard';
    }
    this.notify();
  }

  setAdminTab(tab) {
    this.adminTab = tab;
    this.notify();
  }

  setClientTab(tab) {
    this.clientTab = tab;
    this.notify();
  }

  setViewMode(mode) {
    this.viewMode = mode;
    this.notify();
  }

  // Recalculates fee status based on nextFeeDueDate vs today (2026-09-09)
  recalculateFeeStatuses(save = true) {
    const today = new Date("2026-09-09");
    
    this.state.users.forEach(user => {
      if (user.role !== 'CLIENT') return;
      
      const due = new Date(user.nextFeeDueDate);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        user.feeStatus = "OVERDUE";
      } else if (diffDays <= 5) {
        user.feeStatus = "DUE_SOON";
      } else {
        user.feeStatus = "PAID";
      }
    });

    if (save) {
      this.saveState();
    }
  }

  // Add a new client
  addClient(formData) {
    const newId = `usr_client_${Date.now()}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const memberCode = `BE-2026-${randomSuffix}`;
    
    const joinDate = formData.joinDate || "2026-09-09";
    const nextFeeDueDate = formData.nextFeeDueDate || "2026-10-09";
    const monthlyFee = parseFloat(formData.monthlyFee) || 2500;

    const newClient = {
      id: newId,
      role: "CLIENT",
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      avatarUrl: formData.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      memberCode: memberCode,
      membershipTier: formData.membershipTier || "Monthly Pro Plan",
      joinDate: joinDate,
      nextFeeDueDate: nextFeeDueDate,
      feeStatus: "PAID",
      monthlyFee: monthlyFee,
      trainerId: formData.trainerId || "usr_admin_01",
      currentWeightKg: parseFloat(formData.currentWeightKg) || 70,
      targetWeightKg: parseFloat(formData.targetWeightKg) || 68,
      heightCm: parseInt(formData.heightCm) || 175,
      fitnessGoal: formData.fitnessGoal || "General Fitness & Toning",
      emergencyContact: formData.emergencyContact || "+91 99000 11223",
      attendanceStreakDays: 1,
      waterGlassesToday: 4
    };

    this.state.users.unshift(newClient);

    // Create Initial Payment Record
    const initialPayment = {
      id: `pay_${Date.now()}`,
      userId: newId,
      invoiceNumber: `INV-${memberCode}`,
      amount: monthlyFee,
      planDuration: formData.membershipTier || "1 Month",
      paymentDate: joinDate,
      dueDate: nextFeeDueDate,
      paymentMethod: formData.paymentMethod || "UPI",
      transactionRef: `INIT-${Date.now().toString().slice(-6)}`,
      status: "PAID",
      notes: "Joining admission and initial membership fee."
    };
    this.state.payments.unshift(initialPayment);

    // Create Initial Workout Plan
    this.getWorkoutPlanForUser(newId);
    // Create Initial Diet Plan
    this.getDietPlanForUser(newId);

    // Recalculate status and save
    this.recalculateFeeStatuses();
    return newClient;
  }

  // Update existing client
  updateClient(id, updates) {
    const idx = this.state.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.state.users[idx] = { ...this.state.users[idx], ...updates };
      this.recalculateFeeStatuses();
      return this.state.users[idx];
    }
    return null;
  }

  // Delete client
  deleteClient(id) {
    this.state.users = this.state.users.filter(u => u.id !== id);
    this.state.payments = this.state.payments.filter(p => p.userId !== id);
    this.state.workoutPlans = this.state.workoutPlans.filter(wp => wp.userId !== id);
    this.state.dietPlans = this.state.dietPlans.filter(dp => dp.userId !== id);
    this.saveState();
  }

  // Log a fee payment / renewal
  logPayment({ userId, amount, planDuration, paymentMethod, paymentDate, dueDate, notes }) {
    const user = this.getClientById(userId);
    if (!user) return false;

    const invoiceNumber = `INV-BE-${Date.now().toString().slice(-6)}`;
    const newPayment = {
      id: `pay_${Date.now()}`,
      userId,
      invoiceNumber,
      amount: parseFloat(amount),
      planDuration: planDuration || "1 Month Pro",
      paymentDate: paymentDate || "2026-09-09",
      dueDate: dueDate,
      paymentMethod: paymentMethod || "UPI",
      transactionRef: `TXN-${Date.now().toString().slice(-8)}`,
      status: "PAID",
      notes: notes || "Membership renewal fee logged by Admin."
    };

    this.state.payments.unshift(newPayment);

    // Update user's next fee due date
    user.nextFeeDueDate = dueDate;
    this.recalculateFeeStatuses();

    // Add notification
    this.state.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipientId: userId,
      type: "payment_receipt",
      title: "Fee Payment Received!",
      message: `Payment of ${this.state.gymProfile.currency}${amount} received successfully. Next due date: ${dueDate}.`,
      timestamp: new Date().toISOString(),
      isRead: false
    });

    this.saveState();
    return newPayment;
  }

  // Toggle Exercise completion
  toggleExercise(userId, dayId, exerciseId) {
    const plan = this.getWorkoutPlanForUser(userId);
    if (!plan) return;

    for (const day of plan.days) {
      if (day.id === dayId || !dayId) {
        const ex = day.exercises.find(e => e.id === exerciseId);
        if (ex) {
          ex.completed = !ex.completed;
          this.saveState();
          return ex.completed;
        }
      }
    }
  }

  // Complete entire routine for today
  completeDailyWorkout(userId) {
    const user = this.getClientById(userId);
    const plan = this.getWorkoutPlanForUser(userId);
    if (plan) {
      plan.days.forEach(day => {
        if (day.isToday) {
          day.exercises.forEach(e => { e.completed = true; });
        }
      });
    }

    if (user) {
      user.attendanceStreakDays = (user.attendanceStreakDays || 0) + 1;
    }
    this.saveState();
  }

  // Hydration counter
  incrementWater(userId) {
    const user = this.getClientById(userId);
    if (user) {
      user.waterGlassesToday = (user.waterGlassesToday || 0) + 1;
      this.saveState();
      return user.waterGlassesToday;
    }
    return 0;
  }

  decrementWater(userId) {
    const user = this.getClientById(userId);
    if (user && user.waterGlassesToday > 0) {
      user.waterGlassesToday -= 1;
      this.saveState();
      return user.waterGlassesToday;
    }
    return 0;
  }

  // Update Workout Plan
  saveWorkoutPlan(userId, planData) {
    const existingIdx = this.state.workoutPlans.findIndex(wp => wp.userId === userId);
    const updatedPlan = {
      id: existingIdx !== -1 ? this.state.workoutPlans[existingIdx].id : `wp_${Date.now()}`,
      userId,
      title: planData.title,
      splitType: planData.splitType || "Push-Pull-Legs",
      lastUpdated: new Date().toISOString().split('T')[0],
      days: planData.days
    };

    if (existingIdx !== -1) {
      this.state.workoutPlans[existingIdx] = updatedPlan;
    } else {
      this.state.workoutPlans.push(updatedPlan);
    }

    // Add alert for client
    this.state.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipientId: userId,
      type: "workout_updated",
      title: "Workout Plan Updated!",
      message: `Your coach has updated your ${planData.title} routine. Check your Today's Workout tab.`,
      timestamp: new Date().toISOString(),
      isRead: false
    });

    this.saveState();
  }

  // Update Diet Plan
  saveDietPlan(userId, dietData) {
    const existingIdx = this.state.dietPlans.findIndex(dp => dp.userId === userId);
    const updatedDiet = {
      id: existingIdx !== -1 ? this.state.dietPlans[existingIdx].id : `dp_${Date.now()}`,
      userId,
      title: dietData.title,
      dailyCalories: parseInt(dietData.dailyCalories) || 2200,
      targetProteinG: parseInt(dietData.targetProteinG) || 150,
      targetCarbsG: parseInt(dietData.targetCarbsG) || 200,
      targetFatsG: parseInt(dietData.targetFatsG) || 60,
      dailyWaterLiters: parseFloat(dietData.dailyWaterLiters) || 3.5,
      dietaryType: dietData.dietaryType || "Non-Vegetarian",
      lastUpdated: new Date().toISOString().split('T')[0],
      notes: dietData.notes || "",
      meals: dietData.meals
    };

    if (existingIdx !== -1) {
      this.state.dietPlans[existingIdx] = updatedDiet;
    } else {
      this.state.dietPlans.push(updatedDiet);
    }

    // Add alert for client
    this.state.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipientId: userId,
      type: "diet_updated",
      title: "Diet Chart Updated!",
      message: `Your coach customized your nutrition plan (${dietData.dailyCalories} kcal / ${dietData.targetProteinG}g Protein).`,
      timestamp: new Date().toISOString(),
      isRead: false
    });

    this.saveState();
  }

  // Reset database back to default seed data
  resetToSeedData() {
    this.state = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
    this.recalculateFeeStatuses();
    this.activeUserId = 'usr_admin_01';
    this.adminTab = 'dashboard';
    this.clientTab = 'workout';
    this.saveState();
  }

  // Export JSON
  exportJSON() {
    return JSON.stringify(this.state, null, 2);
  }
}

export const gymStore = new GymStore();
