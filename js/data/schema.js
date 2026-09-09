/**
 * Relational Database Schema Definition for "Body Engineers Fit Club"
 * 
 * Defines the tables, primary keys, foreign keys, constraints, and SQL DDL
 * linking Users, Workouts, Diets, and Payments seamlessly.
 */

export const DATABASE_SCHEMA = {
  name: "body_engineers_fit_club_db",
  version: "2.1.0",
  description: "Relational database schema managing gym members, workouts, diets, billing, and attendance.",
  
  tables: [
    {
      name: "users",
      description: "Master user records for gym owners, trainers, and club members",
      columns: [
        { name: "id", type: "VARCHAR(36)", primaryKey: true, nullable: false, description: "UUID Primary Key" },
        { name: "role", type: "ENUM('ADMIN', 'TRAINER', 'CLIENT')", nullable: false, defaultValue: "'CLIENT'" },
        { name: "full_name", type: "VARCHAR(120)", nullable: false },
        { name: "email", type: "VARCHAR(150)", nullable: false, unique: true },
        { name: "phone", type: "VARCHAR(20)", nullable: false },
        { name: "avatar_url", type: "TEXT", nullable: true },
        { name: "member_code", type: "VARCHAR(30)", nullable: false, unique: true, description: "Formatted gym membership ID e.g. BE-2026-0842" },
        { name: "membership_tier", type: "VARCHAR(50)", nullable: false, description: "Monthly, Quarterly, Half-Yearly, Annual VIP" },
        { name: "join_date", type: "DATE", nullable: false },
        { name: "next_fee_due_date", type: "DATE", nullable: false },
        { name: "fee_status", type: "ENUM('PAID', 'DUE_SOON', 'OVERDUE')", nullable: false, defaultValue: "'PAID'" },
        { name: "monthly_fee", type: "DECIMAL(10,2)", nullable: false },
        { name: "trainer_id", type: "VARCHAR(36)", foreignKey: { table: "users", column: "id" }, nullable: true },
        { name: "current_weight_kg", type: "DECIMAL(5,2)", nullable: true },
        { name: "target_weight_kg", type: "DECIMAL(5,2)", nullable: true },
        { name: "height_cm", type: "INT", nullable: true },
        { name: "fitness_goal", type: "VARCHAR(100)", nullable: true },
        { name: "emergency_contact", type: "VARCHAR(50)", nullable: true },
        { name: "created_at", type: "TIMESTAMP", defaultValue: "CURRENT_TIMESTAMP" }
      ]
    },
    {
      name: "payments",
      description: "Transaction records for membership fee payments and renewals",
      columns: [
        { name: "id", type: "VARCHAR(36)", primaryKey: true, nullable: false },
        { name: "user_id", type: "VARCHAR(36)", foreignKey: { table: "users", column: "id", onDelete: "CASCADE" }, nullable: false },
        { name: "invoice_number", type: "VARCHAR(50)", nullable: false, unique: true },
        { name: "amount", type: "DECIMAL(10,2)", nullable: false },
        { name: "plan_duration", type: "VARCHAR(50)", nullable: false, description: "1 Month, 3 Months, 6 Months, 12 Months" },
        { name: "payment_date", type: "DATE", nullable: false },
        { name: "due_date", type: "DATE", nullable: false },
        { name: "payment_method", type: "ENUM('UPI', 'Cash', 'Credit Card', 'Debit Card', 'NetBanking')", nullable: false },
        { name: "transaction_ref", type: "VARCHAR(100)", nullable: true },
        { name: "status", type: "ENUM('PAID', 'PENDING', 'OVERDUE')", nullable: false, defaultValue: "'PAID'" },
        { name: "notes", type: "TEXT", nullable: true },
        { name: "created_at", type: "TIMESTAMP", defaultValue: "CURRENT_TIMESTAMP" }
      ]
    },
    {
      name: "workout_plans",
      description: "Assigned workout splits and routines for members",
      columns: [
        { name: "id", type: "VARCHAR(36)", primaryKey: true, nullable: false },
        { name: "user_id", type: "VARCHAR(36)", foreignKey: { table: "users", column: "id", onDelete: "CASCADE" }, nullable: false },
        { name: "title", type: "VARCHAR(150)", nullable: false, description: "e.g. 5-Day Hypertrophy & Fat Loss Split" },
        { name: "split_type", type: "VARCHAR(50)", nullable: false, description: "Push-Pull-Legs, Upper-Lower, Full Body" },
        { name: "assigned_by", type: "VARCHAR(36)", foreignKey: { table: "users", column: "id" }, nullable: true },
        { name: "updated_at", type: "TIMESTAMP", defaultValue: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" }
      ]
    },
    {
      name: "workout_days",
      description: "Individual days within a member's workout split",
      columns: [
        { name: "id", type: "VARCHAR(36)", primaryKey: true, nullable: false },
        { name: "workout_plan_id", type: "VARCHAR(36)", foreignKey: { table: "workout_plans", column: "id", onDelete: "CASCADE" }, nullable: false },
        { name: "day_name", type: "VARCHAR(50)", nullable: false, description: "Monday, Tuesday, etc." },
        { name: "routine_title", type: "VARCHAR(100)", nullable: false, description: "Push Day (Chest, Shoulders, Triceps)" },
        { name: "estimated_minutes", type: "INT", defaultValue: "60" },
        { name: "muscle_groups", type: "VARCHAR(150)", nullable: false }
      ]
    },
    {
      name: "exercises",
      description: "Specific exercises assigned to each workout day",
      columns: [
        { name: "id", type: "VARCHAR(36)", primaryKey: true, nullable: false },
        { name: "workout_day_id", type: "VARCHAR(36)", foreignKey: { table: "workout_days", column: "id", onDelete: "CASCADE" }, nullable: false },
        { name: "name", type: "VARCHAR(150)", nullable: false },
        { name: "muscle_group", type: "VARCHAR(50)", nullable: false },
        { name: "target_sets", type: "INT", nullable: false, defaultValue: "3" },
        { name: "target_reps", type: "VARCHAR(30)", nullable: false, defaultValue: "'8-12'" },
        { name: "target_weight_kg", type: "DECIMAL(5,2)", nullable: true },
        { name: "rest_seconds", type: "INT", defaultValue: "60" },
        { name: "notes", type: "TEXT", nullable: true },
        { name: "video_guide_url", type: "TEXT", nullable: true },
        { name: "order_index", type: "INT", defaultValue: "1" }
      ]
    },
    {
      name: "diet_plans",
      description: "Personalized nutrition targets and meal plans",
      columns: [
        { name: "id", type: "VARCHAR(36)", primaryKey: true, nullable: false },
        { name: "user_id", type: "VARCHAR(36)", foreignKey: { table: "users", column: "id", onDelete: "CASCADE" }, nullable: false },
        { name: "title", type: "VARCHAR(150)", nullable: false, description: "e.g. High Protein Lean Mass Diet" },
        { name: "daily_calories", type: "INT", nullable: false },
        { name: "target_protein_g", type: "INT", nullable: false },
        { name: "target_carbs_g", type: "INT", nullable: false },
        { name: "target_fats_g", type: "INT", nullable: false },
        { name: "daily_water_liters", type: "DECIMAL(3,1)", defaultValue: "3.5" },
        { name: "dietary_type", type: "VARCHAR(50)", defaultValue: "'Non-Vegetarian'" },
        { name: "assigned_by", type: "VARCHAR(36)", foreignKey: { table: "users", column: "id" }, nullable: true },
        { name: "updated_at", type: "TIMESTAMP", defaultValue: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" }
      ]
    },
    {
      name: "meal_slots",
      description: "Scheduled daily meal times within a diet plan",
      columns: [
        { name: "id", type: "VARCHAR(36)", primaryKey: true, nullable: false },
        { name: "diet_plan_id", type: "VARCHAR(36)", foreignKey: { table: "diet_plans", column: "id", onDelete: "CASCADE" }, nullable: false },
        { name: "slot_name", type: "VARCHAR(80)", nullable: false, description: "Breakfast, Mid-Morning, Lunch, Pre-Workout, Dinner" },
        { name: "time_string", type: "VARCHAR(20)", nullable: false, description: "08:00 AM" },
        { name: "notes", type: "TEXT", nullable: true },
        { name: "order_index", type: "INT", defaultValue: "1" }
      ]
    },
    {
      name: "meal_items",
      description: "Food items and macros within each meal slot",
      columns: [
        { name: "id", type: "VARCHAR(36)", primaryKey: true, nullable: false },
        { name: "meal_slot_id", type: "VARCHAR(36)", foreignKey: { table: "meal_slots", column: "id", onDelete: "CASCADE" }, nullable: false },
        { name: "food_name", type: "VARCHAR(150)", nullable: false },
        { name: "portion", type: "VARCHAR(80)", nullable: false, description: "e.g. 4 Whole Eggs + 2 Toast" },
        { name: "calories", type: "INT", nullable: false },
        { name: "protein_g", type: "DECIMAL(5,1)", nullable: false },
        { name: "carbs_g", type: "DECIMAL(5,1)", nullable: true },
        { name: "fats_g", type: "DECIMAL(5,1)", nullable: true }
      ]
    }
  ],

  // SQL DDL Generator for Postgres / MySQL
  getSQLDDL() {
    return `-- ==========================================================
-- BODY ENGINEERS FIT CLUB - PRODUCTION DATABASE DDL
-- Generated: 2026-09-09
-- ==========================================================

-- 1. USERS & MEMBERS
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'TRAINER', 'CLIENT')),
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    avatar_url TEXT,
    member_code VARCHAR(30) UNIQUE NOT NULL,
    membership_tier VARCHAR(50) NOT NULL,
    join_date DATE NOT NULL,
    next_fee_due_date DATE NOT NULL,
    fee_status VARCHAR(20) NOT NULL CHECK (fee_status IN ('PAID', 'DUE_SOON', 'OVERDUE')),
    monthly_fee DECIMAL(10,2) NOT NULL DEFAULT 2500.00,
    trainer_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    current_weight_kg DECIMAL(5,2),
    target_weight_kg DECIMAL(5,2),
    height_cm INT,
    fitness_goal VARCHAR(100),
    emergency_contact VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. PAYMENTS & BILLING LEDGER
CREATE TABLE payments (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    plan_duration VARCHAR(50) NOT NULL,
    payment_date DATE NOT NULL,
    due_date DATE NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    transaction_ref VARCHAR(100),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PAID', 'PENDING', 'OVERDUE')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. WORKOUT PLANS & ROUTINES
CREATE TABLE workout_plans (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    split_type VARCHAR(50) NOT NULL,
    assigned_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workout_days (
    id VARCHAR(36) PRIMARY KEY,
    workout_plan_id VARCHAR(36) NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    day_name VARCHAR(50) NOT NULL,
    routine_title VARCHAR(100) NOT NULL,
    estimated_minutes INT DEFAULT 60,
    muscle_groups VARCHAR(150) NOT NULL
);

CREATE TABLE exercises (
    id VARCHAR(36) PRIMARY KEY,
    workout_day_id VARCHAR(36) NOT NULL REFERENCES workout_days(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    muscle_group VARCHAR(50) NOT NULL,
    target_sets INT NOT NULL DEFAULT 3,
    target_reps VARCHAR(30) NOT NULL DEFAULT '8-12',
    target_weight_kg DECIMAL(5,2),
    rest_seconds INT DEFAULT 60,
    notes TEXT,
    video_guide_url TEXT,
    order_index INT DEFAULT 1
);

-- 4. DIET PLANS & NUTRITION
CREATE TABLE diet_plans (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    daily_calories INT NOT NULL,
    target_protein_g INT NOT NULL,
    target_carbs_g INT NOT NULL,
    target_fats_g INT NOT NULL,
    daily_water_liters DECIMAL(3,1) DEFAULT 3.5,
    dietary_type VARCHAR(50) DEFAULT 'Non-Vegetarian',
    assigned_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE meal_slots (
    id VARCHAR(36) PRIMARY KEY,
    diet_plan_id VARCHAR(36) NOT NULL REFERENCES diet_plans(id) ON DELETE CASCADE,
    slot_name VARCHAR(80) NOT NULL,
    time_string VARCHAR(20) NOT NULL,
    notes TEXT,
    order_index INT DEFAULT 1
);

CREATE TABLE meal_items (
    id VARCHAR(36) PRIMARY KEY,
    meal_slot_id VARCHAR(36) NOT NULL REFERENCES meal_slots(id) ON DELETE CASCADE,
    food_name VARCHAR(150) NOT NULL,
    portion VARCHAR(80) NOT NULL,
    calories INT NOT NULL,
    protein_g DECIMAL(5,1) NOT NULL,
    carbs_g DECIMAL(5,1),
    fats_g DECIMAL(5,1)
);

-- 5. INDEXES FOR HIGH PERFORMANCE QUERYING
CREATE INDEX idx_users_fee_status ON users(fee_status, next_fee_due_date);
CREATE INDEX idx_payments_user_date ON payments(user_id, payment_date);
CREATE INDEX idx_workout_user ON workout_plans(user_id);
CREATE INDEX idx_diet_user ON diet_plans(user_id);
`;
  }
};
