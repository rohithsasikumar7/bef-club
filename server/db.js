/**
 * SQLite Database Initialization for Body Engineers Fit Club
 * Creates all tables and seeds data on first run.
 * Uses better-sqlite3 (synchronous) for simple, reliable access.
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'gym.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─────────────────────────────────────────────
// CREATE TABLES
// ─────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL DEFAULT 'CLIENT',
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    avatar_url TEXT,
    member_code TEXT UNIQUE NOT NULL,
    membership_tier TEXT NOT NULL,
    join_date TEXT NOT NULL,
    next_fee_due_date TEXT NOT NULL,
    fee_status TEXT NOT NULL DEFAULT 'PAID',
    monthly_fee REAL NOT NULL DEFAULT 2500,
    trainer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    current_weight_kg REAL,
    target_weight_kg REAL,
    height_cm INTEGER,
    fitness_goal TEXT,
    emergency_contact TEXT,
    attendance_streak_days INTEGER DEFAULT 1,
    water_glasses_today INTEGER DEFAULT 4,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS gym_profile (
    id INTEGER PRIMARY KEY DEFAULT 1,
    name TEXT NOT NULL,
    tagline TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    upi_id TEXT,
    currency TEXT DEFAULT '₹',
    logo_text TEXT,
    sub_text TEXT
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    amount REAL NOT NULL,
    plan_duration TEXT NOT NULL,
    payment_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_ref TEXT,
    status TEXT NOT NULL DEFAULT 'PAID',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS workout_plans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    split_type TEXT NOT NULL DEFAULT 'Push-Pull-Legs',
    last_updated TEXT DEFAULT (date('now')),
    days_json TEXT NOT NULL DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS diet_plans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    daily_calories INTEGER NOT NULL DEFAULT 2200,
    target_protein_g INTEGER NOT NULL DEFAULT 150,
    target_carbs_g INTEGER NOT NULL DEFAULT 200,
    target_fats_g INTEGER NOT NULL DEFAULT 60,
    daily_water_liters REAL DEFAULT 3.5,
    dietary_type TEXT DEFAULT 'Non-Vegetarian',
    last_updated TEXT DEFAULT (date('now')),
    notes TEXT,
    meals_json TEXT NOT NULL DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    recipient_id TEXT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT DEFAULT (datetime('now')),
    is_read INTEGER DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_users_fee ON users(fee_status, next_fee_due_date);
  CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id, payment_date);
  CREATE INDEX IF NOT EXISTS idx_workout_user ON workout_plans(user_id);
  CREATE INDEX IF NOT EXISTS idx_diet_user ON diet_plans(user_id);
  CREATE INDEX IF NOT EXISTS idx_notif_recipient ON notifications(recipient_id);
`);

// ─────────────────────────────────────────────
// SEED DATA (runs only if tables are empty)
// ─────────────────────────────────────────────
function seedIfEmpty() {
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (userCount > 0) return; // already seeded

  console.log('🌱 Seeding SQLite database with initial gym data...');

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users
    (id, role, full_name, email, phone, avatar_url, member_code, membership_tier,
     join_date, next_fee_due_date, fee_status, monthly_fee, trainer_id,
     current_weight_kg, target_weight_kg, height_cm, fitness_goal, emergency_contact,
     attendance_streak_days, water_glasses_today)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const users = [
    ['usr_admin_01','ADMIN','Coach Vikram Rathore','vikram@bodyengineers.com','+91 98765 00001',
     'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
     'BE-STAFF-001','Head Coach & Founder','2024-01-01','2099-12-31','PAID',0,null,85,85,182,'Strength & Athletic Performance','+91 98765 00000',1,8],
    ['usr_client_01','CLIENT','Rahul Sharma','rahul.sharma@example.com','+91 98111 22334',
     'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
     'BE-2026-0842','Monthly Pro Plan','2026-03-11','2026-09-11','DUE_SOON',2500,'usr_admin_01',78.5,74,178,'Lean Hypertrophy & Fat Loss','+91 98111 00000',14,6],
    ['usr_client_02','CLIENT','Ananya Patel','ananya.patel@example.com','+91 98222 33445',
     'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
     'BE-2026-0918','Annual VIP Elite','2025-11-30','2026-11-30','PAID',1500,'usr_admin_01',59.2,58,165,'Strength & Glute Hypertrophy','+91 98222 00000',22,8],
    ['usr_client_03','CLIENT','Kavita Rao','kavita.rao@example.com','+91 98333 44556',
     'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
     'BE-2026-0731','Monthly Standard','2026-02-05','2026-09-05','OVERDUE',2500,'usr_admin_01',68,62,162,'Fat Loss & Functional Conditioning','+91 98333 00000',8,4],
    ['usr_client_04','CLIENT','Arjun Nair','arjun.nair@example.com','+91 98444 55667',
     'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
     'BE-2026-1024','Quarterly Pro','2026-07-25','2026-10-25','PAID',2166,'usr_admin_01',82,86,180,'Mass Bulking & Powerlifting','+91 98444 00000',19,10],
    ['usr_client_05','CLIENT','Sneha Reddy','sneha.reddy@example.com','+91 98555 66778',
     'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
     'BE-2026-1105','Monthly Pro Plan','2026-05-14','2026-09-14','DUE_SOON',2500,'usr_admin_01',55,56.5,168,'Core Strength & Marathon Endurance','+91 98555 00000',11,5],
  ];

  const seedUsers = db.transaction(() => {
    for (const u of users) insertUser.run(...u);
  });
  seedUsers();

  // Gym Profile
  db.prepare(`INSERT OR IGNORE INTO gym_profile (id, name, tagline, address, phone, email, upi_id, currency, logo_text, sub_text)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    'Body Engineers Fit Club',
    'Precision Training & Science-Backed Nutrition',
    'Level 2, Elite Sports Complex, Metro Pillar 142, Indiranagar',
    '+91 98765 43210',
    'support@bodyengineersfitclub.com',
    'bodyengineers@okhdfcbank',
    '₹',
    'BODY ENGINEERS',
    'FIT CLUB'
  );

  // Payments
  const insertPayment = db.prepare(`
    INSERT OR IGNORE INTO payments (id, user_id, invoice_number, amount, plan_duration, payment_date, due_date, payment_method, transaction_ref, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const payments = [
    ['pay_1001','usr_client_01','INV-BE-2026-0842',2500,'1 Month Pro','2026-08-11','2026-09-11','UPI','UPI/260811/984210','DUE_SOON','August monthly fee paid via PhonePe. September renewal upcoming.'],
    ['pay_1002','usr_client_02','INV-BE-2025-0918',18000,'12 Months Annual VIP','2025-11-30','2026-11-30','Credit Card','HDFC-CC-991823','PAID','Full annual membership upfront payment.'],
    ['pay_1003','usr_client_03','INV-BE-2026-0731',2500,'1 Month Standard','2026-08-05','2026-09-05','Cash','CASH-REC-0731','OVERDUE','Membership expired 4 days ago. Reminder WhatsApp sent.'],
    ['pay_1004','usr_client_04','INV-BE-2026-1024',6500,'3 Months Pro','2026-07-25','2026-10-25','UPI','GPay/725102/4411','PAID','Quarterly package with complimentary personal locker.'],
    ['pay_1005','usr_client_05','INV-BE-2026-1105',2500,'1 Month Pro','2026-08-14','2026-09-14','NetBanking','ICICI-NB-881923','DUE_SOON','Automatic renewal reminder scheduled.'],
  ];
  const seedPayments = db.transaction(() => {
    for (const p of payments) insertPayment.run(...p);
  });
  seedPayments();

  // Workout Plans (stored as JSON blobs for simplicity)
  const insertWorkout = db.prepare(`
    INSERT OR IGNORE INTO workout_plans (id, user_id, title, split_type, last_updated, days_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const workoutPlans = [
    {
      id: 'wp_001', userId: 'usr_client_01',
      title: '6-Day Push-Pull-Legs Hypertrophy Split', splitType: 'Push-Pull-Legs', lastUpdated: '2026-09-08',
      days: [
        { id: 'wd_001_mon', dayName: 'Monday', routineTitle: 'Push Day: Chest, Shoulders & Triceps', estimatedMinutes: 65, muscleGroups: 'Chest, Front Delts, Triceps', isToday: true, exercises: [
          { id: 'ex_101', name: 'Incline Dumbbell Bench Press', muscleGroup: 'Chest', targetSets: 4, targetReps: '8 - 10', targetWeightKg: 28, restSeconds: 90, completed: true, notes: 'Maintain 30-degree incline, control the eccentric 3-second descent.', videoGuideUrl: 'https://youtube.com/results?search_query=incline+dumbbell+bench+press+form' },
          { id: 'ex_102', name: 'Flat Barbell Bench Press', muscleGroup: 'Chest', targetSets: 4, targetReps: '6 - 8', targetWeightKg: 75, restSeconds: 120, completed: true, notes: 'Drive through feet, tuck scapula, pause 1s at chest touch.', videoGuideUrl: 'https://youtube.com/results?search_query=barbell+bench+press+proper+form' },
          { id: 'ex_103', name: 'Standing Dumbbell Lateral Raises', muscleGroup: 'Shoulders', targetSets: 4, targetReps: '12 - 15', targetWeightKg: 10, restSeconds: 60, completed: false, notes: 'Slight forward torso lean, lead with elbows to failure.', videoGuideUrl: 'https://youtube.com/results?search_query=dumbbell+lateral+raise+form' },
          { id: 'ex_104', name: 'Seated Overhead Dumbbell Shoulder Press', muscleGroup: 'Shoulders', targetSets: 3, targetReps: '8 - 10', targetWeightKg: 22, restSeconds: 90, completed: false, notes: 'Press in slight arc without slamming dumbbells at top.', videoGuideUrl: 'https://youtube.com/results?search_query=seated+dumbbell+shoulder+press' },
          { id: 'ex_105', name: 'Tricep Cable Rope Pushdowns', muscleGroup: 'Triceps', targetSets: 4, targetReps: '12 - 15', targetWeightKg: 30, restSeconds: 60, completed: false, notes: 'Spread ropes apart at bottom contraction, lock elbows in place.', videoGuideUrl: 'https://youtube.com/results?search_query=tricep+rope+pushdown+form' },
          { id: 'ex_106', name: 'Overhead EZ-Bar Skullcrushers', muscleGroup: 'Triceps', targetSets: 3, targetReps: '10 - 12', targetWeightKg: 25, restSeconds: 60, completed: false, notes: 'Lower behind crown of head for full triceps long head stretch.', videoGuideUrl: 'https://youtube.com/results?search_query=skull+crushers+ez+bar' }
        ]},
        { id: 'wd_001_tue', dayName: 'Tuesday', routineTitle: 'Pull Day: Back, Rear Delts & Biceps', estimatedMinutes: 60, muscleGroups: 'Lats, Rhomboids, Rear Delts, Biceps', isToday: false, exercises: [
          { id: 'ex_201', name: 'Wide Grip Lat Pulldowns', muscleGroup: 'Back', targetSets: 4, targetReps: '10 - 12', targetWeightKg: 60, restSeconds: 75, completed: false, notes: 'Drive elbows to ribs.' },
          { id: 'ex_202', name: 'Barbell Bent-Over Rows', muscleGroup: 'Back', targetSets: 4, targetReps: '8 - 10', targetWeightKg: 65, restSeconds: 90, completed: false, notes: 'Hinge at hips, pull to belly button.' },
          { id: 'ex_203', name: 'Chest Supported Seated Cable Row', muscleGroup: 'Back', targetSets: 3, targetReps: '10 - 12', targetWeightKg: 55, restSeconds: 60, completed: false, notes: 'Squeeze shoulder blades.' },
          { id: 'ex_204', name: 'Rope Face Pulls', muscleGroup: 'Rear Delts', targetSets: 4, targetReps: '15', targetWeightKg: 25, restSeconds: 60, completed: false, notes: 'External rotation focus for healthy shoulders.' },
          { id: 'ex_205', name: 'Incline Dumbbell Bicep Curls', muscleGroup: 'Biceps', targetSets: 4, targetReps: '10 - 12', targetWeightKg: 14, restSeconds: 60, completed: false, notes: 'Deep stretch at bottom.' },
          { id: 'ex_206', name: 'Cross-Body Hammer Curls', muscleGroup: 'Biceps', targetSets: 3, targetReps: '12', targetWeightKg: 16, restSeconds: 60, completed: false, notes: 'Brachialis thickness.' }
        ]},
        { id: 'wd_001_wed', dayName: 'Wednesday', routineTitle: 'Leg Day: Quads, Hamstrings & Calves', estimatedMinutes: 70, muscleGroups: 'Quads, Glutes, Hamstrings, Calves', isToday: false, exercises: [
          { id: 'ex_301', name: 'Barbell Back Squats', muscleGroup: 'Legs', targetSets: 4, targetReps: '6 - 8', targetWeightKg: 95, restSeconds: 120, completed: false, notes: 'Hit parallel depth, brace core.' },
          { id: 'ex_302', name: 'Romanian Deadlifts (RDL)', muscleGroup: 'Hamstrings', targetSets: 4, targetReps: '8 - 10', targetWeightKg: 80, restSeconds: 90, completed: false, notes: 'Push hips back, feel hamstring stretch.' },
          { id: 'ex_303', name: '45-Degree Incline Leg Press', muscleGroup: 'Quads', targetSets: 3, targetReps: '12 - 15', targetWeightKg: 180, restSeconds: 90, completed: false, notes: 'Deep range without pelvis rounding.' },
          { id: 'ex_304', name: 'Seated Hamstring Leg Curls', muscleGroup: 'Hamstrings', targetSets: 3, targetReps: '12 - 15', targetWeightKg: 45, restSeconds: 60, completed: false, notes: 'Control 2s negative.' },
          { id: 'ex_305', name: 'Standing Machine Calf Raises', muscleGroup: 'Calves', targetSets: 4, targetReps: '15 - 20', targetWeightKg: 70, restSeconds: 45, completed: false, notes: 'Hold stretch at bottom 2s.' }
        ]},
        { id: 'wd_001_thu', dayName: 'Thursday', routineTitle: 'Active Recovery & Mobility Core', estimatedMinutes: 40, muscleGroups: 'Core, Lower Back, Mobility', isToday: false, exercises: [
          { id: 'ex_401', name: 'Hanging Leg Raises', muscleGroup: 'Core', targetSets: 4, targetReps: '12 - 15', targetWeightKg: 0, restSeconds: 60, completed: false, notes: 'Do not swing, curl pelvis up.' },
          { id: 'ex_402', name: 'Cable Woodchoppers', muscleGroup: 'Core', targetSets: 3, targetReps: '15 each side', targetWeightKg: 20, restSeconds: 45, completed: false, notes: 'Rotational power.' },
          { id: 'ex_403', name: 'Incline Treadmill Zone-2 Walk', muscleGroup: 'Cardio', targetSets: 1, targetReps: '25 mins', targetWeightKg: 0, restSeconds: 0, completed: false, notes: 'Speed 5.2 km/h, Incline 8%.' }
        ]},
        { id: 'wd_001_fri', dayName: 'Friday', routineTitle: 'Upper Body Power Split', estimatedMinutes: 60, muscleGroups: 'Chest, Back, Arms', isToday: false, exercises: [
          { id: 'ex_501', name: 'Weighted Dips', muscleGroup: 'Chest/Triceps', targetSets: 4, targetReps: '8 - 10', targetWeightKg: 10, restSeconds: 90, completed: false, notes: 'Lean forward for chest focus.' },
          { id: 'ex_502', name: 'Neutral Grip Pull-Ups', muscleGroup: 'Back', targetSets: 4, targetReps: '8 - 10', targetWeightKg: 0, restSeconds: 90, completed: false, notes: 'Full dead-hang stretch.' },
          { id: 'ex_503', name: 'Dumbbell Incline Flyes', muscleGroup: 'Chest', targetSets: 3, targetReps: '12', targetWeightKg: 16, restSeconds: 60, completed: false, notes: 'Slight elbow bend.' }
        ]},
        { id: 'wd_001_sat', dayName: 'Saturday', routineTitle: 'Lower Body & Glutes Focus', estimatedMinutes: 55, muscleGroups: 'Quads, Glutes, Calves', isToday: false, exercises: [
          { id: 'ex_601', name: 'Bulgarian Split Squats', muscleGroup: 'Quads/Glutes', targetSets: 3, targetReps: '10 each leg', targetWeightKg: 16, restSeconds: 75, completed: false, notes: 'Elevate rear foot on bench.' },
          { id: 'ex_602', name: 'Barbell Hip Thrusts', muscleGroup: 'Glutes', targetSets: 4, targetReps: '10 - 12', targetWeightKg: 110, restSeconds: 90, completed: false, notes: 'Lockout glutes at top.' }
        ]}
      ]
    },
    {
      id: 'wp_002', userId: 'usr_client_02',
      title: 'Glute & Functional Strength Split', splitType: 'Lower / Upper Hypertrophy', lastUpdated: '2026-09-01',
      days: [
        { id: 'wd_002_today', dayName: 'Today', routineTitle: 'Glute Hypertrophy & Hamstrings', estimatedMinutes: 55, muscleGroups: 'Glutes, Hamstrings, Core', isToday: true, exercises: [
          { id: 'ex_701', name: 'Barbell Hip Thrusts', muscleGroup: 'Glutes', targetSets: 4, targetReps: '10 - 12', targetWeightKg: 90, restSeconds: 90, completed: false, notes: '2s pause at top.' },
          { id: 'ex_702', name: 'Goblet Squats', muscleGroup: 'Quads/Glutes', targetSets: 3, targetReps: '12', targetWeightKg: 20, restSeconds: 60, completed: false, notes: 'Deep upright squat.' },
          { id: 'ex_703', name: 'Cable Glute Kickbacks', muscleGroup: 'Glutes', targetSets: 3, targetReps: '15 each', targetWeightKg: 12, restSeconds: 45, completed: false, notes: 'Squeeze glute medius.' }
        ]}
      ]
    },
    {
      id: 'wp_003', userId: 'usr_client_03',
      title: 'Fat Loss & Metabolic Conditioning', splitType: 'Full Body Circuit', lastUpdated: '2026-08-28',
      days: [
        { id: 'wd_003_today', dayName: 'Today', routineTitle: 'Metabolic HIIT & Core Strength', estimatedMinutes: 50, muscleGroups: 'Full Body & Cardio', isToday: true, exercises: [
          { id: 'ex_801', name: 'Kettlebell Swings', muscleGroup: 'Posterior Chain', targetSets: 4, targetReps: '20', targetWeightKg: 16, restSeconds: 45, completed: false, notes: 'Explosive hip snap.' },
          { id: 'ex_802', name: 'Dumbbell Thrusters', muscleGroup: 'Full Body', targetSets: 4, targetReps: '12', targetWeightKg: 10, restSeconds: 60, completed: false, notes: 'Squat into overhead press.' }
        ]}
      ]
    }
  ];

  const seedWorkouts = db.transaction(() => {
    for (const wp of workoutPlans) {
      insertWorkout.run(wp.id, wp.userId, wp.title, wp.splitType, wp.lastUpdated, JSON.stringify(wp.days));
    }
  });
  seedWorkouts();

  // Diet Plans
  const insertDiet = db.prepare(`
    INSERT OR IGNORE INTO diet_plans (id, user_id, title, daily_calories, target_protein_g, target_carbs_g, target_fats_g, daily_water_liters, dietary_type, last_updated, notes, meals_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const dietPlans = [
    {
      id: 'dp_001', userId: 'usr_client_01',
      title: 'High-Protein Clean Recomp Plan', dailyCalories: 2450, targetProteinG: 165, targetCarbsG: 260, targetFatsG: 65,
      dailyWaterLiters: 3.5, dietaryType: 'Non-Vegetarian', lastUpdated: '2026-09-07',
      notes: 'Consume whey protein immediately post-workout. Avoid refined sugars after 7:00 PM.',
      meals: [
        { id: 'meal_01', name: 'Power Breakfast', timeString: '08:00 AM', notes: 'Essential morning protein & complex carbs', items: [
          { id: 'fi_01', name: 'Whole Eggs (Boiled / Omelette)', portion: '4 Large Eggs', calories: 280, proteinG: 24, carbsG: 2, fatsG: 20 },
          { id: 'fi_02', name: 'Rolled Oats with Almond Milk', portion: '60g dry oats + 200ml milk', calories: 250, proteinG: 9, carbsG: 45, fatsG: 5 },
          { id: 'fi_03', name: 'Banana & Almonds', portion: '1 Medium Banana + 8 Almonds', calories: 160, proteinG: 3, carbsG: 28, fatsG: 6 }
        ]},
        { id: 'meal_02', name: 'Mid-Morning Fuel', timeString: '11:30 AM', notes: 'Steady energy sustain', items: [
          { id: 'fi_04', name: 'Greek Yogurt / Paneer Cubes', portion: '150g Low Fat', calories: 150, proteinG: 15, carbsG: 8, fatsG: 5 },
          { id: 'fi_05', name: 'Apple Slices with Cinnamon', portion: '1 Medium Apple', calories: 80, proteinG: 0.5, carbsG: 20, fatsG: 0.2 }
        ]},
        { id: 'meal_03', name: 'Muscle Building Lunch', timeString: '01:30 PM', notes: 'High fiber, lean protein, brown rice', items: [
          { id: 'fi_06', name: 'Grilled Chicken Breast / Tofu', portion: '200g Cooked', calories: 330, proteinG: 46, carbsG: 0, fatsG: 7 },
          { id: 'fi_07', name: 'Steamed Brown Rice / Quinoa', portion: '150g Cooked', calories: 175, proteinG: 4, carbsG: 38, fatsG: 1.5 },
          { id: 'fi_08', name: 'Mixed Green Salad with Olive Oil', portion: '1 Big Bowl + 1 tsp oil', calories: 90, proteinG: 2, carbsG: 6, fatsG: 5 }
        ]},
        { id: 'meal_04', name: 'Pre-Workout Boost', timeString: '05:00 PM', notes: 'Take 45 mins before training with 1 cup black coffee', items: [
          { id: 'fi_09', name: 'Whole Grain Toast with Peanut Butter', portion: '2 Slices + 1 tbsp PB', calories: 240, proteinG: 9, carbsG: 30, fatsG: 10 },
          { id: 'fi_10', name: 'Black Coffee or Pre-workout', portion: '200ml (Zero Calorie)', calories: 5, proteinG: 0, carbsG: 0, fatsG: 0 }
        ]},
        { id: 'meal_05', name: 'Post-Workout Recovery', timeString: '07:30 PM', notes: 'Fast acting amino acids within 30 mins of gym', items: [
          { id: 'fi_11', name: '100% Whey Protein Isolate', portion: '1 Scoop in 250ml Water', calories: 130, proteinG: 27, carbsG: 2, fatsG: 1 },
          { id: 'fi_12', name: 'Electrolyte Coconut Water', portion: '200ml Fresh', calories: 45, proteinG: 1, carbsG: 10, fatsG: 0 }
        ]},
        { id: 'meal_06', name: 'Recovery Dinner', timeString: '09:00 PM', notes: 'Low carb, nutrient rich, easy digestion', items: [
          { id: 'fi_13', name: 'Steamed Fish / Paneer Tikka', portion: '180g Portion', calories: 290, proteinG: 34, carbsG: 4, fatsG: 12 },
          { id: 'fi_14', name: 'Sautéed Broccoli, Zucchini & Bell Peppers', portion: '150g Sautéed', calories: 85, proteinG: 4, carbsG: 11, fatsG: 2 }
        ]}
      ]
    },
    {
      id: 'dp_002', userId: 'usr_client_02',
      title: 'Vegetarian High-Protein Tone Diet', dailyCalories: 1950, targetProteinG: 130, targetCarbsG: 210, targetFatsG: 50,
      dailyWaterLiters: 3.0, dietaryType: 'Vegetarian', lastUpdated: '2026-09-01',
      notes: 'High fiber and plant proteins with cottage cheese and edamame.',
      meals: [
        { id: 'meal_201', name: 'Nutrient Dense Breakfast', timeString: '08:30 AM', notes: '', items: [
          { id: 'fi_201', name: 'Paneer Scramble (Bhurji)', portion: '120g Low-fat Paneer', calories: 220, proteinG: 22, carbsG: 4, fatsG: 12 },
          { id: 'fi_202', name: 'Multigrain Toast', portion: '2 Slices', calories: 150, proteinG: 6, carbsG: 28, fatsG: 2 }
        ]},
        { id: 'meal_202', name: 'Balanced Lunch', timeString: '01:00 PM', notes: '', items: [
          { id: 'fi_203', name: 'Soy Chunks / Tofu Curry', portion: '150g Curry', calories: 260, proteinG: 28, carbsG: 14, fatsG: 8 },
          { id: 'fi_204', name: 'Brown Rice & Lentil Dal', portion: '1 Cup Rice + 1 Cup Dal', calories: 280, proteinG: 12, carbsG: 52, fatsG: 3 }
        ]}
      ]
    }
  ];

  const seedDiets = db.transaction(() => {
    for (const dp of dietPlans) {
      insertDiet.run(dp.id, dp.userId, dp.title, dp.dailyCalories, dp.targetProteinG, dp.targetCarbsG, dp.targetFatsG,
        dp.dailyWaterLiters, dp.dietaryType, dp.lastUpdated, dp.notes, JSON.stringify(dp.meals));
    }
  });
  seedDiets();

  // Notifications
  const insertNotif = db.prepare(`
    INSERT OR IGNORE INTO notifications (id, recipient_id, type, title, message, timestamp, is_read)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const seedNotifs = db.transaction(() => {
    insertNotif.run('notif_01','usr_client_01','fee_due','Membership Renewal Alert',
      'Your monthly membership expires in 2 days (Sep 11, 2026). Renew online or at the reception to continue seamless gym access.',
      '2026-09-09T08:00:00Z', 0);
    insertNotif.run('notif_02','usr_client_01','workout_updated','Workout Routine Optimized',
      'Coach Vikram adjusted your Monday Push Day sets and added Incline DB presses.',
      '2026-09-08T17:30:00Z', 1);
    insertNotif.run('notif_03','usr_client_03','fee_overdue','Urgent: Membership Fee Overdue',
      'Your gym fee was due on Sep 05, 2026 (4 days overdue). Please clear your dues today.',
      '2026-09-06T10:00:00Z', 0);
  });
  seedNotifs();

  console.log('✅ Database seeded successfully!');
}

seedIfEmpty();

module.exports = db;
