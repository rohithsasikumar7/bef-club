# 🏋️ Body Engineers Fit Club
### Smart Gym Management System & Client Portal

A full-stack gym management web application with a **SQLite backend**, **REST API**, and a premium dark-mode UI. Manage members, workouts, diet plans, payments, and notifications — all persisted to a real database.

---

## ✨ Features

### Admin Portal
- 📊 **Dashboard** — Revenue metrics, member stats, overdue fee alerts
- 👥 **Member CRM** — Add, edit, delete members with full profile management
- 💳 **Payments** — Log fee collections, generate tax invoices/receipts, WhatsApp sharing
- 🏋️ **Workout Builder** — Assign & customize workout splits per member (Push/Pull/Legs, etc.)
- 🥗 **Diet Planner** — Set macronutrient targets (calories, protein, carbs, fats) per member
- 🔔 **Notifications** — Auto-alerts for fee reminders, workout updates, payment receipts
- 🗄️ **Schema Viewer** — View live SQL DDL and export JSON database backup

### Client Portal
- 📱 **Mobile-first UI** with device simulator frame
- 🏃 **Today's Workout** — Exercise checklist with rest timer, video guide links
- 🥦 **Diet Chart** — Daily meal schedule with macros and hydration tracker
- 💰 **Fee & Invoices** — View payment history, renew membership, download receipts
- 👤 **Profile** — Personal stats, fitness goals, streak tracking

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML, CSS, JavaScript (ES Modules) |
| Styling | Tailwind CSS (CDN) + Custom CSS |
| Icons | Lucide Icons |
| Backend | Node.js + Express.js |
| Database | SQLite via `better-sqlite3` |
| API | REST (JSON) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ — Download from [nodejs.org](https://nodejs.org)

### 1. Install Backend Dependencies
```bash
cd server
npm install
```

### 2. Start the Server
```bash
node index.js
```

### 3. Open the App
Visit **[http://localhost:3001](http://localhost:3001)** in your browser.

> The SQLite database (`server/gym.db`) is automatically created and seeded with demo data on first run.

---

## 📁 Project Structure

```
ai immersion video/
│
├── index.html                  # App shell / entry point
│
├── css/
│   └── styles.css              # Custom styles & animations
│
├── js/
│   ├── app.js                  # Main AppController (routing, events, modals)
│   ├── components/
│   │   ├── AdminPortal.js      # Admin dashboard UI components
│   │   ├── ClientPortal.js     # Client-facing UI components
│   │   ├── Header.js           # Top nav, role switcher, notifications
│   │   ├── FeeAlertBanner.js   # Urgent overdue fee alerts
│   │   └── MobileBottomNav.js  # Mobile tab navigation
│   ├── store/
│   │   └── gymStore.js         # Reactive state store (API-backed)
│   ├── data/
│   │   ├── seedData.js         # Initial demo data
│   │   └── schema.js           # Database schema definition
│   └── utils/
│       ├── api.js              # REST API client (fetch wrapper)
│       ├── whatsapp.js         # WhatsApp message URL generator
│       └── soundEffects.js     # UI audio feedback
│
└── server/
    ├── index.js                # Express REST API server
    ├── db.js                   # SQLite initialization & seeding
    ├── gym.db                  # 📂 SQLite database file
    └── package.json            # Backend dependencies
```

---

## 🌐 API Reference

Base URL: `http://localhost:3001/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/gym-profile` | Get gym settings |
| `PUT` | `/gym-profile` | Update gym settings |
| `GET` | `/users` | List all users |
| `POST` | `/users` | Add new member |
| `GET` | `/users/:id` | Get single user |
| `PUT` | `/users/:id` | Update user profile |
| `DELETE` | `/users/:id` | Delete user |
| `GET` | `/payments` | List all payments |
| `GET` | `/payments?userId=` | Payments for a member |
| `POST` | `/payments` | Log a payment |
| `GET` | `/workout-plans?userId=` | Get member's workout plan |
| `PUT` | `/workout-plans/:id` | Update workout plan |
| `GET` | `/diet-plans?userId=` | Get member's diet plan |
| `PUT` | `/diet-plans/:id` | Update diet plan |
| `GET` | `/notifications?recipientId=` | Get notifications |
| `POST` | `/notifications` | Create notification |
| `PUT` | `/notifications/mark-all-read` | Mark all as read |

---

## 🗄️ Database

The SQLite database (`server/gym.db`) contains 6 tables:

| Table | Description |
|-------|-------------|
| `users` | Members, trainers, admin accounts |
| `payments` | Fee payment transactions |
| `workout_plans` | Member workout splits (days/exercises as JSON) |
| `diet_plans` | Nutrition plans & meal schedules (as JSON) |
| `notifications` | System alerts and messages |
| `gym_profile` | Gym name, contact, UPI details |

### View in VS Code
1. Install the **SQLite Viewer** extension (`Cmd+Shift+X` → search "SQLite Viewer")
2. Open `server/gym.db` from the Explorer — tables appear instantly!

---

## 👥 Demo Personas

Switch between roles using the **Role Switcher** in the top header:

| Name | Role | Fee Status |
|------|------|-----------|
| Coach Vikram Rathore | Admin | — |
| Rahul Sharma | Client | DUE_SOON |
| Ananya Patel | Client | PAID |
| Kavita Rao | Client | OVERDUE |
| Arjun Nair | Client | PAID |
| Sneha Reddy | Client | DUE_SOON |

---

## 📄 License

MIT — Free to use for educational and demo purposes.
