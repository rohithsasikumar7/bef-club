/**
 * Seed Dataset for "Body Engineers Fit Club"
 * Preloaded with realistic gym owner, trainers, and diverse client profiles
 * with linked workouts, personalized diets, and billing states.
 */

export const INITIAL_SEED_DATA = {
  gymProfile: {
    name: "Body Engineers Fit Club",
    tagline: "Precision Training & Science-Backed Nutrition",
    address: "Level 2, Elite Sports Complex, Metro Pillar 142, Indiranagar",
    phone: "+91 98765 43210",
    email: "support@bodyengineersfitclub.com",
    upiId: "bodyengineers@okhdfcbank",
    currency: "₹",
    logoText: "BODY ENGINEERS",
    subText: "FIT CLUB"
  },

  users: [
    {
      id: "usr_admin_01",
      role: "ADMIN",
      fullName: "Coach Vikram Rathore",
      email: "vikram@bodyengineers.com",
      phone: "+91 98765 00001",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      memberCode: "BE-STAFF-001",
      membershipTier: "Head Coach & Founder",
      joinDate: "2024-01-01",
      nextFeeDueDate: "2099-12-31",
      feeStatus: "PAID",
      monthlyFee: 0,
      trainerId: null,
      currentWeightKg: 85.0,
      targetWeightKg: 85.0,
      heightCm: 182,
      fitnessGoal: "Strength & Athletic Performance",
      emergencyContact: "+91 98765 00000"
    },
    {
      id: "usr_client_01",
      role: "CLIENT",
      fullName: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      phone: "+91 98111 22334",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      memberCode: "BE-2026-0842",
      membershipTier: "Monthly Pro Plan",
      joinDate: "2026-03-11",
      nextFeeDueDate: "2026-09-11", // Due in 2 days
      feeStatus: "DUE_SOON",
      monthlyFee: 2500,
      trainerId: "usr_admin_01",
      currentWeightKg: 78.5,
      targetWeightKg: 74.0,
      heightCm: 178,
      fitnessGoal: "Lean Hypertrophy & Fat Loss",
      emergencyContact: "+91 98111 00000",
      attendanceStreakDays: 14,
      waterGlassesToday: 6 // 6 * 250ml = 1.5L
    },
    {
      id: "usr_client_02",
      role: "CLIENT",
      fullName: "Ananya Patel",
      email: "ananya.patel@example.com",
      phone: "+91 98222 33445",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      memberCode: "BE-2026-0918",
      membershipTier: "Annual VIP Elite",
      joinDate: "2025-11-30",
      nextFeeDueDate: "2026-11-30", // Paid until late Nov
      feeStatus: "PAID",
      monthlyFee: 1500, // effective monthly rate from 18k annual
      trainerId: "usr_admin_01",
      currentWeightKg: 59.2,
      targetWeightKg: 58.0,
      heightCm: 165,
      fitnessGoal: "Strength & Glute Hypertrophy",
      emergencyContact: "+91 98222 00000",
      attendanceStreakDays: 22,
      waterGlassesToday: 8
    },
    {
      id: "usr_client_03",
      role: "CLIENT",
      fullName: "Kavita Rao",
      email: "kavita.rao@example.com",
      phone: "+91 98333 44556",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      memberCode: "BE-2026-0731",
      membershipTier: "Monthly Standard",
      joinDate: "2026-02-05",
      nextFeeDueDate: "2026-09-05", // Overdue by 4 days
      feeStatus: "OVERDUE",
      monthlyFee: 2500,
      trainerId: "usr_admin_01",
      currentWeightKg: 68.0,
      targetWeightKg: 62.0,
      heightCm: 162,
      fitnessGoal: "Fat Loss & Functional Conditioning",
      emergencyContact: "+91 98333 00000",
      attendanceStreakDays: 8,
      waterGlassesToday: 4
    },
    {
      id: "usr_client_04",
      role: "CLIENT",
      fullName: "Arjun Nair",
      email: "arjun.nair@example.com",
      phone: "+91 98444 55667",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      memberCode: "BE-2026-1024",
      membershipTier: "Quarterly Pro",
      joinDate: "2026-07-25",
      nextFeeDueDate: "2026-10-25", // Paid
      feeStatus: "PAID",
      monthlyFee: 2166, // from 6500 quarterly
      trainerId: "usr_admin_01",
      currentWeightKg: 82.0,
      targetWeightKg: 86.0,
      heightCm: 180,
      fitnessGoal: "Mass Bulking & Powerlifting",
      emergencyContact: "+91 98444 00000",
      attendanceStreakDays: 19,
      waterGlassesToday: 10
    },
    {
      id: "usr_client_05",
      role: "CLIENT",
      fullName: "Sneha Reddy",
      email: "sneha.reddy@example.com",
      phone: "+91 98555 66778",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      memberCode: "BE-2026-1105",
      membershipTier: "Monthly Pro Plan",
      joinDate: "2026-05-14",
      nextFeeDueDate: "2026-09-14", // Due in 5 days
      feeStatus: "DUE_SOON",
      monthlyFee: 2500,
      trainerId: "usr_admin_01",
      currentWeightKg: 55.0,
      targetWeightKg: 56.5,
      heightCm: 168,
      fitnessGoal: "Core Strength & Marathon Endurance",
      emergencyContact: "+91 98555 00000",
      attendanceStreakDays: 11,
      waterGlassesToday: 5
    }
  ],

  workoutPlans: [
    {
      id: "wp_001",
      userId: "usr_client_01", // Rahul Sharma
      title: "6-Day Push-Pull-Legs Hypertrophy Split",
      splitType: "Push-Pull-Legs",
      lastUpdated: "2026-09-08",
      days: [
        {
          id: "wd_001_mon",
          dayName: "Monday",
          routineTitle: "Push Day: Chest, Shoulders & Triceps",
          estimatedMinutes: 65,
          muscleGroups: "Chest, Front Delts, Triceps",
          isToday: true,
          exercises: [
            {
              id: "ex_101",
              name: "Incline Dumbbell Bench Press",
              muscleGroup: "Chest",
              targetSets: 4,
              targetReps: "8 - 10",
              targetWeightKg: 28,
              restSeconds: 90,
              completed: true,
              notes: "Maintain 30-degree incline, control the eccentric 3-second descent.",
              videoGuideUrl: "https://youtube.com/results?search_query=incline+dumbbell+bench+press+form"
            },
            {
              id: "ex_102",
              name: "Flat Barbell Bench Press",
              muscleGroup: "Chest",
              targetSets: 4,
              targetReps: "6 - 8",
              targetWeightKg: 75,
              restSeconds: 120,
              completed: true,
              notes: "Drive through feet, tuck scapula, pause 1s at chest touch.",
              videoGuideUrl: "https://youtube.com/results?search_query=barbell+bench+press+proper+form"
            },
            {
              id: "ex_103",
              name: "Standing Dumbbell Lateral Raises",
              muscleGroup: "Shoulders",
              targetSets: 4,
              targetReps: "12 - 15",
              targetWeightKg: 10,
              restSeconds: 60,
              completed: false,
              notes: "Slight forward torso lean, lead with elbows to failure.",
              videoGuideUrl: "https://youtube.com/results?search_query=dumbbell+lateral+raise+form"
            },
            {
              id: "ex_104",
              name: "Seated Overhead Dumbbell Shoulder Press",
              muscleGroup: "Shoulders",
              targetSets: 3,
              targetReps: "8 - 10",
              targetWeightKg: 22,
              restSeconds: 90,
              completed: false,
              notes: "Press in slight arc without slamming dumbbells at top.",
              videoGuideUrl: "https://youtube.com/results?search_query=seated+dumbbell+shoulder+press"
            },
            {
              id: "ex_105",
              name: "Tricep Cable Rope Pushdowns",
              muscleGroup: "Triceps",
              targetSets: 4,
              targetReps: "12 - 15",
              targetWeightKg: 30,
              restSeconds: 60,
              completed: false,
              notes: "Spread ropes apart at bottom contraction, lock elbows in place.",
              videoGuideUrl: "https://youtube.com/results?search_query=tricep+rope+pushdown+form"
            },
            {
              id: "ex_106",
              name: "Overhead EZ-Bar Skullcrushers",
              muscleGroup: "Triceps",
              targetSets: 3,
              targetReps: "10 - 12",
              targetWeightKg: 25,
              restSeconds: 60,
              completed: false,
              notes: "Lower behind crown of head for full triceps long head stretch.",
              videoGuideUrl: "https://youtube.com/results?search_query=skull+crushers+ez+bar"
            }
          ]
        },
        {
          id: "wd_001_tue",
          dayName: "Tuesday",
          routineTitle: "Pull Day: Back, Rear Delts & Biceps",
          estimatedMinutes: 60,
          muscleGroups: "Lats, Rhomboids, Rear Delts, Biceps",
          isToday: false,
          exercises: [
            { id: "ex_201", name: "Wide Grip Lat Pulldowns", muscleGroup: "Back", targetSets: 4, targetReps: "10 - 12", targetWeightKg: 60, restSeconds: 75, completed: false, notes: "Drive elbows to ribs." },
            { id: "ex_202", name: "Barbell Bent-Over Rows", muscleGroup: "Back", targetSets: 4, targetReps: "8 - 10", targetWeightKg: 65, restSeconds: 90, completed: false, notes: "Hinge at hips, pull to belly button." },
            { id: "ex_203", name: "Chest Supported Seated Cable Row", muscleGroup: "Back", targetSets: 3, targetReps: "10 - 12", targetWeightKg: 55, restSeconds: 60, completed: false, notes: "Squeeze shoulder blades." },
            { id: "ex_204", name: "Rope Face Pulls", muscleGroup: "Rear Delts", targetSets: 4, targetReps: "15", targetWeightKg: 25, restSeconds: 60, completed: false, notes: "External rotation focus for healthy shoulders." },
            { id: "ex_205", name: "Incline Dumbbell Bicep Curls", muscleGroup: "Biceps", targetSets: 4, targetReps: "10 - 12", targetWeightKg: 14, restSeconds: 60, completed: false, notes: "Deep stretch at bottom." },
            { id: "ex_206", name: "Cross-Body Hammer Curls", muscleGroup: "Biceps", targetSets: 3, targetReps: "12", targetWeightKg: 16, restSeconds: 60, completed: false, notes: "Brachialis thickness." }
          ]
        },
        {
          id: "wd_001_wed",
          dayName: "Wednesday",
          routineTitle: "Leg Day: Quads, Hamstrings & Calves",
          estimatedMinutes: 70,
          muscleGroups: "Quads, Glutes, Hamstrings, Calves",
          isToday: false,
          exercises: [
            { id: "ex_301", name: "Barbell Back Squats", muscleGroup: "Legs", targetSets: 4, targetReps: "6 - 8", targetWeightKg: 95, restSeconds: 120, completed: false, notes: "Hit parallel depth, brace core." },
            { id: "ex_302", name: "Romanian Deadlifts (RDL)", muscleGroup: "Hamstrings", targetSets: 4, targetReps: "8 - 10", targetWeightKg: 80, restSeconds: 90, completed: false, notes: "Push hips back, feel hamstring stretch." },
            { id: "ex_303", name: "45-Degree Incline Leg Press", muscleGroup: "Quads", targetSets: 3, targetReps: "12 - 15", targetWeightKg: 180, restSeconds: 90, completed: false, notes: "Deep range without pelvis rounding." },
            { id: "ex_304", name: "Seated Hamstring Leg Curls", muscleGroup: "Hamstrings", targetSets: 3, targetReps: "12 - 15", targetWeightKg: 45, restSeconds: 60, completed: false, notes: "Control 2s negative." },
            { id: "ex_305", name: "Standing Machine Calf Raises", muscleGroup: "Calves", targetSets: 4, targetReps: "15 - 20", targetWeightKg: 70, restSeconds: 45, completed: false, notes: "Hold stretch at bottom 2s." }
          ]
        },
        {
          id: "wd_001_thu",
          dayName: "Thursday",
          routineTitle: "Active Recovery & Mobility Core",
          estimatedMinutes: 40,
          muscleGroups: "Core, Lower Back, Mobility",
          isToday: false,
          exercises: [
            { id: "ex_401", name: "Hanging Leg Raises", muscleGroup: "Core", targetSets: 4, targetReps: "12 - 15", targetWeightKg: 0, restSeconds: 60, completed: false, notes: "Do not swing, curl pelvis up." },
            { id: "ex_402", name: "Cable Woodchoppers", muscleGroup: "Core", targetSets: 3, targetReps: "15 each side", targetWeightKg: 20, restSeconds: 45, completed: false, notes: "Rotational power." },
            { id: "ex_403", name: "Incline Treadmill Zone-2 Walk", muscleGroup: "Cardio", targetSets: 1, targetReps: "25 mins", targetWeightKg: 0, restSeconds: 0, completed: false, notes: "Speed 5.2 km/h, Incline 8%." }
          ]
        },
        {
          id: "wd_001_fri",
          dayName: "Friday",
          routineTitle: "Upper Body Power Split",
          estimatedMinutes: 60,
          muscleGroups: "Chest, Back, Arms",
          isToday: false,
          exercises: [
            { id: "ex_501", name: "Weighted Dips", muscleGroup: "Chest/Triceps", targetSets: 4, targetReps: "8 - 10", targetWeightKg: 10, restSeconds: 90, completed: false, notes: "Lean forward for chest focus." },
            { id: "ex_502", name: "Neutral Grip Pull-Ups", muscleGroup: "Back", targetSets: 4, targetReps: "8 - 10", targetWeightKg: 0, restSeconds: 90, completed: false, notes: "Full dead-hang stretch." },
            { id: "ex_503", name: "Dumbbell Incline Flyes", muscleGroup: "Chest", targetSets: 3, targetReps: "12", targetWeightKg: 16, restSeconds: 60, completed: false, notes: "Slight elbow bend." }
          ]
        },
        {
          id: "wd_001_sat",
          dayName: "Saturday",
          routineTitle: "Lower Body & Glutes Focus",
          estimatedMinutes: 55,
          muscleGroups: "Quads, Glutes, Calves",
          isToday: false,
          exercises: [
            { id: "ex_601", name: "Bulgarian Split Squats", muscleGroup: "Quads/Glutes", targetSets: 3, targetReps: "10 each leg", targetWeightKg: 16, restSeconds: 75, completed: false, notes: "Elevate rear foot on bench." },
            { id: "ex_602", name: "Barbell Hip Thrusts", muscleGroup: "Glutes", targetSets: 4, targetReps: "10 - 12", targetWeightKg: 110, restSeconds: 90, completed: false, notes: "Lockout glutes at top." }
          ]
        }
      ]
    },
    {
      id: "wp_002",
      userId: "usr_client_02", // Ananya Patel
      title: "Glute & Functional Strength Split",
      splitType: "Lower / Upper Hypertrophy",
      lastUpdated: "2026-09-01",
      days: [
        {
          id: "wd_002_today",
          dayName: "Today",
          routineTitle: "Glute Hypertrophy & Hamstrings",
          estimatedMinutes: 55,
          muscleGroups: "Glutes, Hamstrings, Core",
          isToday: true,
          exercises: [
            { id: "ex_701", name: "Barbell Hip Thrusts", muscleGroup: "Glutes", targetSets: 4, targetReps: "10 - 12", targetWeightKg: 90, restSeconds: 90, completed: false, notes: "2s pause at top." },
            { id: "ex_702", name: "Goblet Squats", muscleGroup: "Quads/Glutes", targetSets: 3, targetReps: "12", targetWeightKg: 20, restSeconds: 60, completed: false, notes: "Deep upright squat." },
            { id: "ex_703", name: "Cable Glute Kickbacks", muscleGroup: "Glutes", targetSets: 3, targetReps: "15 each", targetWeightKg: 12, restSeconds: 45, completed: false, notes: "Squeeze glute medius." }
          ]
        }
      ]
    },
    {
      id: "wp_003",
      userId: "usr_client_03", // Kavita Rao
      title: "Fat Loss & Metabolic Conditioning",
      splitType: "Full Body Circuit",
      lastUpdated: "2026-08-28",
      days: [
        {
          id: "wd_003_today",
          dayName: "Today",
          routineTitle: "Metabolic HIIT & Core Strength",
          estimatedMinutes: 50,
          muscleGroups: "Full Body & Cardio",
          isToday: true,
          exercises: [
            { id: "ex_801", name: "Kettlebell Swings", muscleGroup: "Posterior Chain", targetSets: 4, targetReps: "20", targetWeightKg: 16, restSeconds: 45, completed: false, notes: "Explosive hip snap." },
            { id: "ex_802", name: "Dumbbell Thrusters", muscleGroup: "Full Body", targetSets: 4, targetReps: "12", targetWeightKg: 10, restSeconds: 60, completed: false, notes: "Squat into overhead press." }
          ]
        }
      ]
    }
  ],

  dietPlans: [
    {
      id: "dp_001",
      userId: "usr_client_01", // Rahul Sharma
      title: "High-Protein Clean Recomp Plan",
      dailyCalories: 2450,
      targetProteinG: 165,
      targetCarbsG: 260,
      targetFatsG: 65,
      dailyWaterLiters: 3.5,
      dietaryType: "Non-Vegetarian",
      lastUpdated: "2026-09-07",
      notes: "Consume whey protein immediately post-workout. Avoid refined sugars after 7:00 PM.",
      meals: [
        {
          id: "meal_01",
          name: "Power Breakfast",
          timeString: "08:00 AM",
          notes: "Essential morning protein & complex carbs",
          items: [
            { id: "fi_01", name: "Whole Eggs (Boiled / Omelette)", portion: "4 Large Eggs", calories: 280, proteinG: 24, carbsG: 2, fatsG: 20 },
            { id: "fi_02", name: "Rolled Oats with Almond Milk", portion: "60g dry oats + 200ml milk", calories: 250, proteinG: 9, carbsG: 45, fatsG: 5 },
            { id: "fi_03", name: "Banana & Almonds", portion: "1 Medium Banana + 8 Almonds", calories: 160, proteinG: 3, carbsG: 28, fatsG: 6 }
          ]
        },
        {
          id: "meal_02",
          name: "Mid-Morning Fuel",
          timeString: "11:30 AM",
          notes: "Steady energy sustain",
          items: [
            { id: "fi_04", name: "Greek Yogurt / Paneer Cubes", portion: "150g Low Fat", calories: 150, proteinG: 15, carbsG: 8, fatsG: 5 },
            { id: "fi_05", name: "Apple Slices with Cinnamon", portion: "1 Medium Apple", calories: 80, proteinG: 0.5, carbsG: 20, fatsG: 0.2 }
          ]
        },
        {
          id: "meal_03",
          name: "Muscle Building Lunch",
          timeString: "01:30 PM",
          notes: "High fiber, lean protein, brown rice",
          items: [
            { id: "fi_06", name: "Grilled Chicken Breast / Tofu", portion: "200g Cooked", calories: 330, proteinG: 46, carbsG: 0, fatsG: 7 },
            { id: "fi_07", name: "Steamed Brown Rice / Quinoa", portion: "150g Cooked", calories: 175, proteinG: 4, carbsG: 38, fatsG: 1.5 },
            { id: "fi_08", name: "Mixed Green Salad with Olive Oil", portion: "1 Big Bowl + 1 tsp oil", calories: 90, proteinG: 2, carbsG: 6, fatsG: 5 }
          ]
        },
        {
          id: "meal_04",
          name: "Pre-Workout Boost",
          timeString: "05:00 PM",
          notes: "Take 45 mins before training with 1 cup black coffee",
          items: [
            { id: "fi_09", name: "Whole Grain Toast with Peanut Butter", portion: "2 Slices + 1 tbsp PB", calories: 240, proteinG: 9, carbsG: 30, fatsG: 10 },
            { id: "fi_10", name: "Black Coffee or Pre-workout", portion: "200ml (Zero Calorie)", calories: 5, proteinG: 0, carbsG: 0, fatsG: 0 }
          ]
        },
        {
          id: "meal_05",
          name: "Post-Workout Recovery",
          timeString: "07:30 PM",
          notes: "Fast acting amino acids within 30 mins of gym",
          items: [
            { id: "fi_11", name: "100% Whey Protein Isolate", portion: "1 Scoop in 250ml Water", calories: 130, proteinG: 27, carbsG: 2, fatsG: 1 },
            { id: "fi_12", name: "Electrolyte Coconut Water", portion: "200ml Fresh", calories: 45, proteinG: 1, carbsG: 10, fatsG: 0 }
          ]
        },
        {
          id: "meal_06",
          name: "Recovery Dinner",
          timeString: "09:00 PM",
          notes: "Low carb, nutrient rich, easy digestion",
          items: [
            { id: "fi_13", name: "Steamed Fish / Paneer Tikka", portion: "180g Portion", calories: 290, proteinG: 34, carbsG: 4, fatsG: 12 },
            { id: "fi_14", name: "Sautéed Broccoli, Zucchini & Bell Peppers", portion: "150g Sautéed", calories: 85, proteinG: 4, carbsG: 11, fatsG: 2 }
          ]
        }
      ]
    },
    {
      id: "dp_002",
      userId: "usr_client_02", // Ananya Patel
      title: "Vegetarian High-Protein Tone Diet",
      dailyCalories: 1950,
      targetProteinG: 130,
      targetCarbsG: 210,
      targetFatsG: 50,
      dailyWaterLiters: 3.0,
      dietaryType: "Vegetarian",
      lastUpdated: "2026-09-01",
      notes: "High fiber and plant proteins with cottage cheese and edamame.",
      meals: [
        {
          id: "meal_201",
          name: "Nutrient Dense Breakfast",
          timeString: "08:30 AM",
          items: [
            { id: "fi_201", name: "Paneer Scramble (Bhurji)", portion: "120g Low-fat Paneer", calories: 220, proteinG: 22, carbsG: 4, fatsG: 12 },
            { id: "fi_202", name: "Multigrain Toast", portion: "2 Slices", calories: 150, proteinG: 6, carbsG: 28, fatsG: 2 }
          ]
        },
        {
          id: "meal_202",
          name: "Balanced Lunch",
          timeString: "01:00 PM",
          items: [
            { id: "fi_203", name: "Soy Chunks / Tofu Curry", portion: "150g Curry", calories: 260, proteinG: 28, carbsG: 14, fatsG: 8 },
            { id: "fi_204", name: "Brown Rice & Lentil Dal", portion: "1 Cup Rice + 1 Cup Dal", calories: 280, proteinG: 12, carbsG: 52, fatsG: 3 }
          ]
        }
      ]
    }
  ],

  payments: [
    {
      id: "pay_1001",
      userId: "usr_client_01", // Rahul Sharma
      invoiceNumber: "INV-BE-2026-0842",
      amount: 2500,
      planDuration: "1 Month Pro",
      paymentDate: "2026-08-11",
      dueDate: "2026-09-11", // Due in 2 days
      paymentMethod: "UPI",
      transactionRef: "UPI/260811/984210",
      status: "DUE_SOON",
      notes: "August monthly fee paid via PhonePe. September renewal upcoming."
    },
    {
      id: "pay_1002",
      userId: "usr_client_02", // Ananya Patel
      invoiceNumber: "INV-BE-2025-0918",
      amount: 18000,
      planDuration: "12 Months Annual VIP",
      paymentDate: "2025-11-30",
      dueDate: "2026-11-30",
      paymentMethod: "Credit Card",
      transactionRef: "HDFC-CC-991823",
      status: "PAID",
      notes: "Full annual membership upfront payment."
    },
    {
      id: "pay_1003",
      userId: "usr_client_03", // Kavita Rao
      invoiceNumber: "INV-BE-2026-0731",
      amount: 2500,
      planDuration: "1 Month Standard",
      paymentDate: "2026-08-05",
      dueDate: "2026-09-05", // Overdue
      paymentMethod: "Cash",
      transactionRef: "CASH-REC-0731",
      status: "OVERDUE",
      notes: "Membership expired 4 days ago. Reminder WhatsApp sent."
    },
    {
      id: "pay_1004",
      userId: "usr_client_04", // Arjun Nair
      invoiceNumber: "INV-BE-2026-1024",
      amount: 6500,
      planDuration: "3 Months Pro",
      paymentDate: "2026-07-25",
      dueDate: "2026-10-25",
      paymentMethod: "UPI",
      transactionRef: "GPay/725102/4411",
      status: "PAID",
      notes: "Quarterly package with complimentary personal locker."
    },
    {
      id: "pay_1005",
      userId: "usr_client_05", // Sneha Reddy
      invoiceNumber: "INV-BE-2026-1105",
      amount: 2500,
      planDuration: "1 Month Pro",
      paymentDate: "2026-08-14",
      dueDate: "2026-09-14", // Due in 5 days
      paymentMethod: "NetBanking",
      transactionRef: "ICICI-NB-881923",
      status: "DUE_SOON",
      notes: "Automatic renewal reminder scheduled."
    }
  ],

  notifications: [
    {
      id: "notif_01",
      recipientId: "usr_client_01",
      type: "fee_due",
      title: "Membership Renewal Alert",
      message: "Your monthly membership expires in 2 days (Sep 11, 2026). Renew online or at the reception to continue seamless gym access.",
      timestamp: "2026-09-09T08:00:00Z",
      isRead: false
    },
    {
      id: "notif_02",
      recipientId: "usr_client_01",
      type: "workout_updated",
      title: "Workout Routine Optimized",
      message: "Coach Vikram adjusted your Monday Push Day sets and added Incline DB presses.",
      timestamp: "2026-09-08T17:30:00Z",
      isRead: true
    },
    {
      id: "notif_03",
      recipientId: "usr_client_03",
      type: "fee_overdue",
      title: "Urgent: Membership Fee Overdue",
      message: "Your gym fee was due on Sep 05, 2026 (4 days overdue). Please clear your dues today.",
      timestamp: "2026-09-06T10:00:00Z",
      isRead: false
    }
  ]
};
