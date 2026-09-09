# Student Budget and Expense Tracker 🎓🇿🇦

A full-stack web application designed for university students to manage their monthly allowances (e.g., NSFAS, bursaries, parental allowances), track daily expenditures, calculate safe daily burn rates, and prevent end-of-month financial shortfalls.

Built in accordance with the **TUT Computer Systems Engineering (Work-Integrated Learning / PJD301B)** project proposal by **Naledi Perseverance Mashabane (230099774)**.

---

## 🏗️ System Architecture & Monorepo Layout

```text
student-budget-tracker/
├── client/                 # Next.js 14+ App Router, Tailwind CSS, Lucide React
│   ├── src/
│   │   ├── app/            # App router pages, layouts, and global styles
│   │   ├── components/     # UI cards, tables, modals, charts, filters
│   │   ├── lib/            # API client fetchers, ZAR formatters, date utils
│   │   └── types/          # Shared TypeScript models matching backend entities
│   ├── .env.local          # NEXT_PUBLIC_API_URL
│   ├── package.json
│   └── tailwind.config.ts
├── server/                 # Express.js backend (Node.js + TypeScript)
│   ├── src/
│   │   ├── config/         # PostgreSQL connection pool (pg) + resilient fallback store
│   │   ├── controllers/    # Budget, Expense, Category, and Analytics controllers
│   │   ├── routes/         # Express REST API routers
│   │   ├── db/             # Schema migration scripts and realistic student seed data
│   │   ├── types/          # TypeScript domain interfaces
│   │   └── index.ts        # Server entry point, CORS, logging, and error handling
│   ├── .env                # PORT, DATABASE_URL, CLIENT_URL
│   ├── package.json
│   └── tsconfig.json
├── render.yaml             # Render deployment blueprint (Express + PostgreSQL)
├── package.json            # Monorepo orchestration scripts
└── README.md
```

---

## ✨ Key Features

1. **Monthly Allowance & Budget Management**:
   - Set monthly student allowances (e.g. `R 3,500.00`) with quick presets (`R 2,500`, `R 3,500`, `R 4,500`, `R 5,000`).
   - Track total spent and remaining balance with color-coded health badges (**On Track**, **Warning > 80%**, **Over Budget > 100%**).
2. **Student Daily Burn Rate Calculator**:
   - Dynamically calculates the recommended daily spend limit based on remaining days in the month (`R 110.93 / day`).
   - Warns students early when their daily burn rate exceeds sustainable limits.
3. **South African Student Expense Categories**:
   - Pre-configured categories: Food & Groceries, Transport & Taxi, Books & Stationery, Airtime & Data Bundles, Personal Care & Toiletries, Accommodation & Rent, Entertainment & Social, Emergency & Other.
   - Interactive category cards with percentage bars and instant expense filtering.
4. **Visual Spending Insights**:
   - Daily spending trend bar chart highlighting today's pace and past peak spending days.
   - Payment channel breakdown (Cash, Debit Card, EFT / Mobile App, Campus Card).
5. **Comprehensive Expense Logging & Records**:
   - Quick "Log Expense" modal with real-time validation and category tags.
   - Filter by category, date range (`From Date` - `To Date`), and instant search query.
   - Edit and delete transaction records.
   - **Export to CSV**: Export filtered expense records directly to spreadsheet for student records.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js** (v18+ or v20+ recommended)
- **PostgreSQL** (Optional for local testing; the app includes an automatic fallback data store that runs seamlessly out of the box if a database is not yet provisioned).

### 2. Clone and Setup Environment

#### Configure Backend Environment (`server/.env`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/student_budget
CLIENT_URL=http://localhost:3000
```

#### Configure Frontend Environment (`client/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

### 3. Installation & Running

#### Step 1: Start the Backend Server
```bash
cd server
npm install
npm run seed     # Initializes database tables and student seed records
npm run dev      # Starts Express server at http://localhost:5000
```

#### Step 2: Start the Next.js Frontend
```bash
cd client
npm install
npm run dev      # Starts Next.js dashboard at http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status, database connection mode, and uptime |
| `GET` | `/api/budget/current?month=YYYY-MM` | Fetch budget allowance, total spend, burn rate, and status |
| `POST` | `/api/budget` | Create or update monthly budget allowance |
| `GET` | `/api/expenses` | List expenses (supports `category`, `search`, `startDate`, `endDate`, `sortBy`, `sortOrder`) |
| `GET` | `/api/expenses/:id` | Fetch single expense details |
| `POST` | `/api/expenses` | Record a new expense |
| `PUT` | `/api/expenses/:id` | Update an existing expense record |
| `DELETE` | `/api/expenses/:id` | Delete an expense record |
| `GET` | `/api/categories?month=YYYY-MM` | Fetch category allocations and month-to-date spending |
| `GET` | `/api/analytics/summary?month=YYYY-MM` | Full financial summary with daily trends and payment channels |
| `POST` | `/api/reset` | Reset records back to initial student demonstration data |

---

## 🌐 Production Deployment

### Backend Deployment (Render)
1. Push this repository to GitHub.
2. In Render, create a **PostgreSQL Database** named `student-budget-db`.
3. Create a new **Web Service** pointing to the repository:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build && npm run seed`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `PORT`: `5000`
     - `NODE_ENV`: `production`
     - `DATABASE_URL`: Your Render PostgreSQL Internal/External Connection String.
     - `CLIENT_URL`: Your Vercel frontend URL.
4. Alternatively, use the included [`render.yaml`](./render.yaml) blueprint for one-click setup.

### Frontend Deployment (Vercel)
1. Import the repository into Vercel.
2. Set **Root Directory** to `client`.
3. Under Environment Variables, add:
   - `NEXT_PUBLIC_API_URL`: Your deployed Render backend URL (e.g. `https://student-budget-tracker-api.onrender.com/api`).
4. Click **Deploy**.

---

## 📄 License & Attribution
- **Developer**: Naledi Perseverance Mashabane (Student Number: 230099774)
- **Institution**: Tshwane University of Technology (TUT) - Department of Computer Systems Engineering
- **License**: MIT

