/**
 * Client Portal Component for Body Engineers Fit Club
 * Mobile-First, High-Energy Member Experience:
 * - Prominent "Next Fee Due Date" hero banner
 * - Today's Workout Routine with interactive checklist & rest timer
 * - Weekly Split browser
 * - Personalized Diet & Macro Chart with timed meal schedule
 * - Daily Hydration Tracker
 * - Digital Gym Pass & Profile
 */

import { gymStore } from '../store/gymStore.js';
import { renderClientHeroFeeBanner } from './FeeAlertBanner.js';

export function renderClientPortal() {
  const currentClient = gymStore.getCurrentUser();
  const currentTab = gymStore.clientTab;
  const gym = gymStore.getGymProfile();
  const workoutPlan = gymStore.getWorkoutPlanForUser(currentClient.id);
  const dietPlan = gymStore.getDietPlanForUser(currentClient.id);
  const payments = gymStore.getPaymentsForUser(currentClient.id);

  return `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-4 md:py-8 space-y-6 pb-24 md:pb-8">
      
      <!-- 1. Hero "Next Fee Due Date" Banner -->
      ${renderClientHeroFeeBanner(currentClient)}

      <!-- 2. Client Desktop/Tablet Navigation Tabs (Hidden on Mobile, handled by Bottom Nav) -->
      <div class="hidden md:flex items-center justify-center p-1.5 rounded-2xl bg-dark-900 border border-slate-800 max-w-lg mx-auto">
        ${[
          { id: 'workout', label: "Today's Workout", icon: 'dumbbell' },
          { id: 'diet', label: 'Diet Chart', icon: 'utensils' },
          { id: 'fee', label: 'Billing & Passes', icon: 'credit-card' },
          { id: 'profile', label: 'Profile & Pass', icon: 'user' }
        ].map(tab => `
          <button data-client-tab="${tab.id}" class="flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${currentTab === tab.id ? 'bg-brand-500 text-dark-950 shadow-glow-emerald' : 'text-slate-400 hover:text-white'}">
            <i data-lucide="${tab.icon}" class="w-4 h-4"></i>
            <span>${tab.label}</span>
          </button>
        `).join('')}
      </div>

      <!-- 3. Dynamic Tab Content -->
      ${renderClientTabContent(currentTab, { currentClient, workoutPlan, dietPlan, payments, gym })}

    </div>
  `;
}

function renderClientTabContent(tab, data) {
  switch (tab) {
    case 'workout':
      return renderClientWorkoutTab(data);
    case 'diet':
      return renderClientDietTab(data);
    case 'fee':
      return renderClientFeeTab(data);
    case 'profile':
      return renderClientProfileTab(data);
    default:
      return renderClientWorkoutTab(data);
  }
}

// -------------------------------------------------------------
// 1. CLIENT WORKOUT TAB (Checklist + Rest Timer + Celebration)
// -------------------------------------------------------------
function renderClientWorkoutTab({ currentClient, workoutPlan, gym }) {
  // Find today's routine or default to the first day
  const todayRoutine = workoutPlan.days.find(d => d.isToday) || workoutPlan.days[0];
  const allCompleted = todayRoutine.exercises.every(e => e.completed);
  const completedCount = todayRoutine.exercises.filter(e => e.completed).length;
  const progressPct = Math.round((completedCount / todayRoutine.exercises.length) * 100) || 0;

  return `
    <div class="space-y-6">
      
      <!-- Routine Header & Streak Bar -->
      <div class="glass-panel p-5 sm:p-6 rounded-3xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-md bg-brand-500/20 text-brand-300 font-black text-[11px] border border-brand-500/30">
                TODAY'S ROUTINE
              </span>
              <span class="text-xs text-slate-400 font-medium">${todayRoutine.dayName} Split</span>
            </div>
            <h3 class="font-outfit text-xl sm:text-2xl font-black text-white mt-1">
              ${todayRoutine.routineTitle}
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">Target: <span class="text-brand-400 font-semibold">${todayRoutine.muscleGroups}</span> • ~${todayRoutine.estimatedMinutes} mins</p>
          </div>

          <!-- Attendance & Workout Streak -->
          <div class="flex items-center gap-3 bg-dark-950 p-2.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <i data-lucide="flame" class="w-5 h-5 text-amber-400 fill-amber-400"></i>
            </div>
            <div>
              <div class="font-outfit font-black text-white text-base leading-none">${currentClient.attendanceStreakDays || 1} Days</div>
              <span class="text-[10px] text-slate-400 font-medium">Workout Streak</span>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="space-y-1.5 pt-2">
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-400 font-semibold">Workout Completion</span>
            <span class="font-mono font-bold ${progressPct === 100 ? 'text-brand-400' : 'text-slate-200'}">${completedCount}/${todayRoutine.exercises.length} Exercises (${progressPct}%)</span>
          </div>
          <div class="w-full h-2.5 bg-dark-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 shadow-glow-emerald" style="width: ${progressPct}%"></div>
          </div>
        </div>
      </div>

      <!-- Built-in Rest Timer Widget -->
      <div id="rest-timer-widget" class="glass-panel p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-brand-500/30 bg-gradient-to-r from-dark-900 to-dark-850">
        <div class="flex items-center gap-3.5">
          <div class="relative w-12 h-12 flex items-center justify-center">
            <div class="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center shadow-glow-emerald">
              <i data-lucide="timer" class="w-6 h-6 text-brand-400"></i>
            </div>
          </div>
          <div>
            <div class="text-xs uppercase tracking-wider text-slate-400 font-bold">Inter-Set Rest Timer</div>
            <div id="timer-display" class="font-mono font-black text-2xl text-white">00:00</div>
          </div>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button data-timer-set="30" class="timer-quick-btn px-3 py-1.5 rounded-xl bg-dark-950 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold transition-all">30s</button>
          <button data-timer-set="60" class="timer-quick-btn px-3 py-1.5 rounded-xl bg-dark-950 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold transition-all">60s</button>
          <button data-timer-set="90" class="timer-quick-btn px-3 py-1.5 rounded-xl bg-dark-950 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold transition-all">90s</button>
          <button id="timer-stop-btn" class="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1 transition-all">
            <i data-lucide="square" class="w-3.5 h-3.5"></i> Reset
          </button>
        </div>
      </div>

      <!-- Interactive Exercise Checklist Cards -->
      <div class="space-y-3">
        <div class="flex items-center justify-between px-1">
          <h4 class="font-outfit font-bold text-white text-sm">Today's Exercise Checklist</h4>
          <span class="text-xs text-slate-400">Tap checkbox when set completed</span>
        </div>

        <div class="space-y-3" id="exercise-checklist-container">
          ${todayRoutine.exercises.map((ex, idx) => `
            <div class="p-4 rounded-2xl border transition-all ${ex.completed ? 'bg-emerald-950/20 border-emerald-500/40 opacity-90' : 'bg-dark-900/90 border-slate-800 hover:border-slate-700'} flex items-start justify-between gap-3">
              
              <!-- Checkbox & Name -->
              <div class="flex items-start gap-3.5 flex-1 min-w-0">
                <button data-toggle-exercise-id="${ex.id}" data-day-id="${todayRoutine.id}" class="mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${ex.completed ? 'bg-brand-500 text-dark-950 shadow-glow-emerald' : 'bg-dark-950 border border-slate-700 text-transparent hover:border-brand-500'}">
                  <i data-lucide="check" class="w-4 h-4 font-black ${ex.completed ? 'opacity-100' : 'opacity-0'}"></i>
                </button>
                
                <div class="space-y-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-sm ${ex.completed ? 'line-through text-slate-400' : 'text-white'}">${ex.name}</span>
                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">${ex.muscleGroup}</span>
                  </div>

                  <div class="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <div>Sets: <span class="text-white font-bold">${ex.targetSets}</span></div>
                    <div>Reps: <span class="text-brand-400 font-bold">${ex.targetReps}</span></div>
                    ${ex.targetWeightKg ? `<div>Weight: <span class="text-emerald-300 font-bold">${ex.targetWeightKg} kg</span></div>` : ''}
                  </div>

                  ${ex.notes ? `<p class="text-[11px] text-slate-400 italic mt-1">💡 ${ex.notes}</p>` : ''}
                </div>
              </div>

              <!-- Video Guide Link / Rest trigger -->
              <div class="flex flex-col items-end gap-1.5 shrink-0">
                <button data-start-rest-seconds="${ex.restSeconds || 60}" class="px-2 py-1 rounded-lg bg-dark-950 hover:bg-slate-800 text-brand-400 border border-slate-800 text-[11px] font-semibold flex items-center gap-1 transition-colors" title="Start ${ex.restSeconds || 60}s rest timer">
                  <i data-lucide="timer" class="w-3 h-3"></i> ${ex.restSeconds || 60}s
                </button>
                ${ex.videoGuideUrl ? `
                  <a href="${ex.videoGuideUrl}" target="_blank" rel="noopener noreferrer" class="text-[11px] text-slate-400 hover:text-white flex items-center gap-0.5 mt-1 hover:underline">
                    <i data-lucide="play-circle" class="w-3 h-3 text-rose-400"></i> Video
                  </a>
                ` : ''}
              </div>

            </div>
          `).join('')}
        </div>
      </div>

      <!-- Complete Workout Celebratory Action -->
      <div class="pt-4">
        <button id="complete-workout-btn" class="w-full py-4 rounded-2xl ${allCompleted ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-dark-950 font-black text-base shadow-glow-emerald-lg' : 'bg-dark-850 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm'} flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5">
          <i data-lucide="trophy" class="w-5 h-5 text-amber-300"></i>
          <span>${allCompleted ? "🎉 Complete & Celebrate Workout!" : "Mark All Complete & Finish"}</span>
        </button>
      </div>

      <!-- Weekly Routine Split Drawer / Viewer -->
      <div class="glass-panel p-5 rounded-3xl space-y-4">
        <h4 class="font-outfit font-bold text-white text-sm flex items-center gap-2">
          <i data-lucide="calendar" class="w-4 h-4 text-brand-400"></i>
          <span>Full Weekly Split Overview</span>
        </h4>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          ${workoutPlan.days.map(d => `
            <div class="p-3 rounded-xl ${d.isToday ? 'bg-brand-500/20 border border-brand-500/40 text-brand-300' : 'bg-dark-950 border border-slate-800 text-slate-400'} text-xs space-y-1">
              <div class="font-bold flex items-center justify-between">
                <span>${d.dayName}</span>
                ${d.isToday ? '<span class="text-[9px] font-black uppercase px-1 rounded bg-brand-500 text-dark-950">Today</span>' : ''}
              </div>
              <p class="text-[11px] text-slate-300 font-medium truncate">${d.routineTitle.split(':')[0]}</p>
              <span class="text-[10px] text-slate-500">${d.exercises.length} exercises</span>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

// -------------------------------------------------------------
// 2. CLIENT DIET TAB (Macros + Water + Timed Meal Schedule)
// -------------------------------------------------------------
function renderClientDietTab({ currentClient, dietPlan, gym }) {
  const waterGlasses = currentClient.waterGlassesToday || 4;
  const targetGlasses = 12; // 12 * 250ml = 3.0L
  const waterPct = Math.min(100, Math.round((waterGlasses / targetGlasses) * 100));

  return `
    <div class="space-y-6">
      
      <!-- Macro Target Card Summary -->
      <div class="glass-panel p-5 sm:p-6 rounded-3xl space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Daily Nutrition Plan</span>
            <h3 class="font-outfit text-xl sm:text-2xl font-black text-white mt-0.5">${dietPlan.title}</h3>
            <p class="text-xs text-slate-400">${dietPlan.dietaryType} • Formulated by Coach Vikram</p>
          </div>
          <div class="flex items-baseline gap-1.5 self-start sm:self-auto bg-dark-950 px-3.5 py-2 rounded-2xl border border-slate-800">
            <span class="font-outfit font-black text-2xl text-white">${dietPlan.dailyCalories}</span>
            <span class="text-xs text-brand-400 font-bold">kcal/day</span>
          </div>
        </div>

        <!-- 3 Macro Cards -->
        <div class="grid grid-cols-3 gap-3">
          
          <!-- Protein -->
          <div class="p-3.5 rounded-2xl bg-dark-950 border border-slate-800 text-center space-y-1">
            <span class="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Protein</span>
            <div class="font-outfit font-black text-xl text-white">${dietPlan.targetProteinG}g</div>
            <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div class="bg-blue-500 h-full rounded-full w-full"></div>
            </div>
            <span class="text-[9px] text-slate-400">~${dietPlan.targetProteinG * 4} kcal</span>
          </div>

          <!-- Carbs -->
          <div class="p-3.5 rounded-2xl bg-dark-950 border border-slate-800 text-center space-y-1">
            <span class="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Carbs</span>
            <div class="font-outfit font-black text-xl text-white">${dietPlan.targetCarbsG}g</div>
            <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div class="bg-amber-500 h-full rounded-full w-full"></div>
            </div>
            <span class="text-[9px] text-slate-400">~${dietPlan.targetCarbsG * 4} kcal</span>
          </div>

          <!-- Fats -->
          <div class="p-3.5 rounded-2xl bg-dark-950 border border-slate-800 text-center space-y-1">
            <span class="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Fats</span>
            <div class="font-outfit font-black text-xl text-white">${dietPlan.targetFatsG}g</div>
            <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div class="bg-emerald-500 h-full rounded-full w-full"></div>
            </div>
            <span class="text-[9px] text-slate-400">~${dietPlan.targetFatsG * 9} kcal</span>
          </div>

        </div>
      </div>

      <!-- Daily Hydration Tracker -->
      <div class="glass-panel p-5 rounded-3xl space-y-4 border-sky-500/30 bg-gradient-to-r from-sky-950/20 to-dark-900">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/40">
              <i data-lucide="droplet" class="w-5 h-5 fill-sky-400"></i>
            </div>
            <div>
              <h4 class="font-outfit font-bold text-white text-sm">Daily Hydration Log</h4>
              <p class="text-xs text-slate-400">Target: ${dietPlan.dailyWaterLiters}L (${targetGlasses} glasses of 250ml)</p>
            </div>
          </div>

          <div class="text-right">
            <span class="font-outfit font-black text-xl text-sky-400">${(waterGlasses * 0.25).toFixed(1)}L</span>
            <span class="text-xs text-slate-400">/ ${dietPlan.dailyWaterLiters}L</span>
          </div>
        </div>

        <!-- Interactive Water Glasses -->
        <div class="flex items-center justify-between gap-1 flex-wrap pt-1">
          ${Array.from({ length: 10 }).map((_, i) => `
            <button data-water-glass-idx="${i}" class="water-glass-btn w-7 h-9 rounded-lg flex items-center justify-center border transition-all ${i < waterGlasses ? 'bg-sky-500 border-sky-400 text-white shadow-sm' : 'bg-dark-950 border-slate-800 text-slate-600'}">
              <i data-lucide="glass-water" class="w-4 h-4 ${i < waterGlasses ? 'fill-white' : ''}"></i>
            </button>
          `).join('')}

          <div class="flex items-center gap-1.5 ml-auto">
            <button id="add-water-glass-btn" class="px-2.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-dark-950 font-bold text-xs flex items-center gap-1">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i> +250ml
            </button>
            <button id="reset-water-btn" class="p-1.5 rounded-lg bg-dark-950 hover:bg-slate-800 text-slate-400 text-xs" title="Reset">
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Timed Meal Schedule Cards -->
      <div class="space-y-3">
        <div class="flex items-center justify-between px-1">
          <h4 class="font-outfit font-bold text-white text-sm">Today's Meal Schedule</h4>
          <span class="text-xs text-slate-400">${dietPlan.meals.length} Scheduled Meals</span>
        </div>

        <div class="space-y-3">
          ${dietPlan.meals.map((meal, idx) => `
            <div class="p-4 rounded-2xl bg-dark-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              
              <!-- Meal Slot Header -->
              <div class="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 font-bold text-xs">
                    ${idx + 1}
                  </div>
                  <div>
                    <h5 class="font-bold text-white text-sm">${meal.name}</h5>
                    <p class="text-[11px] text-slate-400">${meal.notes || 'Nutrient rich portion'}</p>
                  </div>
                </div>

                <div class="text-right">
                  <span class="font-mono font-bold text-xs px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
                    ${meal.timeString}
                  </span>
                </div>
              </div>

              <!-- Meal Items Checklist -->
              <div class="space-y-2">
                ${meal.items.map(item => `
                  <div class="p-2.5 rounded-xl bg-dark-950 border border-slate-800/60 flex items-center justify-between text-xs">
                    <div>
                      <span class="font-semibold text-slate-200">${item.foodName}</span>
                      <div class="text-[11px] text-slate-400 mt-0.5">${item.portion}</div>
                    </div>
                    <div class="text-right font-mono">
                      <span class="font-bold text-emerald-400">${item.proteinG}g Prot</span>
                      <div class="text-[10px] text-slate-500">${item.calories} kcal</div>
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
// 3. CLIENT BILLING & RECEIPTS TAB
// -------------------------------------------------------------
function renderClientFeeTab({ currentClient, payments, gym }) {
  return `
    <div class="space-y-6">
      
      <!-- Top Billing Overview -->
      <div class="glass-panel p-5 sm:p-6 rounded-3xl space-y-4">
        <h3 class="font-outfit text-xl font-black text-white flex items-center gap-2">
          <i data-lucide="receipt" class="w-5 h-5 text-brand-400"></i>
          <span>Membership & Payment Ledger</span>
        </h3>
        <p class="text-xs text-slate-400">Official billing records, tax receipts, and renewal invoice history</p>

        <!-- Quick Info Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div class="p-3 rounded-xl bg-dark-950 border border-slate-800 text-xs">
            <span class="text-slate-400">Plan Tier</span>
            <div class="font-bold text-white mt-1">${currentClient.membershipTier}</div>
          </div>
          <div class="p-3 rounded-xl bg-dark-950 border border-slate-800 text-xs">
            <span class="text-slate-400">Monthly Rate</span>
            <div class="font-bold text-brand-400 mt-1">${gym.currency}${currentClient.monthlyFee.toLocaleString('en-IN')}</div>
          </div>
          <div class="p-3 rounded-xl bg-dark-950 border border-slate-800 text-xs">
            <span class="text-slate-400">Member Since</span>
            <div class="font-bold text-slate-300 mt-1">${currentClient.joinDate}</div>
          </div>
          <div class="p-3 rounded-xl bg-dark-950 border border-slate-800 text-xs">
            <span class="text-slate-400">Status</span>
            <div class="font-bold ${currentClient.feeStatus === 'OVERDUE' ? 'text-rose-400' : currentClient.feeStatus === 'DUE_SOON' ? 'text-amber-400' : 'text-emerald-400'} mt-1">
              ${currentClient.feeStatus}
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Receipts List -->
      <div class="space-y-3">
        <h4 class="font-outfit font-bold text-white text-sm px-1">Payment Receipts</h4>

        <div class="space-y-3">
          ${payments.map(p => `
            <div class="p-4 rounded-2xl bg-dark-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-mono font-bold text-brand-400 text-xs">${p.invoiceNumber}</span>
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded ${p.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}">
                    ${p.status}
                  </span>
                </div>
                <div class="text-xs text-slate-300 font-semibold">${p.planDuration} • Paid on ${p.paymentDate}</div>
                <div class="text-[11px] text-slate-500">Method: ${p.paymentMethod} • Ref: ${p.transactionRef || 'N/A'}</div>
              </div>

              <div class="flex items-center gap-3 self-end sm:self-auto">
                <span class="font-outfit font-black text-lg text-white">${gym.currency}${p.amount.toLocaleString('en-IN')}</span>
                <button data-view-receipt-id="${p.id}" class="px-3 py-1.5 rounded-xl bg-dark-950 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                  <i data-lucide="printer" class="w-3.5 h-3.5 text-brand-400"></i>
                  <span>Invoice</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

// -------------------------------------------------------------
// 4. CLIENT PROFILE & DIGITAL GYM PASS
// -------------------------------------------------------------
function renderClientProfileTab({ currentClient, gym }) {
  return `
    <div class="space-y-6">
      
      <!-- Digital Gym ID Card Pass -->
      <div class="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-dark-900 via-dark-850 to-emerald-950/40 border border-emerald-500/40 shadow-glow-emerald">
        
        <!-- Pass Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-dark-950 font-black">
              BE
            </div>
            <div>
              <span class="font-outfit font-black text-sm text-white tracking-wider">BODY ENGINEERS</span>
              <span class="text-[10px] text-brand-400 block font-bold">DIGITAL PASS</span>
            </div>
          </div>
          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
            ${currentClient.memberCode}
          </span>
        </div>

        <!-- Pass Body -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6 my-6">
          <div class="flex items-center gap-4">
            <img src="${currentClient.avatarUrl}" alt="${currentClient.fullName}" class="w-20 h-20 rounded-2xl object-cover ring-2 ring-brand-500 shadow-lg">
            <div class="space-y-1">
              <h3 class="font-outfit font-black text-xl text-white">${currentClient.fullName}</h3>
              <p class="text-xs text-brand-400 font-semibold">${currentClient.membershipTier}</p>
              <p class="text-xs text-slate-400">Coach: <b class="text-slate-200">Coach Vikram</b></p>
            </div>
          </div>

          <!-- Scannable Check-in QR Code -->
          <div class="flex flex-col items-center gap-1 bg-white p-2.5 rounded-2xl">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=BE_MEMBER_${currentClient.memberCode}" alt="Member QR" class="w-20 h-20">
            <span class="text-[9px] font-mono font-bold text-dark-950">SCAN AT GATE</span>
          </div>
        </div>

        <!-- Pass Footer -->
        <div class="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800 text-center text-xs">
          <div>
            <span class="text-[10px] text-slate-500 uppercase font-bold">Weight</span>
            <div class="font-bold text-white mt-0.5">${currentClient.currentWeightKg} kg</div>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 uppercase font-bold">Target</span>
            <div class="font-bold text-brand-400 mt-0.5">${currentClient.targetWeightKg} kg</div>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 uppercase font-bold">Height</span>
            <div class="font-bold text-white mt-0.5">${currentClient.heightCm} cm</div>
          </div>
        </div>

      </div>

      <!-- Emergency & Contact Info -->
      <div class="glass-panel p-5 rounded-3xl space-y-3">
        <h4 class="font-outfit font-bold text-white text-sm">Emergency & Profile Details</h4>
        <div class="space-y-2 text-xs text-slate-300">
          <div class="flex justify-between py-1.5 border-b border-slate-800">
            <span class="text-slate-400">Registered Phone</span>
            <span class="font-bold text-white">${currentClient.phone}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-800">
            <span class="text-slate-400">Email Address</span>
            <span class="font-bold text-white">${currentClient.email}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-800">
            <span class="text-slate-400">Fitness Primary Goal</span>
            <span class="font-bold text-brand-400">${currentClient.fitnessGoal}</span>
          </div>
          <div class="flex justify-between py-1.5">
            <span class="text-slate-400">Emergency Contact</span>
            <span class="font-bold text-rose-300">${currentClient.emergencyContact}</span>
          </div>
        </div>
      </div>

    </div>
  `;
}
