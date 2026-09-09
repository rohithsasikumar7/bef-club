/**
 * Lightweight API client for Body Engineers Fit Club
 * All calls go to the local Express server at http://localhost:3001
 */

const BASE_URL = 'http://localhost:3001/api';

async function request(method, path, body) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(`${BASE_URL}${path}`, options);
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(err.error || `API error ${response.status}`);
  }
  return response.json();
}

export const api = {
  get:    (path)         => request('GET',    path),
  post:   (path, body)   => request('POST',   path, body),
  put:    (path, body)   => request('PUT',    path, body),
  delete: (path)         => request('DELETE', path),

  // ── Gym Profile ───────────────────────────────────────────────
  getGymProfile:    ()       => api.get('/gym-profile'),
  updateGymProfile: (data)   => api.put('/gym-profile', data),

  // ── Users / Members ───────────────────────────────────────────
  getUsers:         ()       => api.get('/users'),
  getUser:          (id)     => api.get(`/users/${id}`),
  createUser:       (data)   => api.post('/users', data),
  updateUser:       (id, d)  => api.put(`/users/${id}`, d),
  deleteUser:       (id)     => api.delete(`/users/${id}`),

  // ── Payments ──────────────────────────────────────────────────
  getPayments:      (userId) => api.get(userId ? `/payments?userId=${userId}` : '/payments'),
  getPayment:       (id)     => api.get(`/payments/${id}`),
  createPayment:    (data)   => api.post('/payments', data),

  // ── Workout Plans ─────────────────────────────────────────────
  getWorkoutPlans:  (userId) => api.get(userId ? `/workout-plans?userId=${userId}` : '/workout-plans'),
  getWorkoutPlan:   (id)     => api.get(`/workout-plans/${id}`),
  createWorkoutPlan: (data)  => api.post('/workout-plans', data),
  updateWorkoutPlan: (id, d) => api.put(`/workout-plans/${id}`, d),

  // ── Diet Plans ────────────────────────────────────────────────
  getDietPlans:     (userId) => api.get(userId ? `/diet-plans?userId=${userId}` : '/diet-plans'),
  getDietPlan:      (id)     => api.get(`/diet-plans/${id}`),
  createDietPlan:   (data)   => api.post('/diet-plans', data),
  updateDietPlan:   (id, d)  => api.put(`/diet-plans/${id}`, d),

  // ── Notifications ─────────────────────────────────────────────
  getNotifications: (userId) => api.get(userId ? `/notifications?recipientId=${userId}` : '/notifications'),
  createNotification: (data) => api.post('/notifications', data),
  markNotifRead:    (id)     => api.put(`/notifications/${id}/read`, {}),
  markAllNotifsRead: (userId)=> api.put('/notifications/mark-all-read', { recipientId: userId }),

  // ── Health ────────────────────────────────────────────────────
  health: () => api.get('/health'),
};
