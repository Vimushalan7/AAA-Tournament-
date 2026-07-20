# 🎮 Free Fire Tournament Platform

A complete, production-ready esports tournament management system with two separate Next.js applications and a Node.js/Express backend.

---

## 📁 Project Structure

```
FF Tournament 2/
├── backend/          → Node.js + Express API (Port 5000)
├── user-app/         → User Next.js App (Port 3000)
└── admin-app/        → Admin Next.js App (Port 3001)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)

### Step 1: Start Backend

```bash
cd backend
npm install
npm run dev
```

The backend starts on **http://localhost:5000**

> ✅ On first start, a default admin account is automatically seeded:
> - **Mobile:** `9999999999`
> - **Password:** `adminpassword`

---

### Step 2: Start User App

```bash
cd user-app
npm install
npm run dev
```

User app runs on **http://localhost:3000**

---

### Step 3: Start Admin App

```bash
cd admin-app
npm install
npm run dev
```

Admin panel runs on **http://localhost:3001**

---

## 🔑 Default Admin Credentials

| Field    | Value           |
|----------|-----------------|
| Mobile   | `9999999999`    |
| Password | `adminpassword` |
| Portal   | http://localhost:3001/login |

---

## 📱 User Application Features

| Feature | Description |
|---------|-------------|
| **Auth** | Mobile OTP login + Email/Password login |
| **OTP Simulation** | OTP code displayed on screen for testing (no SMS gateway needed) |
| **Profile** | Avatar selector, name, Free Fire UID, email |
| **Wallet** | View balance, deposit via Razorpay (simulated), request UPI withdrawals |
| **Razorpay** | Simulated checkout modal with UPI/Card/NetBanking tabs |
| **Tournaments** | Browse upcoming/live/completed matches, join with wallet balance |
| **Lobby Credentials** | Room ID & Password visible after admin broadcasts |
| **Results** | Upload proof screenshot (mock Cloudinary), submit kills & rank |
| **Notifications** | Real-time inbox for room updates, winnings, withdrawals |

---

## 🛡️ Admin Panel Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Revenue, players, active matches, pending payouts, today's stats |
| **Tournaments** | Create, cancel (auto-refund), delete matches with prize distributions |
| **Room Manager** | Set Room ID/Password, broadcast credentials to all participants |
| **User Directory** | Search, inspect match history, transactions, issue bans |
| **Ban System** | Temporary (N days) or Permanent bans with multi-vector locking |
| **Payout Auditor** | Approve/reject withdrawals with automatic wallet refunds on rejection |
| **Results Auditor** | Review screenshot proofs, verify kills/rank, auto-credit wallets |
| **Broadcast Desk** | Send global alerts, tournament-specific notices, maintenance warnings |
| **Audit Logs** | Complete trail of all admin actions with timestamps and IP addresses |

---

## 🏆 Prize Distribution System

Prizes are automatically calculated per tournament's rules:
- **Per Kill reward** × verified kills
- **Rank 1 Placement Prize**
- **Rank 2 Placement Prize**
- **Rank 3 Placement Prize**

Admin verifies kill count and rank → wallet is instantly credited.

---

## 🔒 Anti-Cheat System

Multi-vector ban enforcement that blocks:
- **Mobile Number** — prevents re-registration
- **Free Fire UID** — prevents using same in-game account
- **Device ID** — prevents new accounts from same device
- **Auto temp-ban expiry** — bans lift automatically after duration

---

## 💳 Payment Flow

```
User clicks Deposit → Backend creates Razorpay order → 
Simulated modal appears → User clicks Simulate Success → 
Backend verifies → Wallet credited + Transaction logged
```

---

## 🗄️ Database Collections

| Collection | Purpose |
|-----------|---------|
| `users` | Player profiles, wallet balance, status |
| `tournaments` | Match details, slots, prize pools |
| `tournamentparticipants` | Registration records with kills/rank/prizes |
| `rooms` | Custom lobby credentials |
| `matchresults` | Proof submissions (screenshot/video) |
| `transactions` | All wallet operations (deposit/withdrawal/entry/winning) |
| `withdrawals` | Payout requests and status |
| `notifications` | User inbox messages |
| `adminlogs` | Audit trail for all admin actions |
| `bannedusers` | Multi-vector ban records |

---

## 🌐 API Endpoints

### Auth Routes (`/api/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Email/mobile password login |
| POST | `/otp-send` | Request OTP (simulated) |
| POST | `/otp-verify` | Verify OTP and login |

### User Routes (`/api/users`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/profile` | Get own profile |
| PUT | `/profile` | Update profile |
| GET | `/transactions` | Transaction history |
| GET | `/notifications` | Notification inbox |
| GET | `/matches` | Match history |
| GET | `/results` | Submitted proof list |
| POST | `/results` | Submit match proof |

### Tournament Routes (`/api/tournaments`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all tournaments |
| GET | `/:id` | Tournament details + participants |
| POST | `/:id/join` | Join tournament (deducts fee) |

### Payment Routes (`/api/payments`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/razorpay-order` | Create deposit order |
| POST | `/verify` | Verify payment (simulate success/fail) |
| POST | `/withdraw` | Submit withdrawal request |

### Admin Routes (`/api/admin`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/stats` | Dashboard metrics |
| POST | `/tournaments` | Create tournament |
| PUT | `/tournaments/:id` | Edit tournament |
| POST | `/tournaments/:id/cancel` | Cancel + auto-refund |
| DELETE | `/tournaments/:id` | Delete tournament |
| POST | `/rooms` | Set room credentials |
| POST | `/rooms/:id/send` | Broadcast to players |
| GET | `/users` | List users |
| GET | `/users/:id` | User details + history |
| POST | `/users/:id/ban` | Ban user |
| POST | `/users/:id/unban` | Lift ban |
| GET | `/withdrawals` | Payout requests |
| POST | `/withdrawals/:id/process` | Approve/reject payout |
| GET | `/results` | Match proof list |
| POST | `/results/:id/verify` | Verify proof + credit wallet |
| POST | `/notifications` | Broadcast notification |
| GET | `/logs` | Admin audit logs |

---

## 🎨 Design System

- **Base Color:** `#080710` (Deep Space Black)
- **Panel Color:** `#121124` (Dark Indigo Panel)
- **Neon Blue:** `#00f0ff` (Accent/Active States)
- **Neon Purple:** `#bd00ff` (Highlights/Admin)
- **Neon Pink:** `#ff007f` (Danger/Bans)
- **Font:** Inter (Google Fonts)

---

## ⚙️ Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ff_tournament
JWT_SECRET=esports_ff_tournament_secret_key_2026
NODE_ENV=development
```
