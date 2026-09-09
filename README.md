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

See [student-budget-tracker/README.md](./student-budget-tracker/README.md) for complete documentation.

