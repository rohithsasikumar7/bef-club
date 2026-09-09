/**
 * Body Engineers Fit Club — Express REST API Server
 * Serves both the SQLite REST API and the static frontend files.
 * Run: node server/index.js  →  Open http://localhost:3001
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// ─────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve the entire frontend (index.html, css/, js/) as static files
app.use(express.static(path.join(__dirname, '..')));

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Recompute fee_status based on next_fee_due_date */
function computeFeeStatus(nextFeeDueDate, role) {
  if (role === 'ADMIN' || role === 'TRAINER') return 'PAID';
  const now = new Date();
  const dueDate = new Date(nextFeeDueDate);
  const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
  if (daysUntilDue < 0) return 'OVERDUE';
  if (daysUntilDue <= 7) return 'DUE_SOON';
  return 'PAID';
}

/** Enrich a raw user row: parse JSON if needed, recompute feeStatus */
function enrichUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    role: u.role,
    fullName: u.full_name,
    email: u.email,
    phone: u.phone,
    avatarUrl: u.avatar_url,
    memberCode: u.member_code,
    membershipTier: u.membership_tier,
    joinDate: u.join_date,
    nextFeeDueDate: u.next_fee_due_date,
    feeStatus: computeFeeStatus(u.next_fee_due_date, u.role),
    monthlyFee: u.monthly_fee,
    trainerId: u.trainer_id,
    currentWeightKg: u.current_weight_kg,
    targetWeightKg: u.target_weight_kg,
    heightCm: u.height_cm,
    fitnessGoal: u.fitness_goal,
    emergencyContact: u.emergency_contact,
    attendanceStreakDays: u.attendance_streak_days,
    waterGlassesToday: u.water_glasses_today,
    createdAt: u.created_at,
  };
}

/** Enrich a raw payment row */
function enrichPayment(p) {
  if (!p) return null;
  return {
    id: p.id,
    userId: p.user_id,
    invoiceNumber: p.invoice_number,
    amount: p.amount,
    planDuration: p.plan_duration,
    paymentDate: p.payment_date,
    dueDate: p.due_date,
    paymentMethod: p.payment_method,
    transactionRef: p.transaction_ref,
    status: p.status,
    notes: p.notes,
    createdAt: p.created_at,
  };
}

/** Enrich a workout plan row: parse days_json */
function enrichWorkout(w) {
  if (!w) return null;
  return {
    id: w.id,
    userId: w.user_id,
    title: w.title,
    splitType: w.split_type,
    lastUpdated: w.last_updated,
    days: typeof w.days_json === 'string' ? JSON.parse(w.days_json) : (w.days_json || []),
  };
}

/** Enrich a diet plan row: parse meals_json */
function enrichDiet(d) {
  if (!d) return null;
  return {
    id: d.id,
    userId: d.user_id,
    title: d.title,
    dailyCalories: d.daily_calories,
    targetProteinG: d.target_protein_g,
    targetCarbsG: d.target_carbs_g,
    targetFatsG: d.target_fats_g,
    dailyWaterLiters: d.daily_water_liters,
    dietaryType: d.dietary_type,
    lastUpdated: d.last_updated,
    notes: d.notes,
    meals: typeof d.meals_json === 'string' ? JSON.parse(d.meals_json) : (d.meals_json || []),
  };
}

/** Enrich a notification row */
function enrichNotif(n) {
  if (!n) return null;
  return {
    id: n.id,
    recipientId: n.recipient_id,
    type: n.type,
    title: n.title,
    message: n.message,
    timestamp: n.timestamp,
    isRead: !!n.is_read,
  };
}

// ─────────────────────────────────────────────
// ROUTES — GYM PROFILE
// ─────────────────────────────────────────────

app.get('/api/gym-profile', (req, res) => {
  const profile = db.prepare('SELECT * FROM gym_profile WHERE id = 1').get();
  if (!profile) return res.status(404).json({ error: 'Gym profile not found' });
  res.json({
    name: profile.name,
    tagline: profile.tagline,
    address: profile.address,
    phone: profile.phone,
    email: profile.email,
    upiId: profile.upi_id,
    currency: profile.currency,
    logoText: profile.logo_text,
    subText: profile.sub_text,
  });
});

app.put('/api/gym-profile', (req, res) => {
  const { name, tagline, address, phone, email, upiId, currency, logoText, subText } = req.body;
  db.prepare(`UPDATE gym_profile SET name=?, tagline=?, address=?, phone=?, email=?, upi_id=?, currency=?, logo_text=?, sub_text=? WHERE id=1`)
    .run(name, tagline, address, phone, email, upiId, currency, logoText, subText);
  res.json({ success: true });
});

// ─────────────────────────────────────────────
// ROUTES — USERS / MEMBERS
// ─────────────────────────────────────────────

app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT * FROM users ORDER BY role, full_name').all();
  res.json(users.map(enrichUser));
});

app.get('/api/users/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(enrichUser(user));
});

app.post('/api/users', (req, res) => {
  const b = req.body;
  const id = `usr_${Date.now()}`;
  db.prepare(`
    INSERT INTO users (id, role, full_name, email, phone, avatar_url, member_code, membership_tier,
      join_date, next_fee_due_date, fee_status, monthly_fee, trainer_id,
      current_weight_kg, target_weight_kg, height_cm, fitness_goal, emergency_contact,
      attendance_streak_days, water_glasses_today)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, b.role || 'CLIENT', b.fullName, b.email, b.phone,
    b.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.fullName)}&background=10b981&color=06090e&size=150`,
    b.memberCode, b.membershipTier, b.joinDate, b.nextFeeDueDate,
    computeFeeStatus(b.nextFeeDueDate, b.role || 'CLIENT'),
    b.monthlyFee || 2500, b.trainerId || null,
    b.currentWeightKg || null, b.targetWeightKg || null,
    b.heightCm || null, b.fitnessGoal || null, b.emergencyContact || null,
    1, 0
  );
  // Create an empty workout + diet plan for the new member
  const wpId = `wp_${Date.now()}`;
  db.prepare(`INSERT INTO workout_plans (id, user_id, title, split_type, days_json) VALUES (?, ?, ?, ?, ?)`)
    .run(wpId, id, '5-Day Hypertrophy Split', 'Push-Pull-Legs', '[]');
  const dpId = `dp_${Date.now()}`;
  db.prepare(`INSERT INTO diet_plans (id, user_id, title, daily_calories, target_protein_g, target_carbs_g, target_fats_g, meals_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(dpId, id, 'Balanced Nutrition Plan', 2000, 140, 200, 55, '[]');
  res.status(201).json(enrichUser(db.prepare('SELECT * FROM users WHERE id=?').get(id)));
});

app.put('/api/users/:id', (req, res) => {
  const b = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  db.prepare(`
    UPDATE users SET
      full_name=?, phone=?, monthly_fee=?, next_fee_due_date=?,
      fee_status=?, current_weight_kg=?, target_weight_kg=?,
      height_cm=?, fitness_goal=?, membership_tier=?, avatar_url=?,
      attendance_streak_days=?, water_glasses_today=?
    WHERE id=?
  `).run(
    b.fullName ?? user.full_name,
    b.phone ?? user.phone,
    b.monthlyFee ?? user.monthly_fee,
    b.nextFeeDueDate ?? user.next_fee_due_date,
    computeFeeStatus(b.nextFeeDueDate ?? user.next_fee_due_date, user.role),
    b.currentWeightKg ?? user.current_weight_kg,
    b.targetWeightKg ?? user.target_weight_kg,
    b.heightCm ?? user.height_cm,
    b.fitnessGoal ?? user.fitness_goal,
    b.membershipTier ?? user.membership_tier,
    b.avatarUrl ?? user.avatar_url,
    b.attendanceStreakDays ?? user.attendance_streak_days,
    b.waterGlassesToday ?? user.water_glasses_today,
    req.params.id
  );
  res.json(enrichUser(db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id)));
});

app.delete('/api/users/:id', (req, res) => {
  const result = db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true });
});

// ─────────────────────────────────────────────
// ROUTES — PAYMENTS
// ─────────────────────────────────────────────

app.get('/api/payments', (req, res) => {
  const { userId } = req.query;
  const rows = userId
    ? db.prepare('SELECT * FROM payments WHERE user_id=? ORDER BY payment_date DESC').all(userId)
    : db.prepare('SELECT * FROM payments ORDER BY payment_date DESC').all();
  res.json(rows.map(enrichPayment));
});

app.get('/api/payments/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM payments WHERE id=?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Payment not found' });
  res.json(enrichPayment(p));
});

app.post('/api/payments', (req, res) => {
  const b = req.body;
  const id = `pay_${Date.now()}`;
  db.prepare(`
    INSERT INTO payments (id, user_id, invoice_number, amount, plan_duration, payment_date, due_date, payment_method, transaction_ref, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, b.userId, b.invoiceNumber, b.amount, b.planDuration, b.paymentDate, b.dueDate, b.paymentMethod, b.transactionRef || null, b.status || 'PAID', b.notes || null);

  // Update user's due date and fee status after payment
  if (b.dueDate) {
    db.prepare('UPDATE users SET next_fee_due_date=?, fee_status=? WHERE id=?')
      .run(b.dueDate, computeFeeStatus(b.dueDate, 'CLIENT'), b.userId);
  }

  res.status(201).json(enrichPayment(db.prepare('SELECT * FROM payments WHERE id=?').get(id)));
});

// ─────────────────────────────────────────────
// ROUTES — WORKOUT PLANS
// ─────────────────────────────────────────────

app.get('/api/workout-plans', (req, res) => {
  const { userId } = req.query;
  const rows = userId
    ? db.prepare('SELECT * FROM workout_plans WHERE user_id=?').all(userId)
    : db.prepare('SELECT * FROM workout_plans').all();
  res.json(rows.map(enrichWorkout));
});

app.get('/api/workout-plans/:id', (req, res) => {
  const w = db.prepare('SELECT * FROM workout_plans WHERE id=?').get(req.params.id);
  if (!w) return res.status(404).json({ error: 'Workout plan not found' });
  res.json(enrichWorkout(w));
});

app.post('/api/workout-plans', (req, res) => {
  const b = req.body;
  const id = `wp_${Date.now()}`;
  db.prepare('INSERT INTO workout_plans (id, user_id, title, split_type, days_json) VALUES (?, ?, ?, ?, ?)')
    .run(id, b.userId, b.title, b.splitType || 'Push-Pull-Legs', JSON.stringify(b.days || []));
  res.status(201).json(enrichWorkout(db.prepare('SELECT * FROM workout_plans WHERE id=?').get(id)));
});

app.put('/api/workout-plans/:id', (req, res) => {
  const b = req.body;
  const existing = db.prepare('SELECT * FROM workout_plans WHERE id=?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Workout plan not found' });
  db.prepare('UPDATE workout_plans SET title=?, split_type=?, days_json=?, last_updated=date("now") WHERE id=?')
    .run(b.title ?? existing.title, b.splitType ?? existing.split_type, JSON.stringify(b.days ?? JSON.parse(existing.days_json)), req.params.id);
  res.json(enrichWorkout(db.prepare('SELECT * FROM workout_plans WHERE id=?').get(req.params.id)));
});

// ─────────────────────────────────────────────
// ROUTES — DIET PLANS
// ─────────────────────────────────────────────

app.get('/api/diet-plans', (req, res) => {
  const { userId } = req.query;
  const rows = userId
    ? db.prepare('SELECT * FROM diet_plans WHERE user_id=?').all(userId)
    : db.prepare('SELECT * FROM diet_plans').all();
  res.json(rows.map(enrichDiet));
});

app.get('/api/diet-plans/:id', (req, res) => {
  const d = db.prepare('SELECT * FROM diet_plans WHERE id=?').get(req.params.id);
  if (!d) return res.status(404).json({ error: 'Diet plan not found' });
  res.json(enrichDiet(d));
});

app.post('/api/diet-plans', (req, res) => {
  const b = req.body;
  const id = `dp_${Date.now()}`;
  db.prepare('INSERT INTO diet_plans (id, user_id, title, daily_calories, target_protein_g, target_carbs_g, target_fats_g, daily_water_liters, dietary_type, notes, meals_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, b.userId, b.title, b.dailyCalories || 2000, b.targetProteinG || 140, b.targetCarbsG || 200, b.targetFatsG || 55, b.dailyWaterLiters || 3.5, b.dietaryType || 'Non-Vegetarian', b.notes || null, JSON.stringify(b.meals || []));
  res.status(201).json(enrichDiet(db.prepare('SELECT * FROM diet_plans WHERE id=?').get(id)));
});

app.put('/api/diet-plans/:id', (req, res) => {
  const b = req.body;
  const existing = db.prepare('SELECT * FROM diet_plans WHERE id=?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Diet plan not found' });
  db.prepare(`UPDATE diet_plans SET title=?, daily_calories=?, target_protein_g=?, target_carbs_g=?, target_fats_g=?, daily_water_liters=?, dietary_type=?, notes=?, meals_json=?, last_updated=date("now") WHERE id=?`)
    .run(
      b.title ?? existing.title,
      b.dailyCalories ?? existing.daily_calories,
      b.targetProteinG ?? existing.target_protein_g,
      b.targetCarbsG ?? existing.target_carbs_g,
      b.targetFatsG ?? existing.target_fats_g,
      b.dailyWaterLiters ?? existing.daily_water_liters,
      b.dietaryType ?? existing.dietary_type,
      b.notes ?? existing.notes,
      JSON.stringify(b.meals ?? JSON.parse(existing.meals_json)),
      req.params.id
    );
  res.json(enrichDiet(db.prepare('SELECT * FROM diet_plans WHERE id=?').get(req.params.id)));
});

// ─────────────────────────────────────────────
// ROUTES — NOTIFICATIONS
// ─────────────────────────────────────────────

app.get('/api/notifications', (req, res) => {
  const { recipientId } = req.query;
  const rows = recipientId
    ? db.prepare('SELECT * FROM notifications WHERE recipient_id=? OR recipient_id IS NULL ORDER BY timestamp DESC').all(recipientId)
    : db.prepare('SELECT * FROM notifications ORDER BY timestamp DESC').all();
  res.json(rows.map(enrichNotif));
});

app.post('/api/notifications', (req, res) => {
  const b = req.body;
  const id = `notif_${Date.now()}`;
  db.prepare('INSERT INTO notifications (id, recipient_id, type, title, message, is_read) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, b.recipientId || null, b.type, b.title, b.message, 0);
  res.status(201).json(enrichNotif(db.prepare('SELECT * FROM notifications WHERE id=?').get(id)));
});

app.put('/api/notifications/:id/read', (req, res) => {
  db.prepare('UPDATE notifications SET is_read=1 WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

app.put('/api/notifications/mark-all-read', (req, res) => {
  const { recipientId } = req.body;
  if (recipientId) {
    db.prepare('UPDATE notifications SET is_read=1 WHERE recipient_id=?').run(recipientId);
  } else {
    db.prepare('UPDATE notifications SET is_read=1').run();
  }
  res.json({ success: true });
});

// ─────────────────────────────────────────────
// ROUTES — UTILITY
// ─────────────────────────────────────────────

/** Health check */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), db: 'gym.db' });
});

/** Catch-all: serve index.html for any non-API route (SPA fallback) */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏋️  Body Engineers Fit Club API is running!`);
  console.log(`   Frontend → http://localhost:${PORT}`);
  console.log(`   API Base → http://localhost:${PORT}/api`);
  console.log(`   Database → ${path.join(__dirname, 'gym.db')}\n`);
});
